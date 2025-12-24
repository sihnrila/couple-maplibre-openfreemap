import type { GeocodeItem } from "../../shared/types";

type Props = {
  value: string;
  onChange: (v: string) => void;
  results: GeocodeItem[];
  loading: boolean;
  error: string | null;
  onPick: (item: GeocodeItem) => void;
};

export function NominatimSearch({ value, onChange, results, loading, error, onPick }: Props) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur shadow p-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm text-black placeholder:text-black/50"
          placeholder="상호/주소로 검색해서 저장…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="text-xs opacity-70 px-2">{loading ? "검색…" : ""}</div>
      </div>

      {error && (
        <div className="mt-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
          <div className="text-xs text-red-600">{error}</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-2 rounded-xl border border-black/10 overflow-hidden bg-white">
          {results.map((r) => (
            <button
              key={String(r.place_id)}
              type="button"
              onClick={() => onPick(r)}
              className="w-full text-left px-3 py-2 hover:bg-black/5"
            >
              <div className="text-sm font-medium text-black/90">
                {r.name ?? r.display_name.split(",")[0]}
              </div>
              <div className="text-xs opacity-70 truncate text-black/70">{r.display_name}</div>
            </button>
          ))}
        </div>
      )}

      {!error && results.length === 0 && value.trim().length >= 2 && !loading && (
        <div className="mt-1 text-[11px] opacity-70 text-black/70">
          검색어를 입력하면 결과가 표시됩니다
        </div>
      )}

      {!error && results.length === 0 && value.trim().length < 2 && (
        <div className="mt-1 text-[11px] opacity-70 text-black/70">
          결과 선택 → 저장 카드가 열려요 ✨
        </div>
      )}
    </div>
  );
}
