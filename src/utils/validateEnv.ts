const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
] as const;

export function validateEnvironmentVariables(): void {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // 本番環境でモックが有効になっていないかチェック
  if (import.meta.env.PROD) {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.warn('WARNING: Mock data is enabled in production!');
    }
    if (import.meta.env.VITE_USE_MOCK_GEMINI === 'true') {
        console.warn('WARNING: Mock Gemini is enabled in production!');
    }
  }
}
