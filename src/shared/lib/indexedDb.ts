// Utility for IndexedDB offline persistence
const DB_NAME = "pension_myriam_db";
const DB_VERSION = 1;

export interface OfflineAction {
  id?: number;
  type: "UPDATE_MEAL_STATUS" | "SAVE_MENU" | "TOGGLE_AVAILABILITY" | "DUPLICATE_MENU";
  payload: any;
  timestamp: number;
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Store for menus: key is fechaStr (e.g. "2026-08-12")
      if (!db.objectStoreNames.contains("minutas")) {
        db.createObjectStore("minutas", { keyPath: "fechaStr" });
      }

      // Store for daily planners: key is fechaStr
      if (!db.objectStoreNames.contains("planificador")) {
        db.createObjectStore("planificador", { keyPath: "fechaStr" });
      }

      // Store for actions queue to sync in background
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

// Menu (minutas) storage
export async function saveLocalMenu(fechaStr: string, data: any): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("minutas", "readwrite");
    const store = transaction.objectStore("minutas");
    const request = store.put({ fechaStr, data, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalMenu(fechaStr: string): Promise<any | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("minutas", "readonly");
    const store = transaction.objectStore("minutas");
    const request = store.get(fechaStr);

    request.onsuccess = () => resolve(request.result ? request.result.data : null);
    request.onerror = () => reject(request.error);
  });
}

// Planner storage
export async function saveLocalPlanificador(fechaStr: string, data: any): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("planificador", "readwrite");
    const store = transaction.objectStore("planificador");
    const request = store.put({ fechaStr, data, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalPlanificador(fechaStr: string): Promise<any | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("planificador", "readonly");
    const store = transaction.objectStore("planificador");
    const request = store.get(fechaStr);

    request.onsuccess = () => resolve(request.result ? request.result.data : null);
    request.onerror = () => reject(request.error);
  });
}

// Sync Queue storage
export async function enqueueOfflineAction(
  type: OfflineAction["type"],
  payload: any
): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("sync_queue", "readwrite");
    const store = transaction.objectStore("sync_queue");
    const action: OfflineAction = {
      type,
      payload,
      timestamp: Date.now(),
    };
    const request = store.add(action);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getSyncQueue(): Promise<OfflineAction[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("sync_queue", "readonly");
    const store = transaction.objectStore("sync_queue");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function dequeueOfflineAction(id: number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("sync_queue", "readwrite");
    const store = transaction.objectStore("sync_queue");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearSyncQueue(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("sync_queue", "readwrite");
    const store = transaction.objectStore("sync_queue");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
