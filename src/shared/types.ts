export type MarkerStyle = "circle" | "pin" | "heart" | "star" | "diamond" | "square";

export type Place = {
  id: string;
  couple_id: string;
  folder_id: string | null;
  title: string;
  memo: string | null;
  lat: number;
  lng: number;
  visited_at: string | null;
  tags: string[];
  source: string | null;
  source_id: string | null;
  marker_style: MarkerStyle;
  created_at: string;
};

export type Folder = {
  id: string;
  couple_id: string;
  name: string;
  color: string;
  icon: string | null;
  sort: number;
  created_at: string;
};

export type GeocodeItem = {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
};
