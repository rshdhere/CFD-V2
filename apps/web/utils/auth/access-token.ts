let inMemoryAccessToken: string | null = null;

export function getAccessToken() {
  return inMemoryAccessToken;
}

export function setAccessToken(accessToken: string) {
  inMemoryAccessToken = accessToken;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}
