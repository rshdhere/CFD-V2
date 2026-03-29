import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/utils/auth/access-token";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type AuthFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type InitAuthResponse = {
  accessToken?: string;
};

function getServerOrigin(trpcUrl: string) {
  try {
    return new URL(trpcUrl).origin;
  } catch {
    if (typeof window === "undefined") {
      return trpcUrl;
    }

    return new URL(trpcUrl, window.location.origin).origin;
  }
}

type AxiosLikeResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers?: Record<string, unknown>;
};

function toFetchResponse(response: AxiosLikeResponse) {
  const responseHeaders = new Headers();

  for (const [key, value] of Object.entries(response.headers ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => responseHeaders.append(key, String(item)));
      continue;
    }

    responseHeaders.set(key, String(value));
  }

  const body =
    typeof response.data === "string"
      ? response.data
      : response.data === undefined || response.data === null
        ? ""
        : typeof response.data === "object"
          ? JSON.stringify(response.data)
          : String(response.data);

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function initAuth(trpcUrl: string) {
  try {
    const response = await fetch(`${getServerOrigin(trpcUrl)}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      clearAccessToken();
      return false;
    }

    const data = (await response.json()) as InitAuthResponse;

    if (!data.accessToken) {
      clearAccessToken();
      return false;
    }

    setAccessToken(data.accessToken);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

export async function logout(trpcUrl: string) {
  try {
    await fetch(`${getServerOrigin(trpcUrl)}/refresh/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network failures so local logout can still complete.
  }
}

export function createAuthFetch(trpcUrl: string): AuthFetch {
  const baseURL = getServerOrigin(trpcUrl);

  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  const refresh = axios.create({
    baseURL,
    withCredentials: true,
  });

  let refreshPromise: Promise<string | null> | null = null;

  api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return config;
    }

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    config.headers.set("Authorization", `Bearer ${accessToken}`);
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;

      if (
        !originalRequest ||
        originalRequest._retry ||
        error.response?.status !== 401
      ) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes("/refresh")) {
        clearAccessToken();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refresh
            .post<{ accessToken: string }>("/refresh")
            .then((response) => response.data.accessToken ?? null)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const nextAccessToken = await refreshPromise;

        if (!nextAccessToken) {
          throw error;
        }

        setAccessToken(nextAccessToken);
        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }
        originalRequest.headers.set(
          "Authorization",
          `Bearer ${nextAccessToken}`,
        );

        return api.request(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    },
  );

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" || input instanceof URL
        ? input.toString()
        : input.url;

    try {
      const response = await api.request<string>({
        url,
        method: init?.method,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        data: init?.body,
        signal: init?.signal ?? undefined,
        responseType: "text",
        transformResponse: [(value) => value],
      });

      return toFetchResponse(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return toFetchResponse(error.response);
      }

      throw error;
    }
  };
}
