import { api, saveInviteCode } from "../../lib/api";

export async function createCouple(): Promise<{ inviteCode: string; coupleId: string }> {
  const result = await api<{ inviteCode: string; coupleId: string }>("/api/couple/create", {
    method: "POST",
  });
  saveInviteCode(result.inviteCode);
  return result;
}

export async function joinCouple(inviteCode: string): Promise<{ coupleId: string }> {
  const result = await api<{ coupleId: string }>("/api/couple/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
  saveInviteCode(inviteCode);
  return result;
}

export async function rotateInviteCode(): Promise<{ inviteCode: string }> {
  const result = await api<{ inviteCode: string }>("/api/couple/rotate", {
    method: "POST",
  });
  saveInviteCode(result.inviteCode);
  return result;
}

