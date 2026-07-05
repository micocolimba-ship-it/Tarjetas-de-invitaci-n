import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Copy, 
  Share2, 
  Heart, 
  CheckCircle, 
  Plus, 
  Trash2, 
  DollarSign, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  Smartphone, 
  Laptop, 
  Check, 
  RefreshCw,
  Send,
  Home as HomeIcon,
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  QrCode,
  Info,
  Gift,
  X,
  CreditCard,
  MessageSquare,
  Settings,
  Mail,
  Music,
  Volume2,
  UploadCloud,
  Save,
  AlertTriangle
} from 'lucide-react';

import { EventData, GuestRSVP, DonationConfig, EventType, TemplateStyle, BankAccount, CustomTemplate } from './types';
import { TEMPLATE_STYLES, EVENT_TYPES_METADATA, INITIAL_EVENTS, INITIAL_RSVPS, DEFAULT_DONATION_CONFIG } from './data/templates';
import { EDITORIAL_WHITE_TEMPLATE, EDITORIAL_BLACK_TEMPLATE, EDITORIAL_OLIVE_TEMPLATE, EDITORIAL_V2_PREMIUM_TEMPLATE, EDITORIAL_V2_OLIVE_TEMPLATE, EDITORIAL_PASSPORT_TEMPLATE } from './data/editorialTemplate';
import { CURATED_EVENT_IMAGES, searchPixabayImages, generateAiPromptForEvent } from './services/imageService';
import InvitationPreview from './components/InvitationPreview';
import TemplateGallery from './components/TemplateGallery';
import AdminPanel from './components/AdminPanel';
import { saveAudioFile, deleteAudioFile } from './utils/audioStorage';
import { DesignerCreditCard } from './components/DesignerCreditCard';
import { getDynamicInitials } from './components/InvitationExperience';
import { initAuth, googleSignIn, logout, fetchSpreadsheets, appendToGoogleSheet } from './lib/firebase';

// Safe wrapper for localStorage to prevent security exceptions in embedded/incognito mobile browsers and iframes
const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage.getItem blocked:', e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage.setItem blocked:', e);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage.removeItem blocked:', e);
    }
  }
};

export default function App() {
  // Mobile Screen Detector for Premium Guest View responsive width
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple route check for Premium Guest Mode (/i/:id or /invitacion/:id) or query parameter fallback (?i=... or ?invitacion=...)
  const guestEventId = useMemo(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(?:i|invitacion)\/([^/]+)/);
    if (match) {
      return match[1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('i') || params.get('invitacion') || null;
  }, []);

  const isGuestView = guestEventId !== null;

  // Stable per-browser anonymous identity, used to scope invitations when there's no
  // logged-in account. Every invitation always has an owner (this id, or the logged-in
  // user's id) so the server can tell "my invitations" from everyone else's and never
  // has to guess from an entire local snapshot.
  const [anonymousOwnerId] = useState<string>(() => {
    const existing = safeLocalStorage.getItem('family_owner_id');
    if (existing) return existing;
    const generated = 'anon-' + (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    safeLocalStorage.setItem('family_owner_id', generated);
    return generated;
  });

  // Guest view interactive form states
  const [guestViewName, setGuestViewName] = useState('');
  const [guestViewAttending, setGuestViewAttending] = useState(true);
  const [guestViewCompanions, setGuestViewCompanions] = useState(0);
  const [guestViewComment, setGuestViewComment] = useState('');
  const [guestViewSuccess, setGuestViewSuccess] = useState('');
  const [guestViewSubmitting, setGuestViewSubmitting] = useState(false);

  // Global View State (Home: Vista Invitación completa, Plantillas: Galería, Usuario: Panel de carga, Admin: Panel del administrador)
  const [currentView, setCurrentView] = useState<'home' | 'plantillas' | 'usuario' | 'admin'>('home');
  const [previewMode, setPreviewMode] = useState<'web' | 'mobile'>('web');

  // Application State persistent via LocalStorage
  const [events, setEvents] = useState<EventData[]>(() => {
    const saved = safeLocalStorage.getItem('family_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically upgrade existing example-matrimonio event to the premium Editorial template style
        const wedding = parsed.find((e: any) => e.id === 'ejemplo-matrimonio');
        if (wedding && wedding.style === 'romantico') {
          wedding.style = 'editorial-white-v1';
        }
        return parsed;
      } catch (err) {
        return INITIAL_EVENTS;
      }
    }
    return INITIAL_EVENTS;
  });
  
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const savedEvents = safeLocalStorage.getItem('family_events');
    const savedActiveId = safeLocalStorage.getItem('family_selected_event_id');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        if (parsed && parsed.length > 0) {
          if (savedActiveId && parsed.some((e: any) => e.id === savedActiveId)) {
            return savedActiveId;
          }
          return parsed[0].id;
        }
      } catch (err) {
        // fallback
      }
    }
    return savedActiveId || INITIAL_EVENTS[0].id;
  });

  useEffect(() => {
    if (selectedEventId) {
      safeLocalStorage.setItem('family_selected_event_id', selectedEventId);
    }
  }, [selectedEventId]);

  const [rsvps, setRsvps] = useState<GuestRSVP[]>(() => {
    const saved = safeLocalStorage.getItem('family_rsvps');
    return saved ? JSON.parse(saved) : INITIAL_RSVPS;
  });

  const [donationConfig, setDonationConfig] = useState<DonationConfig>(() => {
    const saved = safeLocalStorage.getItem('family_donations');
    return saved ? JSON.parse(saved) : DEFAULT_DONATION_CONFIG;
  });

  // Cover image mapping
  const [customImageUrls, setCustomImageUrls] = useState<Record<string, string>>(() => {
    const saved = safeLocalStorage.getItem('family_custom_image_urls');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing family_custom_image_urls:', e);
      }
    }
    return {
      'ejemplo-matrimonio': '/api/media/ejemplo-matrimonio-1782665090563-lina_1.jpg',
      'ejemplo-cumpleanos': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200'
    };
  });

  useEffect(() => {
    safeLocalStorage.setItem('family_custom_image_urls', JSON.stringify(customImageUrls));
  }, [customImageUrls]);

  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Google Sheets OAuth Integration States
  const [googleUserToken, setGoogleUserToken] = useState<string | null>(null);
  const [userSpreadsheets, setUserSpreadsheets] = useState<Array<{ id: string; name: string }>>([]);
  const [isSheetsConnecting, setIsSheetsConnecting] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [isFetchingSheets, setIsFetchingSheets] = useState(false);

  const loadSpreadsheets = async (token: string) => {
    setIsFetchingSheets(true);
    setSheetsError(null);
    try {
      const sheets = await fetchSpreadsheets(token);
      setUserSpreadsheets(sheets);
    } catch (err: any) {
      console.error("Error al cargar hojas de cálculo:", err);
      setSheetsError("No se pudieron cargar tus hojas de cálculo de Google Drive. Por favor, asegúrate de haber otorgado los permisos.");
    } finally {
      setIsFetchingSheets(false);
    }
  };

  // Listen to Google Auth changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUserToken(token);
        loadSpreadsheets(token);
      },
      () => {
        setGoogleUserToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnectGoogle = async () => {
    setIsSheetsConnecting(true);
    setSheetsError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUserToken(result.accessToken);
        // Save token on server-side event data immediately
        setEvents(prev => prev.map(e => {
          if (e.id === selectedEventId) {
            return {
              ...e,
              googleSheetsToken: result.accessToken,
              updatedAt: new Date().toISOString()
            };
          }
          return e;
        }));
        // Fetch files
        setIsFetchingSheets(true);
        const sheets = await fetchSpreadsheets(result.accessToken);
        setUserSpreadsheets(sheets);
      }
    } catch (err: any) {
      console.error("Error connecting with Google Sheets:", err);
      setSheetsError("Error al conectar con Google. Por favor, asegúrate de autorizar los permisos de Google Drive y Sheets.");
    } finally {
      setIsFetchingSheets(false);
      setIsSheetsConnecting(false);
    }
  };

  // User Authentication States (Regular User and Admin)
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(() => {
    const saved = safeLocalStorage.getItem('family_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUser, setAdminUser] = useState<{ id: string; username: string; role: string } | null>(() => {
    const saved = safeLocalStorage.getItem('family_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      safeLocalStorage.setItem('family_current_user', JSON.stringify(currentUser));
    } else {
      safeLocalStorage.removeItem('family_current_user');
    }
  }, [currentUser]);

  // Every invitation always belongs to someone: the logged-in account if there is one,
  // otherwise this browser's anonymous id. Used to scope every /api/events call.
  const ownerId = (currentUser || adminUser)?.id || anonymousOwnerId;

  // Persist exactly one invitation to the server. Always scoped to its own id/owner —
  // never touches or replaces any other invitation.
  const saveEventToServer = async (event: EventData) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (err) {
      console.error('Error saving event to server:', err);
    }
  };

  // Assign an owner to legacy local events that predate this field, and re-assign
  // anonymous-browser-owned events to the account when the user logs in (the server
  // allows that one specific transfer — anon owner -> real account — so invitations
  // created before signing in aren't stranded).
  useEffect(() => {
    setEvents(prev => {
      let changed = false;
      const updated = prev.map(e => {
        if (!e.userId) {
          changed = true;
          return { ...e, userId: ownerId };
        }
        if ((currentUser || adminUser) && e.userId === anonymousOwnerId && e.userId !== ownerId) {
          changed = true;
          return { ...e, userId: ownerId, updatedAt: new Date().toISOString() };
        }
        return e;
      });
      if (changed && hasLoadedInitialData) {
        updated.forEach(e => {
          if (e.userId === ownerId) {
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(e)
            }).catch(err => console.error('Error claiming event ownership:', err));
          }
        });
      }
      return changed ? updated : prev;
    });
  }, [currentUser, adminUser]);

  useEffect(() => {
    if (adminUser) {
      safeLocalStorage.setItem('family_admin_user', JSON.stringify(adminUser));
    } else {
      safeLocalStorage.removeItem('family_admin_user');
    }
  }, [adminUser]);

  // Auth form states
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userAuthError, setUserAuthError] = useState('');
  const [userAuthLoading, setUserAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [copiedCardEventId, setCopiedCardEventId] = useState<string | null>(null);
  const [deleteEventConfirmId, setDeleteEventConfirmId] = useState<string | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAuthError('');
    setUserAuthLoading(true);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userUsername, password: userPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setUserUsername('');
        setUserPassword('');
        setUserAuthError('');
      } else {
        setUserAuthError(data.error || 'Ocurrió un error en la autenticación.');
      }
    } catch (err) {
      setUserAuthError('Error al conectar con el servidor.');
    } finally {
      setUserAuthLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    setAdminAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user.role === 'admin') {
          setAdminUser(data.user);
          setAdminUsername('');
          setAdminPassword('');
          setAdminAuthError('');
        } else {
          setAdminAuthError('Acceso denegado: Este usuario no tiene privilegios de administrador.');
        }
      } else {
        setAdminAuthError(data.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setAdminAuthError('Error al conectar con el servidor.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    const confirmDisconnect = window.confirm("¿Estás seguro de que deseas desconectar la integración con Google Sheets?");
    if (!confirmDisconnect) return;

    try {
      await logout();
      setGoogleUserToken(null);
      setUserSpreadsheets([]);
      setEvents(prev => prev.map(e => {
        if (e.id === selectedEventId) {
          return {
            ...e,
            googleSheetsId: '',
            googleSheetsName: '',
            googleSheetsToken: '',
            googleSheetsLastSync: '',
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      }));
    } catch (err) {
      console.error("Error al desconectar Google Sheets:", err);
    }
  };

  const handleSelectSheet = async (sheetId: string) => {
    const sheet = userSpreadsheets.find(s => s.id === sheetId);
    if (!sheet) return;

    // Save selection
    setEvents(prev => prev.map(e => {
      if (e.id === selectedEventId) {
        return {
          ...e,
          googleSheetsId: sheet.id,
          googleSheetsName: sheet.name,
          googleSheetsToken: googleUserToken || '',
          googleSheetsLastSync: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" }),
          updatedAt: new Date().toISOString()
        };
      }
      return e;
    }));

    // In background, append headers if empty
    if (googleUserToken) {
      try {
        await appendToGoogleSheet(googleUserToken, sheet.id, [
          "Fecha de Confirmación",
          "Nombre del Invitado",
          "¿Asiste?",
          "Acompañantes adicionales",
          "Comentarios / Restricciones alimenticias"
        ]);
        console.log("Cabeceras creadas en Google Sheet.");
      } catch (err) {
        console.error("Error creating headers in sheet:", err);
      }
    }
  };

  // Server Database Synchronizer — loads ONLY this owner's invitations (never the whole
  // database) and seeds/refreshes the server one invitation at a time. Guest view has its
  // own dedicated single-invitation fetch below, so it never touches this at all.
  useEffect(() => {
    if (isGuestView) return;

    async function syncWithServer() {
      try {
        const eventsRes = await fetch(`/api/events?userId=${encodeURIComponent(ownerId)}`);
        if (eventsRes.ok) {
          const serverEvents: EventData[] = await eventsRes.json();
          const saved = safeLocalStorage.getItem('family_events');
          let localEvents: EventData[] = [];
          if (saved) {
            try { localEvents = JSON.parse(saved); } catch (e) {}
          }
          const localOwnEvents = localEvents.filter(e => !e.userId || e.userId === ownerId);

          const mergedMap = new Map<string, EventData>();
          serverEvents.forEach(e => mergedMap.set(e.id, e));
          // Add local events the server doesn't have yet, or newer local edits made off-line
          const toPush: EventData[] = [];
          localOwnEvents.forEach(e => {
            const existing = mergedMap.get(e.id);
            if (!existing) {
              mergedMap.set(e.id, e);
              toPush.push(e);
            } else {
              const localTime = new Date(e.updatedAt || e.createdAt || 0).getTime();
              const serverTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              if (localTime > serverTime) {
                mergedMap.set(e.id, e);
                toPush.push(e);
              }
            }
          });

          const finalEvents = Array.from(mergedMap.values());
          if (finalEvents.length > 0) {
            setEvents(finalEvents);
          }

          // Seed/refresh the server with anything it was missing — one document per call,
          // never a full-array replace, so this can never affect any other invitation.
          await Promise.all(toPush.map(e =>
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(e)
            }).catch(err => console.error('Error seeding event to server:', err))
          ));

          // RSVP counts scoped to just this owner's own invitations.
          const rsvpLists = await Promise.all(finalEvents.map(e =>
            fetch(`/api/rsvps?eventId=${encodeURIComponent(e.id)}`)
              .then(r => (r.ok ? r.json() : []))
              .catch(() => [])
          ));
          setRsvps(rsvpLists.flat());
        }
      } catch (err) {
        console.error('Error during initial server database synchronization:', err);
      } finally {
        setHasLoadedInitialData(true);
      }
    }
    syncWithServer();
  }, []);

  useEffect(() => {
    if (isGuestView) return;
    safeLocalStorage.setItem('family_events', JSON.stringify(events));
  }, [events, isGuestView]);

  // Autosave the currently active invitation only — debounced so rapid typing doesn't
  // spam the network. Explicit save actions (create/update/delete buttons) also save
  // immediately; this just covers ordinary in-place editing.
  useEffect(() => {
    if (!hasLoadedInitialData || isGuestView) return;
    const eventToSave = events.find(e => e.id === selectedEventId);
    if (!eventToSave || !eventToSave.userId) return;

    const timeoutId = setTimeout(() => {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSave)
      }).catch(err => console.error('Error saving event to server:', err));
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [events, selectedEventId, hasLoadedInitialData, isGuestView]);

  useEffect(() => {
    if (isGuestView) return;
    safeLocalStorage.setItem('family_rsvps', JSON.stringify(rsvps));
  }, [rsvps, isGuestView]);

  useEffect(() => {
    if (!hasLoadedInitialData) return;
    safeLocalStorage.setItem('family_donations', JSON.stringify(donationConfig));
  }, [donationConfig, hasLoadedInitialData]);

  // Custom Admin Templates State
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = safeLocalStorage.getItem('family_custom_templates');
    const loaded: CustomTemplate[] = saved ? JSON.parse(saved) : [];
    // Ensure "Editorial White", "Editorial Black", and "Editorial Olive" are registered and always updated to the latest version in code.
    const idxWhite = loaded.findIndex(t => t.id === 'editorial-white-v1');
    if (idxWhite !== -1) {
      loaded[idxWhite] = EDITORIAL_WHITE_TEMPLATE;
    } else {
      loaded.unshift(EDITORIAL_WHITE_TEMPLATE);
    }

    const idxBlack = loaded.findIndex(t => t.id === 'editorial-black-v1');
    if (idxBlack !== -1) {
      loaded[idxBlack] = EDITORIAL_BLACK_TEMPLATE;
    } else {
      const whitePos = loaded.findIndex(t => t.id === 'editorial-white-v1');
      if (whitePos !== -1) {
        loaded.splice(whitePos + 1, 0, EDITORIAL_BLACK_TEMPLATE);
      } else {
        loaded.unshift(EDITORIAL_BLACK_TEMPLATE);
      }
    }

    const idxOlive = loaded.findIndex(t => t.id === 'editorial-olive-v1');
    if (idxOlive !== -1) {
      loaded[idxOlive] = EDITORIAL_OLIVE_TEMPLATE;
    } else {
      const blackPos = loaded.findIndex(t => t.id === 'editorial-black-v1');
      if (blackPos !== -1) {
        loaded.splice(blackPos + 1, 0, EDITORIAL_OLIVE_TEMPLATE);
      } else {
        loaded.push(EDITORIAL_OLIVE_TEMPLATE);
      }
    }

    const idxV2Premium = loaded.findIndex(t => t.id === 'editorial-v2-premium');
    if (idxV2Premium !== -1) {
      loaded[idxV2Premium] = EDITORIAL_V2_PREMIUM_TEMPLATE;
    } else {
      loaded.push(EDITORIAL_V2_PREMIUM_TEMPLATE);
    }

    const idxV2Olive = loaded.findIndex(t => t.id === 'editorial-v2-olive');
    if (idxV2Olive !== -1) {
      loaded[idxV2Olive] = EDITORIAL_V2_OLIVE_TEMPLATE;
    } else {
      loaded.push(EDITORIAL_V2_OLIVE_TEMPLATE);
    }

    const idxPassport = loaded.findIndex(t => t.id === 'editorial-passport-v1');
    if (idxPassport !== -1) {
      loaded[idxPassport] = EDITORIAL_PASSPORT_TEMPLATE;
    } else {
      loaded.push(EDITORIAL_PASSPORT_TEMPLATE);
    }
    return loaded;
  });

  useEffect(() => {
    safeLocalStorage.setItem('family_custom_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Google Font Dynamic Loader
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@300;400;600;700;800&family=Italiana&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700;900&family=Outfit:wght@300;400;700;800&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Sacramento&family=Space+Grotesk:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Guest view fetches exactly the one invitation it needs, directly from the server —
  // it never downloads the full events collection, which is both faster and means a
  // guest's browser never receives every other family's private invitation data.
  const [guestEvent, setGuestEvent] = useState<EventData | null>(null);

  useEffect(() => {
    if (!isGuestView || !guestEventId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(guestEventId)}`);
        if (cancelled) return;
        if (res.ok) {
          setGuestEvent(await res.json());
        }
      } catch (err) {
        console.error('Error loading guest invitation:', err);
      } finally {
        if (!cancelled) setHasLoadedInitialData(true);
      }
    })();
    return () => { cancelled = true; };
  }, [isGuestView, guestEventId]);

  // Handler for submitting RSVPs directly from the Guest Invitation View
  const handleGuestViewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestViewName.trim() || !guestEvent) return;
    setGuestViewSubmitting(true);

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'rsvp-' + Date.now(),
          eventId: guestEvent.id,
          guestName: guestViewName,
          attending: guestViewAttending,
          companions: guestViewAttending ? guestViewCompanions : 0,
          comment: guestViewComment,
          googleSheetsUrl: guestEvent.googleSheetsUrl
        })
      });

      if (response.ok) {
        setGuestViewSuccess(`¡Muchas gracias ${guestViewName}! Tu confirmación se ha registrado exitosamente.`);
        setGuestViewName('');
        setGuestViewComment('');
        setGuestViewCompanions(0);
      } else {
        alert('Hubo un problema al registrar tu asistencia. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error in guest RSVP submit:', err);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setGuestViewSubmitting(false);
    }
  };

  // Premium Guest Mode Render Bypass
  if (isGuestView) {
    if (!hasLoadedInitialData) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8C7A5F] mb-4"></div>
          <p className="text-xs text-stone-500 font-extrabold uppercase tracking-widest animate-pulse">Cargando Invitación...</p>
        </div>
      );
    }

    if (!guestEvent) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <span className="text-4xl mb-4">✉️</span>
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-2">Invitación No Encontrada</h2>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            Lo sentimos, no pudimos encontrar la invitación que estás buscando. Por favor verifica que el enlace sea correcto o contacta a los anfitriones del evento.
          </p>
          <a
            href="/"
            className="inline-block bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Ir al Inicio
          </a>
        </div>
      );
    }

    const isDarkTemplate = guestEvent.style === 'editorial-black-v1';
    const isOliveTemplate = guestEvent.style === 'editorial-olive-v1';
    const coverUrl = guestEvent.imageUrl || 
      (guestEvent.galleryImages && guestEvent.galleryImages.length > 0 ? guestEvent.galleryImages[0] : '') ||
      customImageUrls[guestEvent.id] || 
      (guestEvent.style === 'editorial-white-v1' ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' : 
       isDarkTemplate ? 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200' : 
       isOliveTemplate ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200' : '');

    let pageBgClass = 'bg-[#FAF8F5]';
    let cardClass = 'bg-[#FAF8F5] sm:bg-white border-[#E9E3DA] text-stone-900';
    let badgeClass = 'text-[#8C7A5F]';
    let titleClass = 'text-stone-900';
    let descClass = 'text-stone-500';
    let successClass = 'bg-[#FAF8F5] border-[#8C7A5F]/30';
    let successTextClass = 'text-stone-950';
    let labelClass = 'text-stone-500';
    let inputClass = 'bg-white border border-[#DCD5C9] text-stone-850 focus:border-[#8C7A5F]';

    if (isDarkTemplate) {
      pageBgClass = 'bg-[#111111]';
      cardClass = 'bg-[#161616] border-stone-800 text-[#FAF8F5]';
      badgeClass = 'text-[#C7A873]';
      titleClass = 'text-[#FAF8F5]';
      descClass = 'text-stone-400';
      successClass = 'bg-[#222222] border-stone-800';
      successTextClass = 'text-[#FAF8F5]';
      labelClass = 'text-stone-400';
      inputClass = 'bg-[#222222] border border-stone-800 text-[#FAF8F5] focus:border-[#C7A873]';
    } else if (isOliveTemplate) {
      pageBgClass = 'bg-[#F7F4EF]';
      cardClass = 'bg-white border-[#E6E1D8] text-[#3D3A35]';
      badgeClass = 'text-[#8D9982]';
      titleClass = 'text-[#3D3A35]';
      descClass = 'text-[#706B62]';
      successClass = 'bg-[#FDFCFB] border-[#8D9982]/30';
      successTextClass = 'text-[#3D3A35]';
      labelClass = 'text-[#706B62]';
      inputClass = 'bg-white border border-[#E6E1D8] text-[#3D3A35] focus:border-[#8D9982]';
    }

    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-start p-0 m-0 overflow-y-auto transition-colors duration-500 ${pageBgClass}`}>
        {/* Full-width elegant invitation container */}
        <div className="w-full max-w-4xl flex flex-col justify-center items-center">
          <InvitationPreview 
            event={guestEvent} 
            imageUrl={coverUrl}
            isMobileSize={isMobileScreen}
            customTemplates={customTemplates}
          />
        </div>

        {/* Premium Embedded Direct RSVP Form */}
        {guestEvent.style !== 'editorial-passport-v1' && (
          <div className="w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6">
            <div className={`rounded-[32px] p-6 sm:p-10 border shadow-xs text-center flex flex-col items-center ${cardClass}`}>
            <span className={`text-[10px] uppercase tracking-[0.3em] font-extrabold mb-3 ${badgeClass}`}>
              Confirmación Directa de Invitados
            </span>
            <h3 className={`text-xl sm:text-2xl font-serif mb-4 ${titleClass}`}>
              ¿Nos acompañas en este gran día?
            </h3>
            <p className={`text-xs leading-relaxed max-w-md mb-6 ${descClass}`}>
              Confirma tu asistencia directamente en este formulario. Tus datos se actualizarán al instante en el panel de los anfitriones y su planilla en tiempo real.
            </p>

            {guestViewSuccess ? (
              <div className={`w-full border p-8 rounded-2xl text-center animate-fade-in flex flex-col items-center gap-2 ${successClass}`}>
                <span className="text-3xl">🕊️</span>
                <p className={`text-sm font-bold leading-normal ${successTextClass}`}>{guestViewSuccess}</p>
                <p className="text-[10px] text-stone-400 mt-1">¡Los novios/anfitriones han sido notificados!</p>
              </div>
            ) : (
              <form onSubmit={handleGuestViewSubmit} className="w-full flex flex-col gap-4 text-left">
                {/* Guest Name */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] uppercase tracking-wider font-extrabold ${labelClass}`}>Nombre Completo del Invitado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tía María Sol Lavin"
                    value={guestViewName}
                    onChange={(e) => setGuestViewName(e.target.value)}
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none transition-all ${inputClass}`}
                  />
                </div>

                {/* Attendance */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] uppercase tracking-wider font-extrabold ${labelClass}`}>¿Asistirás?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestViewAttending(true)}
                      className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                        guestViewAttending
                          ? isDarkTemplate
                            ? 'bg-[#FAF8F5] text-[#111111] border-[#FAF8F5]'
                            : isOliveTemplate
                              ? 'bg-[#5C6454] text-white border-[#5C6454]'
                              : 'bg-[#8C7A5F] text-white border-[#8C7A5F]'
                          : isDarkTemplate
                            ? 'bg-[#1e1e1e] text-stone-300 border-stone-800 hover:bg-stone-900'
                            : isOliveTemplate
                              ? 'bg-white text-[#706B62] border-[#E6E1D8] hover:bg-[#FDFCFB]'
                              : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-stone-50'
                      }`}
                    >
                      💍 Sí, asistiré con gusto
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestViewAttending(false)}
                      className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                        !guestViewAttending
                          ? isDarkTemplate
                            ? 'bg-rose-950 text-rose-200 border-rose-900'
                            : isOliveTemplate
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-rose-700 text-white border-rose-700'
                          : isDarkTemplate
                            ? 'bg-[#1e1e1e] text-stone-300 border-stone-800 hover:bg-stone-900'
                            : isOliveTemplate
                              ? 'bg-white text-[#706B62] border-[#E6E1D8] hover:bg-[#FDFCFB]'
                              : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-stone-50'
                      }`}
                    >
                      ✉️ No podré asistir
                    </button>
                  </div>
                </div>

                {/* Companions count */}
                {guestViewAttending && (
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] uppercase tracking-wider font-extrabold ${labelClass}`}>¿Con cuántos acompañantes asistes?</label>
                    <select
                      value={guestViewCompanions}
                      onChange={(e) => setGuestViewCompanions(Number(e.target.value))}
                      className={`w-full text-xs rounded-xl p-3 focus:outline-none transition-all ${inputClass}`}
                    >
                      <option value="0">Voy solo/a</option>
                      <option value="1">1 Acompañante</option>
                      <option value="2">2 Acompañantes</option>
                      <option value="3">3 Acompañantes</option>
                      <option value="4">4 Acompañantes</option>
                      <option value="5">5 Acompañantes</option>
                    </select>
                  </div>
                )}

                {/* Comments / Diet restrictions */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] uppercase tracking-wider font-extrabold ${labelClass}`}>Mensaje de Felicitación / Comentarios / Alergias</label>
                  <textarea
                    rows={2.5}
                    placeholder="Ej. Alérgico al gluten / ¡Felicidades amigos!"
                    value={guestViewComment}
                    onChange={(e) => setGuestViewComment(e.target.value)}
                    className={`w-full text-xs rounded-xl p-3 resize-none focus:outline-none transition-all ${inputClass}`}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={guestViewSubmitting}
                  className={`w-full font-extrabold uppercase tracking-widest py-4 rounded-full transition-all text-xs disabled:opacity-50 mt-2 shadow-xs ${
                    isDarkTemplate
                      ? 'bg-[#FAF8F5] hover:bg-[#EBE9E5] text-[#111111]'
                      : isOliveTemplate
                        ? 'bg-[#5C6454] hover:bg-[#717B67] text-white'
                        : 'bg-[#8C7A5F] hover:bg-[#79684E] text-white'
                  }`}
                >
                  {guestViewSubmitting ? 'Registrando Asistencia...' : 'Enviar Confirmación'}
                </button>
              </form>
            )}
          </div>
        </div>
        )}
        <DesignerCreditCard styleId={guestEvent.style} />
      </div>
    );
  }

  const handleSaveTemplate = (template: CustomTemplate) => {
    setCustomTemplates(prev => {
      const idx = prev.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = template;
        return copy;
      }
      return [...prev, template];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Music Upload States
  const [isUploadingMusic, setIsUploadingMusic] = useState<boolean>(false);
  const [musicUploadError, setMusicUploadError] = useState<string>('');

  // Media Upload States (Photos and Videos)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean[]>([false, false, false]);
  const [photoUploadError, setPhotoUploadError] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [videoUploadError, setVideoUploadError] = useState<string>('');

  const handlePhotoUpload = async (file: File, index: number) => {
    const updatedLoading = [...isUploadingPhoto];
    updatedLoading[index] = true;
    setIsUploadingPhoto(updatedLoading);
    setPhotoUploadError('');

    try {
      if (file.size > 15 * 1024 * 1024) {
        setPhotoUploadError('La imagen es demasiado grande (máximo 15MB)');
        updatedLoading[index] = false;
        setIsUploadingPhoto([...updatedLoading]);
        return;
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data,
          eventId: activeEvent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen al servidor');
      }

      const result = await response.json();
      if (result.success && result.url) {
        const currentGallery = activeEvent.galleryImages ? [...activeEvent.galleryImages] : ['', '', ''];
        // Ensure array size is at least index + 1
        while (currentGallery.length <= index) {
          currentGallery.push('');
        }
        currentGallery[index] = result.url;
        updateActiveEventField('galleryImages', currentGallery);
      }
    } catch (err: any) {
      console.error(err);
      setPhotoUploadError('Fallo al cargar la foto: ' + (err.message || err));
    } finally {
      updatedLoading[index] = false;
      const finalLoading = [...isUploadingPhoto];
      finalLoading[index] = false;
      setIsUploadingPhoto(finalLoading);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setIsUploadingVideo(true);
    setVideoUploadError('');

    try {
      if (file.size > 30 * 1024 * 1024) {
        setVideoUploadError('El video es demasiado grande (máximo 30MB)');
        setIsUploadingVideo(false);
        return;
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data,
          eventId: activeEvent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir el video al servidor');
      }

      const result = await response.json();
      if (result.success && result.url) {
        updateActiveEventField('videoUrl', result.url);
      }
    } catch (err: any) {
      console.error(err);
      setVideoUploadError('Fallo al cargar el video: ' + (err.message || err));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleMusicUpload = async (file: File) => {
    setIsUploadingMusic(true);
    setMusicUploadError('');
    try {
      if (file.size > 30 * 1024 * 1024) {
        setMusicUploadError('El archivo es demasiado grande (máximo 30MB)');
        setIsUploadingMusic(false);
        return;
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data,
          eventId: activeEvent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo al servidor');
      }

      const result = await response.json();
      if (!result.success || !result.audioUrl) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      const currentMusicConfig = activeEvent.musicConfig || { enabled: false };
      updateActiveEventField('musicConfig', {
        ...currentMusicConfig,
        enabled: true,
        audioUrl: result.audioUrl,
        songName: result.songName || file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Archivo de Audio Propio',
        showMuteButton: currentMusicConfig.showMuteButton ?? true,
        showReplayButton: currentMusicConfig.showReplayButton ?? true,
        autoplayOnOpen: currentMusicConfig.autoplayOnOpen ?? true,
        loop: currentMusicConfig.loop ?? true,
        initialVolume: currentMusicConfig.initialVolume ?? 80
      });
    } catch (err: any) {
      console.error(err);
      setMusicUploadError(err.message || 'Error al guardar el archivo de música en el servidor');
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const handleMusicRemove = async () => {
    try {
      const currentMusicConfig = activeEvent.musicConfig || { enabled: false };
      updateActiveEventField('musicConfig', {
        ...currentMusicConfig,
        audioUrl: '',
        songName: '',
        artist: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Pixabay Search State
  const [pixabayQuery, setPixabayQuery] = useState<string>('');
  const [pixabayKey, setPixabayKey] = useState<string>('44719280-5b512e9b9cf90176313f8c5b9'); // Demo API key
  const [pixabayResults, setPixabayResults] = useState<any[]>([]);
  const [isSearchingPixabay, setIsSearchingPixabay] = useState<boolean>(false);
  const [pixabaySearched, setPixabaySearched] = useState<boolean>(false);

  // AI Helpers
  const [aiPromptOutput, setAiPromptOutput] = useState<string>('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState<boolean>(false);

  // RSVP Guest form inputs
  const [guestName, setGuestName] = useState<string>('');
  const [guestAttending, setGuestAttending] = useState<boolean>(true);
  const [guestCompanions, setGuestCompanions] = useState<number>(0);
  const [guestComment, setGuestComment] = useState<string>('');
  const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState<string>('');

  // Donation Dialog on 'Crear Invitación'
  const [showDonationPopup, setShowDonationPopup] = useState<boolean>(false);
  const [newCreatedEventUrl, setNewCreatedEventUrl] = useState<string>('');

  // Apply style prompts to either clone as new event or update current event
  const [pendingStyleToApply, setPendingStyleToApply] = useState<string | null>(null);
  const [showApplyStyleModal, setShowApplyStyleModal] = useState<boolean>(false);

  // Active event selector helpers
  const visibleEvents = useMemo(() => {
    if (adminUser) {
      return events; // Admin sees everything!
    }
    if (!currentUser) {
      return events; // Standard view (publicly available)
    }
    // Return all events that have no user ID, or user's owned events so they don't see other users' private ones
    return events.filter(e => !e.userId || e.userId === currentUser.id);
  }, [events, currentUser, adminUser]);

  const activeEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || visibleEvents[0] || events[0] || INITIAL_EVENTS[0];
  }, [events, visibleEvents, selectedEventId]);

  const activeTemplate = useMemo(() => {
    return TEMPLATE_STYLES[activeEvent.style] || TEMPLATE_STYLES.elegante;
  }, [activeEvent.style]);

  // Update active event parameters
  const updateActiveEventField = (field: keyof EventData, value: any) => {
    setEvents(prev => prev.map(e => {
      if (e.id === selectedEventId) {
        let updatedStyle = e.style;
        let updatedTitle = e.title;
        let updatedDescription = e.description;

        if (field === 'type') {
          const newType = value as EventType;
          updatedStyle = EVENT_TYPES_METADATA[newType]?.suggestedStyle || 'elegante';

          // Set default templates text based on selected category type
          const isDefaultTitle = [
            'Nuestra Boda Soñada', 
            '¡Mis 30 Primaveras!', 
            'Celebración de Matrimonio / Boda', 
            'Celebración de Cumpleaños',
            'Celebración de Fiesta / Celebración',
            'Celebración de Reunión Familiar',
            'Celebración de Baby Shower',
            'Celebración de Bautizo',
            'Celebración de Confirmación',
            'Celebración de Otro Evento Especial',
            'Mi Santo Bautizo',
            'Mi Confirmación'
          ].some(t => e.title === t || e.title.startsWith('Celebración de'));

          if (isDefaultTitle) {
            if (newType === 'matrimonio') {
              updatedTitle = 'Nuestra Boda Soñada';
              updatedDescription = 'Querida familia, nos llena de felicidad invitarlos a celebrar nuestra unión matrimonial. Ha sido un camino hermoso y queremos compartir el inicio de esta nueva etapa con las personas que más amamos. \n\nVestimenta: Formal. \nRegalo: Lluvia de sobres o transferencia de apoyo.';
            } else if (newType === 'cumpleanos') {
              updatedTitle = '¡Mis 30 Primaveras!';
              updatedDescription = '¡Se viene el cambio de folio! Quiero celebrar un año más de vida compartiendo ricas comidas, buena música y anécdotas con mi familia chilena y colombiana. \n\n¡Los espero para cantar el cumpleaños feliz! No olviden confirmar su asistencia para preparar los bocadillos.';
            } else if (newType === 'bautizo') {
              updatedTitle = 'Mi Santo Bautizo';
              updatedDescription = 'Querida familia y amigos, nos llena de regocijo invitarlos al bautismo de nuestro hijo/a. Queremos compartir con ustedes esta hermosa bendición y consagración ante Dios, rodeados de fe y mucho amor.';
            } else if (newType === 'confirmacion') {
              updatedTitle = 'Mi Confirmación';
              updatedDescription = 'Tengo la alegría de invitarlos a acompañarme en el sacramento de mi Confirmación. Es un paso muy importante en mi vida de fe y deseo de corazón compartir este día tan especial y bendecido con todos ustedes.';
            } else if (newType === 'babyshower') {
              updatedTitle = 'Baby Shower Especial';
              updatedDescription = '¡Un nuevo milagro está por llegar! Queremos invitarlos a celebrar la dulce espera de nuestro bebé. Compartiremos juegos, risas y mucho cariño para prepararnos para este gran momento familiar.';
            } else if (newType === 'fiesta') {
              updatedTitle = '¡Gran Fiesta Familiar!';
              updatedDescription = '¡Cualquier motivo es excelente para sonreír y festejar juntos! Queremos reunirlos a todos para compartir una velada increíble llena de música, baile, comida deliciosa y momentos inolvidables.';
            } else if (newType === 'reunion') {
              updatedTitle = 'Gran Almuerzo Familiar';
              updatedDescription = '¡Ha pasado mucho tiempo! Queremos reunir a toda la familia bajo un mismo techo para reír, ponernos al día y disfrutar de un asado espectacular. Traigan su mejor sonrisa y muchas ganas de compartir.';
            } else {
              updatedTitle = `Celebración Especial`;
              updatedDescription = 'Querida familia, nos encantaría que nos acompañen en este momento tan bonito y especial. ¡No falten!';
            }

            // Also search for a new curated image or set a default one matching the category
            const defaultImg = CURATED_EVENT_IMAGES[newType]?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
            setCustomImageUrls(prev => ({ ...prev, [e.id]: defaultImg }));
          }
        }

        const updatedEvent = { 
          ...e, 
          [field]: value, 
          updatedAt: new Date().toISOString() 
        };

        if (field === 'type') {
          updatedEvent.title = updatedTitle;
          updatedEvent.description = updatedDescription;
          updatedEvent.style = updatedStyle;
        }

        if (field === 'style') {
          const newStyle = value as string;
          const currentImg = customImageUrls[e.id];
          const isDefaultOfOld = !currentImg || 
            currentImg.includes('photo-1519741497674') || 
            currentImg.includes('photo-1519225495810') || 
            currentImg.includes('photo-1542601906990') || 
            currentImg.includes('photo-1530103862676');
            
          if (isDefaultOfOld) {
            let defaultImg = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
            if (newStyle === 'editorial-black-v1') {
              defaultImg = 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200';
            } else if (newStyle === 'editorial-olive-v1' || newStyle === 'editorial-v2-olive') {
              defaultImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200';
            } else if (newStyle === 'editorial-passport-v1') {
              defaultImg = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200';
            }
            
            setCustomImageUrls(prev => ({ ...prev, [e.id]: defaultImg }));
          }
        }

        return updatedEvent;
      }
      return e;
    }));
  };

  // Create empty template
  const createNewEvent = (type: EventType) => {
    const meta = EVENT_TYPES_METADATA[type];
    const newId = `evento-${Date.now()}`;
    const newEvent: EventData = {
      id: newId,
      type: type,
      style: meta.suggestedStyle,
      title: `Celebración de ${meta.name}`,
      hostName: 'Hans Lavin & Chefie Arias',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:30',
      locationName: 'Salón Familiar Principal',
      locationAddress: 'Santiago, Chile / Medellín, Colombia',
      description: 'Querida familia, nos encantaría que nos acompañen en este momento tan bonito y especial. ¡No falten!',
      dressCode: 'Formal / Elegante',
      dressCodeDescription: 'Te sugerimos traje formal para caballeros y vestido de fiesta para damas.',
      whatsappContact: '+56912345678',
      userId: ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEvents(prev => [...prev, newEvent]);
    setSelectedEventId(newId);
    saveEventToServer(newEvent);

    const initialImg = CURATED_EVENT_IMAGES[type]?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
    setCustomImageUrls(prev => ({ ...prev, [newId]: initialImg }));
  };

  // Click on 'CREAR TARJETA E INVITACIÓN' - keeping fallback
  const handleDeployInvitation = () => {
    const uniqueUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
    setNewCreatedEventUrl(uniqueUrl);
    setShowDonationPopup(true);
  };

  // Save as brand new invitation (Separate unique URL)
  const handleCreateAsNewInvitation = () => {
    const newId = `evento-${Date.now()}`;
    const newTitle = activeEvent.title.includes('(Copia)') || activeEvent.title.endsWith('(Nueva)')
      ? activeEvent.title 
      : `${activeEvent.title} (Nueva)`;
      
    const clonedEvent: EventData = {
      ...activeEvent,
      id: newId,
      title: newTitle,
      userId: ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Copy cover image URL for this event id
    const currentCoverImg = customImageUrls[activeEvent.id];
    if (currentCoverImg) {
      setCustomImageUrls(prev => ({ ...prev, [newId]: currentCoverImg }));
    }
    
    setEvents(prev => [...prev, clonedEvent]);
    setSelectedEventId(newId);
    saveEventToServer(clonedEvent);

    // Set deployment info
    const uniqueUrl = `${window.location.origin}/invitacion/${newId}`;
    setNewCreatedEventUrl(uniqueUrl);
    setShowDonationPopup(true);
  };

  // Update existing invitation (Same URL)
  const handleUpdateExistingInvitation = () => {
    const updatedEvent: EventData = { ...activeEvent, updatedAt: new Date().toISOString() };
    setEvents(prev => prev.map(e => (e.id === selectedEventId ? updatedEvent : e)));
    saveEventToServer(updatedEvent);

    const uniqueUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
    setNewCreatedEventUrl(uniqueUrl);
    setShowDonationPopup(true);
  };

  const handleClosePopupAndGoHome = () => {
    setShowDonationPopup(false);
    setCurrentView('home');
  };

  const deleteEvent = async (id: string) => {
    if (events.length <= 1) {
      alert('Debes mantener al menos una invitación para previsualizar.');
      return;
    }
    const remaining = events.filter(e => e.id !== id);
    setEvents(remaining);
    setSelectedEventId(remaining[0].id);
    try {
      await fetch(`/api/events/${encodeURIComponent(id)}?userId=${encodeURIComponent(ownerId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting event from server:', err);
    }
  };

  // Pixabay search integration
  const handlePixabaySearch = async () => {
    if (!pixabayQuery) return;
    setIsSearchingPixabay(true);
    setPixabaySearched(true);
    try {
      const results = await searchPixabayImages(pixabayQuery, activeEvent.type, pixabayKey);
      setPixabayResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPixabay(false);
    }
  };

  const selectCoverImage = (url: string) => {
    setCustomImageUrls(prev => ({
      ...prev,
      [activeEvent.id]: url
    }));
    updateActiveEventField('imageUrl', url);
  };

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    setCoverUploadError('');

    try {
      if (file.size > 15 * 1024 * 1024) {
        setCoverUploadError('La imagen es demasiado grande (máximo 15MB)');
        setIsUploadingCover(false);
        return;
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64Data,
          eventId: activeEvent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen al servidor');
      }

      const result = await response.json();
      if (result.success && result.url) {
        selectCoverImage(result.url);
      }
    } catch (err: any) {
      console.error(err);
      setCoverUploadError('Fallo al cargar la foto: ' + (err.message || err));
    } finally {
      setIsUploadingCover(false);
    }
  };

  // AI Text Generator
  const generateDescriptionWithAi = () => {
    setIsGeneratingIdea(true);
    setTimeout(() => {
      let smartText = '';
      if (activeEvent.type === 'matrimonio') {
        smartText = `¡Nos casamos! 💍\n\nCon mucha alegría los invitamos a celebrar con nosotros este inicio de un gran camino de amor. \n\n📍 Lugar: ${activeEvent.locationName}\n📅 Fecha: ${activeEvent.date}\n⏰ Hora: ${activeEvent.time}\n\nCódigo de Vestimenta: Formal de Gala.\n\nPara nosotros lo más importante es su compañía, pero si desean realizarnos un obsequio o aportar para nuestro nuevo hogar, pueden hacerlo en la sección de donaciones bancarias de la invitación. ¡Esperamos verlos pronto!`;
      } else if (activeEvent.type === 'cumpleanos') {
        smartText = `¡Se viene una nueva vuelta al sol! 🎂✨\n\nTe invito a celebrar mi cumpleaños. Disfrutaremos de deliciosa comida, música y el mejor ambiente junto a nuestra hermosa familia de Chile y Colombia.\n\n📍 Ubicación: ${activeEvent.locationName}\n⏰ Hora: ${activeEvent.time}\n\n¡Confirma tu asistencia abajo para que preparemos los mejores platillos!`;
      } else if (activeEvent.type === 'babyshower') {
        smartText = `¡Esperamos con amor la llegada de nuestro bebé! 🍼👶🌸\n\nQuerida familia, están invitados a celebrar con nosotros este hermoso baby shower. Compartiremos divertidos juegos y ricas sorpresas.\n\n📍 Dónde: ${activeEvent.locationName}\n📅 Cuándo: ${activeEvent.date}`;
      } else {
        smartText = `¡Gran Encuentro de la Familia! 🏡🥩\n\nInvitamos a toda la familia a este día especial de reencuentro. Traigan todas sus ganas de conversar, comer rico y pasar un domingo maravilloso.\n\n📍 Lugar: ${activeEvent.locationName}\n🍔 Coordinemos la comida compartida.\n\n¡Por favor, confirmen asistencia!`;
      }
      updateActiveEventField('description', smartText);
      setIsGeneratingIdea(false);
    }, 600);
  };

  // AI Prompt compiler
  const triggerPromptGeneration = () => {
    setIsGeneratingPrompt(true);
    setTimeout(() => {
      const prompt = generateAiPromptForEvent(activeEvent.type, activeEvent.style, activeEvent.title, activeEvent.description);
      setAiPromptOutput(prompt);
      setIsGeneratingPrompt(false);
    }, 500);
  };

  // RSVP Form handler
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newRsvp: GuestRSVP = {
      id: `r-${Date.now()}`,
      eventId: activeEvent.id,
      guestName: guestName,
      attending: guestAttending,
      companions: guestCompanions,
      comment: guestComment,
      confirmedAt: new Date().toISOString()
    };

    setRsvps(prev => [newRsvp, ...prev]);
    setGuestName('');
    setGuestComment('');
    setGuestCompanions(0);
    setRsvpSuccessMessage(`¡Gracias ${guestName}! Tu confirmación se ha registrado exitosamente.`);
    
    setTimeout(() => {
      setRsvpSuccessMessage('');
    }, 5000);
  };

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const copyInvitationLink = () => {
    const shareUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          })
          .catch(() => {
            fallbackCopyText(shareUrl);
          });
      } else {
        fallbackCopyText(shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy', err);
      fallbackCopyText(shareUrl);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
  };

  const activeEventRsvps = useMemo(() => {
    return rsvps.filter(r => r.eventId === activeEvent.id);
  }, [rsvps, activeEvent.id]);

  const stats = useMemo(() => {
    const attendingList = activeEventRsvps.filter(r => r.attending);
    const totalAdults = attendingList.length;
    const totalCompanions = attendingList.reduce((sum, r) => sum + r.companions, 0);
    return {
      confirmedCount: attendingList.length,
      declinedCount: activeEventRsvps.filter(r => !r.attending).length,
      totalGuests: totalAdults + totalCompanions,
      companionsCount: totalCompanions
    };
  }, [activeEventRsvps]);

  return (
    // Global Styling Theme: Cream, Warm Beige, Sand Colors for exquisite elegant family vibes. Fully light/cream theme!
    <div className="min-h-screen bg-[#F9F6F0] text-stone-800 flex flex-col font-sans-modern selection:bg-[#E6DFD3] selection:text-stone-900">
      
      {/* Exquisite Top Bar Navigation */}
      <header className="border-b border-[#EBE5DA] bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="bg-[#8C7A5F] p-2.5 rounded-xl text-white shadow-sm">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
                Tarjeta Familiar Lavin Arias
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">Diseño, plantillas de eventos y confirmaciones para Chile y Colombia 🇨🇱 🇨🇴</p>
            </div>
          </div>

          {/* Nav Links: "Home", "Plantillas" and "Usuario" separated requested */}
          <nav className="flex items-center gap-1 bg-[#F1EBE0] p-1 rounded-xl border border-[#E6DFD3]">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'home'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              VER INVITACIÓN (Home)
            </button>

            <button
              id="nav-plantillas-btn"
              onClick={() => setCurrentView('plantillas')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'plantillas'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              PLANTILLAS (Diseños)
            </button>
            
            <button
              id="nav-usuario-btn"
              onClick={() => setCurrentView('usuario')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'usuario'
                  ? 'bg-[#8C7A5F] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              PANEL DE CARGA (Usuario)
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                currentView === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              ADMIN (Plantillas)
            </button>
          </nav>

           {/* Event Quick switch & management */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#EBE5DA] shadow-xs">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider pl-1.5 hidden lg:inline">Invitación:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-[#DCD5C9] text-xs font-bold text-stone-800 px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#8C7A5F] max-w-[130px] sm:max-w-none cursor-pointer"
            >
              {visibleEvents.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {EVENT_TYPES_METADATA[ev.type]?.emoji} {ev.title}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
                const title = prompt("Introduce el título para tu nueva invitación:", "Mi Celebración Especial");
                if (title && title.trim()) {
                  const newId = `evento-${Date.now()}`;
                  const newEvent: EventData = {
                    id: newId,
                    type: 'matrimonio', // Default category
                    style: 'elegante',
                    title: title.trim(),
                    hostName: 'Hans Lavin & Chefie Arias',
                    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    time: '19:30',
                    locationName: 'Salón Familiar Principal',
                    locationAddress: 'Santiago, Chile / Medellín, Colombia',
                    description: 'Querida familia, nos encantaría que nos acompañen en este momento tan bonito y especial. ¡No falten!',
                    dressCode: 'Formal / Elegante',
                    dressCodeDescription: 'Te sugerimos traje formal para caballeros y vestido de fiesta para damas.',
                    whatsappContact: '+56912345678',
                    userId: ownerId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setEvents(prev => [...prev, newEvent]);
                  setSelectedEventId(newId);
                  saveEventToServer(newEvent);

                  // Set unique URL and show popup
                  const uniqueUrl = `${window.location.origin}/invitacion/${newId}`;
                  setNewCreatedEventUrl(uniqueUrl);
                  
                  setCurrentView('usuario'); // Switch to User panel to load details
                  setShowDonationPopup(true);
                }
              }}
              className="bg-white hover:bg-stone-50 text-[#8C7A5F] border border-[#DCD5C9] p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
              title="Crear Nueva Invitación"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {events.length > 1 && (
              <button
                onClick={() => {
                  setDeleteEventConfirmId(activeEvent.id);
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
                title="Eliminar Invitación Seleccionada"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        
        {/* ========================================================= */}
        {/* VIEW: HOME (The Invitation Card spans full-width)        */}
        {/* ========================================================= */}
        {currentView === 'home' && (
          <div className="flex flex-col gap-8 w-full">
            
            {/* Header info bar */}
            <div className="bg-[#FAF8F5] border border-[#EBE5DA] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs text-stone-600 font-medium">
                  Vista preliminar de la invitación para compartir. Los invitados confirmados se registran abajo.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={copyInvitationLink}
                  className="bg-white border border-[#DCD5C9] hover:bg-[#FAF8F5] text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-stone-700"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Enlace Copiado' : 'Copiar URL Único'}
                </button>
              </div>
            </div>

            {/* Device Switcher Bar for Web vs Mobile View */}
            <div className="flex justify-center bg-white border border-[#EBE5DA] p-1.5 rounded-2xl max-w-sm mx-auto w-full shadow-sm">
              <button
                id="preview-web-btn"
                onClick={() => setPreviewMode('web')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  previewMode === 'web'
                    ? 'bg-[#8C7A5F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Vista Web (Escritorio)
              </button>
              <button
                id="preview-mobile-btn"
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-[#8C7A5F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Vista Móvil (Celular)
              </button>
            </div>

            {/* CONDITIONAL DEVICE INVITATION RENDERING */}
            {previewMode === 'web' ? (
              <div className="w-full bg-white rounded-3xl border border-[#EBE5DA] overflow-hidden shadow-xl transition-all duration-300">
                <InvitationPreview 
                  event={activeEvent} 
                  imageUrl={customImageUrls[activeEvent.id]} 
                  isMobileSize={false} 
                  customTemplates={customTemplates}
                />
              </div>
            ) : (
              /* Simulated Physical Smartphone */
              <div className="flex flex-col items-center justify-center py-2 w-full">
                <div className="relative w-full max-w-[375px] h-[720px] rounded-[50px] border-[12px] border-stone-850 bg-stone-900 shadow-2xl overflow-hidden flex flex-col justify-between">
                  
                  {/* Notch / Dynamic Island */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-stone-850 rounded-b-xl z-30 flex items-center justify-center">
                    <div className="w-10 h-0.75 bg-stone-700/80 rounded-full" />
                    <div className="w-2 h-2 bg-stone-800 rounded-full ml-2.5 border border-stone-700/50" />
                  </div>
                  
                  {/* Mobile Status Bar */}
                  <div className="h-7 w-full bg-transparent px-5 pt-1.5 flex justify-between items-center text-[9px] text-stone-500 font-bold absolute top-0.5 left-0 z-20 pointer-events-none select-none">
                    <span>12:30 🇨🇱 🇨🇴</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-4 h-2.5 border border-stone-500 rounded-xs flex p-0.5">
                        <div className="w-full h-full bg-stone-500 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>
  
                  {/* Viewport Frame with native vertical scroll */}
                  <div className="flex-1 overflow-y-auto h-full rounded-[38px] bg-[#FAF8F5] scrollbar-none pt-7 pb-4">
                    <InvitationPreview 
                      event={activeEvent} 
                      imageUrl={customImageUrls[activeEvent.id]} 
                      isMobileSize={true} 
                      customTemplates={customTemplates}
                    />
                    
                    {/* Immersive Mobile RSVP form inside Mobile Viewport */}
                    {activeEvent.style !== 'editorial-passport-v1' && (
                      <div className="bg-[#FAF8F5] p-4 border-t border-stone-200">
                      <div className="text-center flex flex-col items-center gap-1.5 pb-4 border-b border-stone-200">
                        <span className="text-xl">✨</span>
                        <h4 className="text-xs font-black text-stone-900">Confirmar Mi Asistencia</h4>
                        <p className="text-[9px] text-stone-400 max-w-[200px]">
                          Formulario optimizado para celulares de la familia.
                        </p>
                      </div>

                      <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-2.5 mt-3">
                        <input
                          type="text"
                          required
                          placeholder="Tu Nombre Completo"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="bg-white border border-[#DCD5C9] text-[10px] text-stone-800 rounded-lg p-2 focus:outline-none focus:border-[#8C7A5F]"
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setGuestAttending(true)}
                            className={`py-1.5 text-[9px] font-extrabold rounded-lg border transition-all ${
                              guestAttending ? 'bg-[#8C7A5F] text-white border-[#8C7A5F]' : 'bg-white text-stone-600 border-[#DCD5C9]'
                            }`}
                          >
                            Sí, asistiré
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuestAttending(false)}
                            className={`py-1.5 text-[9px] font-extrabold rounded-lg border transition-all ${
                              !guestAttending ? 'bg-rose-700 text-white border-rose-700' : 'bg-white text-stone-600 border-[#DCD5C9]'
                            }`}
                          >
                            No podré
                          </button>
                        </div>

                        {guestAttending && (
                          <select
                            value={guestCompanions}
                            onChange={(e) => setGuestCompanions(Number(e.target.value))}
                            className="bg-white border border-[#DCD5C9] text-[10px] text-stone-850 rounded-lg p-2"
                          >
                            <option value="0">Voy solo/a</option>
                            <option value="1">1 acompañante</option>
                            <option value="2">2 acompañantes</option>
                            <option value="3">3 acompañantes</option>
                          </select>
                        )}

                        <textarea
                          rows={2}
                          placeholder="Mensaje o alergia..."
                          value={guestComment}
                          onChange={(e) => setGuestComment(e.target.value)}
                          className="bg-white border border-[#DCD5C9] text-[10px] text-stone-800 rounded-lg p-2 resize-none"
                        />

                        <button
                          type="submit"
                          className="bg-[#8C7A5F] text-white font-extrabold py-2 px-3 rounded-lg text-[9px] tracking-wider uppercase transition-all"
                        >
                          Enviar Confirmación
                        </button>
                      </form>
                    </div>
                    )}

                  </div>

                  {/* Physical home indicator line */}
                  <div className="absolute bottom-1 w-full flex justify-center pointer-events-none select-none z-30">
                    <div className="w-20 h-1 bg-stone-600 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* RSVP CARD (FORM DE REGISTRO) - APPEARS AT THE BOTTOM AND MUST BE LIGHT / CREAM COLOR (not black) */}
            {activeEvent.style !== 'editorial-passport-v1' && (
              <div className="w-full bg-[#FAF8F5] rounded-3xl border border-[#EBE5DA] p-6 sm:p-10 shadow-md">
              
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                
                <div className="text-center flex flex-col items-center gap-1.5 border-b border-[#EBE5DA] pb-5">
                  <div className="bg-[#8C7A5F]/10 p-3 rounded-full text-[#8C7A5F]">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 mt-2">Confirmar Mi Asistencia</h3>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
                    Ayuda a los anfitriones con la preparación de bocadillos, comida y espacio para niños. Tu respuesta se registra inmediatamente.
                  </p>
                </div>

                {rsvpSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2.5 shadow-xs">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="font-medium">{rsvpSuccessMessage}</p>
                  </div>
                )}

                <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
                  
                  {/* Guest Name input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">Nombre Completo del Invitado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Tía María Sol Lavin"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Attendance validation option buttons */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">¿Asistirás al Evento?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGuestAttending(true)}
                        className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                          guestAttending 
                            ? 'bg-[#8C7A5F] text-white border-[#8C7A5F] shadow-xs' 
                            : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-[#F9F6F0]'
                        }`}
                      >
                        👍 Sí, asistiré con gusto
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuestAttending(false)}
                        className={`py-3 text-xs font-extrabold rounded-xl border transition-all ${
                          !guestAttending 
                            ? 'bg-rose-700 text-white border-rose-700 shadow-xs' 
                            : 'bg-white text-stone-600 border-[#DCD5C9] hover:bg-[#F9F6F0]'
                        }`}
                      >
                        👎 No podré asistir
                      </button>
                    </div>
                  </div>

                  {/* Companions counter toggle */}
                  {guestAttending && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-xs text-stone-600 font-bold">Acompañantes adicionales</label>
                      <select
                        value={guestCompanions}
                        onChange={(e) => setGuestCompanions(Number(e.target.value))}
                        className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] shadow-2xs"
                      >
                        <option value="0">Ninguno (Voy solo/a)</option>
                        <option value="1">Llevo 1 acompañante</option>
                        <option value="2">Llevo 2 acompañantes</option>
                        <option value="3">Llevo 3 acompañantes</option>
                        <option value="4">Llevo 4 acompañantes</option>
                        <option value="5">Llevo 5 o más adicionales</option>
                      </select>
                      <p className="text-[10px] text-stone-400">
                        *Indica si viajan niños o adultos en los comentarios para organizar la comida típica.
                      </p>
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-600 font-bold">Mensaje / Alergias Alimentarias</label>
                    <textarea
                      rows={3}
                      placeholder="Ej. ¡Felicitaciones! Estaré feliz de acompañar a la familia. Viajo desde Medellín."
                      value={guestComment}
                      onChange={(e) => setGuestComment(e.target.value)}
                      className="bg-white border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] transition-all resize-none shadow-2xs"
                    />
                  </div>

                  {/* Submit RSVP btn */}
                  <button
                    type="submit"
                    className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar Confirmación Familiar
                  </button>

                </form>

              </div>

            </div>
            )}

            <DesignerCreditCard styleId={activeEvent.style} />

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: PLANTILLAS (TEMPLATE SELECTOR GALLERY)              */}
        {/* ========================================================= */}
        {currentView === 'plantillas' && (
          <TemplateGallery 
            activeEvent={activeEvent}
            imageUrl={customImageUrls[activeEvent.id]}
            onSelectStyle={(style) => {
              setPendingStyleToApply(style);
              setShowApplyStyleModal(true);
            }}
            onPreviewStyle={(style) => {
              setPendingStyleToApply(style);
              setShowApplyStyleModal(true);
            }}
            onSelectCategory={(category) => updateActiveEventField('type', category)}
            customTemplates={customTemplates}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW: ADMIN (TEMPLATE CREATION AND CUSTOM MANAGEMENT)     */}
        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* VIEW: ADMIN (TEMPLATE CREATION AND CUSTOM MANAGEMENT)     */}
        {/* ========================================================= */}
        {currentView === 'admin' && (
          adminUser === null ? (
            <div className="max-w-md w-full mx-auto bg-white border border-[#EBE5DA] rounded-3xl p-8 shadow-lg flex flex-col gap-6">
              <div className="text-center">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center border border-[#EBE5DA] mb-3">
                  <Settings className="w-6 h-6 text-[#8C7A5F]" />
                </div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Acceso de Administrador</h3>
                <p className="text-xs text-stone-500 mt-1">Crea y gestiona plantillas personalizadas de manera global.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Usuario de Administrador</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Ej. admin"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                  />
                </div>

                {adminAuthError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium leading-relaxed">
                    ⚠️ {adminAuthError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={adminAuthLoading}
                  className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {adminAuthLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Ingresar al Panel de Admin"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Administrador
                  </div>
                  <span className="text-xs text-stone-600 font-medium">Sesión iniciada como <strong>{adminUser.username}</strong></span>
                </div>
                <button
                  onClick={() => setAdminUser(null)}
                  className="text-xs text-stone-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-all cursor-pointer bg-[#FAF8F5] border border-[#EBE5DA] py-1.5 px-3 rounded-lg"
                >
                  <UserIcon className="w-3.5 h-3.5" /> Cerrar Sesión Admin
                </button>
              </div>
              <AdminPanel 
                customTemplates={customTemplates}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            </div>
          )
        )}

        {/* ========================================================= */}
        {/* VIEW: USUARIO (PANEL DE CARGA DE LA INFORMACIÓN)          */}
        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* VIEW: USUARIO (PANEL DE CARGA DE LA INFORMACIÓN)          */}
        {/* ========================================================= */}
        {currentView === 'usuario' && (
          (currentUser === null && adminUser === null) ? (
            <div className="max-w-md w-full mx-auto bg-white border border-[#EBE5DA] rounded-3xl p-8 shadow-lg flex flex-col gap-6">
              <div className="text-center">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center border border-[#EBE5DA] mb-3">
                  <UserIcon className="w-6 h-6 text-[#8C7A5F]" />
                </div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Acceso a Panel de Carga</h3>
                <p className="text-xs text-stone-500 mt-1">Registra tu usuario para crear y administrar tus invitaciones familiares.</p>
              </div>

              {/* Tabs for Login vs Register */}
              <div className="flex border-b border-[#EBE5DA]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setUserAuthError(''); }}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                    authMode === 'login' 
                      ? 'border-[#8C7A5F] text-[#8C7A5F]' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setUserAuthError(''); }}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                    authMode === 'register' 
                      ? 'border-[#8C7A5F] text-[#8C7A5F]' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              <form onSubmit={handleUserAuth} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Nombre de Usuario</label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="Ej. hans_lavin"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                  />
                </div>

                {userAuthError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium leading-relaxed">
                    ⚠️ {userAuthError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={userAuthLoading}
                  className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {userAuthLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : authMode === 'login' ? (
                    "Iniciar Sesión"
                  ) : (
                    "Registrarse y Crear Cuenta"
                  )}
                </button>
              </form>
            </div>
          ) : (
            // User is logged in! We show the Welcome Banner and the Card Grid list.
            <div className="flex flex-col gap-8 w-full">
              {/* Header Banner */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8C7A5F]/10 text-[#8C7A5F] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-extrabold">
                    🎉 Hola, {(currentUser || adminUser)?.username}!
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Gestiona tus tarjetas familiares creadas a continuación.</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setAdminUser(null);
                  }}
                  className="text-xs text-stone-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-all cursor-pointer bg-[#FAF8F5] border border-[#EBE5DA] py-2 px-4 rounded-xl"
                >
                  <UserIcon className="w-3.5 h-3.5" /> Cerrar Sesión
                </button>
              </div>

              {/* CARD GRID FOR CREATED INVITATIONS */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-md">
                <div className="border-b border-[#EBE5DA] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black text-stone-900 flex items-center gap-2 uppercase tracking-wider">
                      🗂️ Mis Invitaciones Creadas
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Tarjetas de invitación activas vinculadas a tu cuenta.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateEventModal(true);
                    }}
                    className="bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Nueva Invitación
                  </button>
                </div>

                {visibleEvents.length === 0 ? (
                  <div className="text-center py-12 bg-[#FAF8F5] border border-dashed border-[#DCD5C9] rounded-2xl p-6 flex flex-col items-center gap-3">
                    <Sparkles className="w-8 h-8 text-[#8C7A5F]/40 animate-pulse" />
                    <p className="text-xs text-stone-500 font-medium">Aún no tienes invitaciones creadas en tu cuenta.</p>
                    <p className="text-[11px] text-stone-400">¡Haz clic en el botón de arriba para crear tu primera tarjeta de invitación interactiva!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleEvents.map(ev => {
                      const eventRsvpsCount = rsvps.filter(r => r.eventId === ev.id).length;
                      const coverImg = customImageUrls[ev.id] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600';
                      
                      // Dynamic theme matching for cards based on template/style!
                      const isDarkStyle = ev.style === 'editorial-black-v1' || ev.style === 'moderno';
                      const isOliveStyle = ev.style === 'editorial-olive-v1' || ev.style === 'editorial-v2-olive';
                      const isRomanticStyle = ev.style === 'romantico';
                      const isGoldStyle = ev.style === 'editorial-v2-premium';
                      
                      let cardBg = 'bg-[#FAF8F5]';
                      let cardTextPrimary = 'text-stone-900';
                      let cardTextSecondary = 'text-stone-500';
                      let cardBorder = selectedEventId === ev.id 
                        ? 'border-[#8C7A5F] shadow-md ring-2 ring-[#8C7A5F]/10' 
                        : 'border-[#EBE5DA] hover:border-stone-400 shadow-2xs';
                      let footerBg = 'bg-white border-t border-[#EBE5DA]';
                      let urlContainerBg = 'bg-stone-100/60 border border-[#EBE5DA]';
                      
                      if (isDarkStyle) {
                        cardBg = 'bg-[#161616]';
                        cardTextPrimary = 'text-[#FAF8F5]';
                        cardTextSecondary = 'text-stone-400';
                        cardBorder = selectedEventId === ev.id 
                          ? 'border-[#C7A873] shadow-md ring-2 ring-[#C7A873]/20' 
                          : 'border-stone-850 hover:border-stone-700 shadow-2xs';
                        footerBg = 'bg-[#111111] border-t border-stone-850';
                        urlContainerBg = 'bg-stone-900/60 border border-stone-850';
                      } else if (isOliveStyle) {
                        cardBg = 'bg-[#FAF9F6]';
                        cardTextPrimary = 'text-[#3D3A35]';
                        cardTextSecondary = 'text-[#706B62]';
                        cardBorder = selectedEventId === ev.id 
                          ? 'border-[#8D9982] shadow-md ring-2 ring-[#8D9982]/25' 
                          : 'border-[#E6E1D8] hover:border-stone-400 shadow-2xs';
                        footerBg = 'bg-[#FAF9F6] border-t border-[#E6E1D8]';
                        urlContainerBg = 'bg-[#E6E1D8]/40 border border-[#D0C9BC]';
                      } else if (isRomanticStyle) {
                        cardBg = 'bg-rose-50/20';
                        cardTextPrimary = 'text-rose-950';
                        cardTextSecondary = 'text-rose-800/70';
                        cardBorder = selectedEventId === ev.id 
                          ? 'border-rose-300 shadow-md ring-2 ring-rose-200/50' 
                          : 'border-rose-100 hover:border-rose-200 shadow-2xs';
                        footerBg = 'bg-white border-t border-rose-100';
                        urlContainerBg = 'bg-rose-50/60 border border-rose-100';
                      } else if (isGoldStyle) {
                        cardBg = 'bg-[#FAF8F5]';
                        cardTextPrimary = 'text-stone-900';
                        cardTextSecondary = 'text-stone-500';
                        cardBorder = selectedEventId === ev.id 
                          ? 'border-[#C7A873] shadow-md ring-2 ring-[#C7A873]/30' 
                          : 'border-[#E9E3DA] hover:border-stone-400 shadow-2xs';
                        footerBg = 'bg-white border-t border-[#E9E3DA]';
                        urlContainerBg = 'bg-[#F7F4EF] border border-[#E9E3DA]';
                      }

                      return (
                        <div 
                          key={ev.id} 
                          className={`border rounded-2xl overflow-hidden ${cardBg} transition-all flex flex-col justify-between ${cardBorder}`}
                        >
                          <div>
                            {/* Card Top Cover Image */}
                            <div className="aspect-video relative w-full h-32 bg-stone-100">
                              <img src={coverImg} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3">
                                <span className="text-[10px] bg-white/90 backdrop-blur-xs text-stone-800 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                                  {EVENT_TYPES_METADATA[ev.type]?.emoji} {EVENT_TYPES_METADATA[ev.type]?.name}
                                </span>
                              </div>
                            </div>

                             {/* Card Body */}
                             <div className="p-4 flex flex-col gap-1.5">
                               <h4 className={`font-extrabold ${cardTextPrimary} text-xs truncate`} title={ev.title}>{ev.title}</h4>
                               <p className={`text-[10px] ${cardTextSecondary} font-medium flex items-center gap-1`}>
                                 📅 {ev.date} a las {ev.time}
                               </p>
                               <p className={`text-[10px] ${cardTextSecondary} font-medium flex items-center gap-1 truncate`} title={ev.locationName}>
                                 📍 {ev.locationName}
                               </p>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                   ✉️ Confirmados: {eventRsvpsCount}
                                 </span>
                               </div>

                               {/* URL correspondente de la tarjeta con opción de copiar rápido */}
                               <div className={`mt-2.5 ${urlContainerBg} rounded-xl p-2 flex items-center justify-between gap-1.5 overflow-hidden`}>
                                 <div className="flex-1 min-w-0 flex flex-col">
                                   <span className="text-[8px] text-[#8C7A5F] font-black uppercase tracking-wider mb-0.5">Enlace de Invitación</span>
                                   <div className="flex items-center gap-1 overflow-hidden">
                                     <span className={`text-[9px] font-mono ${isDarkStyle ? 'text-stone-400' : 'text-stone-500'} truncate flex-shrink min-w-0`}>
                                       .../invitacion/
                                     </span>
                                     <span className="text-[9px] font-mono font-extrabold text-[#8C7A5F] bg-[#8C7A5F]/10 border border-[#8C7A5F]/20 px-1 py-0.5 rounded-sm flex-shrink-0">
                                       {ev.id}
                                     </span>
                                   </div>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     const cardUrl = `${window.location.origin}/invitacion/${ev.id}`;
                                     try {
                                       if (navigator.clipboard && window.isSecureContext) {
                                         navigator.clipboard.writeText(cardUrl)
                                           .then(() => {
                                             setCopiedCardEventId(ev.id);
                                             setTimeout(() => setCopiedCardEventId(null), 2000);
                                           });
                                       } else {
                                         const textArea = document.createElement("textarea");
                                         textArea.value = cardUrl;
                                         textArea.style.position = "fixed";
                                         document.body.appendChild(textArea);
                                         textArea.focus();
                                         textArea.select();
                                         document.execCommand('copy');
                                         document.body.removeChild(textArea);
                                         setCopiedCardEventId(ev.id);
                                         setTimeout(() => setCopiedCardEventId(null), 2000);
                                       }
                                     } catch (err) {
                                       console.error(err);
                                     }
                                   }}
                                   className={`p-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs border ${
                                     copiedCardEventId === ev.id
                                       ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                       : "bg-white hover:bg-stone-50 text-stone-500 border-[#DCD5C9] hover:text-stone-700"
                                   }`}
                                   title="Copiar Enlace de Invitación"
                                 >
                                   {copiedCardEventId === ev.id ? (
                                     <>
                                       <Check className="w-2.5 h-2.5 text-emerald-600" />
                                       <span className="text-[8px] font-extrabold uppercase">Copiado</span>
                                     </>
                                   ) : (
                                     <>
                                       <Copy className="w-2.5 h-2.5" />
                                       <span className="text-[8px] font-extrabold uppercase">Copiar</span>
                                     </>
                                   )}
                                 </button>
                               </div>
                             </div>
                          </div>

                          {/* Card Actions */}
                          <div className={`p-3 ${footerBg} grid grid-cols-3 gap-1.5`}>
                            <button
                              onClick={() => {
                                setSelectedEventId(ev.id);
                                // Scroll down to editing form
                                setTimeout(() => {
                                  const formElem = document.getElementById("edit-details-section");
                                  if (formElem) {
                                    formElem.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }, 100);
                              }}
                              className="bg-[#8C7A5F] hover:bg-[#73634B] text-white py-1.5 px-2 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEventId(ev.id);
                                setCurrentView('home');
                              }}
                              className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-[#DCD5C9] py-1.5 px-2 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                            >
                              🌐 Ver
                            </button>
                            <button
                              disabled={visibleEvents.length <= 1}
                              onClick={() => {
                                setDeleteEventConfirmId(ev.id);
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              🗑️ Borrar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* EDIT DETAILS SECTION PANEL CONTAINER */}
              <div id="edit-details-section" className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 shadow-inner flex flex-col gap-6">
                <div className="border-b border-[#EBE5DA] pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1">
                      🛠️ Editando: <span className="text-[#8C7A5F]">{activeEvent.title}</span>
                    </h3>
                    <p className="text-[11px] text-[#8C7A5F] font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sincronizado permanentemente con la Nube de Firebase Firestore
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSavingCloud(true);
                        setCloudSaveStatus('saving');
                        try {
                          const res = await fetch('/api/events', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(activeEvent)
                          });
                          if (res.ok) {
                            setCloudSaveStatus('success');
                            setTimeout(() => setCloudSaveStatus('idle'), 3000);
                          } else {
                            setCloudSaveStatus('error');
                          }
                        } catch (e) {
                          setCloudSaveStatus('error');
                        } finally {
                          setIsSavingCloud(false);
                        }
                      }}
                      disabled={isSavingCloud}
                      className={`px-4 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md border ${
                        cloudSaveStatus === 'success'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : cloudSaveStatus === 'error'
                            ? 'bg-rose-600 border-rose-500 text-white animate-shake'
                            : 'bg-[#8C7A5F] border-[#73634B] hover:bg-[#73634B] text-white'
                      }`}
                    >
                      {cloudSaveStatus === 'saving' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : cloudSaveStatus === 'success' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Guardado Seguro!</span>
                        </>
                      ) : cloudSaveStatus === 'error' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Error al Guardar</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] bg-[#8C7A5F]/10 text-[#8C7A5F] px-3 py-2 rounded-xl font-mono font-bold border border-[#8C7A5F]/20">
                      ID: {activeEvent.id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            
                  {/* Left side (cols 1-6): Information Panel loader input */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    
                    <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
                
                <div className="border-b border-[#EBE5DA] pb-4">
                  <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8C7A5F]" /> Panel de Carga de Información
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Carga los datos del evento familiar. Las plantillas se repondrán automáticamente con esta información.
                  </p>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Categoría del Evento</label>
                    <select
                      value={activeEvent.type}
                      onChange={(e) => updateActiveEventField('type', e.target.value as EventType)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    >
                      {Object.entries(EVENT_TYPES_METADATA).map(([key, value]) => (
                        <option key={key} value={key}>{value.emoji} {value.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Plantilla / Estilo Visual</label>
                    <select
                      value={activeEvent.style}
                      onChange={(e) => updateActiveEventField('style', e.target.value as TemplateStyle)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    >
                      {Object.entries(TEMPLATE_STYLES).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                      {customTemplates.filter(ct => ct.category === activeEvent.type).map(ct => (
                        <option key={ct.id} value={ct.id}>✨ {ct.name} (Pers.)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Título de la Tarjeta</label>
                  <input
                    type="text"
                    value={activeEvent.title}
                    onChange={(e) => updateActiveEventField('title', e.target.value)}
                    placeholder="Ej. Matrimonio de Hans & Chefie"
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                  />
                </div>

                {/* Hosts & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Nombres Anfitriones</label>
                    <input
                      type="text"
                      value={activeEvent.hostName}
                      onChange={(e) => updateActiveEventField('hostName', e.target.value)}
                      placeholder="Ej. Hans & Chefie"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Contacto de Ayuda (WhatsApp)</label>
                    <input
                      type="text"
                      value={activeEvent.whatsappContact || ''}
                      onChange={(e) => updateActiveEventField('whatsappContact', e.target.value)}
                      placeholder="Ej. +56912345678"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Fecha de Celebración</label>
                    <input
                      type="date"
                      value={activeEvent.date}
                      onChange={(e) => updateActiveEventField('date', e.target.value)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Hora de inicio</label>
                    <input
                      type="time"
                      value={activeEvent.time}
                      onChange={(e) => updateActiveEventField('time', e.target.value)}
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Physical Location Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Lugar del Evento</label>
                    <input
                      type="text"
                      value={activeEvent.locationName}
                      onChange={(e) => updateActiveEventField('locationName', e.target.value)}
                      placeholder="Ej. Casa de Hans & Chefie"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Dirección Física</label>
                    <input
                      type="text"
                      value={activeEvent.locationAddress}
                      onChange={(e) => updateActiveEventField('locationAddress', e.target.value)}
                      placeholder="Ej. Av. Vitacura 5400, Santiago"
                      className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F]"
                    />
                  </div>
                </div>

                {/* Google Sheets RSVP Integration */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-stone-950 uppercase tracking-wider">
                          Google Sheets
                        </h4>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Sincroniza confirmaciones en tiempo real
                        </p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    {activeEvent.googleSheetsId ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Conectado
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-stone-200">
                        No conectado
                      </span>
                    )}
                  </div>

                  {sheetsError && (
                    <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 text-[10px] text-rose-700 leading-normal">
                      {sheetsError}
                    </div>
                  )}

                  {/* Estado 1: No conectado */}
                  {!googleUserToken && !activeEvent.googleSheetsId && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] text-stone-600 leading-relaxed">
                        Conecta tu cuenta de Google de forma directa y guiada. Las confirmaciones de asistencia de tus invitados se escribirán de inmediato en la hoja de cálculo que elijas.
                      </p>
                      <button
                        type="button"
                        onClick={handleConnectGoogle}
                        disabled={isSheetsConnecting}
                        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] disabled:bg-stone-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {isSheetsConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Iniciando conexión segura...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span>Conectar con Google</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Estado 2: Conectado con Google pero falta elegir hoja */}
                  {googleUserToken && !activeEvent.googleSheetsId && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[10px] bg-stone-100/60 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-stone-600 font-medium">Conectado a Google</span>
                        <button
                          type="button"
                          onClick={handleDisconnectGoogle}
                          className="text-stone-500 hover:text-rose-600 font-extrabold uppercase text-[8px] tracking-wider"
                        >
                          Cerrar sesión
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-stone-500 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                          {isFetchingSheets && <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#8C7A5F]" />}
                          Selecciona una hoja de cálculo
                        </label>
                        
                        {isFetchingSheets ? (
                          <div className="text-center py-4 text-[10px] text-stone-500 font-medium">
                            Cargando tus hojas de cálculo...
                          </div>
                        ) : userSpreadsheets.length === 0 ? (
                          <div className="text-center py-4 text-[10px] text-stone-500">
                            No encontramos planillas de Sheets en tu Google Drive. Crea una planilla e inténtalo de nuevo.
                          </div>
                        ) : (
                          <select
                            onChange={(e) => handleSelectSheet(e.target.value)}
                            defaultValue=""
                            className="w-full bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] cursor-pointer"
                          >
                            <option value="" disabled>-- Elige una hoja de cálculo --</option>
                            {userSpreadsheets.map((sheet) => (
                              <option key={sheet.id} value={sheet.id}>
                                {sheet.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estado 3: Totalmente Conectado (Sincronizando) */}
                  {activeEvent.googleSheetsId && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider">Planilla de Destino</span>
                            <span className="text-xs font-bold text-stone-800 line-clamp-1 mt-0.5">{activeEvent.googleSheetsName || 'Sin Nombre'}</span>
                          </div>
                          <span className="text-emerald-500 font-semibold text-xs">✓</span>
                        </div>

                        {activeEvent.googleSheetsLastSync && (
                          <div className="flex items-center justify-between text-[8px] text-stone-400 border-t border-stone-150 pt-2 mt-1">
                            <span>ÚLTIMA SINCRONIZACIÓN</span>
                            <span className="font-mono">{activeEvent.googleSheetsLastSync}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Go back to selection state
                            setUserSpreadsheets([]);
                            if (googleUserToken) {
                              loadSpreadsheets(googleUserToken);
                            } else {
                              handleConnectGoogle();
                            }
                            setEvents(prev => prev.map(e => {
                              if (e.id === selectedEventId) {
                                return {
                                  ...e,
                                  googleSheetsId: '',
                                  updatedAt: new Date().toISOString()
                                };
                              }
                              return e;
                            }));
                          }}
                          className="flex-1 bg-white hover:bg-stone-50 border border-[#DCD5C9] text-stone-700 font-bold text-xs py-2 px-3 rounded-xl transition-all text-center cursor-pointer"
                        >
                          Cambiar hoja
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnectGoogle}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2 px-3 rounded-xl transition-all text-center cursor-pointer"
                        >
                          Desconectar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Description message + AI writer */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wide">Mensaje de Invitación</label>
                    <button
                      type="button"
                      onClick={generateDescriptionWithAi}
                      disabled={isGeneratingIdea}
                      className="text-[10px] text-[#8C7A5F] hover:text-[#73634B] font-bold flex items-center gap-1 bg-[#8C7A5F]/10 border border-[#8C7A5F]/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isGeneratingIdea ? 'Escribiendo...' : 'Asistente IA'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={activeEvent.description}
                    onChange={(e) => updateActiveEventField('description', e.target.value)}
                    placeholder="Describe los detalles principales del evento de tu familia."
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-3 focus:outline-none focus:border-[#8C7A5F] resize-none"
                  />
                </div>

                {/* Código de Vestimenta Customizer */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      👔👗 Código de Vestuario (Dress Code)
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">Define las sugerencias de vestimenta para tus invitados.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-stone-500 font-extrabold uppercase tracking-wide">Código / Estilo</label>
                      <input
                        type="text"
                        value={activeEvent.dressCode || ''}
                        onChange={(e) => updateActiveEventField('dressCode', e.target.value)}
                        placeholder="Ej. Formal / Elegante, Guayabera, etc."
                        className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-stone-500 font-extrabold uppercase tracking-wide">Indicaciones de Vestuario</label>
                      <input
                        type="text"
                        value={activeEvent.dressCodeDescription || ''}
                        onChange={(e) => updateActiveEventField('dressCodeDescription', e.target.value)}
                        placeholder="Ej. Hombres de traje y corbata, mujeres vestido de noche."
                        className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Cronograma / Itinerario del Evento */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Calendar className="w-4 h-4 text-[#8C7A5F]" /> Cronograma del Evento (Itinerario)
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Define los momentos clave del evento que verán tus invitados en la tarjeta.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {(() => {
                      const currentSchedule = activeEvent.schedule || [
                        { time: "19:30", title: "Cóctel de Recepción", description: "Llegada de invitados y brindis inicial." },
                        { time: "20:30", title: "Ceremonia Central", description: "Momento simbólico de celebración." },
                        { time: "22:00", title: "Banquete y Fiesta", description: "Cena, baile y sorpresas de la noche." }
                      ];

                      return (
                        <>
                          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {currentSchedule.map((item, index) => (
                              <div key={index} className="bg-white border border-[#EBE5DA] rounded-xl p-3 flex flex-col gap-2 relative group shadow-3xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = currentSchedule.filter((_, i) => i !== index);
                                    updateActiveEventField('schedule', updated);
                                  }}
                                  className="absolute top-2 right-2 text-stone-450 hover:text-red-500 p-1 transition-colors"
                                  title="Eliminar momento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <div className="grid grid-cols-3 gap-2 pr-6">
                                  <div className="col-span-1 flex flex-col gap-0.5">
                                    <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider">Hora</span>
                                    <input
                                      type="text"
                                      value={item.time}
                                      onChange={(e) => {
                                        const updated = [...currentSchedule];
                                        updated[index] = { ...updated[index], time: e.target.value };
                                        updateActiveEventField('schedule', updated);
                                      }}
                                      placeholder="Ej. 19:30"
                                      className="bg-[#FAF8F5] border border-stone-200 text-xs text-stone-850 rounded-lg p-1.5 font-bold focus:outline-none focus:border-[#8C7A5F]"
                                    />
                                  </div>
                                  <div className="col-span-2 flex flex-col gap-0.5">
                                    <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider">Título</span>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const updated = [...currentSchedule];
                                        updated[index] = { ...updated[index], title: e.target.value };
                                        updateActiveEventField('schedule', updated);
                                      }}
                                      placeholder="Ej. Ceremonia Civil"
                                      className="bg-[#FAF8F5] border border-stone-200 text-xs text-stone-850 rounded-lg p-1.5 font-bold focus:outline-none focus:border-[#8C7A5F]"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider">Descripción</span>
                                  <input
                                    type="text"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const updated = [...currentSchedule];
                                      updated[index] = { ...updated[index], description: e.target.value };
                                      updateActiveEventField('schedule', updated);
                                    }}
                                    placeholder="Ej. Intercambio de anillos y firmas."
                                    className="bg-[#FAF8F5] border border-stone-200 text-[11px] text-stone-700 rounded-lg p-1.5 focus:outline-none focus:border-[#8C7A5F]"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [
                                ...currentSchedule,
                                { time: "23:00", title: "Nuevo Momento", description: "Detalle opcional de este momento." }
                              ];
                              updateActiveEventField('schedule', updated);
                            }}
                            className="flex items-center justify-center gap-1 border border-dashed border-[#8C7A5F]/40 hover:bg-white text-[10px] font-extrabold text-[#8C7A5F] py-2.5 rounded-xl transition-all uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar Momento
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Envelope Opening Experience Setting */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Mail className="w-4 h-4 text-[#8C7A5F]" /> Experiencia de Apertura de Sobre
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Controla cómo se presenta la invitación a tus invitados la primera vez que la abren.</p>
                  </div>

                  {/* Selector options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateActiveEventField('envelopeExperience', 'none')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        activeEvent.envelopeExperience !== 'elegant'
                          ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-2xs'
                          : 'bg-white/50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-base mb-1">⚡</span>
                      <span className="text-xs font-bold text-stone-850">Desactivada</span>
                      <span className="text-[9px] text-stone-400 mt-0.5">Ver contenido directo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActiveEventField('envelopeExperience', 'elegant')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        activeEvent.envelopeExperience === 'elegant'
                          ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-2xs'
                          : 'bg-white/50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-base mb-1">✉️</span>
                      <span className="text-xs font-bold text-stone-850">Sobre elegante</span>
                      <span className="text-[9px] text-stone-400 mt-0.5">Apertura física 3D</span>
                    </button>
                  </div>

                  {/* Settings if active */}
                  {activeEvent.envelopeExperience === 'elegant' && (
                    <div className="border-t border-[#EBE5DA] pt-3 flex flex-col gap-3.5 animate-fade-in">
                      {/* Guest Name input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Nombre del Invitado en el Sobre</label>
                        <input
                          type="text"
                          value={activeEvent.guestName || ''}
                          onChange={(e) => updateActiveEventField('guestName', e.target.value)}
                          placeholder="E.g., Familia Lavin Arias"
                          className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F]"
                        />
                        <p className="text-[9px] text-stone-400">Si dejas este campo en blanco, mostrará "Querida Familia y Amigos".</p>
                      </div>

                      {/* Color selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Color de Fondo del Sobre</label>
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {[
                            { name: 'Blanco Marfil', value: '#FAF8F5' },
                            { name: 'Blanco Puro', value: '#FFFFFF' },
                            { name: 'Forest Green', value: '#1C2E24' },
                            { name: 'Burgundy', value: '#4A2E2B' },
                            { name: 'Navy Blue', value: '#1E2A38' },
                            { name: 'Amber Gold', value: '#8C7A5F' },
                            { name: 'Charcoal', value: '#222222' },
                            { name: 'Soft Rose', value: '#A17F7F' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => updateActiveEventField('envelopeColor', color.value)}
                              className={`w-6 h-6 rounded-full border shadow-3xs transition-all ${
                                activeEvent.envelopeColor === color.value ? 'scale-115 ring-2 ring-amber-400' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeEvent.envelopeColor || '#FAF8F5'}
                            onChange={(e) => updateActiveEventField('envelopeColor', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCD5C9] p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={activeEvent.envelopeColor || '#FAF8F5'}
                            onChange={(e) => updateActiveEventField('envelopeColor', e.target.value)}
                            placeholder="#FAF8F5"
                            className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2 w-28 font-mono focus:outline-none focus:border-[#8C7A5F]"
                          />
                        </div>
                      </div>

                      {/* Monogram / Seal option */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Sello / Monograma de Cera</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'heart', label: '❤️ Corazón' },
                            { id: 'sparkles', label: '✨ Destellos' },
                            { id: 'monogram', label: '✍️ Monograma' }
                          ].map((seal) => (
                            <button
                              key={seal.id}
                              type="button"
                              onClick={() => {
                                if (seal.id === 'monogram') {
                                  updateActiveEventField('envelopeSeal', getDynamicInitials(activeEvent.hostName));
                                } else {
                                  updateActiveEventField('envelopeSeal', seal.id);
                                }
                              }}
                              className={`py-2 px-2.5 rounded-lg border text-center text-[10px] font-bold transition-all ${
                                (seal.id === 'monogram' && activeEvent.envelopeSeal !== 'heart' && activeEvent.envelopeSeal !== 'sparkles') ||
                                (seal.id === 'heart' && activeEvent.envelopeSeal === 'heart') ||
                                (seal.id === 'sparkles' && activeEvent.envelopeSeal === 'sparkles')
                                  ? 'bg-[#8C7A5F] text-white border-[#8C7A5F]'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {seal.label}
                            </button>
                          ))}
                        </div>

                        {activeEvent.envelopeSeal !== 'heart' && activeEvent.envelopeSeal !== 'sparkles' && (
                          <div className="mt-1.5 flex flex-col gap-1 animate-fade-in">
                            <span className="text-[9px] text-stone-400 font-bold">Texto del monograma (máx 3 caracteres):</span>
                            <input
                              type="text"
                              maxLength={3}
                              value={activeEvent.envelopeSeal || getDynamicInitials(activeEvent.hostName)}
                              onChange={(e) => updateActiveEventField('envelopeSeal', e.target.value)}
                              className="bg-white border border-[#DCD5C9] text-xs font-bold text-stone-850 rounded-xl p-2 w-20 text-center uppercase focus:outline-none focus:border-[#8C7A5F]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Music Settings */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Music className="w-4 h-4 text-[#8C7A5F]" /> Música del Evento
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Agrega una banda sonora premium o sube un archivo MP3 personalizado que se reproducirá en segundo plano.</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-850">Activar Música</span>
                      <p className="text-[10px] text-stone-400">La música comenzará a reproducirse al abrir el sobre.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = activeEvent.musicConfig || { enabled: false };
                        updateActiveEventField('musicConfig', {
                          ...current,
                          enabled: !current.enabled,
                          showMuteButton: current.showMuteButton ?? true,
                          showReplayButton: current.showReplayButton ?? true,
                          autoplayOnOpen: current.autoplayOnOpen ?? true,
                          loop: current.loop ?? true,
                          initialVolume: current.initialVolume ?? 80
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        activeEvent.musicConfig?.enabled ? 'bg-[#8C7A5F]' : 'bg-stone-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          activeEvent.musicConfig?.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {activeEvent.musicConfig?.enabled && (
                    <div className="border-t border-[#EBE5DA] pt-3 flex flex-col gap-3.5 animate-fade-in">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Seleccionar Canción o Subir MP3</label>
                        <div className="flex flex-col gap-2">
                          {[
                            {
                              name: "Canon en Re Mayor",
                              artist: "Johann Pachelbel (Piano)",
                              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                              label: "🎵 Canon en Re Mayor (Piano)"
                            },
                            {
                              name: "Acoustic Wedding Love",
                              artist: "Instrumental",
                              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                              label: "🎸 Acoustic Wedding Love (Guitarra)"
                            },
                            {
                              name: "Cinematic Love Story",
                              artist: "Instrumental Romance",
                              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                              label: "🎻 Cinematic Love Story (Sinfónico)"
                            }
                          ].map((track) => (
                            <button
                              key={track.url}
                              type="button"
                              onClick={() => {
                                const current = activeEvent.musicConfig || {};
                                updateActiveEventField('musicConfig', {
                                  ...current,
                                  audioUrl: track.url,
                                  songName: track.name,
                                  artist: track.artist
                                });
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                                activeEvent.musicConfig?.audioUrl === track.url
                                  ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-3xs'
                                  : 'bg-white/50 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold text-stone-850">{track.label}</p>
                                <p className="text-[9px] text-stone-400">{track.artist}</p>
                              </div>
                              {activeEvent.musicConfig?.audioUrl === track.url && (
                                <Check className="w-4 h-4 text-[#8C7A5F]" />
                              )}
                            </button>
                          ))}

                          <div className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                            !activeEvent.musicConfig?.audioUrl
                              ? 'bg-white border-[#8C7A5F] ring-1 ring-[#8C7A5F]/20 shadow-3xs'
                              : 'bg-white/50 border-stone-200 hover:border-stone-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-stone-850">✨ Subir Archivo MP3 Propio</p>
                                <p className="text-[9px] text-stone-400">Hasta 30MB. Se guarda en tu navegador de forma segura.</p>
                              </div>
                              {!activeEvent.musicConfig?.audioUrl && (
                                <Check className="w-4 h-4 text-[#8C7A5F]" />
                              )}
                            </div>

                            {isUploadingMusic ? (
                              <div className="flex items-center gap-2 py-2">
                                <RefreshCw className="w-4 h-4 text-[#8C7A5F] animate-spin" />
                                <span className="text-[10px] text-stone-500 font-medium font-sans">Cargando y guardando archivo localmente...</span>
                              </div>
                            ) : (!activeEvent.musicConfig?.audioUrl && activeEvent.musicConfig?.songName) ? (
                              <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-lg p-2 flex items-center justify-between mt-1">
                                <div className="truncate pr-2">
                                  <p className="text-[10px] font-bold text-[#8C7A5F] truncate">{activeEvent.musicConfig.songName}</p>
                                  <p className="text-[9px] text-stone-400">Cargado exitosamente</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleMusicRemove}
                                  className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                                  title="Eliminar canción"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#DCD5C9] hover:bg-stone-50/50 cursor-pointer py-2.5 rounded-lg text-[10px] font-bold text-stone-700 uppercase tracking-wider transition-all mt-1">
                                <UploadCloud className="w-4 h-4 text-stone-400" />
                                <span>Seleccionar archivo MP3</span>
                                <input
                                  type="file"
                                  accept="audio/mp3, audio/mpeg, audio/aac, audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleMusicUpload(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}

                            {musicUploadError && (
                              <p className="text-[9px] text-red-500 font-bold mt-1">{musicUploadError}</p>
                            )}

                            {/* Direct Custom MP3 URL Input */}
                            <div className="border-t border-[#EBE5DA] pt-2.5 mt-1">
                              <label className="text-[9px] text-stone-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                                🔗 O ingresa un enlace MP3 de Internet (URL Pública):
                              </label>
                              <input
                                type="url"
                                placeholder="https://ejemplo.com/musica.mp3"
                                value={activeEvent.musicConfig?.audioUrl && !activeEvent.musicConfig.audioUrl.startsWith('blob:') && !activeEvent.musicConfig.audioUrl.startsWith('https://www.soundhelix.com') ? activeEvent.musicConfig.audioUrl : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const current = activeEvent.musicConfig || {};
                                  updateActiveEventField('musicConfig', {
                                    ...current,
                                    audioUrl: val,
                                    songName: val ? 'Canción por URL Pública' : '',
                                    artist: val ? 'Enlace de Internet' : ''
                                  });
                                }}
                                className="w-full bg-[#FAF8F5] border border-[#DCD5C9] text-[10px] text-stone-850 rounded-lg p-2 mt-1 focus:outline-none focus:border-[#8C7A5F]"
                              />
                              <p className="text-[8px] text-stone-400 mt-1 leading-relaxed">
                                Para celulares, sube tu MP3 a Google Drive (enlace público de descarga directa), Dropbox o un hosting de audio, y pega el enlace directo aquí. ¡Así sonará siempre para tus invitados desde cualquier celular!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Nombre de Canción</label>
                          <input
                            type="text"
                            value={activeEvent.musicConfig?.songName || ''}
                            onChange={(e) => {
                              const current = activeEvent.musicConfig || {};
                              updateActiveEventField('musicConfig', { ...current, songName: e.target.value });
                            }}
                            disabled={!!activeEvent.musicConfig?.audioUrl}
                            placeholder="E.g., Canon in D"
                            className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2 focus:outline-none focus:border-[#8C7A5F] disabled:opacity-60"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide">Artista / Intérprete</label>
                          <input
                            type="text"
                            value={activeEvent.musicConfig?.artist || ''}
                            onChange={(e) => {
                              const current = activeEvent.musicConfig || {};
                              updateActiveEventField('musicConfig', { ...current, artist: e.target.value });
                            }}
                            disabled={!!activeEvent.musicConfig?.audioUrl}
                            placeholder="E.g., Pachelbel"
                            className="bg-white border border-[#DCD5C9] text-xs text-stone-850 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div className="mt-2 border-t border-[#EBE5DA] pt-3 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] font-extrabold text-stone-500 uppercase tracking-wide">
                            <span>Volumen Inicial</span>
                            <span>{activeEvent.musicConfig?.initialVolume ?? 80}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={activeEvent.musicConfig?.initialVolume ?? 80}
                            onChange={(e) => {
                              const current = activeEvent.musicConfig || {};
                              updateActiveEventField('musicConfig', { ...current, initialVolume: parseInt(e.target.value) });
                            }}
                            className="w-full accent-[#8C7A5F] cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeEvent.musicConfig?.autoplayOnOpen !== false}
                              onChange={(e) => {
                                const current = activeEvent.musicConfig || {};
                                updateActiveEventField('musicConfig', { ...current, autoplayOnOpen: e.target.checked });
                              }}
                              className="rounded text-[#8C7A5F] focus:ring-[#8C7A5F] border-stone-300"
                            />
                            <div className="text-[11px] font-medium text-stone-700">Autoplay al abrir</div>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeEvent.musicConfig?.loop !== false}
                              onChange={(e) => {
                                const current = activeEvent.musicConfig || {};
                                updateActiveEventField('musicConfig', { ...current, loop: e.target.checked });
                              }}
                              className="rounded text-[#8C7A5F] focus:ring-[#8C7A5F] border-stone-300"
                            />
                            <div className="text-[11px] font-medium text-stone-700">Repetir infinitamente</div>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeEvent.musicConfig?.showMuteButton !== false}
                              onChange={(e) => {
                                const current = activeEvent.musicConfig || {};
                                updateActiveEventField('musicConfig', { ...current, showMuteButton: e.target.checked });
                              }}
                              className="rounded text-[#8C7A5F] focus:ring-[#8C7A5F] border-stone-300"
                            />
                            <div className="text-[11px] font-medium text-stone-700">Botón Silenciar (Mute)</div>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeEvent.musicConfig?.showReplayButton !== false}
                              onChange={(e) => {
                                const current = activeEvent.musicConfig || {};
                                updateActiveEventField('musicConfig', { ...current, showReplayButton: e.target.checked });
                              }}
                              className="rounded text-[#8C7A5F] focus:ring-[#8C7A5F] border-stone-300"
                            />
                            <div className="text-[11px] font-medium text-stone-700">Botón Reiniciar (Replay)</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Photos and Video Album Settings */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <ImageIcon className="w-4 h-4 text-[#8C7A5F]" /> Sección de Fotos y Videos
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Sube tus propias fotos del recuerdo y agrega un video de invitación interactivo.</p>
                  </div>

                  {/* 📸 Photos Gallery Album Section */}
                  <div className="border-t border-[#EBE5DA] pt-3 flex flex-col gap-3">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                      📸 Álbum de Fotos del Recuerdo (3 Slots)
                    </span>
                    <p className="text-[10px] text-stone-400 -mt-1">Estas imágenes reemplazarán las fotos de la plantilla por defecto.</p>

                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((idx) => {
                        const currentGallery = activeEvent.galleryImages || [];
                        const photoUrl = currentGallery[idx];
                        return (
                          <div key={idx} className="flex flex-col gap-1.5 items-center">
                            <div className="relative w-full aspect-square bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col items-center justify-center group shadow-3xs">
                              {isUploadingPhoto[idx] ? (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-center p-1">
                                  <RefreshCw className="w-4 h-4 text-[#8C7A5F] animate-spin" />
                                  <span className="text-[8px] text-stone-500 mt-1">Cargando...</span>
                                </div>
                              ) : photoUrl ? (
                                <>
                                  <img src={photoUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...currentGallery];
                                      updated[idx] = '';
                                      updateActiveEventField('galleryImages', updated);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                    title="Quitar foto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-2 text-stone-400 hover:text-[#8C7A5F] transition-colors">
                                  <UploadCloud className="w-5 h-5 mb-1" />
                                  <span className="text-[8px] font-bold uppercase text-center">Subir Foto {idx + 1}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handlePhotoUpload(file, idx);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                            <input
                              type="text"
                              value={photoUrl || ''}
                              onChange={(e) => {
                                const updated = [...currentGallery];
                                while (updated.length <= idx) updated.push('');
                                updated[idx] = e.target.value;
                                updateActiveEventField('galleryImages', updated);
                              }}
                              placeholder={`URL Foto ${idx + 1}`}
                              className="w-full bg-white border border-[#DCD5C9] text-[9px] rounded-lg p-1 text-center font-sans focus:outline-none focus:border-[#8C7A5F]"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {photoUploadError && (
                      <p className="text-[9px] text-red-500 font-bold">{photoUploadError}</p>
                    )}
                  </div>

                  {/* 🎥 Video Section */}
                  <div className="border-t border-[#EBE5DA] pt-3 flex flex-col gap-2.5">
                    <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                      🎥 Video de Invitación (YouTube, Vimeo, MP4)
                    </span>
                    <p className="text-[10px] text-stone-400 -mt-1">Sube un archivo de video de tu familia o pega un enlace de YouTube / Vimeo.</p>

                    <div className="flex flex-col gap-2 bg-white border border-stone-200 rounded-xl p-3 shadow-3xs">
                      {isUploadingVideo ? (
                        <div className="flex items-center gap-2 py-1 justify-center text-stone-500 text-[10px] font-sans">
                          <RefreshCw className="w-4 h-4 text-[#8C7A5F] animate-spin" />
                          <span>Procesando y guardando video en el servidor...</span>
                        </div>
                      ) : activeEvent.videoUrl ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#8C7A5F] truncate max-w-[200px]">Video cargado exitosamente</span>
                            <button
                              type="button"
                              onClick={() => updateActiveEventField('videoUrl', '')}
                              className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                              title="Eliminar video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {activeEvent.videoUrl.startsWith('data:') || activeEvent.videoUrl.endsWith('.mp4') || activeEvent.videoUrl.includes('/api/media/') ? (
                            <video src={activeEvent.videoUrl} className="w-full aspect-video rounded-lg object-cover bg-stone-900" controls playsinline />
                          ) : (
                            <p className="text-[9px] text-stone-400 italic">Enlace externo o insertado: {activeEvent.videoUrl}</p>
                          )}
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 border border-dashed border-[#DCD5C9] hover:bg-stone-50/50 cursor-pointer py-2.5 rounded-lg text-[10px] font-bold text-stone-700 uppercase tracking-wider transition-all">
                          <UploadCloud className="w-4 h-4 text-stone-400" />
                          <span>Seleccionar archivo de Video (MP4)</span>
                          <input
                            type="file"
                            accept="video/*, video/mp4, video/quicktime"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleVideoUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}

                      <div className="border-t border-[#EBE5DA] pt-2">
                        <label className="text-[9px] text-stone-500 font-extrabold uppercase tracking-wide">
                          🔗 O ingresa un enlace directo o de YouTube:
                        </label>
                        <input
                          type="url"
                          placeholder="Ej. https://www.youtube.com/watch?v=..."
                          value={activeEvent.videoUrl || ''}
                          onChange={(e) => updateActiveEventField('videoUrl', e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#DCD5C9] text-[10px] text-stone-850 rounded-lg p-2 mt-1 focus:outline-none focus:border-[#8C7A5F]"
                        />
                      </div>
                    </div>
                    {videoUploadError && (
                      <p className="text-[9px] text-red-500 font-bold">{videoUploadError}</p>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS TO SAVE / DEPLOY & TRIGGER POPUP WITH BANK ACCOUNTS */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleCreateAsNewInvitation}
                    className="flex-1 bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-4 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 animate-pulse" />
                    ✨ CREAR NUEVA INVITACIÓN (Nueva URL)
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleUpdateExistingInvitation}
                    className="flex-1 bg-white hover:bg-stone-50 text-stone-700 border border-[#DCD5C9] font-extrabold py-4 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    🔄 ACTUALIZAR ACTUAL (Misma URL)
                  </button>
                </div>

              </div>

              {/* Gallery selection for background image */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#EBE5DA] pb-3">
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#8C7A5F]" /> Imagen de Portada / Pasaporte
                  </h3>
                  <span className="text-[10px] bg-[#8C7A5F]/15 text-[#8C7A5F] px-2.5 py-0.5 rounded-full font-bold">
                    Reemplazable
                  </span>
                </div>

                {/* CURRENT COVER PREVIEW */}
                <div className="flex items-start gap-4 p-3 bg-[#FAF8F5] rounded-2xl border border-[#EBE5DA]">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-[#DCD5C9] shadow-sm">
                    <img 
                      src={customImageUrls[activeEvent.id] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'} 
                      alt="Miniatura actual" 
                      className="w-full h-full object-cover grayscale contrast-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-bold text-stone-800">Foto del Invitado de Honor</p>
                    <p className="text-[9px] text-stone-500 leading-tight">Esta foto se mostrará en la portada de tu tarjeta y en el marco principal del pasaporte.</p>
                    
                    {/* Upload button wrapper */}
                    <div className="flex items-center gap-2 mt-1">
                      <label className="bg-[#8C7A5F] hover:bg-[#73634B] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                        <span>{isUploadingCover ? 'Subiendo...' : 'Subir foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverUpload(e.target.files[0]);
                            }
                          }}
                          disabled={isUploadingCover}
                        />
                      </label>
                    </div>
                    {coverUploadError && (
                      <p className="text-[9px] text-red-500 font-bold mt-1">{coverUploadError}</p>
                    )}
                  </div>
                </div>

                {/* PASTE URL DIRECTLY */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-700 block">O ingresa un enlace directo a la foto:</label>
                  <input
                    type="url"
                    placeholder="Ej. https://ejemplo.com/mi-foto.jpg"
                    value={customImageUrls[activeEvent.id] || ''}
                    onChange={(e) => selectCoverImage(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl p-2.5 focus:outline-none focus:border-[#8C7A5F]"
                  />
                </div>

                {/* PRE-CURATED GRID */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone-700">O elige una de nuestras imágenes pre-curadas:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(CURATED_EVENT_IMAGES[activeEvent.type] || CURATED_EVENT_IMAGES['otro']).map((img, i) => (
                      <div 
                        key={i} 
                        onClick={() => selectCoverImage(img.url)}
                        className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          customImageUrls[activeEvent.id] === img.url ? 'border-[#8C7A5F] scale-98 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {customImageUrls[activeEvent.id] === img.url && (
                          <div className="absolute top-1 right-1 bg-[#8C7A5F] p-1 rounded-full">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right side (cols 7-12): MANDATORY "APOYO AL DESARROLLO Y MEJORA DE LA PLATAFORMA" panel inside Usuario section */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* APOYO AL DESARROLLO Y MEJORA DE LA PLATAFORMA */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-md">
                
                <div className="border-b border-[#EBE5DA] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[#8C7A5F] animate-pulse" /> APOYO PARA LA PLATAFORMA
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">Para continuar desarrollando y mejorando la plataforma cada día.</p>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                    100% Directo
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Este es un apoyo voluntario para continuar desarrollando y mejorando la plataforma cada día. Dado que esta aplicación es gratis para nuestra familia Lavin Arias, hemos colocado estas cuentas por defecto para recibir aportes de Chile 🇨🇱 y Colombia 🇨🇴. Puedes revisarlas y modificarlas aquí.
                </p>

                {/* Chile Accounts review list */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🇨🇱 Chile (Soporte y Desarrollo)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {donationConfig.chileAccounts.map((account, index) => (
                      <div key={index} className="bg-white p-3 rounded-xl border border-[#EBE5DA] text-[11px] text-stone-700">
                        <p className="font-bold text-[#8C7A5F]">{account.bankName}</p>
                        <p className="font-medium text-stone-600">{account.accountType}</p>
                        <p className="font-mono text-stone-900 font-semibold mt-1">{account.accountNumber}</p>
                        <p className="text-stone-500 mt-0.5">RUT: {account.holderId}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colombia Accounts review list */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🇨🇴 Colombia (Soporte y Desarrollo)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {donationConfig.colombiaAccounts.map((account, index) => (
                      <div key={index} className="bg-white p-3 rounded-xl border border-[#EBE5DA] text-[11px] text-stone-700">
                        <p className="font-bold text-[#8C7A5F]">{account.bankName}</p>
                        <p className="font-medium text-stone-600">{account.accountType}</p>
                        <p className="font-mono text-stone-900 font-semibold mt-1">{account.accountNumber}</p>
                        <p className="text-stone-500 mt-0.5">CC: {account.holderId}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Electronic Payment Links */}
                <div className="bg-[#FAF8F5] border border-[#EBE5DA] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    🌐 Enlaces Rápidos Electrónicos
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-xs">
                      <span className="text-stone-600 font-medium">Link Mercado Pago</span>
                      <span className="font-mono text-stone-500 select-all">{donationConfig.mercadoPagoUrl}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-xs">
                      <span className="text-stone-600 font-medium">Link PayPal</span>
                      <span className="font-mono text-stone-500 select-all">{donationConfig.paypalUrl}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Guest RSVP control list dashboard inside USUARIO page */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-md">
                
                <div className="flex items-center justify-between border-b border-[#EBE5DA] pb-3">
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#8C7A5F]" /> Panel de Invitados Confirmados ({activeEventRsvps.length})
                  </h3>
                  
                  {/* Small stats badges */}
                  <span className="text-[10px] bg-[#8C7A5F]/10 text-[#8C7A5F] px-2 py-0.5 rounded-full font-bold">
                    Asistirán: {stats.totalGuests}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeEventRsvps.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs">
                      No hay registros aún para esta plantilla.
                    </div>
                  ) : (
                    activeEventRsvps.map(r => (
                      <div key={r.id} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DA] flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-800">{r.guestName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            r.attending ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.attending ? `Sí (${r.companions + 1})` : 'No asistirá'}
                          </span>
                        </div>
                        {r.comment && <p className="text-stone-500 italic mt-1">"{r.comment}"</p>}
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Pixabay real-time image fetcher */}
              <div className="bg-white border border-[#EBE5DA] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-md">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#8C7A5F]" /> Buscador en Banco de Fotos (Pixabay)
                </h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe palabra clave (ej. flores, boda, cake)"
                    value={pixabayQuery}
                    onChange={(e) => setPixabayQuery(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD5C9] text-xs text-stone-800 rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-[#8C7A5F]"
                  />
                  <button
                    onClick={handlePixabaySearch}
                    disabled={isSearchingPixabay}
                    className="bg-[#8C7A5F] text-white hover:bg-[#73634B] text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    {isSearchingPixabay ? '...' : 'Buscar'}
                  </button>
                </div>

                {pixabaySearched && (
                  <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto mt-2">
                    {pixabayResults.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => selectCoverImage(img.url)}
                        className="aspect-video relative rounded-lg overflow-hidden cursor-pointer border border-[#EBE5DA] hover:border-[#8C7A5F] transition-all"
                      >
                        <img src={img.thumbnailUrl} alt="Pixabay" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    )
  )}

      </main>

      {/* ========================================================= */}
      {/* DIALOG POPUP: APORTE VOLUNTARIO (Cuentas de Banco Chile-Col) */}
      {/* Triggers on clicking 'Crear Invitación' inside Usuario tab */}
      {/* ========================================================= */}
      {showDonationPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EBE5DA] animate-scaleUp">
            
            {/* Header banner decoration inside modal */}
            <div className="bg-[#8C7A5F] text-white p-6 relative flex flex-col items-center text-center">
              <Gift className="w-10 h-10 mb-2 animate-bounce" />
              <h3 className="text-lg font-extrabold">¡Invitación Creada Exitosamente!</h3>
              <p className="text-xs text-stone-200 mt-1 max-w-xs leading-relaxed">
                ¡Tu enlace URL único de la tarjeta ha sido generado! Tus invitados ya pueden ingresar y confirmar asistencia.
              </p>
            </div>

            {/* Content list with financial support details */}
            <div className="p-6 flex flex-col gap-4 max-h-[420px] overflow-y-auto">
              
              {/* Unique Invitation Link Section */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col gap-2">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  🌐 Enlace de Invitación Creado / Actualizado
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={newCreatedEventUrl}
                    className="flex-1 bg-white border border-emerald-200 text-xs text-stone-800 rounded-lg p-2 focus:outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      try {
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(newCreatedEventUrl);
                          alert("¡Enlace copiado al portapapeles!");
                        } else {
                          const tempInput = document.createElement('input');
                          tempInput.value = newCreatedEventUrl;
                          document.body.appendChild(tempInput);
                          tempInput.select();
                          document.execCommand('copy');
                          document.body.removeChild(tempInput);
                          alert("¡Enlace copiado al portapapeles!");
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="bg-[#8C7A5F] hover:bg-[#73634B] text-white p-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Copiar Enlace"
                  >
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copiar</span>
                  </button>
                </div>
                <p className="text-[9px] text-stone-500 mt-1 leading-tight">
                  Comparte este enlace con tus invitados para que puedan ver la invitación interactiva y registrar su asistencia.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#EBE5DA] p-3.5 rounded-xl flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <Info className="w-4 h-4 text-[#8C7A5F] flex-shrink-0 mt-0.5" />
                <p>
                  Este es un apoyo voluntario para continuar desarrollando y mejorando la plataforma cada día. Puedes realizar aportes directos a las siguientes cuentas de la familia Lavin Arias:
                </p>
              </div>

              {/* Chile Direct Account support details */}
              <div className="border border-[#EBE5DA] rounded-xl p-3 bg-[#FAF8F5]">
                <p className="text-xs font-extrabold text-stone-800 mb-2">🇨🇱 Transferencias en Chile (Soporte y Desarrollo)</p>
                <div className="flex flex-col gap-2">
                  {donationConfig.chileAccounts.map((account, index) => (
                    <div key={index} className="bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-[11px] text-stone-700">
                      <p className="font-bold text-stone-800">{account.bankName} — <span className="font-semibold text-stone-500">{account.accountType}</span></p>
                      <p className="font-mono text-[#8C7A5F] font-bold mt-0.5">N° {account.accountNumber}</p>
                      <p className="text-[10px] text-stone-500">Titular: {account.holderName} | RUT: {account.holderId}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colombia Direct Account support details */}
              <div className="border border-[#EBE5DA] rounded-xl p-3 bg-[#FAF8F5]">
                <p className="text-xs font-extrabold text-stone-800 mb-2">🇨🇴 Transferencias en Colombia (Soporte y Desarrollo)</p>
                <div className="flex flex-col gap-2">
                  {donationConfig.colombiaAccounts.map((account, index) => (
                    <div key={index} className="bg-white p-2.5 rounded-lg border border-[#EBE5DA] text-[11px] text-stone-700">
                      <p className="font-bold text-stone-800">{account.bankName} — <span className="font-semibold text-stone-500">{account.accountType}</span></p>
                      <p className="font-mono text-[#8C7A5F] font-bold mt-0.5">Celular: {account.accountNumber}</p>
                      <p className="text-[10px] text-stone-500">Titular: {account.holderName} | CC: {account.holderId}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Electronic methods */}
              <div className="flex gap-2">
                <a 
                  href={donationConfig.paypalUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 py-2.5 rounded-xl text-center text-xs font-bold transition-all"
                >
                  🌐 PayPal Internacional
                </a>
                <a 
                  href={donationConfig.mercadoPagoUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-[#009EE3]/10 border border-[#009EE3]/20 hover:bg-[#009EE3]/20 text-[#009EE3] py-2.5 rounded-xl text-center text-xs font-bold transition-all"
                >
                  💳 Mercado Pago Chile
                </a>
              </div>

            </div>

            {/* Footer with actions */}
            <div className="bg-[#FAF8F5] border-t border-[#EBE5DA] p-4 flex gap-2">
              <button
                onClick={handleClosePopupAndGoHome}
                className="w-full bg-[#8C7A5F] hover:bg-[#73634B] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Listo, ver mi Tarjeta en la Home
              </button>
            </div>

          </div>

        </div>
      )}

      {showApplyStyleModal && pendingStyleToApply && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EBE5DA] animate-scaleUp">
            <div className="text-center flex flex-col items-center gap-3">
              <span className="text-3xl">✨</span>
              <h3 className="text-base font-extrabold text-stone-900">¿Cómo deseas aplicar esta plantilla?</h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Puedes aplicar el estilo visual "<strong>{TEMPLATE_STYLES[pendingStyleToApply as TemplateStyle]?.name || pendingStyleToApply}</strong>" a la invitación actual, o guardarlo como una nueva invitación separada con su propia URL única.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-6">
              <button
                onClick={() => {
                  // Option 1: Create as new invitation (New URL)
                  const newId = `evento-${Date.now()}`;
                  const clonedEvent: EventData = {
                    ...activeEvent,
                    id: newId,
                    style: pendingStyleToApply as TemplateStyle,
                    title: `Mi Evento ${TEMPLATE_STYLES[pendingStyleToApply as TemplateStyle]?.name || 'Nuevo'}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  
                  // Copy image url
                  const currentCoverImg = customImageUrls[activeEvent.id];
                  if (currentCoverImg) {
                    setCustomImageUrls(prev => ({ ...prev, [newId]: currentCoverImg }));
                  }

                  setEvents(prev => [...prev, clonedEvent]);
                  setSelectedEventId(newId);
                  saveEventToServer(clonedEvent);

                  // Show URL in popup and take to editor
                  const uniqueUrl = `${window.location.origin}/invitacion/${newId}`;
                  setNewCreatedEventUrl(uniqueUrl);
                  
                  setShowApplyStyleModal(false);
                  setPendingStyleToApply(null);
                  setCurrentView('usuario');
                  setShowDonationPopup(true);
                }}
                className="w-full bg-[#8C7A5F] hover:bg-[#73634B] text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear como Nueva Invitación (Nueva URL)
              </button>

              <button
                onClick={() => {
                  // Option 2: Apply to current active event
                  updateActiveEventField('style', pendingStyleToApply);
                  
                  const uniqueUrl = `${window.location.origin}/invitacion/${activeEvent.id}`;
                  setNewCreatedEventUrl(uniqueUrl);
                  
                  setShowApplyStyleModal(false);
                  setPendingStyleToApply(null);
                  setCurrentView('home'); // take to home to see preview
                  setShowDonationPopup(true);
                }}
                className="w-full bg-[#FAF8F5] hover:bg-[#F1EBE0] text-stone-700 border border-[#DCD5C9] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                Aplicar a Invitación Actual (Misma URL)
              </button>

              <button
                onClick={() => {
                  setShowApplyStyleModal(false);
                  setPendingStyleToApply(null);
                }}
                className="w-full bg-white hover:bg-stone-50 text-stone-500 font-medium py-2 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE INVITACIÓN          */}
      {/* ========================================================= */}
      {deleteEventConfirmId && (() => {
        const eventToDelete = events.find(e => e.id === deleteEventConfirmId);
        return (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
            <div className="bg-white border border-[#EBE5DA] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scale-up flex flex-col gap-5">
              <div className="text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-1">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">¿Eliminar invitación?</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar permanentemente la invitación <strong className="text-stone-800">"{eventToDelete?.title || 'esta invitación'}"</strong>? 
                  Esta acción es irreversible y borrará también todas las confirmaciones asociadas.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteEventConfirmId(null)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteEventConfirmId) {
                      deleteEvent(deleteEventConfirmId);
                      setDeleteEventConfirmId(null);
                    }
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center shadow-md shadow-rose-200"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: SELECCIÓN DE CATEGORÍA DE NUEVA INVITACIÓN         */}
      {/* ========================================================= */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-[#EBE5DA] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-scale-up flex flex-col gap-5">
            <div className="text-center flex flex-col items-center gap-1">
              <span className="text-3xl">✨</span>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mt-2">Nueva Tarjeta de Invitación</h3>
              <p className="text-xs text-stone-500">Selecciona el tipo de evento familiar que deseas crear:</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
              {Object.entries(EVENT_TYPES_METADATA).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    createNewEvent(key as EventType);
                    setShowCreateEventModal(false);
                  }}
                  className="bg-stone-50 hover:bg-[#F1EBE0] border border-[#EBE5DA] hover:border-[#8C7A5F]/40 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{meta.emoji}</span>
                  <span className="text-[10px] font-extrabold text-stone-700 uppercase tracking-wider block leading-tight">{meta.name}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#EBE5DA] pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateEventModal(false)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credit note */}
      <footer className="border-t border-[#EBE5DA] bg-white py-5 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Familia Lavin Arias. Todos los derechos reservados.</p>
          <p className="font-semibold text-stone-700">Desarrollado con amor para Chile y Colombia 🇨🇱 ❤️ 🇨🇴</p>
        </div>
      </footer>

    </div>
  );
}
