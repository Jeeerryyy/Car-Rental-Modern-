export const validateEnv = () => {
  const required = ['VITE_API_URL', 'VITE_SOCKET_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    console.error(`[Modern Drive Portal] Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`[Modern Drive Portal] Missing required environment variables: ${missing.join(', ')}`);
  }
};
