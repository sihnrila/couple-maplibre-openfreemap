import type { Place, GeocodeItem } from "../../shared/types";
import { api } from "../../lib/api";

export async function listPlaces(): Promise<Place[]> {
  return api<Place[]>("/api/places");
}

export async function createPlace(input: Omit<Place, "id" | "couple_id">): Promise<Place> {
  return api<Place>("/api/places", { method: "POST", body: JSON.stringify(input) });
}

export async function updatePlace(
  id: string,
  input: {
    folder_id?: string | null;
    title?: string;
    memo?: string | null;
    visited_at?: string | null;
    tags?: string[];
    marker_style?: string;
  }
): Promise<{ id: string }> {
  return api<{ id: string }>(`/api/places/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function geocode(q: string, limit = 6): Promise<GeocodeItem[]> {
  return api<GeocodeItem[]>(`/api/geocode?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeItem | null> {
  try {
    const result = await api<GeocodeItem>(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
    return result;
  } catch (e) {
    console.error("Reverse geocode error:", e);
    return null;
  }
}
