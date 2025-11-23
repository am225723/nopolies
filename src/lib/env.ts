// Environment variable validation
const requiredEnvVars = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
} as const;

const optionalEnvVars = {
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

type EnvVars = typeof requiredEnvVars & typeof optionalEnvVars;

function validateEnv(): EnvVars {
  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  };
}

export const env = validateEnv();

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;