# Cloudflare Pages 최종 연동 가이드

## 현재 상태
✅ GitHub 저장소: https://github.com/sihnrila/couple-maplibre-openfreemap
✅ 코드 푸시 완료
✅ 빌드 준비 완료
⏳ Cloudflare Pages 연동 필요

## Cloudflare Dashboard에서 연동 (5분 소요)

### 1. Pages 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **Pages** → **Create a project** 클릭
3. **Connect to Git** 선택

### 2. GitHub 계정 연결

1. **GitHub** 클릭
2. GitHub 계정 선택 (또는 새로 연결)
3. 권한 승인 (처음이면)
4. 저장소 선택: **couple-maplibre-openfreemap** 선택

### 3. 빌드 설정

**Configure build** 섹션:

- **Framework preset**: `None` (또는 `Vite` 선택 가능)
- **Build command**: 
  ```
  npm ci && npm run build
  ```
- **Build output directory**: 
  ```
  dist
  ```
- **Root directory**: `/` (기본값, 변경 불필요)

### 4. 환경변수 설정 (⚠️ 필수!)

**Environment variables** 섹션에서:

1. **Add variable** 클릭
2. 입력:
   - **Variable name**: `VITE_API_BASE`
   - **Value**: `https://couplemap-api.oo8923.workers.dev`
   - **Environment**: 
     - ✅ **Production** 체크
     - ✅ **Preview** 체크
3. **Save** 클릭

### 5. 배포 시작

1. **Save and Deploy** 클릭
2. 배포 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 후 **View site** 클릭 또는 Pages URL 확인

### 6. 배포 확인

배포 완료 후:
- Pages URL: `https://couplemap.pages.dev` (또는 자동 생성된 URL)
- 브라우저에서 접속
- 온보딩 모달 표시 확인
- "커플 만들기" 클릭 → 초대코드 생성 확인

---

## 배포 후 자동화

이제 코드를 수정하고 푸시하면 자동으로 재배포됩니다:

```bash
git add .
git commit -m "Update"
git push origin main
# → Cloudflare Pages가 자동으로 감지하여 재배포
```

---

## 문제 해결

### 환경변수가 적용되지 않음

- 배포 후 환경변수를 설정했다면:
  1. 프로젝트 → **Deployments** 탭
  2. 최신 배포 → **Retry deployment** 클릭

### 빌드 실패

- **Deployments** 탭에서 실패한 배포 클릭
- **Build logs** 확인
- 로컬에서 `npm run build` 성공하는지 확인

### API 요청 실패

- 브라우저 개발자 도구 → Console 확인
- `VITE_API_BASE` 환경변수 확인
- Worker URL 확인: `https://couplemap-api.oo8923.workers.dev`

---

## 완료 체크리스트

- [ ] Cloudflare Dashboard에서 Pages 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 완료
- [ ] 환경변수 `VITE_API_BASE` 설정 완료
- [ ] 배포 완료
- [ ] Pages URL 접속 확인
- [ ] 온보딩 모달 표시 확인
- [ ] 초대코드 생성 테스트
- [ ] 검색 기능 테스트

---

## 현재 설정 요약

- **GitHub 저장소**: https://github.com/sihnrila/couple-maplibre-openfreemap
- **Worker URL**: https://couplemap-api.oo8923.workers.dev
- **Pages 프로젝트 이름**: `couplemap` (또는 원하는 이름)
- **빌드 명령어**: `npm ci && npm run build`
- **출력 디렉토리**: `dist`
- **필수 환경변수**: `VITE_API_BASE=https://couplemap-api.oo8923.workers.dev`

---

**다음 단계**: Cloudflare Dashboard에서 위 절차를 따라 진행하세요!

