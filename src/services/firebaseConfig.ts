// Détection de la configuration Firebase à partir des variables d'environnement Vite.
// Aucun SDK Firebase n'est chargé dans cette version.

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const FIREBASE_ENV_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const satisfies Record<keyof FirebaseConfig, string>;

/** Clés indispensables pour considérer Firebase comme configurée. */
const REQUIRED_KEYS: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];

export type FirebaseConfigStatus =
  | { configured: true; config: FirebaseConfig }
  | { configured: false; missing: string[] };

export function readFirebaseConfig(env: Record<string, string | boolean | undefined>): FirebaseConfigStatus {
  const value = (key: keyof FirebaseConfig) => {
    const raw = env[FIREBASE_ENV_KEYS[key]];
    return typeof raw === 'string' ? raw.trim() : '';
  };
  const missing = REQUIRED_KEYS.filter((key) => value(key) === '').map((key) => FIREBASE_ENV_KEYS[key]);
  if (missing.length > 0) return { configured: false, missing };
  return {
    configured: true,
    config: {
      apiKey: value('apiKey'),
      authDomain: value('authDomain'),
      projectId: value('projectId'),
      storageBucket: value('storageBucket'),
      messagingSenderId: value('messagingSenderId'),
      appId: value('appId'),
    },
  };
}
