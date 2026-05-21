const DEFAULT_LARAVEL_API_URL = 'http://localhost:8000/api';

const cleanValue = (value: string | undefined) => value?.trim() ?? '';

export const laravelApiConfig = {
  apiUrl: cleanValue(import.meta.env.VITE_LARAVEL_API_URL) || DEFAULT_LARAVEL_API_URL,
};

export const hasLaravelApiUrl = laravelApiConfig.apiUrl.length > 0;
