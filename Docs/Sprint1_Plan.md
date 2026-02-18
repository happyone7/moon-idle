# Sprint 1 Plan (MoonIdle Web)

## Objective

- 첫 우주선 생성 1~2시간 흐름 체감
- 로켓 품질(과학 지표 기반) + 다중 조립 슬롯 핵심 루프 안정화
- QA PASS 게이트 후 sprint 브랜치 병합 프로세스 정착

## Branch Model

- `master`: 배포 기준
- `sprint/1`: 통합 브랜치
- `dev/programmer`, `dev/ui`, `dev/qa`, `dev/design`, `dev/sound`, `dev/build`: 병렬 작업

## Agent Backlog

1. `dev/programmer`
- 과학 지표/품질/슬롯 루프 밸런스 조정
- 저장 마이그레이션 점검

2. `dev/ui`
- 품질/슬롯 UI 가독성 개선
- 모바일 레이아웃 점검

3. `dev/qa`
- Playwright 스모크 + 핵심 루프 테스트
- QA 리포트 발행 (`QA_RESULT=PASS/FAIL`)

4. `dev/design`
- 2.99$ 유료 패키지 기준 초반 체감 밸런스 조정안
- 향후 우주 확장팩 연결 자원 설계

5. `dev/sound`
- 조립/발사/완료 이벤트 사운드 레이어 조정

6. `dev/build`
- GitHub Pages 배포 상태 확인
- EXE/Steam 배포용 Electron 스켈레톤 점검

## QA Gate

- 머지 조건: QA 리포트에 `QA_RESULT=PASS`
- 실행:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/agent-workflow/qa-merge-gate.ps1 -SprintBranch sprint/1 -DevBranch dev/programmer -QaReportPath qa/dev-programmer.txt -AllowUntracked
```

## Definition of Done

- 핵심 루프 오류 없이 15분 플레이 가능
- 저장/새로고침/복귀 시 상태 일관성 유지
- QA 리포트 PASS
- sprint/1에 병합 완료
