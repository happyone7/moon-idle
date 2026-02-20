# Sprint 7 최종 QA 리포트

**날짜**: 2026-02-21
**QA 담당**: QAEngineer
**대상**: sprint/7 → master 머지 전 최종 게이트
**브랜치**: sprint/7 (HEAD: cb9a6df 기준)

---

## 코드 검증 결과

| 항목 | 판정 | 근거 |
|------|------|------|
| P7-1 팝업 위치 | PASS | `js/world.js` L939, L1061, L1234 — `openBldOv`, `openAddonOv`, `openGhostOv` 세 함수 모두 `ovEl.style.display = 'block'` 직후 `requestAnimationFrame(() => { ... })` 콜백 내에서 위치 계산(offsetHeight 읽기 + left/top 설정) |
| P7-2 애드온 가격 | PASS | `js/game-data.js` L160 — `addon_inv_bank` cost `{ money: 5000 }` (≥ 5,000 충족) / L172 — `addon_tech_hub` cost `{ money: 8000 }` (≥ 8,000 충족) |
| P7-3 애드온 간격 | PASS | `js/world.js` L16 — `ADDON_POSITIONS = { ops_center: 940, launch_pad: 2800 }` — ops_center 940 ≤ 990 충족, launch_pad 2800 ≤ 2830 충족 |
| P7-4 ASCII 기반부 | PASS | ops_premium 2인스턴스 `████████████` = 12블록 (공백 없음) / ops_24h 2인스턴스 `████████████` = 12블록 / ops_sales 2인스턴스 `████████████` = 12블록 (총 ops 6인스턴스 확인) / wb-refinery 3인스턴스 `██████████` = 10블록 (tier≥3, tier≥1, 기본 각 1개) |
| P7-5 폰트 통일 | PASS | `index.html` L477 `.world-bld { font-family: 'Courier New', Consolas, 'DejaVu Sans Mono', monospace; }` — 명세와 정확히 일치 |
| P6-3 밸런싱 | PASS | `js/game-state.js` L804 — `const RES_MAX = { money:1e12, metal:5e7, fuel:2e7, electronics:1e7, research:50000 }` — money 상한 1e12 (1조) 확인 |

---

## Playwright 스모크 테스트

**실행 환경**: Playwright v1.58.2, Chromium, headless, NODE_PATH=global npm modules
**실행 방법**: `NODE_PATH="C:/Users/happy/AppData/Roaming/npm/node_modules" node .tmp_pw_test.js`
**참고**: Playwright MCP 서버가 현재 세션에 연결되지 않아 (available: claude.ai Notion, claude-vscode만 등록) `@playwright/test` npm 패키지를 직접 Node.js로 실행

| 항목 | 판정 | 상세 |
|------|------|------|
| 페이지 로드 | PASS | `PAGE_TITLE: MOON IDLE — 달 탐사 로켓 제작소` — file:// 프로토콜로 정상 로드 |
| 콘솔 에러 | PASS | `CONSOLE_ERRORS_COUNT: 0` — 페이지 에러 및 console.error 호출 없음 |
| .world-bld 존재 | PASS | `WORLD_BLD_COUNT: 4` — Production Hub 탭 활성화 후 .world-bld 요소 4개 존재 확인 |
| 자원 표시 영역 | PASS | `#res-left` 요소 존재 확인 (`count=1`) — 게임 내 자원 표시 패널 정상 렌더링 |
| font-family 확인 | PASS | 실제값: `"Courier New", Consolas, "DejaVu Sans Mono", monospace` — Courier New 포함, CSS 명세와 완전 일치 |

**스모크 테스트 추가 확인사항**:
- `BODY_CLASS: tab-production` — 탭 전환 정상 동작
- `NAV_TAB_PRODUCTION_VISIBLE: true` — 네비게이션 탭 렌더링 정상
- 전체 ID 목록 확인 (`#app`, `#world-scene`, `#buildings-layer`, `#nav-tabs`, `#pane-production` 등 핵심 요소 모두 정상 존재)

---

## 최종 판정

**[PASS]**

코드 검증 6항목 전량 PASS, Playwright 스모크 테스트 5항목 전량 PASS.
콘솔 에러 0건. .world-bld 폰트 명세 일치 확인.

**sprint/7 → master 머지 승인**
