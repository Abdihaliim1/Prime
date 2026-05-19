export const ADMIN_AUTH_COOKIE = "pt-admin-auth";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminTokenPayload {
  u: string;
  exp: number;
}

function getSecret(credentials: AdminCredentials) {
  return process.env.AUTH_SECRET || credentials.password;
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export function getAdminCredentials(): AdminCredentials | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) return null;
  return { username, password };
}

export async function createAdminToken(username: string) {
  const credentials = getAdminCredentials();
  if (!credentials) return null;

  const payload = base64UrlEncode(
    JSON.stringify({
      u: username,
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
    } satisfies AdminTokenPayload)
  );
  const signature = await sign(payload, getSecret(credentials));

  return `${payload}.${signature}`;
}

export async function verifyAdminToken(token: string | undefined | null) {
  const credentials = getAdminCredentials();
  if (!credentials || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload, getSecret(credentials));
  if (signature !== expected) return false;

  try {
    const data = JSON.parse(base64UrlDecode(payload)) as Partial<AdminTokenPayload>;
    return data.u === credentials.username && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
