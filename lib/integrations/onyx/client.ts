import "server-only";

const DEFAULT_TIMEOUT_MS = 15_000;

type OnyxErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "BAD_RESPONSE"
  | "UPSTREAM_ERROR";

type OnyxErrorOptions = ErrorOptions & {
  code: OnyxErrorCode;
  status?: number;
};

export class OnyxError extends Error {
  readonly status?: number;
  readonly code: OnyxErrorCode;

  constructor(message: string, options: OnyxErrorOptions) {
    super(message, options);
    this.name = "OnyxError";
    this.code = options.code;
    this.status = options.status;
  }
}

function baseUrl() {
  const value = process.env.ONYX_BASE_URL?.trim();
  if (!value) {
    throw new Error("ONYX_BASE_URL is required for Onyx integration");
  }
  return value.replace(/\/$/, "");
}

function mapStatus(status: number): OnyxErrorCode {
  if (status === 401) {
    return "UNAUTHORIZED";
  }
  if (status === 403) {
    return "FORBIDDEN";
  }
  if (status === 404) {
    return "NOT_FOUND";
  }
  if (status === 429) {
    return "RATE_LIMITED";
  }
  return "UPSTREAM_ERROR";
}

export async function onyxRequest<T>({
  bearerToken,
  init,
  path,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  bearerToken: string;
  init?: RequestInit;
  path: string;
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
      cache: "no-store",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new OnyxError(
        `Onyx request failed (${response.status})${detail ? `: ${detail}` : ""}`,
        { code: mapStatus(response.status), status: response.status }
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new OnyxError("Onyx returned invalid JSON", {
        cause: error,
        code: "BAD_RESPONSE",
        status: response.status,
      });
    }
  } catch (error) {
    if (error instanceof OnyxError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OnyxError("Onyx request timed out", {
        cause: error,
        code: "TIMEOUT",
      });
    }
    throw new OnyxError("Onyx request failed", {
      cause: error,
      code: "UPSTREAM_ERROR",
    });
  } finally {
    clearTimeout(timeout);
  }
}
