const DB_NAME = 'TarjetaFamiliarAudioDB';
const STORE_NAME = 'audioFiles';

export function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Add a 1.5-second timeout in case indexedDB.open hangs (common on iOS/mobile Safari cross-origin iframes)
    const timer = setTimeout(() => {
      reject(new Error('IndexedDB open operation timed out'));
    }, 1500);

    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        clearTimeout(timer);
        reject(new Error('IndexedDB is not supported in this browser/environment'));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(request.error || new Error('Failed to open database'));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

export async function saveAudioFile(eventId: string, file: File): Promise<string> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file, eventId);
      request.onsuccess = () => {
        const url = URL.createObjectURL(file);
        resolve(url);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('saveAudioFile error:', err);
    throw err;
  }
}

export async function getAudioFileUrl(eventId: string): Promise<string | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(eventId);
      request.onsuccess = () => {
        const file = request.result as File | Blob | undefined;
        if (file) {
          const url = URL.createObjectURL(file);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Error reading from IndexedDB:', err);
    return null;
  }
}

export async function deleteAudioFile(eventId: string): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(eventId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error deleting from IndexedDB:', err);
  }
}
