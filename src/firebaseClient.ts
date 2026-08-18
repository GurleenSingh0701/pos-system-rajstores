import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = 'pos_admin_firebase_config';

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading Firebase config from localStorage', e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function getFirebaseInstances() {
  if (appInstance && firestoreInstance && authInstance) {
    return { app: appInstance, db: firestoreInstance, auth: authInstance, isCustomConfig: true };
  }

  const userConfig = getSavedFirebaseConfig();
  if (userConfig && userConfig.projectId && userConfig.apiKey && userConfig.apiKey !== 'PASTE_FROM_POS_APP') {
    try {
      if (!getApps().length) {
        appInstance = initializeApp(userConfig);
      } else {
        appInstance = getApps()[0];
      }
      firestoreInstance = getFirestore(appInstance);
      authInstance = getAuth(appInstance);
      return { app: appInstance, db: firestoreInstance, auth: authInstance, isCustomConfig: true };
    } catch (err) {
      console.warn('Firebase initialization with custom config failed, operating in shared state sync mode', err);
    }
  }

  return { app: null, db: null, auth: null, isCustomConfig: false };
}
