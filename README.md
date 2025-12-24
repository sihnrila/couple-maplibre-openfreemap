# Couple Map (MapLibre + OpenFreeMap + Nominatim + Cloudflare D1)

## 특징
- **결제수단/토큰 없이**(지도는 OpenFreeMap) 감성 지도
- 검색은 **Nominatim**을 **Cloudflare Worker**가 프록시 + (느슨한) rate limit
- 저장은 **Cloudflare D1** (Worker API)
- **초대코드 기반 온보딩** (로그인 없음, 둘만 공유)
- **폴더(컬렉션) 관리** + **테마(감성 지도 레이어)** 설정
- UX: 검색 → 선택 → 지도 flyTo → 바텀시트 저장 카드 → 저장 → 마커 갱신

---

## 1) 실행 (로컬)

### A. 프론트
```bash
npm i
cp .env.example .env
npm run dev
```

### B. 워커(D1)
터미널 하나 더 열고:
```bash
npm run dev:worker
```

- 워커 기본 주소: `http://127.0.0.1:8787`
- 프론트 `.env`의 `VITE_API_BASE`가 비어있으면 위 주소를 자동 사용합니다.

---

## 2) D1 초기화 (처음 1회)
Cloudflare 계정이 있어야 합니다.

```bash
# (1) 로그인
npx wrangler login

# (2) D1 생성
npx wrangler d1 create couplemap_db

# (3) workers/wrangler.toml의 database_id를 위 결과값으로 채우기

# (4) 스키마 적용
npx wrangler d1 execute couplemap_db --file workers/schema.sql --config workers/wrangler.toml
```

---

## 3) 기존 데이터베이스 마이그레이션 (기존 사용자)

기존 D1 데이터베이스가 있는 경우, 다음 SQL을 실행하여 스키마를 업데이트하세요:

```bash
# 마이그레이션 SQL 실행
npx wrangler d1 execute couplemap_db --command "
  -- couples 테이블 추가
  CREATE TABLE IF NOT EXISTS couples (
    id TEXT PRIMARY KEY,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  -- folders 테이블 추가
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  -- places 테이블에 folder_id 컬럼 추가
  ALTER TABLE places ADD COLUMN folder_id TEXT;

  -- 인덱스 추가
  CREATE INDEX IF NOT EXISTS idx_folders_couple_sort ON folders (couple_id, sort);
  CREATE INDEX IF NOT EXISTS idx_places_couple_created ON places (couple_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_places_folder ON places (folder_id);
" --config workers/wrangler.toml
```

또는 `workers/schema.sql` 파일을 직접 수정한 후:

```bash
npx wrangler d1 execute couplemap_db --file workers/schema.sql --config workers/wrangler.toml
```

**주의**: 기존 `places` 테이블의 데이터는 유지되지만, `couple_id`가 없으면 새로운 초대코드 시스템과 연동되지 않습니다. 필요시 수동으로 `couples` 테이블에 레코드를 추가하고 `invite_code`를 생성해야 합니다.

---

## 4) 배포

**📖 상세 배포 가이드**: [DEPLOY.md](./DEPLOY.md) 참고

간단 요약:
```bash
npm run deploy:worker
npm run build
```

**Cloudflare Pages 배포**:
- GitHub 연결 → Build command: `npm ci && npm run build`
- Output directory: `dist`
- 환경변수 `VITE_API_BASE` 설정 필수

자세한 절차는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

---

## 5) 주의 (Nominatim)
- Nominatim 공개 API는 **1초 1회 이하** 등 사용 정책이 있습니다.
- 이 프로젝트는 Worker에서 (느슨한) 1 req/sec 제한을 두고,
  프론트에서는 디바운스로 과도한 호출을 막습니다.

---

## 6) API 엔드포인트

### 공개 엔드포인트
- `GET  /api/geocode?q=...&limit=6`  (Nominatim proxy)
- `POST /api/couple/create`  (커플 생성, inviteCode 반환)
- `POST /api/couple/join`  (초대코드로 참여)

### 보호된 엔드포인트 (헤더 `x-invite-code` 필요)
- `POST /api/couple/rotate`  (초대코드 재발급)
- `GET  /api/folders`  (폴더 목록)
- `POST /api/folders`  (폴더 생성)
- `PATCH /api/folders/:id`  (폴더 수정)
- `DELETE /api/folders/:id`  (폴더 삭제)
- `GET  /api/places`  (장소 목록)
- `POST /api/places`  (장소 생성)
- `PATCH /api/places/:id`  (장소 수정)

---

## 7) 기능 설명

### 초대코드 기반 온보딩
- 최초 진입 시 온보딩 모달 표시
- "커플 만들기": 새 커플 생성 및 초대코드 발급
- "초대코드로 참여": 기존 커플에 참여
- 초대코드는 localStorage에 저장되며, 모든 API 요청에 자동으로 포함됩니다

### 폴더(컬렉션) 관리
- 장소를 폴더로 분류하여 관리
- 폴더별 색상 및 아이콘 설정 가능
- 마커 색상이 폴더 색상으로 표시됨
- 폴더 삭제 시 해당 폴더의 장소들은 폴더 없음으로 이동

### 테마 설정
- **Base Style**: 라이트(positron) / 다크(liberty)
- **Overlay**: 없음 / 그레인 / 비네트 / 나이트 틴트
- 설정은 localStorage에 저장되어 유지됨

---

## 8) 완전 무료 티어 중심
- Cloudflare D1 무료 티어: 5GB 저장, 5M 읽기/일, 100K 쓰기/일
- Cloudflare Workers 무료 티어: 100K 요청/일
- 한도 초과 시 에러/정지로 멈추는 형태 유지 (과금 구조 없음)

---

## 9) PWA (Progressive Web App)

이 앱은 PWA로 구현되어 있어 **폰에서 앱처럼 설치 가능**합니다.

### 주요 기능
- ✅ 홈 화면에 추가 가능 (iOS/Android)
- ✅ 독립 앱으로 실행 (주소창 없음)
- ✅ 오프라인 캐싱 지원
- ✅ 자동 업데이트

### 설치 방법
1. **Android**: 설정(⚙︎) → "홈 화면에 추가" → "설치하기" 버튼
2. **iOS**: 설정(⚙︎) → "홈 화면에 추가" → Safari 공유 버튼 → "홈 화면에 추가"

### 상세 가이드
- **PWA 구현 가이드**: [PWA_GUIDE.md](./PWA_GUIDE.md)
- **Capacitor 가이드 (옵션)**: [CAPACITOR_GUIDE.md](./CAPACITOR_GUIDE.md) - iOS/Android 네이티브 앱으로 확장

### 아이콘 생성
아이콘 파일은 수동으로 생성해야 합니다. `public/icons/README.md`를 참고하세요.
