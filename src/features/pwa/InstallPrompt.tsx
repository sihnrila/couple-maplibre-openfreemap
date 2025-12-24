import { useState, useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS 감지
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // 이미 설치되어 있는지 확인
    const standalone = (window.navigator as any).standalone || window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Android: beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // 이미 설치되어 있으면 표시하지 않음
  if (isStandalone) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-black/10 to-black/5 border border-black/10">
      <div className="text-xs font-semibold text-black/70">📱 홈 화면에 추가</div>

      {isIOS ? (
        <div className="space-y-2 text-xs text-black/60">
          <div className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>하단 공유 버튼 <span className="font-semibold">(□↑)</span> 탭</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>스크롤하여 <span className="font-semibold">"홈 화면에 추가"</span> 선택</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>앱 아이콘과 이름 확인 후 <span className="font-semibold">"추가"</span> 탭</span>
          </div>
        </div>
      ) : deferredPrompt ? (
        <div className="space-y-2">
          <div className="text-xs text-black/60">
            앱을 홈 화면에 추가하면 더 빠르게 접근할 수 있어요!
          </div>
          <button
            className="w-full px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold"
            onClick={handleInstallClick}
            type="button"
          >
            설치하기
          </button>
        </div>
      ) : (
        <div className="text-xs text-black/60">
          브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택하세요.
        </div>
      )}
    </div>
  );
}

