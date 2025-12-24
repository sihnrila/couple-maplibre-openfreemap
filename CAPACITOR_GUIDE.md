# Capacitor 가이드 (옵션 B)

Capacitor를 사용하여 iOS/Android 네이티브 앱으로 확장하는 가이드입니다.

**주의**: 이 가이드는 선택사항이며, PWA만으로도 충분히 사용 가능합니다.

---

## Capacitor란?

Capacitor는 웹 앱을 네이티브 iOS/Android 앱으로 변환하는 도구입니다.
- PWA 기반으로 네이티브 기능 추가 가능
- App Store / Play Store 배포 가능
- 카메라, 파일 시스템 등 네이티브 API 접근

---

## 설치 및 설정

### 1. Capacitor 패키지 설치

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 2. Capacitor 초기화

```bash
npx cap init
```

**입력 예시**:
- App name: `CoupleMap`
- App ID: `com.yourdomain.couplemap`
- Web dir: `dist`

### 3. iOS/Android 프로젝트 생성

```bash
# 빌드 먼저 실행
npm run build

# iOS 프로젝트 생성
npx cap add ios

# Android 프로젝트 생성
npx cap add android
```

---

## 프로젝트 구조

초기화 후 다음 구조가 생성됩니다:

```
couple-maplibre-openfreemap/
  dist/                    # 빌드 출력
  ios/                     # iOS 프로젝트
  android/                 # Android 프로젝트
  capacitor.config.ts      # Capacitor 설정
```

---

## 설정 파일

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.couplemap',
  appName: 'CoupleMap',
  webDir: 'dist',
  server: {
    // 개발 중에는 로컬 서버 사용
    // url: 'http://localhost:5173',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0b0b0b',
    },
  },
};

export default config;
```

---

## 네이티브 기능 추가 (선택사항)

### 1. Status Bar 스타일링

```bash
npm install @capacitor/status-bar
```

```typescript
// src/main.tsx
import { StatusBar, Style } from '@capacitor/status-bar';

// 다크 테마일 때
StatusBar.setStyle({ style: Style.Dark });
```

### 2. Splash Screen

```bash
npm install @capacitor/splash-screen
```

이미 `capacitor.config.ts`에 기본 설정이 포함되어 있습니다.

### 3. 파일 시스템 (사진 업로드용 - 현재 미구현)

```bash
npm install @capacitor/filesystem
```

**주의**: 현재 프로젝트는 사진 업로드를 구현하지 않았으므로 필요시 추가 구현 필요.

---

## iOS 빌드 및 실행

### 1. Xcode에서 열기

```bash
npx cap open ios
```

### 2. 빌드 설정

1. Xcode에서 프로젝트 선택
2. **Signing & Capabilities** 탭
3. Team 선택 (Apple Developer 계정 필요)
4. Bundle Identifier 확인

### 3. 시뮬레이터에서 실행

1. 상단에서 시뮬레이터 선택
2. ▶️ 버튼 클릭

### 4. 실제 기기에서 실행

1. USB로 iPhone 연결
2. Xcode에서 기기 선택
3. Trust 설정 (기기에서)
4. ▶️ 버튼 클릭

---

## Android 빌드 및 실행

### 1. Android Studio에서 열기

```bash
npx cap open android
```

### 2. 빌드 설정

1. Android Studio에서 프로젝트 열기
2. **Build** → **Make Project**
3. **Run** → **Run 'app'**

### 3. 에뮬레이터에서 실행

1. AVD Manager에서 에뮬레이터 생성
2. 에뮬레이터 실행
3. Run 버튼 클릭

### 4. 실제 기기에서 실행

1. USB로 Android 기기 연결
2. USB 디버깅 활성화 (기기에서)
3. Run 버튼 클릭

---

## 웹 앱 업데이트 반영

웹 앱을 수정한 후 네이티브 앱에 반영:

```bash
# 1. 빌드
npm run build

# 2. Capacitor에 복사
npx cap sync

# 3. iOS/Android 프로젝트에서 확인
npx cap open ios
# 또는
npx cap open android
```

---

## 스토어 배포

### iOS (App Store)

1. **Xcode**에서 **Product** → **Archive**
2. **Organizer**에서 **Distribute App**
3. App Store Connect에 업로드
4. App Store Connect에서 앱 정보 입력
5. 심사 제출

**요구사항**:
- Apple Developer 계정 ($99/년)
- 앱 아이콘 (1024x1024px)
- 스크린샷 (다양한 기기 크기)
- 개인정보 처리방침 URL

### Android (Google Play Store)

1. **Android Studio**에서 **Build** → **Generate Signed Bundle / APK**
2. AAB 파일 생성
3. Google Play Console에 업로드
4. 앱 정보 입력
5. 심사 제출

**요구사항**:
- Google Play Developer 계정 ($25 일회성)
- 앱 아이콘 (512x512px)
- 스크린샷
- 개인정보 처리방침 URL

---

## 주의사항

### 1. API 엔드포인트

네이티브 앱에서도 Cloudflare Workers API를 사용합니다.
- `VITE_API_BASE`는 빌드 시점에 고정됩니다
- 환경별로 다른 API URL 사용 시 빌드 스크립트 수정 필요

### 2. 지도 타일

MapLibre GL JS는 네이티브에서도 작동하지만:
- iOS: WebKit 기반이므로 정상 작동
- Android: WebView 기반이므로 정상 작동
- 성능은 네이티브 지도 SDK보다 낮을 수 있음

### 3. 오프라인 지원

- Service Worker는 네이티브에서도 작동
- 지도 타일 캐싱은 제한적
- 완전한 오프라인 지원을 위해서는 네이티브 지도 SDK 고려

### 4. 초대코드 공유

네이티브 앱에서 초대코드 공유:
- 기본 Web Share API 사용 가능
- 네이티브 공유 플러그인 추가 가능 (`@capacitor/share`)

---

## 비용

### 개발 비용
- **무료**: 로컬 개발, 에뮬레이터/시뮬레이터 테스트

### 배포 비용
- **iOS**: Apple Developer Program $99/년
- **Android**: Google Play Developer $25 일회성

### 운영 비용
- Cloudflare Workers/D1: 무료 티어 (기존과 동일)
- 추가 비용 없음

---

## 권장사항

### PWA만 사용하는 경우
- ✅ 무료
- ✅ 스토어 심사 불필요
- ✅ 즉시 업데이트 가능
- ✅ 크로스 플랫폼

### Capacitor로 네이티브 앱 배포하는 경우
- ✅ 스토어에서 검색 가능
- ✅ 푸시 알림 등 네이티브 기능 활용
- ⚠️ 스토어 심사 필요
- ⚠️ 업데이트 시 재배포 필요
- ⚠️ 개발자 계정 비용

**결론**: 2명만 사용하는 커플 지도앱이라면 **PWA만으로 충분**합니다.
Capacitor는 나중에 필요할 때 추가하는 것을 권장합니다.

---

## 참고 자료

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [iOS 개발 가이드](https://capacitorjs.com/docs/ios)
- [Android 개발 가이드](https://capacitorjs.com/docs/android)

