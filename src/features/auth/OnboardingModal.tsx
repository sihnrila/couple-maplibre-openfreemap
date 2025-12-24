import { useState, useEffect } from "react";
import { createCouple, joinCouple } from "./couple.api";

type Props = {
  open: boolean;
  onClose: () => void;
};

const COLOR_PALETTE = [
  "#FF6B6B", // Rose Punch
  "#F7B267", // Apricot Glow
  "#F8E16C", // Soft Sun
  "#6BCB77", // Mint Meadow
  "#4D96FF", // Blue Pop
  "#845EC2", // Lavender Night
  "#00C2A8", // Aqua Whisper
  "#2C2F36", // Graphite
];

export function OnboardingModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMode("select");
      setInviteCode("");
      setError("");
    }
  }, [open]);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      await createCouple();
      onClose();
    } catch (e: any) {
      setError(e?.message || "생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      setError("초대코드를 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await joinCouple(code);
      onClose();
    } catch (e: any) {
      setError(e?.message || "참여 실패. 초대코드를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-3xl bg-white shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">커플 지도 시작하기</h2>

          {mode === "select" && (
            <div className="space-y-3">
              <button
                className="w-full px-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold disabled:opacity-40"
                onClick={() => setMode("create")}
                type="button"
              >
                커플 만들기
              </button>
              <button
                className="w-full px-4 py-3 rounded-2xl bg-black/5 hover:bg-black/10 text-sm font-semibold"
                onClick={() => setMode("join")}
                type="button"
              >
                초대코드로 참여
              </button>
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-4">
              <p className="text-sm text-black/70">
                새로운 커플 지도를 만들면 초대코드가 발급됩니다. 파트너에게 공유해주세요!
              </p>
              {error && <div className="text-xs text-red-600">{error}</div>}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold disabled:opacity-40"
                  onClick={handleCreate}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "생성 중…" : "생성하기"}
                </button>
                <button
                  className="px-4 py-3 rounded-2xl bg-black/5 hover:bg-black/10 text-sm"
                  onClick={() => setMode("select")}
                  type="button"
                >
                  뒤로
                </button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-black/70">초대코드</label>
                <input
                  id="invite-code-input"
                  name="invite-code"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none focus:ring-2 focus:ring-black/15 text-sm uppercase"
                  placeholder="예: ABC12345"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoin();
                  }}
                />
              </div>
              {error && <div className="text-xs text-red-600">{error}</div>}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold disabled:opacity-40"
                  onClick={handleJoin}
                  disabled={loading || !inviteCode.trim()}
                  type="button"
                >
                  {loading ? "참여 중…" : "참여하기"}
                </button>
                <button
                  className="px-4 py-3 rounded-2xl bg-black/5 hover:bg-black/10 text-sm"
                  onClick={() => setMode("select")}
                  type="button"
                >
                  뒤로
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

