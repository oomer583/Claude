import "server-only";

const DEFAULT_TIMEOUT_MS = 15_000;

export class OnyxError extends Error {
  readonly status?: number;
  readonly code:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "RATE_LIMITED"
    | "TIMEOUT"
    | "BAD_RESPONSE"
    | "UPSTREAM_ERROR";

  constructor(
    code: OnyxError["code"],
    message: string,
    options?: { status?: number; cause?: unknown }
  ) {
    super(message, { cause: options?.cause });
    this.name = "OnyxError";
    this.code = code;
    this.status = options?.status;
  }
}

function baseUrl() {
  const value = process.env.ONYX_BASE_URL?.trim();
  if (!value) {
    throw new Error("ONYX_BASE_URL is required for Onyx integration");
  }
  return value.replace(/\/$/, "");
}

function mapStatus(status: number): OnyxError["code"] {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMITED";
  return "UPSTREAM_ERROR";
}

export async function onyxRequest<T>({
  path,
  bearerToken,
  init,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  path: string;
  bearerToken: string;
  init?: RequestInit;
  timeoutMs?: number;
}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${bearerToken}`);
    if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new OnyxError(
        mapStatus(response.status),
        `Onyx request failed (${response.status})${detail ? `: ${detail}` : ""}`,
        { status: response.status }
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new OnyxError("BAD_RESPONSE", "Onyx returned invalid JSON", {
        status: response.status,
        cause: error,
      });
    }
  } catch (error) {
    if (error instanceof OnyxError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OnyxError("TIMEOUT", "Onyx request timed out", { cause: error });
    }
    throw new OnyxError("UPSTREAM_ERROR", "Onyx request failed", {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}
