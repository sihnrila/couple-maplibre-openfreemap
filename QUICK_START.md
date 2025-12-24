# 빠른 시작 가이드

## 현재 상태
✅ Git 저장소 초기화 완료
✅ 초기 커밋 완료
⏳ GitHub 저장소 생성 필요
⏳ Cloudflare Pages 연동 필요

## 다음 단계

### 1. GitHub 저장소 생성 (필수)

1. https://github.com/new 접속
2. Repository name: `couple-maplibre-openfreemap`
3. **⚠️ 중요**: "Add a README file" 체크 해제
4. Create repository 클릭

### 2. 원격 저장소 연결 및 푸시

GitHub에서 저장소를 생성한 후, 아래 명령어를 실행하세요:

```bash
# YOUR_USERNAME을 실제 GitHub 사용자명으로 변경
git remote add origin https://github.com/YOUR_USERNAME/couple-maplibre-openfreemap.git
git push -u origin main
```

### 3. Cloudflare Pages 연동

1. https://dash.cloudflare.com 접속
2. Workers & Pages → Pages → Create a project
3. Connect to Git → GitHub 선택
4. 저장소 선택: `couple-maplibre-openfreemap`
5. Build settings:
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
6. Environment variables:
   - Variable name: `VITE_API_BASE`
   - Value: `https://couplemap-api.oo8923.workers.dev`
7. Save and Deploy

---

## GitHub 저장소 URL이 있으시면 알려주세요!

저장소 URL을 알려주시면 자동으로 연결하고 푸시하겠습니다.

예: `https://github.com/username/couple-maplibre-openfreemap.git`

