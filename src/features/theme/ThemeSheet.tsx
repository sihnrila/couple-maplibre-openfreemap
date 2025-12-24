import { BottomSheet } from "../../shared/ui/BottomSheet";
import { getBaseStyle, setBaseStyle, getOverlay, setOverlay, type BaseStyle, type Overlay } from "./theme";

type Props = {
  open: boolean;
  onClose: () => void;
  onThemeChange?: () => void;
};

export function ThemeSheet({ open, onClose, onThemeChange }: Props) {
  const baseStyle = getBaseStyle();
  const overlay = getOverlay();

  const handleBaseStyleChange = (style: BaseStyle) => {
    setBaseStyle(style);
    onThemeChange?.();
  };

  const handleOverlayChange = (ov: Overlay) => {
    setOverlay(ov);
    onThemeChange?.();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="🎨 테마 설정">
      <div className="space-y-6">
        {/* Base Style */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-black/70">지도 스타일</div>
          <div className="flex gap-2">
            <button
              className={`flex-1 px-4 py-3 rounded-2xl text-sm font-semibold ${
                baseStyle === "light"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleBaseStyleChange("light")}
              type="button"
            >
              ☀️ 라이트
            </button>
            <button
              className={`flex-1 px-4 py-3 rounded-2xl text-sm font-semibold ${
                baseStyle === "dark"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleBaseStyleChange("dark")}
              type="button"
            >
              🌙 다크
            </button>
          </div>
        </div>

        {/* Overlay */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-black/70">오버레이 효과</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                overlay === "none"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleOverlayChange("none")}
              type="button"
            >
              없음
            </button>
            <button
              className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                overlay === "grain"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleOverlayChange("grain")}
              type="button"
            >
              그레인
            </button>
            <button
              className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                overlay === "vignette"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleOverlayChange("vignette")}
              type="button"
            >
              비네트
            </button>
            <button
              className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                overlay === "nightTint"
                  ? "bg-black text-white"
                  : "bg-black/5 hover:bg-black/10"
              }`}
              onClick={() => handleOverlayChange("nightTint")}
              type="button"
            >
              나이트 틴트
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

