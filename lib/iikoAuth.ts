export type IikoAuthEnvironment = {
  [key: string]: string | undefined;
  IIKO_API_LOGIN?: string;
  IIKO_API_KEY?: string;
  IIKO_APP_ID?: string;
  IIKO_CLIENT_SECRET?: string;
};

export function getIikoAuthRequest(env: IikoAuthEnvironment) {
  const apiKey = (env.IIKO_API_KEY || env.IIKO_API_LOGIN || '').trim();
  const appId = env.IIKO_APP_ID?.trim();
  const clientSecret = env.IIKO_CLIENT_SECRET?.trim();
  if (!apiKey) return null;
  if (Boolean(appId) !== Boolean(clientSecret)) throw new Error('IIKO_APP_CREDENTIALS_INCOMPLETE');
  if (appId && clientSecret) return {
    endpoint: '/api/v2/access_token',
    body: { appId, clientSecret, apiKey },
  };
  return { endpoint: '/api/1/access_token', body: { apiLogin: apiKey } };
}
