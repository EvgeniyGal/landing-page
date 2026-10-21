import { ApiError, type ApiErrorBody } from "./types";

const PRODUCTION_API_URL = "https://aiautomations.work";
const DEFAULT_API_URL = __DEV__ ? "http://localhost:3000" : PRODUCTION_API_URL;

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/$/, "");
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

const DEFAULT_TIMEOUT_MS = 12_000;

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", onAbort, { once: true });
    }
  }
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(resolveApiUrl(path), {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      (error instanceof Error && error.name === "AbortError") ||
      /has been canceled|timed out|AbortError/i.test(message)
    ) {
      throw new ApiError(
        `Cannot reach API (${getApiBaseUrl()}). Is Next.js running (npm run dev)?`,
        0,
        "timeout",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }

  if (response.status === 401 && options.auth !== false) {
    onUnauthorized?.();
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const body = (data ?? {}) as ApiErrorBody;
    throw new ApiError(body.error || `Request failed (${response.status})`, response.status, body.code);
  }

  return data as T;
}
