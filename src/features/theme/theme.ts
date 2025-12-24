import type maplibregl from "maplibre-gl";

export type BaseStyle = "kakao" | "light" | "dark";
export type Overlay = "none" | "grain" | "vignette" | "nightTint";

// 카카오맵 스타일을 모방한 OSM 기반 스타일
const KAKAO_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm-tiles",
    },
  ],
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
};

export const BASE_STYLES: Record<BaseStyle, string | maplibregl.StyleSpecification> = {
  kakao: KAKAO_STYLE,
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/liberty",
};

export function getBaseStyle(): BaseStyle {
  const stored = localStorage.getItem("theme_base_style");
  if (stored === "kakao" || stored === "dark") {
    return stored;
  }
  // 기본값을 카카오맵 스타일로 설정
  return "kakao";
}

export function setBaseStyle(style: BaseStyle): void {
  localStorage.setItem("theme_base_style", style);
}

export function getOverlay(): Overlay {
  const stored = localStorage.getItem("theme_overlay");
  return (stored === "grain" || stored === "vignette" || stored === "nightTint") ? stored : "none";
}

export function setOverlay(overlay: Overlay): void {
  localStorage.setItem("theme_overlay", overlay);
}

