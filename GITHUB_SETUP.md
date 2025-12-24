# GitHub 연동 가이드

## 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 **+** 버튼 → **New repository** 클릭
3. 저장소 설정:
   - **Repository name**: `couple-maplibre-openfreemap` (또는 원하는 이름)
   - **Description**: "커플을 위한 감성 지도 - 초대코드 기반 PWA"
   - **Public** 또는 **Private** 선택
   - **⚠️ 중요**: "Initialize this repository with a README" 체크 해제 (이미 커밋이 있음)
4. **Create repository** 클릭

## 2. 로컬 저장소와 GitHub 연결

GitHub에서 저장소를 생성하면 표시되는 URL을 사용합니다:

```bash
# HTTPS 방식 (권장)
git remote add origin https://github.com/YOUR_USERNAME/couple-maplibre-openfreemap.git

# 또는 SSH 방식 (SSH 키가 설정되어 있다면)
# git remote add origin git@github.com:YOUR_USERNAME/couple-maplibre-openfreemap.git
```

**YOUR_USERNAME**을 실제 GitHub 사용자명으로 변경하세요.

## 3. 코드 푸시

```bash
git push -u origin main
```

GitHub 인증이 필요하면:
- Personal Access Token 사용 (HTTPS)
- 또는 SSH 키 사용 (SSH)

## 4. Cloudflare Pages 연동

### A. Cloudflare Dashboard 접속

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **Pages** → **Create a project**

### B. GitHub 연결

1. **Connect to Git** 선택
2. **GitHub** 클릭
3. GitHub 계정 연결 (처음이면 권한 승인)
4. 저장소 선택: `couple-maplibre-openfreemap`

### C. 빌드 설정

**Build settings**:
- **Framework preset**: `None` (또는 `Vite` 선택 가능)
- **Build command**: `npm ci && npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (기본값, 변경 불필요)

### D. 환경변수 설정 (중요!)

**Environment variables** 섹션에서:
1. **Add variable** 클릭
2. 입력:
   - **Variable name**: `VITE_API_BASE`
   - **Value**: `https://couplemap-api.oo8923.workers.dev`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - (또는 "Production and Preview" 선택)
3. **Save** 클릭

### E. 배포

1. **Save and Deploy** 클릭
2. 배포 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 후 Pages URL 확인 (예: `https://couple-maplibre-openfreemap.pages.dev`)

## 5. 배포 확인

1. Pages URL 접속
2. 온보딩 모달 표시 확인
3. "커플 만들기" 클릭 → 초대코드 생성 확인
4. 검색 기능 테스트

## 6. 이후 업데이트

코드를 수정한 후:

```bash
git add .
git commit -m "Update: 설명"
git push
```

Cloudflare Pages가 자동으로 감지하여 재배포합니다!

---

## 문제 해결

### GitHub 인증 오류

**HTTPS 사용 시**:
- Personal Access Token 필요
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- `repo` 권한으로 토큰 생성
- 비밀번호 대신 토큰 사용

**SSH 사용 시**:
- SSH 키가 GitHub에 등록되어 있어야 함
- `ssh -T git@github.com`으로 테스트

### 빌드 실패

- 로컬에서 `npm run build` 성공하는지 확인
- Cloudflare Dashboard → Pages → Deployments → 실패한 배포 클릭 → 로그 확인

### 환경변수 미적용

- 환경변수 설정 후 **Retry deployment** 클릭
- 또는 새 커밋 푸시로 재배포

---

## 현재 상태

✅ Git 저장소 초기화 완료
✅ 초기 커밋 완료
⏳ GitHub 저장소 생성 필요
⏳ 원격 저장소 연결 및 푸시 필요
⏳ Cloudflare Pages 연동 필요

