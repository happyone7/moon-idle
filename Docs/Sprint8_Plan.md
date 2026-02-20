# Sprint 8 계획서 — 연구 탭 v7b 수준 완성 + 공통 프로그레스 바 개선

**기간**: 2026-02-21 ~
**브랜치**: `sprint/8` (master v0.7.0 기준 분기, WIP d9f9ce8 포함)
**목표**: Sprint 8 WIP(연구 탭 리워크)를 v7b 목업 수준으로 완성하고, 공통 프로그레스 바 시각 품질 개선

---

## 총괄PD 지시 기록 (2026-02-21)

> 위 내용대로 진행 시작해
> — v7 갭 분석 HIGH 항목 기반 Sprint 8 진행 지시 (스프린트 계획 보고 직후)

---

## 현재 sprint/8 WIP 상태

| 파일 | 상태 | 비고 |
|------|------|------|
| `js/game-state.js` | ✅ 완료 | `startResearch`, `tickResearch`, `_completeResearch` 구현됨 |
| `js/game-data.js` | ✅ 완료 | `RESEARCH_BRANCHES` (S/P/A/T/O), `UPGRADES` ID 체계 |
| `js/tabs/research.js` | ⚠️ 부분완료 | 브랜치 컬럼 렌더 + 4상태 카드 구현됨. ASCII 패널·ETA·큐 헤더 미구현 |
| `index.html` | ⚠️ 부분완료 | `rsh-branch-*` CSS 추가됨. shimmer·amber 변형 미적용 |

---

## v7 갭 분석 대비 Sprint 8 범위

### ✅ 이미 구현됨 (WIP)
- RESEARCH_BRANCHES 브랜치 컬럼 레이아웃
- 시간 기반 RP 소비 (`rpSpent` 추적)
- 완료/진행중/가용/잠금 4가지 카드 상태
- RESEARCH_ASCII_ART 데이터 정의

### 🎯 Sprint 8 신규 구현 대상
- 연구 카드 ASCII 아트 HTML 렌더링 (진행 중 카드)
- ETA 표시 (남은 RP / RP rate)
- 큐 헤더 ("연구 중 [N/2 슬롯]")
- RP 생산 현황 패널 (건물별 + 합계)
- 공통 프로그레스 바 shimmer + white leading edge
- 앰버 프로그레스 변형 (T브랜치 열보호)

---

## 작업 항목

### P8-1 (프로그래밍팀장): 연구 ETA 헬퍼 함수
**파일**: `js/game-state.js`
**내용**: 현재 RP rate 기준 연구 완료까지 남은 시간(초) 계산 함수 추가
```javascript
// 반환: 남은 초 (0이면 RP 없음/진행 불가)
function getResearchETA(uid) { ... }
```
- `getProduction().research` (RP/s) 기준
- 진행 중인 연구 수에 따라 RP 분배 고려 (tickResearch 로직과 동일)
- `Infinity` 반환 시 "∞" 표시용
**워크트리**: `wt-dev-programmer` (`dev/programmer`)

---

### U8-1 (UI팀장): 연구 탭 v7b 수준 UI 완성
**파일**: `js/tabs/research.js`
**내용**: `renderResearchTab()` 확장

1. **큐 헤더** — 탑바 옆 슬롯 현황
   ```
   연구 중 [1 / 2 슬롯]
   ```
   - 동시 진행 가능 슬롯: 기본 2 (`gs.maxResearchSlots || 2`)
   - 슬롯 초과 시 신규 시작 불가 (startResearch에서 체크)

2. **진행 중 카드 ASCII 패널**
   - `RESEARCH_ASCII_ART[uid]` 데이터 활용
   - 없으면 `RESEARCH_ASCII_ART._default` 사용
   - 스캔라인 오버레이 적용 (`.rsh-ascii-scanline`)

3. **ETA 표시**
   - `getResearchETA(uid)` 호출 → 초 → `mm:ss` 또는 `hh:mm` 포맷
   - RP 없을 때: `RP 없음 — 연구소 필요`

4. **RP 생산 현황 패널** (탑바 아래 접이식)
   ```
   RP 생산: 연구소 × 2 → +0.40/s  TOTAL: +0.40/s
   ```
   - `gs.buildings.research_lab` 수 × baseRate 표시

**워크트리**: `wt-dev-ui` (`dev/ui`)

---

### U8-2 (UI팀장): 공통 프로그레스 바 shimmer + leading edge
**파일**: `index.html` (CSS 섹션)
**내용**: v7b·v7c·v7e 목업에서 공통으로 사용된 프로그레스 바 개선 CSS

```css
@keyframes progress-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
.prog-fill {
  background: linear-gradient(90deg, var(--green) 0%, var(--green-bright,#6fff6f) 50%, var(--green) 100%);
  background-size: 200% auto;
  animation: progress-shimmer 2.4s linear infinite;
}
.prog-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 3px;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 0 6px #fff;
}
```

- `.prog-fill` 전역 적용 (연구/조립/임무 탭 모두)
- `::after` leading edge는 width > 5% 일 때만 표시 (`display:none` 기본, JS로 토글)

**워크트리**: `wt-dev-ui` (`dev/ui`)

---

### U8-3 (UI팀장): 앰버 프로그레스 변형 (T브랜치)
**파일**: `index.html` (CSS 섹션)
**내용**: v7b 목업의 `.amber-fill` 구현

```css
.prog-fill.amber-fill {
  background: linear-gradient(90deg, var(--amber) 0%, #ffdf80 50%, var(--amber) 100%);
  background-size: 200% auto;
  animation: progress-shimmer 2.4s linear infinite;
}
```

- 연구 탭 T브랜치 (`id:'T'`) 카드 진행바에만 적용
- `renderResearchTab()`에서 `branch.id === 'T' ? 'amber-fill' : ''` 조건부 클래스

**워크트리**: `wt-dev-ui` (`dev/ui`)

---

### QA8-1 (QA팀장): Sprint 8 통합 QA
**파일**: `qa/sprint8_qa_report.md`
**조건**: P8-1, U8-1, U8-2, U8-3 전 항목 dev/* → sprint/8 머지 완료 후 실행

**체크 항목**:
- [ ] 연구 탭 정상 렌더링 (브랜치 컬럼 5개 표시)
- [ ] 연구 시작 → 진행 바 갱신 → ASCII 패널 표시 확인
- [ ] ETA 표시 정상 (RP rate > 0 시)
- [ ] 큐 헤더 슬롯 카운트 정확
- [ ] RP 생산 현황 패널 수치 정확
- [ ] 프로그레스 바 shimmer 애니메이션 동작
- [ ] T브랜치 앰버 프로그레스 확인
- [ ] 기존 기능 회귀 없음 (생산/조립/발사 탭)
- [ ] localStorage 저장/불러오기 정상 (`researchProgress` 포함)
- [ ] 모바일 뷰포트(375px) 브랜치 컬럼 가로 스크롤 정상

**워크트리**: `wt-dev-qa` (`dev/qa`)

---

## 머지 순서

```
P8-1 완료 → dev/programmer → sprint/8
  ↓
U8-1 완료 (P8-1 함수 참조) → dev/ui → sprint/8
U8-2 완료 → dev/ui → sprint/8
U8-3 완료 → dev/ui → sprint/8
  ↓
QA8-1 실행 → PASS 확인 → 완료 보고
```

---

## 완료 기준

- 연구 탭: 진행 중 연구에 ASCII 패널 + ETA + 큐 헤더 표시
- 공통: 프로그레스 바 shimmer 전 탭 적용
- QA8-1: `QA_RESULT=PASS` 기록
- 총괄PD에게 sprint/8 배포 보고 후 컨펌 대기
