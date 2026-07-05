import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";

dotenv.config();

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const RSVPS_FILE = path.join(DATA_DIR, "rsvps.json");
const AUDIO_DIR = path.join(DATA_DIR, "audio");
const MEDIA_DIR = path.join(DATA_DIR, "media");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize Firebase Admin (trusted server-side SDK — bypasses Firestore security rules,
// which are locked down to deny all direct client access; see firestore.rules).
// Falls back to local JSON file storage (below) when no credentials are available, e.g. local dev.
let db: admin.firestore.Firestore | null = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
    db = admin.firestore();
    console.log("🔥 Firebase Admin Firestore initialized successfully on backend for persistent data.");
  }
} catch (e) {
  console.error("⚠️ Failed to initialize Firebase Admin on server (falling back to local file storage):", e);
  db = null;
}

// In-Memory Database Cache for instantaneous API loads (users only — events/rsvps are
// always read fresh per-user/per-event so a stale cache can never masquerade as "everything").
let cachedUsers: any[] | null = null;
let cachedUsersTime = 0;
const CACHE_TTL_MS = 60000; // 60 seconds of cache TTL to bypass slow database roundtrips

// Lock to prevent multiple simultaneous downloads of the same media chunks
const activeRestores = new Map<string, Promise<boolean>>();

// Setup local users fallback
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    {
      id: "admin-default",
      username: "admin",
      password: bcrypt.hashSync("admin_family_secure_2026", 10),
      role: "admin"
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
} else {
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    let changed = false;
    for (const u of users) {
      if (u.username === "admin" && u.password === "adminpassword") {
        u.password = bcrypt.hashSync("admin_family_secure_2026", 10);
        changed = true;
      } else if (typeof u.password === "string" && !u.password.startsWith("$2")) {
        // Migrate any legacy plaintext password to a bcrypt hash in place
        u.password = bcrypt.hashSync(u.password, 10);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error updating admin password:", e);
  }
}
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Firebase CRUD and backup persistent helper functions with safety timeouts
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

function withTimeout<T>(promise: Promise<T>, ms: number = 10000, timeoutErrorMsg: string = "Operation timed out"): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutErrorMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// ---------------------------------------------------------------------------
// Events: always read/write ONE document at a time, scoped by owner or by id.
// Never fetch-all-then-diff-and-delete — that pattern is what used to let one
// invitation's save silently wipe out every other invitation in the database.
// ---------------------------------------------------------------------------

async function getEventsForUser(userId: string): Promise<any[]> {
  if (db) {
    try {
      const fetchPromise = (async () => {
        const snapshot = await db!.collection("events").where("userId", "==", userId).get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      })();
      return await withTimeout(fetchPromise, 8000, "Firestore read events timed out");
    } catch (err) {
      console.error("Error reading user events from Firestore:", err);
    }
  }
  // Local fallback only when Firebase isn't configured or the read above failed —
  // never used to silently treat "found nothing" as "the truth".
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const all = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
      return all.filter((e: any) => e.userId === userId);
    }
  } catch (err) {
    console.error("Error reading local events fallback:", err);
  }
  return [];
}

async function getEventById(id: string): Promise<any | null> {
  if (db) {
    try {
      const fetchPromise = db.collection("events").doc(id).get();
      const docSnap = await withTimeout(fetchPromise, 8000, "Firestore read event timed out");
      return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err) {
      console.error(`Error reading event ${id} from Firestore:`, err);
    }
  }
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const all = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
      return all.find((e: any) => e.id === id) || null;
    }
  } catch (err) {
    console.error("Error reading local event fallback:", err);
  }
  return null;
}

async function saveOneEvent(event: any): Promise<void> {
  // Best-effort local mirror (dev convenience / offline cache) — never authoritative.
  try {
    let all: any[] = [];
    if (fs.existsSync(EVENTS_FILE)) {
      all = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    }
    const idx = all.findIndex((e: any) => e.id === event.id);
    if (idx !== -1) all[idx] = event; else all.push(event);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(all, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing event to local cache:", err);
  }

  if (db) {
    try {
      const sanitized = sanitizeForFirestore(event);
      const savePromise = db.collection("events").doc(event.id).set(sanitized, { merge: true });
      await withTimeout(savePromise, 10000, "Firestore save event timed out");
    } catch (err) {
      console.error(`Error saving event ${event.id} to Firestore:`, err);
    }
  }
}

async function deleteOneEvent(id: string): Promise<void> {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const all = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(all.filter((e: any) => e.id !== id), null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error deleting event from local cache:", err);
  }

  if (db) {
    try {
      const deletePromise = db.collection("events").doc(id).delete();
      await withTimeout(deletePromise, 10000, "Firestore delete event timed out");
    } catch (err) {
      console.error(`Error deleting event ${id} from Firestore:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// RSVPs: scoped by eventId, same one-document-at-a-time philosophy as events.
// ---------------------------------------------------------------------------

async function getRsvpsForEvent(eventId: string): Promise<any[]> {
  if (db) {
    try {
      const fetchPromise = (async () => {
        const snapshot = await db!.collection("rsvps").where("eventId", "==", eventId).get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      })();
      return await withTimeout(fetchPromise, 8000, "Firestore read rsvps timed out");
    } catch (err) {
      console.error(`Error reading rsvps for event ${eventId} from Firestore:`, err);
    }
  }
  try {
    if (fs.existsSync(RSVPS_FILE)) {
      const all = JSON.parse(fs.readFileSync(RSVPS_FILE, "utf-8"));
      return all.filter((r: any) => r.eventId === eventId);
    }
  } catch (err) {
    console.error("Error reading local rsvps fallback:", err);
  }
  return [];
}

async function saveOneRsvp(rsvpEntry: any): Promise<void> {
  try {
    let all: any[] = [];
    if (fs.existsSync(RSVPS_FILE)) {
      all = JSON.parse(fs.readFileSync(RSVPS_FILE, "utf-8"));
    }
    const idx = all.findIndex((r: any) => r.id === rsvpEntry.id);
    if (idx !== -1) all[idx] = rsvpEntry; else all.unshift(rsvpEntry);
    fs.writeFileSync(RSVPS_FILE, JSON.stringify(all, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing rsvp to local cache:", err);
  }

  if (db) {
    try {
      const sanitized = sanitizeForFirestore(rsvpEntry);
      const savePromise = db.collection("rsvps").doc(rsvpEntry.id).set(sanitized, { merge: true });
      await withTimeout(savePromise, 10000, "Firestore save rsvp timed out");
    } catch (err) {
      console.error(`Error saving rsvp ${rsvpEntry.id} to Firestore:`, err);
    }
  }
}

async function deleteOneRsvp(id: string): Promise<void> {
  try {
    if (fs.existsSync(RSVPS_FILE)) {
      const all = JSON.parse(fs.readFileSync(RSVPS_FILE, "utf-8"));
      fs.writeFileSync(RSVPS_FILE, JSON.stringify(all.filter((r: any) => r.id !== id), null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error deleting rsvp from local cache:", err);
  }

  if (db) {
    try {
      const deletePromise = db.collection("rsvps").doc(id).delete();
      await withTimeout(deletePromise, 10000, "Firestore delete rsvp timed out");
    } catch (err) {
      console.error(`Error deleting rsvp ${id} from Firestore:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Users (auth accounts) — small collection, still read as a whole for
// username-uniqueness/lookup purposes. Passwords are always bcrypt hashes.
// ---------------------------------------------------------------------------

async function getUsersFromDb(): Promise<any[]> {
  const now = Date.now();
  if (cachedUsers && (now - cachedUsersTime < CACHE_TTL_MS)) {
    return cachedUsers;
  }

  let users: any[] = [];
  try {
    if (db) {
      const fetchPromise = (async () => {
        const snapshot = await db!.collection("users").get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      })();

      users = await withTimeout(fetchPromise, 4000, "Firestore read users timed out");
      if (users.length > 0) {
        try {
          fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
        } catch (e) {
          console.error("Failed to cache users locally:", e);
        }
      }
    }
  } catch (err) {
    console.error("Error reading users from Firestore:", err);
  }

  if (users.length === 0) {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        users = JSON.parse(data);
      }
    } catch (err) {
      console.error("Error reading users locally:", err);
    }
  }

  // Migrate any legacy plaintext password found in Firestore/local storage to a bcrypt hash.
  for (const u of users) {
    if (typeof u.password === "string" && !u.password.startsWith("$2")) {
      u.password = bcrypt.hashSync(u.password, 10);
      saveUserToDb(u).catch(e => console.error("Error migrating password hash:", e));
    }
  }

  if (users.length > 0) {
    cachedUsers = users;
    cachedUsersTime = Date.now();
  }
  return users;
}

async function saveUserToDb(user: any): Promise<boolean> {
  try {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");

    // Update cache
    cachedUsers = users;
    cachedUsersTime = Date.now();
  } catch (err) {
    console.error("Error writing user locally:", err);
  }

  try {
    if (db) {
      const sanitizedUser = sanitizeForFirestore(user);
      const savePromise = db.collection("users").doc(user.id).set(sanitizedUser);
      await withTimeout(savePromise, 10000, "Firestore save user timed out");
      return true;
    }
  } catch (err) {
    console.error("Error saving user to Firestore:", err);
  }
  return true; // Local save succeeded
}

// Chunked file backup inside Firestore
async function saveFileToFirestore(fileName: string, buffer: Buffer, mimeType: string = ""): Promise<void> {
  if (!db) return;
  try {
    const totalSize = buffer.length;
    const chunkSize = 500 * 1024; // 500 KB (extremely safe to prevent Firestore's 1MB document size limit with base64 overhead)
    const totalChunks = Math.ceil(totalSize / chunkSize);

    const fileDocRef = db.collection("files").doc(fileName);
    await fileDocRef.set({
      fileName,
      totalChunks,
      mimeType,
      createdAt: new Date().toISOString()
    });

    const savePromises: Promise<any>[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunkBuffer = buffer.subarray(start, end);
      const chunkBase64 = chunkBuffer.toString("base64");

      const chunkDocRef = fileDocRef.collection("chunks").doc(i.toString());
      savePromises.push(chunkDocRef.set({
        index: i,
        data: chunkBase64
      }));
    }
    await Promise.all(savePromises);
    console.log(`✅ Fully backed up file ${fileName} to Firestore in ${totalChunks} chunks in parallel.`);
  } catch (err) {
    console.error(`❌ Error backing up file ${fileName} to Firestore:`, err);
  }
}

async function restoreFileFromFirestore(fileName: string, targetDir: string): Promise<boolean> {
  if (!db) return false;
  try {
    const fileDocRef = db.collection("files").doc(fileName);
    const docSnap = await withTimeout(fileDocRef.get(), 10000, "Firestore get file doc timed out");
    if (!docSnap.exists) {
      console.log(`🔍 File ${fileName} is not in Firestore backup.`);
      return false;
    }

    const { totalChunks } = docSnap.data() as any;
    const buffers: Buffer[] = [];

    // Parallel fetch of chunks to drastically speed up media loads
    const chunkPromises: Promise<any>[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkDocRef = fileDocRef.collection("chunks").doc(i.toString());
      chunkPromises.push(withTimeout(chunkDocRef.get(), 10000, `Firestore get chunk ${i} timed out`));
    }
    const chunkSnaps = await Promise.all(chunkPromises);

    for (let i = 0; i < totalChunks; i++) {
      const chunkSnap = chunkSnaps[i];
      if (!chunkSnap.exists) {
        console.error(`❌ Chunk ${i} of file ${fileName} is missing in Firestore backup!`);
        return false;
      }
      const base64Data = chunkSnap.data()!.data;
      buffers.push(Buffer.from(base64Data, "base64"));
    }

    const fullBuffer = Buffer.concat(buffers);
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, fullBuffer);
    console.log(`♻️ Successfully restored file ${fileName} from Firestore backup to local disk cache in parallel.`);
    return true;
  } catch (err) {
    console.error(`❌ Error restoring file ${fileName} from Firestore:`, err);
    return false;
  }
}

async function restoreFileFromFirestoreCached(fileName: string, targetDir: string): Promise<boolean> {
  const filePath = path.join(targetDir, fileName);
  if (fs.existsSync(filePath)) return true;

  if (activeRestores.has(fileName)) {
    console.log(`⏳ File ${fileName} is already being restored, waiting on existing promise...`);
    return activeRestores.get(fileName)!;
  }

  const restorePromise = (async () => {
    try {
      const res = await restoreFileFromFirestore(fileName, targetDir);
      return res;
    } finally {
      activeRestores.delete(fileName);
    }
  })();

  activeRestores.set(fileName, restorePromise);
  return restorePromise;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: Use JSON middleware to parse POST request bodies with 50mb limit for audio files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Custom GET handlers with automatic Firestore backup recovery for static files
  app.get("/api/audio/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(AUDIO_DIR, filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      const restored = await restoreFileFromFirestoreCached(filename, AUDIO_DIR);
      if (restored && fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    } catch (e) {
      console.error("Error serving audio from Firestore backup:", e);
    }
    next();
  });

  app.get("/api/media/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(MEDIA_DIR, filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      const restored = await restoreFileFromFirestoreCached(filename, MEDIA_DIR);
      if (restored && fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    } catch (e) {
      console.error("Error serving media from Firestore backup:", e);
    }
    next();
  });

  // Serve static assets publicly as standard fallback
  app.use("/api/audio", express.static(AUDIO_DIR));
  app.use("/api/media", express.static(MEDIA_DIR));

  // Media Native Upload API (for videos and gallery photos) with automated cloud chunked backup
  app.post("/api/upload-media", async (req, res) => {
    try {
      const { fileName, fileData, eventId } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Faltan datos del archivo" });
      }

      // fileData is a base64 data URI (e.g. "data:image/png;base64,...")
      const matches = fileData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      let base64Data = fileData;
      let mimeType = "image/jpeg";
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = fileData.replace(/^data:\w+\/\w+;base64,/, "");
      }

      const buffer = Buffer.from(base64Data, "base64");

      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${eventId || "media"}-${Date.now()}-${cleanFileName}`;
      const filePath = path.join(MEDIA_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);

      // Back up to Firestore asynchronously
      saveFileToFirestore(uniqueName, buffer, mimeType).catch(e => {
        console.error("Async media backup failed:", e);
      });

      const publicUrl = `/api/media/${uniqueName}`;
      res.json({
        success: true,
        url: publicUrl
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ error: "Error al guardar el archivo en el servidor" });
    }
  });

  // Audio Native Upload API with automated cloud chunked backup
  app.post("/api/upload-audio", async (req, res) => {
    try {
      const { fileName, fileData, eventId } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Faltan datos del archivo" });
      }

      // fileData is a base64 data URI or raw base64 string
      const base64Data = fileData.replace(/^data:audio\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${eventId || "audio"}-${Date.now()}-${cleanFileName}`;
      const filePath = path.join(AUDIO_DIR, uniqueName);

      fs.writeFileSync(filePath, buffer);

      // Back up to Firestore asynchronously
      saveFileToFirestore(uniqueName, buffer, "audio/mpeg").catch(e => {
        console.error("Async audio backup failed:", e);
      });

      const publicUrl = `/api/audio/${uniqueName}`;
      res.json({
        success: true,
        audioUrl: publicUrl,
        songName: fileName.replace(/\.[^/.]+$/, "")
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ error: "Error al guardar el archivo de audio en el servidor" });
    }
  });

  // Authentication API Routes (User and Admin Auth)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "El usuario y contraseña son obligatorios" });
      }

      const users = await getUsersFromDb();

      const existingUser = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase().trim());
      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
      }

      const newUser = {
        id: "user-" + Date.now(),
        username: username.trim(),
        password: await bcrypt.hash(password, 10),
        role: "user"
      };

      await saveUserToDb(newUser);

      res.json({
        success: true,
        user: { id: newUser.id, username: newUser.username, role: newUser.role }
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error del servidor al registrar" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "El usuario y contraseña son obligatorios" });
      }

      const users = await getUsersFromDb();

      const matchedUser = users.find(
        (u: any) => u.username.toLowerCase() === username.toLowerCase().trim()
      );

      const passwordOk = matchedUser ? await bcrypt.compare(password, matchedUser.password) : false;
      if (!matchedUser || !passwordOk) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      res.json({
        success: true,
        user: { id: matchedUser.id, username: matchedUser.username, role: matchedUser.role }
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ error: "Error del servidor al iniciar sesión" });
    }
  });

  // API Routes for Persistent Synchronized Database (Events and RSVPs)
  // Each invitation is now read/written/deleted as its own document — creating or
  // editing one invitation can never affect any other invitation in the database.
  app.get("/api/events", async (req, res) => {
    try {
      const userId = typeof req.query.userId === "string" ? req.query.userId : "";
      if (!userId) {
        return res.status(400).json({ error: "Falta userId" });
      }
      const events = await getEventsForUser(userId);
      return res.json(events);
    } catch (error) {
      console.error("Error reading events:", error);
      res.status(500).json({ error: "Error de servidor al leer eventos" });
    }
  });

  // Public single-invitation lookup — used to render a shared /invitacion/:id link
  // without downloading every invitation in the database.
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Invitación no encontrada" });
      }
      return res.json(event);
    } catch (error) {
      console.error("Error reading event:", error);
      res.status(500).json({ error: "Error de servidor al leer la invitación" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const event = req.body;
      if (!event || !event.id || !event.userId) {
        return res.status(400).json({ error: "El evento debe incluir id y userId" });
      }
      const existing = await getEventById(event.id);
      if (existing && existing.userId && existing.userId !== event.userId) {
        // Allow exactly one ownership transfer: an anonymous browser-owned invitation being
        // claimed by the same browser after the user logs in / registers. Real-account-to-
        // real-account or anonymous-to-anonymous transfers are still rejected.
        const isAnonToRealClaim = existing.userId.startsWith("anon-") && !event.userId.startsWith("anon-");
        if (!isAnonToRealClaim) {
          return res.status(403).json({ error: "No tienes permiso para modificar esta invitación" });
        }
      }
      await saveOneEvent(event);
      res.json({ success: true });
    } catch (error) {
      console.error("Error writing event:", error);
      res.status(500).json({ error: "Error de servidor al guardar la invitación" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const userId = typeof req.query.userId === "string" ? req.query.userId : "";
      const existing = await getEventById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Invitación no encontrada" });
      }
      if (existing.userId && existing.userId !== userId) {
        return res.status(403).json({ error: "No tienes permiso para borrar esta invitación" });
      }
      await deleteOneEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Error de servidor al borrar la invitación" });
    }
  });

  app.get("/api/rsvps", async (req, res) => {
    try {
      const eventId = typeof req.query.eventId === "string" ? req.query.eventId : "";
      if (!eventId) {
        return res.status(400).json({ error: "Falta eventId" });
      }
      const rsvps = await getRsvpsForEvent(eventId);
      return res.json(rsvps);
    } catch (error) {
      console.error("Error reading rsvps:", error);
      res.status(500).json({ error: "Error de servidor al leer confirmaciones" });
    }
  });

  app.post("/api/rsvps", async (req, res) => {
    try {
      const newRsvp = req.body;
      if (!newRsvp || !newRsvp.eventId || !newRsvp.guestName) {
        return res.status(400).json({ error: "Faltan datos de la confirmación" });
      }

      // Find if there's an existing rsvp for this guest under the same event
      const existingForEvent = await getRsvpsForEvent(newRsvp.eventId);
      const existing = existingForEvent.find(
        (r: any) => r.guestName.toLowerCase().trim() === newRsvp.guestName.toLowerCase().trim()
      );

      const rsvpEntry: any = {
        id: existing?.id || newRsvp.id || "rsvp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        eventId: newRsvp.eventId,
        guestName: newRsvp.guestName,
        attending: newRsvp.attending !== undefined ? newRsvp.attending : true,
        companions: newRsvp.companions || 0,
        comment: newRsvp.comment || "",
        confirmedAt: newRsvp.confirmedAt || new Date().toISOString()
      };

      await saveOneRsvp(rsvpEntry);

      // 1. Google Sheets OAuth API Integration
      let googleSheetsId = "";
      let googleSheetsToken = "";
      let matchedEvent: any = null;
      try {
        matchedEvent = await getEventById(rsvpEntry.eventId);
        if (matchedEvent) {
          googleSheetsId = matchedEvent.googleSheetsId;
          googleSheetsToken = matchedEvent.googleSheetsToken;
        }
      } catch (err) {
        console.error("Error al obtener credenciales de Sheets para el evento:", err);
      }

      if (googleSheetsId && googleSheetsToken) {
        try {
          console.log(`Sincronizando confirmación vía Sheets API oficial en hoja: ${googleSheetsId}`);
          const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsId}/values/A:E:append?valueInputOption=USER_ENTERED`;
          const confirmedAtFormatted = new Date(rsvpEntry.confirmedAt).toLocaleString("es-CL", { timeZone: "America/Santiago" });

          const appendRes = await fetch(sheetsApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${googleSheetsToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              range: "A:E",
              majorDimension: "ROWS",
              values: [
                [
                  confirmedAtFormatted,
                  rsvpEntry.guestName,
                  rsvpEntry.attending ? "Sí" : "No",
                  rsvpEntry.companions,
                  rsvpEntry.comment
                ]
              ]
            })
          });

          if (!appendRes.ok) {
            const errText = await appendRes.text();
            console.error("Error de Sheets API al agregar fila:", errText);
          } else {
            console.log("Fila agregada correctamente vía Google Sheets API.");

            // Actualizar timestamp de última sincronización solo en ESE evento
            try {
              if (matchedEvent) {
                matchedEvent.googleSheetsLastSync = new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });
                await saveOneEvent(matchedEvent);
              }
            } catch (err) {
              console.error("Error al guardar marca de tiempo de sincronización:", err);
            }
          }
        } catch (err: any) {
          console.error("Error de red al conectar con Google Sheets API:", err.message);
        }
      }

      // Optional: Synchronize with old Google Sheets Web App URL for backward compatibility if provided
      const { googleSheetsUrl } = rsvpEntry;
      if (googleSheetsUrl && (googleSheetsUrl.startsWith("http://") || googleSheetsUrl.startsWith("https://"))) {
        try {
          console.log("Sincronizando confirmación con Google Sheets viejo:", googleSheetsUrl);
          await fetch(googleSheetsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: rsvpEntry.eventId,
              guestName: rsvpEntry.guestName,
              attending: rsvpEntry.attending ? "Sí" : "No",
              companions: rsvpEntry.companions,
              comment: rsvpEntry.comment,
              confirmedAt: new Date(rsvpEntry.confirmedAt).toLocaleString("es-CL", { timeZone: "America/Santiago" })
            })
          });
        } catch (err: any) {
          console.error("Error sending to Google Sheets webhook:", err.message);
        }
      }

      res.json({ success: true, rsvp: rsvpEntry });
    } catch (error) {
      console.error("Error writing rsvp:", error);
      res.status(500).json({ error: "Error de servidor al guardar confirmación" });
    }
  });

  app.delete("/api/rsvps/:id", async (req, res) => {
    try {
      await deleteOneRsvp(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting rsvp:", error);
      res.status(500).json({ error: "Error de servidor al borrar confirmación" });
    }
  });

  // API Routes MUST go before Vite middleware
  app.post("/api/generate-template", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY no configurado",
          message: "Por favor, agrega tu clave GEMINI_API_KEY en el panel de Configuración > Secretos (Settings > Secrets) de la plataforma para activar el generador de IA."
        });
      }

      const { promptDescription, category } = req.body;
      if (!promptDescription) {
        return res.status(400).json({ error: "Falta la descripción de la plantilla" });
      }

      // Lazy instantiation of GoogleGenAI SDK as required
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Eres un diseñador experto en invitaciones digitales de boda y eventos familiares.
Tu objetivo es diseñar un fragmento de código HTML con estilos integrados usando Tailwind CSS y variables dinámicas encerradas en dobles llaves (por ejemplo, {{title}}), o bien utilizando etiquetas de componentes premium si seleccionas el motor V2, o bien devolviendo una estructura JSON serializada si seleccionas el Editorial Design Engine V3.

DETERMINACIÓN DEL MOTOR (engine):
- Si el usuario solicita conceptos como "Boda Toscana", "Editorial Vogue", "Lujo minimalista", "Old Money", "Quiet Luxury", "Hotel Ritz", "Vintage Europeo", o cualquier concepto que apunte a alta costura, ultra lujo, elegancia asimétrica, minimalismo fino o estética Kinfolk, DEBES generar la plantilla usando el **Editorial Design Engine V3** (engine = 'v3').
- Si solicita un diseño premium de otro tipo, usa el **Editorial Engine V2** (engine = 'v2').
- Para diseños tradicionales o de bajo perfil, usa el **Classic Engine** (engine = 'classic').

REGLAS PARA EDITORIAL DESIGN ENGINE V3 (engine = 'v3'):
Cuando uses 'v3', la propiedad 'htmlContent' NO debe contener HTML. Debe ser estrictamente una cadena JSON válida serializada que represente la estructura de componentes. El JSON debe tener la siguiente estructura:
{
  "engine": "v3",
  "theme": "editorial",
  "palette": "olive", // Puede ser 'white' | 'olive' | 'black' | 'beige' | 'rose' | 'navy' de acuerdo al mood solicitado.
  "components": [
    { "type": "HeroLuxury" }, // Elige entre: HeroLuxury, HeroEditorial, HeroMagazine
    { "type": "DividerGold" }, // Elige entre: DividerGold, DividerOlive, DividerMinimal
    { "type": "QuoteLuxury" }, // Elige entre: QuoteLuxury, QuoteEditorial
    { "type": "GalleryEditorial" }, // Elige entre: GalleryEditorial, GalleryMasonry, GalleryFilm
    { "type": "PaperCard" }, // Elige entre: PaperCard, GlassCard, FloatingCard
    { "type": "TimelineElegant" }, // Elige entre: TimelineElegant, TimelineMinimal
    { "type": "RSVPLuxury" }, // RSVPLuxury
    { "type": "FooterLuxury" } // Elige entre: FooterLuxury, FooterMinimal
  ]
}

REGLAS PARA LAS PALETAS DE V3 (palette):
- "Boda Toscana" -> palette = 'olive' (tonos olivo y campos rústicos refinados)
- "Editorial Vogue" -> palette = 'black' o 'rose' (gala de alta costura)
- "Lujo minimalista", "Quiet Luxury" -> palette = 'white' o 'beige' (elegancia pura, almendra y marfil)
- "Old Money" -> palette = 'navy' o 'white' (azul heráldico refinado, lino y dorado)
- "Hotel Ritz" -> palette = 'black' o 'beige' (lujo clásico dorado)
- "Vintage Europeo" -> palette = 'rose' o 'beige' (tonos románticos gastados)

REGLAS PARA EDITORIAL ENGINE V2 (engine = 'v2'):
Cuando uses 'v2', tu htmlContent debe contener tags premium personalizados de nuestra biblioteca V2 (<hero-fullscreen>, <hero-editorial>, <hero-luxury>, <hero-cinematic>, <image-full>, <image-rounded>, <image-editorial>, <image-magazine>, <image-mosaic>, <editorial-title>, <editorial-subtitle>, <quote-block>, <story-paragraph>, <pull-quote>, <section-countdown>, <section-ceremony>, <section-reception>, <section-schedule>, <section-dresscode>, <section-gifts>, <section-gallery>, <section-video>, <section-rsvp>, <section-footer>, <editorial-card>, <luxury-card>, <glass-card>, <divider-olive>, <divider-gold>, <divider-minimal>, <divider-floral>, <divider-luxury>).

REGLAS DE VARIABLES (PLACEHOLDERS):
Las variables se inyectan en dobles llaves, ej: {{title}}, {{hostName}}, {{date}}, {{time}}, {{imageUrl}}, {{description}}, {{confirmationDeadline}}, {{schedule}}, {{giftLink}}.

REGLAS DE FUENTES DE GOOGLE FONTS:
- Títulos: "Great Vibes", "Playfair Display", "Cinzel", "Dancing Script", "Alex Brush", "Sacramento", "Parisienne", "Italiana", "Cormorant Garamond", "Montserrat", "Space Grotesk".
- Cuerpo: "Inter", "Montserrat", "Lora", "Cormorant Garamond", "Outfit", "JetBrains Mono".

RETORNO:
Debes responder estrictamente en formato JSON utilizando el esquema requerido, devolviendo el código HTML o el JSON serializado de V3 en la propiedad 'htmlContent', el motor elegido ('classic', 'v2' o 'v3') en 'engine', las fuentes en 'fontTitle' y 'fontBody', el nombre y descripción en 'name' y 'description', una lista de variables detectadas en 'variablesUsed' y etiquetas útiles en 'tags'. El código o JSON debe ser limpio, sin envoltorios de Markdown ni bloques de código \`\`\`.`;

      const promptText = `Crea una plantilla de categoría "${category}" basada en la siguiente descripción del usuario:
"${promptDescription}"

Si la descripción sugiere sofisticación o es del tipo: "Boda Toscana", "Editorial Vogue", "Lujo minimalista", "Old Money", "Quiet Luxury", "Hotel Ritz", "Vintage Europeo", asegúrate de elegir engine='v3', elegir la paleta adecuada ('white', 'olive', 'black', 'beige', 'rose', 'navy') y devolver el JSON serializado de V3 en la propiedad 'htmlContent'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nombre creativo y descriptivo para la plantilla" },
              description: { type: Type.STRING, description: "Descripción refinada del estilo de la plantilla" },
              engine: { type: Type.STRING, description: "Motor de renderizado a utilizar: 'classic', 'v2' o 'v3'" },
              fontTitle: { type: Type.STRING, description: "La fuente recomendada para títulos de la lista permitida" },
              fontBody: { type: Type.STRING, description: "La fuente recomendada para el cuerpo de la lista permitida" },
              htmlContent: { type: Type.STRING, description: "Código HTML puro o JSON serializado de V3, autocompletado con placeholders" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Etiquetas del diseño, por ejemplo ['editorial', 'luxury', 'gold', 'v3-engine']"
              },
              variablesUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Nombres de los placeholders que incluiste, ej. ['title', 'hostName', 'date']"
              }
            },
            required: ["name", "description", "engine", "fontTitle", "fontBody", "htmlContent", "tags", "variablesUsed"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se pudo obtener texto del modelo de IA");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Error al generar plantilla con IA:", error);
      res.status(500).json({
        error: "Error de servidor al invocar Gemini",
        message: error.message || "Ocurrió un error inesperado al procesar la solicitud."
      });
    }
  });

  // Serve static frontend in production, or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
