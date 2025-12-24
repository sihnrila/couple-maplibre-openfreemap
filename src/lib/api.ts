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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
    ...init,
      headers,
    });
  } catch (e: any) {
    // Network error (CORS, connection refused, etc.)
    const errorMsg = e?.message || "네트워크 오류가 발생했습니다";
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
      throw new Error("서버에 연결할 수 없습니다. Worker 서버가 실행 중인지 확인해주세요.");
    }
    throw new Error(errorMsg);
  }

  // Handle auth errors
  if (res.status === 401 || res.status === 403) {
    clearInviteCode();
    // Trigger onboarding modal by dispatching event (only once per second)
    const authErrorKey = "__authErrorDispatched";
    if (!(window as any)[authErrorKey]) {
      (window as any)[authErrorKey] = true;
      window.dispatchEvent(new CustomEvent("auth-error"));
      // Reset flag after a short delay to allow retry if needed
      setTimeout(() => {
        (window as any)[authErrorKey] = false;
      }, 1000);
    }
    const txt = await res.text().catch(() => "");
    // Don't throw error for 401/403 to prevent console spam
    // The auth-error event will handle showing the onboarding modal
    throw new Error("인증이 필요합니다");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Rate limit 에러는 더 친화적인 메시지 제공
    if (res.status === 429) {
      throw new Error("검색 요청이 너무 빠릅니다. 1초 후 다시 시도해주세요.");
    }
    // Nominatim 차단 에러 처리
    if (txt.includes("Access blocked") || txt.includes("usage policy")) {
      throw new Error("검색 서비스가 일시적으로 제한되었습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error(txt || `HTTP ${res.status}`);
  }
  
  try {
  return (await res.json()) as T;
  } catch (e: any) {
    throw new Error("서버 응답을 파싱할 수 없습니다");
  }
}
