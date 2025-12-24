# PWA 아이콘 생성 가이드

이 디렉토리에 다음 아이콘 파일들을 생성해야 합니다:

## 필수 아이콘 파일

1. **pwa-192.png** (192x192px)
   - 일반 PWA 아이콘
   - 안전 영역: 중앙 160x160px

2. **pwa-512.png** (512x512px)
   - 일반 PWA 아이콘 (큰 사이즈)
   - 안전 영역: 중앙 426x426px

3. **pwa-512-maskable.png** (512x512px)
   - Maskable 아이콘 (안드로이드)
   - 안전 영역: 중앙 384x384px (전체 512x512px의 75%)
   - 가장자리 64px는 시스템이 마스킹할 수 있음

4. **apple-touch-icon.png** (180x180px)
   - iOS 홈 화면 아이콘
   - 전체 영역 사용 가능

## 아이콘 디자인 가이드

### 색상
- 배경: #0b0b0b (다크)
- 액센트: #FF6B6B (로즈) 또는 #4D96FF (블루)
- 텍스트/아이콘: 흰색 또는 밝은 색상

### 디자인 아이디어
- 하트 두 개 (❤️❤️)
- 지도 핀 + 하트
- "CM" 또는 "C" 로고
- 지도와 하트 조합

## 생성 방법

### 방법 1: 온라인 도구
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 방법 2: 이미지 편집 도구
1. 512x512px 캔버스 생성
2. 중앙 384x384px 안전 영역에 디자인
3. PNG로 저장
4. 192x192px로 리사이즈하여 pwa-192.png 생성
5. 180x180px로 리사이즈하여 apple-touch-icon.png 생성
6. pwa-512-maskable.png는 중앙 384x384px만 사용하도록 디자인

### 방법 3: 임시 아이콘 (개발용)
개발 중에는 단색 사각형이나 간단한 텍스트로 임시 아이콘을 만들어도 됩니다.

## 파일 위치 확인

모든 아이콘은 `public/icons/` 디렉토리에 있어야 합니다:
```
public/
  icons/
    pwa-192.png
    pwa-512.png
    pwa-512-maskable.png
  apple-touch-icon.png
```

