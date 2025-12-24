import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Place, GeocodeItem, Folder } from "../../shared/types";
import { BottomSheet } from "../../shared/ui/BottomSheet";
import { TagInput } from "../../shared/ui/TagInput";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { createPlace, geocode, listPlaces } from "./places.api";
import { listFolders } from "../folders/folders.api";
import { NominatimSearch } from "./NominatimSearch";
import { OnboardingModal } from "../auth/OnboardingModal";
import { SettingsSheet } from "../settings/SettingsSheet";
import { getInviteCode } from "../../lib/api";
import { getBaseStyle, getOverlay, BASE_STYLES } from "../theme/theme";

const ICON_EMOJI_MAP: Record<string, string> = {
  heart: "❤️",
  coffee: "☕",
  camp: "⛺",
  sparkle: "✨",
  food: "🍽️",
  sea: "🌊",
  walk: "🚶",
  gift: "🎁",
};

function nowISO() {
  return new Date().toISOString();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[m] ?? m;
  });
}

function clampText(s: string, n = 90) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function pickTitleFromGeocode(it: GeocodeItem) {
  return it.name ?? it.display_name.split(",")[0] ?? "Saved place";
}

export function MapPage() {
  const qc = useQueryClient();

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [baseStyle, setBaseStyleState] = useState<"light" | "dark">(getBaseStyle);
  const [overlay, setOverlayState] = useState<"none" | "grain" | "vignette" | "nightTint">(getOverlay);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  // 검색 state
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 450);
  const [results, setResults] = useState<GeocodeItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 선택/바텀시트
  const [selected, setSelected] = useState<GeocodeItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // draft
  const [draft, setDraft] = useState<null | {
    title: string;
    memo: string;
    visited_at: string;
    tags: string[];
    folder_id: string | null;
    lat: number | null;
    lng: number | null;
    source: string;
    source_id: string | null;
  }>(null);

  // Check onboarding on mount and auth errors
  useEffect(() => {
    const inviteCode = getInviteCode();
    if (!inviteCode) {
      setOnboardingOpen(true);
    }

    const handleAuthError = () => {
      setOnboardingOpen(true);
    };
    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  // 지도 1회 생성
  useEffect(() => {
    if (!mapElRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: BASE_STYLES[baseStyle],
      center: [126.978, 37.5665],
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마 변경: style 교체
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    // 스타일이 로드되지 않았으면 대기
    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        map.setStyle(BASE_STYLES[baseStyle]);
      });
      return;
    }
    
    map.setStyle(BASE_STYLES[baseStyle]);
  }, [baseStyle]);

  // 오버레이 클래스 업데이트
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.className = `map-overlay ${overlay !== "none" ? overlay : ""}`;
  }, [overlay]);

  // places & folders
  const placesQuery = useQuery({
    queryKey: ["places"],
    queryFn: listPlaces,
    enabled: !!getInviteCode(),
  });

  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: listFolders,
    enabled: !!getInviteCode(),
  });

  const createPlaceMut = useMutation({
    mutationFn: (payload: Omit<Place, "id" | "couple_id">) => createPlace(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["places"] });
      setSheetOpen(false);
      setSelected(null);
      setDraft(null);
    },
  });

  const places = placesQuery.data ?? [];
  const folders = foldersQuery.data ?? [];

  // 마커 동기화 (폴더 색상 적용)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = markersRef.current;
    const nextIds = new Set(places.map((p) => p.id));

    // 폴더 색상 맵 생성
    const folderColorMap = new Map<string, string>();
    folders.forEach((f) => {
      folderColorMap.set(f.id, f.color);
    });

    for (const [id, marker] of existing.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    for (const p of places) {
      if (existing.has(p.id)) {
        // Update existing marker color if folder changed
        const existingMarker = existing.get(p.id);
        if (existingMarker) {
          const folderColor = p.folder_id ? folderColorMap.get(p.folder_id) : null;
          const el = existingMarker.getElement();
          if (el && folderColor) {
            el.style.backgroundColor = folderColor;
            el.style.boxShadow = `0 0 0 3px ${folderColor}40`;
          } else if (el) {
            el.style.backgroundColor = "#ffffff";
            el.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.25)";
          }
        }
        continue;
      }

      const el = document.createElement("div");
      const folderColor = p.folder_id ? folderColorMap.get(p.folder_id) : null;

      if (folderColor) {
        el.className = "w-3 h-3 rounded-full cursor-pointer";
        el.style.backgroundColor = folderColor;
        el.style.boxShadow = `0 0 0 3px ${folderColor}40`;
      } else {
        el.className =
          "w-3 h-3 rounded-full bg-white shadow-[0_0_0_3px_rgba(0,0,0,0.25)] cursor-pointer";
      }

      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
        `<div style="font-size:12px;line-height:1.35;max-width:220px">
          <div style="font-weight:700;margin-bottom:4px">${escapeHtml(p.title)}</div>
          <div style="opacity:.85">${escapeHtml(clampText(p.memo ?? ""))}</div>
        </div>`
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);

      existing.set(p.id, marker);
    }
  }, [places, folders]);

  // 검색 실행 (디바운스)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const query = debouncedQ.trim();
      if (query.length < 2) {
        setResults([]);
        setSearchError(null);
        return;
      }
      setSearching(true);
      setSearchError(null);
      try {
        const data = await geocode(query, 6);
        if (!cancelled) {
          setResults(data || []);
          if (data && data.length === 0) {
            setSearchError("검색 결과가 없습니다");
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          const errorMsg = e?.message || "검색 중 오류가 발생했습니다";
          console.error("Geocode error:", errorMsg, e);
          setResults([]);
          
          if (errorMsg.includes("너무 빠릅니다") || errorMsg.includes("429")) {
            setSearchError("검색 요청이 너무 빠릅니다. 1초 후 다시 시도해주세요.");
          } else if (errorMsg.includes("연결할 수 없습니다") || errorMsg.includes("NetworkError")) {
            setSearchError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
          } else {
            setSearchError(errorMsg);
          }
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const openSaveSheet = (item: GeocodeItem) => {
    setSelected(item);
    setSheetOpen(true);

    const lat = Number(item.lat);
    const lng = Number(item.lon);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, essential: true });
    }

    setDraft({
      title: pickTitleFromGeocode(item),
      memo: item.display_name ? `📍 ${item.display_name}` : "",
      visited_at: "",
      tags: [],
      folder_id: null,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      source: "nominatim",
      source_id: String(item.place_id ?? ""),
    });

    // UX: 검색어/결과 정리
    setQ("");
    setResults([]);
  };

  const canSave =
    !!getInviteCode() &&
    !!draft?.title?.trim() &&
    draft?.lat != null &&
    draft?.lng != null &&
    !createPlaceMut.isPending;

  const onSave = async () => {
    if (!draft) return;
    if (!canSave) return;

    try {
      await createPlaceMut.mutateAsync({
        folder_id: draft.folder_id,
        title: draft.title.trim(),
        memo: draft.memo.trim() ? draft.memo.trim() : null,
        lat: draft.lat!,
        lng: draft.lng!,
        visited_at: draft.visited_at ? draft.visited_at : null,
        tags: draft.tags,
        source: draft.source,
        source_id: draft.source_id,
        created_at: nowISO(),
      });
    } catch (e: any) {
      const msg = (e?.message as string) || "저장 실패";
      if (/unique|constraint|duplicate/i.test(msg)) {
        alert("이미 저장된 장소 같아! 🧷");
      } else {
        alert(msg);
      }
    }
  };

  const handleThemeChange = () => {
    setBaseStyleState(getBaseStyle());
    setOverlayState(getOverlay());
  };

  return (
    <div className="h-dvh w-full relative">
      {/* 상단: 검색 + 설정 */}
      <div className="absolute z-20 left-3 right-3 top-3 space-y-2">
        <NominatimSearch
          value={q}
          onChange={setQ}
          results={results}
          loading={searching}
          error={searchError}
          onPick={openSaveSheet}
        />

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-2xl bg-white/85 backdrop-blur shadow text-sm text-black"
            onClick={() => setSettingsOpen(true)}
            type="button"
            title="설정"
          >
            ⚙︎
          </button>

          <button
            className="px-3 py-2 rounded-2xl bg-white/85 backdrop-blur shadow text-sm text-black"
            type="button"
            onClick={() => {
              const map = mapRef.current;
              if (!map) return;
              if (!places[0]) return alert("아직 저장된 핀이 없어! 검색해서 하나 저장해봐 🧷");
              map.flyTo({ center: [places[0].lng, places[0].lat], zoom: 14, essential: true });
            }}
            title="최근 저장으로 이동"
          >
            최근
          </button>
        </div>
      </div>

      {placesQuery.isLoading && (
        <div className="absolute z-20 right-3 top-28 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur shadow text-sm text-black">
          불러오는 중…
        </div>
      )}

      {/* 지도 */}
      <div ref={mapElRef} className="h-full w-full relative" />

      {/* 오버레이 */}
      <div ref={overlayRef} className="map-overlay" />

      {/* 바텀시트: 저장 카드 */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelected(null);
        }}
        title="🧷 저장 카드"
      >
        {!draft ? (
          <div className="text-sm opacity-70">선택된 장소가 없어요.</div>
        ) : (
          <div className="space-y-4">
            <div className="text-[11px] opacity-70">
              {selected?.display_name ? (
                <span>{selected.display_name}</span>
              ) : (
                <span>주소 정보가 없어요</span>
              )}
            </div>

            {/* 폴더 선택 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-black/70">폴더</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                    draft.folder_id === null
                      ? "bg-black text-white"
                      : "bg-black/5 hover:bg-black/10"
                  }`}
                  onClick={() => setDraft({ ...draft, folder_id: null })}
                  type="button"
                >
                  없음
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-white ${
                      draft.folder_id === f.id ? "ring-2 ring-black/30" : ""
                    }`}
                    style={{ backgroundColor: f.color }}
                    onClick={() => setDraft({ ...draft, folder_id: f.id })}
                    type="button"
                  >
                    {f.icon ? ICON_EMOJI_MAP[f.icon] || "" : ""} {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-black/70">장소 이름</label>
              <input
                id="place-title"
                name="place-title"
                className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm text-black placeholder:text-black/50"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="예: 우리의 첫 카페"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-black/70">방문일 (선택)</label>
              <input
                id="visited-at"
                name="visited-at"
                className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm text-black"
                type="date"
                value={draft.visited_at}
                onChange={(e) => setDraft({ ...draft, visited_at: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-black/70">태그</label>
              <TagInput
                value={draft.tags}
                onChange={(tags) => setDraft({ ...draft, tags })}
                suggestions={["맛집", "카페", "바다", "산책", "숙소", "뷰맛집", "캠핑", "야경"]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-black/70">메모</label>
              <textarea
                id="place-memo"
                name="place-memo"
                className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm min-h-[90px] text-black placeholder:text-black/50"
                value={draft.memo}
                onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                placeholder="예: 창가 자리, 6시쯤 노을 예쁨…"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 px-3 py-3 rounded-2xl bg-black text-white text-sm disabled:opacity-40"
                onClick={onSave}
                disabled={!canSave}
                type="button"
              >
                {createPlaceMut.isPending ? "저장 중…" : "저장하기"}
              </button>

              <button
                className="px-4 py-3 rounded-2xl bg-black/5 hover:bg-black/10 text-sm"
                onClick={() => {
                  setSheetOpen(false);
                  setSelected(null);
                }}
                type="button"
              >
                취소
              </button>
            </div>

            <div className="text-[11px] opacity-60">
              지도: OpenFreeMap(키 없음) / 검색: Nominatim(Worker 프록시)
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 온보딩 모달 */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={() => {
          if (getInviteCode()) {
            setOnboardingOpen(false);
            qc.invalidateQueries();
          }
        }}
      />

      {/* 설정 시트 */}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={handleThemeChange}
      />

      {/* 하단 도움말 */}
      <div className="absolute z-10 left-3 bottom-3 right-3">
        <div className="rounded-2xl bg-white/70 backdrop-blur shadow p-3">
          <div className="text-xs font-semibold mb-1">🧭 흐름</div>
          <div className="text-[11px] opacity-80">
            검색 → 선택 → 저장 카드에서 제목/태그/메모 다듬기 → 저장
          </div>
        </div>
      </div>
    </div>
  );
}
