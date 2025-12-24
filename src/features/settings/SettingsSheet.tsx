import { useState } from "react";
import { BottomSheet } from "../../shared/ui/BottomSheet";
import { getInviteCode } from "../../lib/api";
import { rotateInviteCode } from "../auth/couple.api";
import { FolderManagerSheet } from "../folders/FolderManagerSheet";
import { ThemeSheet } from "../theme/ThemeSheet";
import { InstallPrompt } from "../pwa/InstallPrompt";

type Props = {
  open: boolean;
  onClose: () => void;
  onThemeChange?: () => void;
};

export function SettingsSheet({ open, onClose, onThemeChange }: Props) {
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteCode = getInviteCode();

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("복사 실패");
    }
  };

  const handleRotate = async () => {
    if (!confirm("초대코드를 재발급하면 기존 코드는 사용할 수 없습니다. 계속하시겠어요?")) {
      return;
    }
    setRotating(true);
    try {
      await rotateInviteCode();
      alert("초대코드가 재발급되었습니다!");
    } catch (e: any) {
      alert(e?.message || "재발급 실패");
    } finally {
      setRotating(false);
    }
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="⚙️ 설정">
        <div className="space-y-4">
          {/* PWA 설치 안내 */}
          <InstallPrompt />

          {/* 초대코드 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-black/70">초대코드</div>
            {inviteCode ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="invite-code-display"
                    name="invite-code-display"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/5 text-sm font-mono uppercase"
                    value={inviteCode}
                    readOnly
                  />
                  <button
                    className="px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold"
                    onClick={handleCopyInviteCode}
                    type="button"
                  >
                    {copied ? "복사됨!" : "복사"}
                  </button>
                </div>
                <button
                  className="w-full px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-sm"
                  onClick={handleRotate}
                  disabled={rotating}
                  type="button"
                >
                  {rotating ? "재발급 중…" : "초대코드 재발급"}
                </button>
              </div>
            ) : (
              <div className="text-sm text-black/50">초대코드가 없습니다</div>
            )}
          </div>

          {/* 폴더 관리 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-black/70">관리</div>
            <button
              className="w-full px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-semibold text-left"
              onClick={() => setShowFolderManager(true)}
              type="button"
            >
              📁 폴더 관리
            </button>
            <button
              className="w-full px-4 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-semibold text-left"
              onClick={() => setShowThemeSheet(true)}
              type="button"
            >
              🎨 테마 설정
            </button>
          </div>
        </div>
      </BottomSheet>

      <FolderManagerSheet
        open={showFolderManager}
        onClose={() => setShowFolderManager(false)}
      />
      <ThemeSheet
        open={showThemeSheet}
        onClose={() => setShowThemeSheet(false)}
        onThemeChange={onThemeChange}
      />
    </>
  );
}

