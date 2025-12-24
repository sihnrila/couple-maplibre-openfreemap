# GitHub 인증 설정

## Personal Access Token 생성 (HTTPS 사용 시)

### 1. GitHub에서 토큰 생성

1. [GitHub Settings](https://github.com/settings/tokens) 접속
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → **Generate new token (classic)** 클릭
4. 설정:
   - **Note**: `Couple Map Deployment` (또는 원하는 이름)
   - **Expiration**: 원하는 기간 선택 (90 days 권장)
   - **Scopes**: `repo` 체크 (전체 권한)
5. **Generate token** 클릭
6. **⚠️ 중요**: 토큰을 복사해두세요! (한 번만 표시됨)

### 2. 토큰으로 푸시

```bash
# 사용자명: GitHub 사용자명 (sihnrila)
# 비밀번호: 위에서 생성한 Personal Access Token
git push -u origin main
```

또는 토큰을 URL에 포함:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/sihnrila/couple-maplibre-openfreemap.git
git push -u origin main
```

---

## SSH 방식 사용 (권장)

### 1. SSH 키 확인

```bash
ls -la ~/.ssh
```

`id_rsa.pub` 또는 `id_ed25519.pub` 파일이 있으면 이미 키가 있습니다.

### 2. SSH 키 생성 (없는 경우)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Enter 키 3번 (기본 설정 사용)
```

### 3. 공개 키 복사

```bash
cat ~/.ssh/id_ed25519.pub
# 또는
cat ~/.ssh/id_rsa.pub
```

출력된 전체 내용을 복사하세요.

### 4. GitHub에 SSH 키 등록

1. [GitHub SSH Settings](https://github.com/settings/keys) 접속
2. **New SSH key** 클릭
3. **Title**: `MacBook` (또는 원하는 이름)
4. **Key**: 위에서 복사한 공개 키 붙여넣기
5. **Add SSH key** 클릭

### 5. SSH로 원격 저장소 변경

```bash
git remote set-url origin git@github.com:sihnrila/couple-maplibre-openfreemap.git
git push -u origin main
```

---

## 빠른 방법: GitHub CLI 사용

```bash
# GitHub CLI 설치 (없는 경우)
brew install gh

# 로그인
gh auth login

# 푸시
git push -u origin main
```

---

## 현재 상태

✅ 원격 저장소 연결 완료: `https://github.com/sihnrila/couple-maplibre-openfreemap.git`
⏳ 인증 설정 필요 (위 방법 중 하나 선택)

