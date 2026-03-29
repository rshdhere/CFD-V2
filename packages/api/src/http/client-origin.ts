import { CLIENT_URL } from "@CFD-V2/config";

function parseOrigin(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveClientOrigin(candidateOrigin?: string) {
  return parseOrigin(candidateOrigin) ?? parseOrigin(CLIENT_URL);
}
