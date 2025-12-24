import { useMemo, useState } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
};

export function TagInput({ value, onChange, suggestions = [] }: Props) {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const normalized = t.startsWith("#") ? t : `#${t}`;
    if (value.includes(normalized)) return;
    onChange([...value, normalized].slice(0, 8));
    setInput("");
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 6);
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [input, suggestions]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <button
            key={t}
            type="button"
            className="text-xs px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black"
            onClick={() => remove(t)}
            title="클릭하면 제거"
          >
            {t} <span className="opacity-60">×</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm text-black placeholder:text-black/50"
          placeholder="태그 입력 (예: 맛집, 바다, 산책)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
        />
        <button
          className="px-3 py-2 rounded-xl bg-black text-white text-sm"
          type="button"
          onClick={() => add(input)}
        >
          추가
        </button>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-black/10 hover:bg-black/5 text-black"
              onClick={() => add(s)}
            >
              {s.startsWith("#") ? s : `#${s}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
