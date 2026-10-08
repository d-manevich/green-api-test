import type { Credentials } from "@/lib/chats";

const KEY = "green-api-credentials";

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Credentials>;
    return typeof value.idInstance === "string" &&
      typeof value.apiTokenInstance === "string"
      ? {
          idInstance: value.idInstance,
          apiTokenInstance: value.apiTokenInstance,
        }
      : null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(credentials));
  } catch {
    // Signed in for this tab only
  }
}

export function clearCredentials(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored
  }
}
