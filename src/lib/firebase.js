import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Storage optional for later: import { getStorage } from 'firebase/storage';

// Build config from Vite env vars. measurementId is optional (Analytics only)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
// export const storage = getStorage(app); // enable when needed

// Lazy Analytics init (only in production & if supported)
let analyticsInstance; // cached
export async function initAnalytics() {
  if (analyticsInstance) return analyticsInstance;
  if (import.meta.env.DEV) return null; // skip in dev
  try {
    const mod = await import('firebase/analytics');
    if (mod.isSupported && (await mod.isSupported())) {
      analyticsInstance = mod.getAnalytics(app);
    }
  } catch (_) {
    // ignore analytics errors silently
  }
  return analyticsInstance ?? null;
}
