# PWA 구현 가이드

## 완료된 작업

### 1. 패키지 추가
- ✅ `vite-plugin-pwa` 추가됨 (`package.json`)

### 2. Vite 설정
- ✅ `vite.config.ts`에 VitePWA 플러그인 추가
- ✅ `registerType: "autoUpdate"` 설정
- ✅ Manifest 설정 완료
- ✅ Workbox 캐싱 전략 설정

### 3. 아이콘 파일
- ⚠️ 아이콘 파일은 수동으로 생성 필요 (`public/icons/README.md` 참고)

### 4. 설치 UX
- ✅ `InstallPrompt` 컴포넌트 생성
- ✅ SettingsSheet에 설치 안내 추가
- ✅ Android: beforeinstallprompt 이벤트 처리
- ✅ iOS: 가이드 문구 표시

### 5. 오프라인/캐시 전략
- ✅ 지도 타일: NetworkFirst (24시간 캐시)
- ✅ API: NetworkFirst (5분 캐시)
- ✅ 정적 리소스: Precache

### 6. Cloudflare Pages 호환
- ✅ base path: "/" 유지
- ✅ build output: `dist`
- ✅ `VITE_API_BASE`는 Pages 환경변수로 설정

---

## 설치 및 실행

### 1. 패키지 설치
```bash
npm install
```

### 2. 아이콘 파일 생성
`public/icons/README.md`를 참고하여 아이콘 파일을 생성하세요.

**임시 아이콘 (개발용)**:
개발 중에는 아이콘 없이도 작동하지만, 브라우저 경고가 표시될 수 있습니다.
실제 배포 전에는 반드시 아이콘을 생성하세요.

### 3. 로컬 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

빌드 후 `dist` 디렉토리에 다음 파일이 생성됩니다:
- `sw.js` (Service Worker)
- `workbox-*.js` (Workbox 런타임)
- `manifest.webmanifest`

---

## 테스트

### PWA 설치 테스트

#### Android (Chrome)
1. 개발 서버 실행 (`npm run dev`)
2. Chrome에서 `http://localhost:5173` 접속
3. 설정(⚙︎) → "홈 화면에 추가" 섹션 확인
4. "설치하기" 버튼 클릭 (또는 브라우저 메뉴 → "앱 설치")
5. 홈 화면에 앱 아이콘 생성 확인
6. 아이콘 클릭하여 독립 앱으로 실행 확인

#### iOS (Safari)
1. Safari에서 접속
2. 설정(⚙︎) → "홈 화면에 추가" 섹션 확인
3. 하단 공유 버튼(□↑) 탭
4. "홈 화면에 추가" 선택
5. 홈 화면에 앱 아이콘 생성 확인
6. 아이콘 클릭하여 독립 앱으로 실행 확인

### 오프라인 테스트
1. 앱 설치
2. 개발자 도구 → Network → Offline 체크
3. 앱 새로고침
4. 캐시된 리소스가 로드되는지 확인

---

## 배포 (Cloudflare Pages)

### 1. 빌드 확인
```bash
npm run build
```

### 2. Pages 배포
기존 배포 절차와 동일합니다 (`DEPLOY.md` 참고).

**중요**: 
- Service Worker는 HTTPS에서만 작동합니다
- Cloudflare Pages는 자동으로 HTTPS를 제공합니다
- `VITE_API_BASE` 환경변수 설정 필수

### 3. 배포 후 확인
1. Pages URL 접속
2. 개발자 도구 → Application → Service Workers
3. Service Worker가 등록되었는지 확인
4. Manifest가 올바르게 로드되는지 확인

---

## 문제 해결

### Service Worker가 등록되지 않음
- **원인**: HTTPS가 아닌 환경에서 실행
- **해결**: 로컬에서는 `npm run dev`로 실행 (Vite가 자동 처리), 배포는 HTTPS 필수

### 아이콘이 표시되지 않음
- **원인**: 아이콘 파일이 없거나 경로가 잘못됨
- **해결**: `public/icons/` 디렉토리에 아이콘 파일 생성 확인

### 설치 버튼이 표시되지 않음 (Android)
- **원인**: `beforeinstallprompt` 이벤트가 발생하지 않음
- **해결**: 
  - HTTPS 환경에서 테스트
  - 이미 설치된 경우 표시되지 않음 (정상)
  - 브라우저 메뉴에서 "앱 설치" 확인

### iOS에서 설치 가이드가 표시되지 않음
- **원인**: 이미 설치되어 있거나 Safari가 아님
- **해결**: Safari에서 테스트, `(window.navigator as any).standalone` 확인

---

## PWA 기능 확인 체크리스트

- [ ] Manifest 파일 생성 확인
- [ ] Service Worker 등록 확인
- [ ] 아이콘 표시 확인 (다양한 크기)
- [ ] Android 설치 프롬프트 작동
- [ ] iOS 설치 가이드 표시
- [ ] 독립 앱으로 실행 (주소창 없음)
- [ ] 오프라인 캐싱 작동
- [ ] 자동 업데이트 작동

---

## 다음 단계

PWA 기본 구현이 완료되었습니다. 필요시 다음을 고려하세요:

1. **아이콘 디자인**: 전문 디자이너에게 의뢰하거나 온라인 도구 활용
2. **오프라인 페이지**: 네트워크 오류 시 표시할 커스텀 페이지
3. **푸시 알림**: (선택사항) Cloudflare Workers + Web Push API
4. **Capacitor 통합**: 네이티브 앱으로 확장 (아래 옵션 B 참고)

