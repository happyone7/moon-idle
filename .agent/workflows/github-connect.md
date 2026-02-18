---
description: GitHub 원격 저장소 연결 및 초기 커밋 방법
---

# GitHub 연결 워크플로우

## 사전 조건
- git이 설치되어 있어야 함
- GitHub 계정 및 레포지토리 생성 완료

## 단계

1. git 초기화 (이미 되어 있으면 스킵)
```
git init
```

2. .gitignore 생성 (이미 있으면 스킵)

3. 파일 스테이징 및 초기 커밋
```
git add .
git commit -m "Initial commit: MoonIdle game"
```

4. GitHub 원격 저장소 연결
```
git remote add origin https://github.com/USERNAME/REPO_NAME.git
```

5. 브랜치 설정 및 푸시
```
git branch -M main
git push -u origin main
```

## 이후 업데이트 시
```
git add .
git commit -m "커밋 메시지"
git push
```
