# Cloudflare Pages 배포 가이드

## 방법 1: Cloudflare Dashboard에서 배포 (권장)

### 1. 빌드
```bash
npm run build
```

### 2. Cloudflare Dashboard에서 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **Pages** → **Create a project**
3. **Upload assets** 선택 (직접 업로드)
4. **Project name** 입력: `couplemap` (또는 원하는 이름)
5. **Production branch** 입력: `main` (또는 `master`)
6. **Drag and drop** 또는 **Browse**로 `dist` 폴더 선택
   - 또는 터미널에서: `cd dist && zip -r ../dist.zip . && cd ..`
   - `dist.zip` 파일 업로드
7. **Deploy site** 클릭

### 3. 배포 확인

- 배포 완료 후 Pages URL 확인 (예: `https://couplemap.pages.dev`)
- 브라우저에서 접속하여 테스트

### 4. 재배포 (코드 변경 후)

```bash
npm run build
# dist 폴더를 다시 zip으로 압축하거나 Dashboard에서 재업로드
```

**참고**: 재배포는 GitHub 연동 방법(방법 2)이 더 편리합니다.

### 5. 환경변수 설정

배포 후 Cloudflare Dashboard에서:
1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **Pages** → `couplemap` 프로젝트 선택
3. **Settings** → **Environment variables**
4. **Add variable** 클릭:
   - **Variable name**: `VITE_API_BASE`
   - **Value**: `https://couplemap-api.oo8923.workers.dev`
   - **Environment**: Production, Preview, Production and Preview 모두 선택
5. **Save** 클릭
6. **Retry deployment** 클릭 (환경변수 적용)

---

## 방법 2: GitHub 연동 (자동 배포 - 권장)

### A. GitHub 저장소 생성 및 푸시

```bash
# 1. Git 초기화
git init

# 2. .gitignore 확인/생성
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
.env
.env.local
*.log
.wrangler/
EOF

# 3. 파일 추가 및 커밋
git add .
git commit -m "Initial commit: Couple Map PWA"

# 4. GitHub에서 저장소 생성 후
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/couple-maplibre-openfreemap.git
git push -u origin main
```

### B. Cloudflare Pages에서 GitHub 연결

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **Pages** → **Create a project**
3. **Connect to Git** 선택
4. GitHub 계정 연결 (처음이면 권한 승인)
5. 저장소 선택: `couple-maplibre-openfreemap`

### C. 빌드 설정

**Build settings**:
- **Framework preset**: None (또는 Vite)
- **Build command**: `npm ci && npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (기본값)

### D. 환경변수 설정

**Environment variables** 섹션:
- **Variable name**: `VITE_API_BASE`
- **Value**: `https://couplemap-api.oo8923.workers.dev`
- **Environment**: Production, Preview, Production and Preview 모두 선택

### E. 배포 확인

- **Save and Deploy** 클릭
- 배포 완료 후 Pages URL 확인 (예: `https://couple-maplibre-openfreemap.pages.dev`)
- 브라우저에서 접속하여 테스트

---

## 배포 후 확인 사항

### ✅ 체크리스트

- [ ] Pages URL 접속 가능
- [ ] 온보딩 모달 표시
- [ ] "커플 만들기" 클릭 → 초대코드 생성
- [ ] 검색 기능 작동
- [ ] Worker API 연결 확인 (개발자 도구 → Network)

### 🔍 문제 해결

**환경변수가 적용되지 않음**:
- 배포 후 환경변수를 설정했다면 **Retry deployment** 필요
- 또는 새 커밋 푸시로 재배포

**API 요청 실패**:
- 브라우저 개발자 도구 → Console에서 에러 확인
- `VITE_API_BASE` 환경변수가 올바르게 설정되었는지 확인
- Worker URL이 올바른지 확인

**빌드 실패**:
- 로컬에서 `npm run build` 성공하는지 확인
- `package.json`의 빌드 스크립트 확인
- Node 버전 확인 (권장: 20+)

---

## 현재 설정 요약

- **Worker URL**: `https://couplemap-api.oo8923.workers.dev`
- **Pages 프로젝트 이름**: `couplemap` (또는 원하는 이름)
- **빌드 명령어**: `npm ci && npm run build`
- **출력 디렉토리**: `dist`
- **필수 환경변수**: `VITE_API_BASE=https://couplemap-api.oo8923.workers.dev`

---

## 빠른 배포 (GitHub 연동 사용 시)

```bash
# 1. Git 초기화 및 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/couple-maplibre-openfreemap.git
git push -u origin main

# 2. Cloudflare Dashboard에서 GitHub 연결
# (위 "방법 2" 참고)

# 3. 이후 코드 변경 시
git add .
git commit -m "Update"
git push
# 자동으로 배포됨!
```

---

## 현재 상태

✅ **빌드 완료**: `dist` 폴더 생성됨
✅ **Worker 배포 완료**: `https://couplemap-api.oo8923.workers.dev`
⏳ **Pages 배포 필요**: 위 방법 중 하나 선택하여 배포

배포 후 환경변수(`VITE_API_BASE`)만 설정하면 완료!

