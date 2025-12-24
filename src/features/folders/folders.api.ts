import type { Folder } from "../../shared/types";
import { api } from "../../lib/api";

export async function listFolders(): Promise<Folder[]> {
  return api<Folder[]>("/api/folders");
}

export async function createFolder(input: {
  name: string;
  color: string;
  icon?: string | null;
  sort?: number;
}): Promise<Folder> {
  return api<Folder>("/api/folders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateFolder(
  id: string,
  input: {
    name?: string;
    color?: string;
    icon?: string | null;
    sort?: number;
  }
): Promise<{ id: string }> {
  return api<{ id: string }>(`/api/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteFolder(id: string): Promise<{ success: boolean }> {
  return api<{ success: boolean }>(`/api/folders/${id}`, {
    method: "DELETE",
  });
}

