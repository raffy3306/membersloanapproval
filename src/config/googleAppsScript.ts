const DEFAULT_SCRIPT_ID = '1LzcA9-TEl5N434UaGD88c4NdxajmJ8lvvbbEB1lNUZs';

const cleanValue = (value: string | undefined) => value?.trim() ?? '';

export const googleAppsScriptConfig = {
  scriptId: cleanValue(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_ID) || DEFAULT_SCRIPT_ID,
  webAppUrl: cleanValue(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL),
};

export const hasGoogleAppsScriptUrl = googleAppsScriptConfig.webAppUrl.length > 0;

