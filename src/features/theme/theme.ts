export type BaseStyle = "light" | "dark";
export type Overlay = "none" | "grain" | "vignette" | "nightTint";

export const BASE_STYLES: Record<BaseStyle, string> = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/liberty",
};

export function getBaseStyle(): BaseStyle {
  const stored = localStorage.getItem("theme_base_style");
  return stored === "dark" ? "dark" : "light";
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

