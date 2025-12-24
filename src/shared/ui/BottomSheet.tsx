import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-30 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      </div>

      <div
        className={[
          "fixed left-0 right-0 bottom-0 z-40 transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-xl">
          <div className="rounded-t-3xl bg-white/95 backdrop-blur shadow-soft">
            <div className="px-4 pt-3 pb-2">
              <div className="mx-auto h-1 w-10 rounded-full bg-black/15" />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-black/90">{title ?? ""}</div>
                <button
                  className="text-xs px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10"
                  onClick={onClose}
                  type="button"
                >
                  닫기
                </button>
              </div>
            </div>
            <div className="px-4 pb-5">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
