const fallback = "https://couplemap-api.oo8923.workers.dev";
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || fallback;

// Get invite code from localStorage
export function getInviteCode(): string | null {
  return localStorage.getItem("inviteCode");
}

// Save invite code to localStorage
export function saveInviteCode(code: string): void {
  localStorage.setItem("inviteCode", code);
}

// Clear invite code (for logout/onboarding reset)
export function clearInviteCode(): void {
  localStorage.removeItem("inviteCode");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const inviteCode = getInviteCode();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init?.headers as Record<string, string> || {}),
  };

  // Add x-invite-code header if available (except for public endpoints)
  if (inviteCode && !path.includes("/couple/create") && !path.includes("/couple/join")) {
    headers["x-invite-code"] = inviteCode;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // Handle auth errors
  if (res.status === 401 || res.status === 403) {
    clearInviteCode();
    // Trigger onboarding modal by dispatching event
    window.dispatchEvent(new CustomEvent("auth-error"));
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Rate limit 에러는 더 친화적인 메시지 제공
    if (res.status === 429) {
      throw new Error("검색 요청이 너무 빠릅니다. 1초 후 다시 시도해주세요.");
    }
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
