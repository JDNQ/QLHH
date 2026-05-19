import type { AuthTokens } from "@/types";

type ApiWrapped<T> = { data?: T };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function logInvalidAuthShape(payload: unknown, normalized: unknown) {
  if (typeof console === "undefined") return;

  console.error("Invalid auth response shape", {
    rootKeys: isRecord(payload) ? Object.keys(payload) : typeof payload,
    dataKeys: isRecord(normalized)
      ? Object.keys(normalized)
      : typeof normalized,
  });
}

// Accept either direct auth payload or global-interceptor shape { data: payload }.
export function parseAuthTokens(payload: unknown): AuthTokens {
  const maybeWrapped =
    isRecord(payload) && "data" in payload
      ? (payload as ApiWrapped<unknown>).data
      : payload;

  if (!isRecord(maybeWrapped)) {
    logInvalidAuthShape(payload, maybeWrapped);
    throw new Error("Invalid auth response: missing payload");
  }

  const accessToken = maybeWrapped.accessToken ?? maybeWrapped.token;
  const refreshToken = maybeWrapped.refreshToken;
  const user = maybeWrapped.user;

  if (
    typeof accessToken !== "string" ||
    !user
  ) {
    logInvalidAuthShape(payload, maybeWrapped);
    throw new Error(
      "Invalid auth response: missing accessToken/refreshToken/user",
    );
  }

  return {
    token: accessToken,
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    user: user as AuthTokens["user"],
  };
}
