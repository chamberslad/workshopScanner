export function createMsalConfig(tenantId, clientId) {
  return {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  }
}

export const tokenRequest = {
  scopes: ['openid', 'profile', 'email'],
}
