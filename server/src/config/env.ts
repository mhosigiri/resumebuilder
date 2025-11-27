import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value?: string) =>
  (value ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  openRouterKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  appUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  appName: process.env.OPENROUTER_APP_NAME ?? 'Resume Builder',
};

export const assertEnv = () => {
  if (!env.openRouterKey) {
    throw new Error('OPENROUTER_API_KEY is required');
  }
};


