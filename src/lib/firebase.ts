export type FirebaseClients = {
  app: import("firebase/app").FirebaseApp;
  auth: import("firebase/auth").Auth;
  db: import("firebase/firestore").Firestore;
  storage: import("firebase/storage").FirebaseStorage;
  usingEmulators: boolean;
};

function readConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!apiKey || !projectId) return null;
  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured(): boolean {
  return readConfig() !== null;
}

let clientsPromise: Promise<FirebaseClients | null> | undefined;

/** Loads the Firebase SDK only when web config is present. Demo mode never downloads it. */
export function getFirebase(): Promise<FirebaseClients | null> {
  if (clientsPromise) return clientsPromise;
  const config = readConfig();
  if (!config) {
    clientsPromise = Promise.resolve(null);
    return clientsPromise;
  }

  clientsPromise = (async () => {
    const { initializeApp } = await import("firebase/app");
    const { connectAuthEmulator, getAuth } = await import("firebase/auth");
    const { connectFirestoreEmulator, getFirestore } = await import("firebase/firestore");
    const { connectStorageEmulator, getStorage } = await import("firebase/storage");

    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const usingEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";

    if (usingEmulators) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
      connectStorageEmulator(storage, host, 9199);
    }

    return { app, auth, db, storage, usingEmulators };
  })();

  return clientsPromise;
}

export function dataModeLabel(): "demo" | "emulators" | "firebase" {
  if (!isFirebaseConfigured()) return "demo";
  return import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true" ? "emulators" : "firebase";
}
