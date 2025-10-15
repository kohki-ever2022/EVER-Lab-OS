

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_USE_MOCK_GEMINI: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
  // FIX: Add MODE to satisfy type checks for import.meta.env.MODE used in the app (e.g., ErrorBoundary.tsx).
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
