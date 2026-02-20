# Sprint 5 Plan — 팀장 리뷰 미반영 항목 전량 해소

> **목표**: Sprint 2 종료 시 작성된 팀장 리뷰 보고서(아트디렉터, 기획팀장, QA팀장)의 제안/버그 중 Sprint 3·4에서 누락된 항목 전량 반영
> **출처**: report_art_director.md, report_game_designer.md, report_game_designer_playtest.md, report_qa_lead_playtest.md
> **소요 예상**: 병렬 에이전트 1시간 (단일 6~8시간)

---

## 팀장별 업무

### 1. 기획팀장 (dev/design) — 6건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| D5-1 | orbit_200 마일스톤 조건 수정 — check 조건을 `altitude >= 120`으로 하향 | DESIGN-001 | CRITICAL |
| D5-2 | TIER-6 연구 2개 효과 부여 — auto_worker_assign이 auto_worker 자동화 해금, auto_assemble_restart가 auto_assemble 해금 (문스톤 비용 면제 경로) | DESIGN-002 | CRITICAL |
| D5-3 | PHASE 목표 고도 재조정 — P1:50(유지), P2:80, P3:100, P4:115, P5:130 | DESIGN-003 | HIGH |
| D5-4 | 기본 신뢰도 상향 — 56 → 70, PROTO relBonus 0 → +5 | DESIGN-005 | HIGH |
| D5-5 | 품질별 시간당 효율 균형 — STD timeSec:60→40, rewardMult:1.5→2.0 / ADV timeSec:120→80, rewardMult:2.5→3.5 | DESIGN-008 | MEDIUM |
| D5-6 | control/payload 파트에서 research 비용 제거 — research는 기술 연구 전용 자원으로 역할 분리 | DESIGN-009 | MEDIUM |

### 2. 프로그래밍팀장 (dev/programmer) — 13건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| P5-1 | 발사 신뢰도 기반 성공/실패 판정 구현 — `Math.random()*100 < reliability` 분기, 실패 시 폭발 연출 + 부품 일부 손실 | TASK-1 | HIGH |
| P5-2 | 문스톤 지급 코드 확인 — gs.moonstone += earned 경로가 정상 동작하는지 검증, 누락 시 수정 | TASK-2 | HIGH |
| P5-3 | 오프라인 복귀 정산 화면 — calcOffline() 반환값 상세화 + 복귀 모달 표시 (자원/조립/발사 내역) | TASK-4 | HIGH |
| P5-4 | getAddonTimeMult() 조립 시간 적용 — assembly.js startAssembly() + automation.js auto_assemble endAt 계산에 반영 | BUG-P02 | HIGH |
| P5-5 | hideTechTip() 함수 정의 — Escape 키 핸들러에서 호출하는 미정의 함수 추가 | BUG-P03 | HIGH |
| P5-6 | auto_worker slotCap 검사 — automation.js 인원 자동 배치 시 슬롯 한도 클램핑 | BUG-P05 | MEDIUM |
| P5-7 | renderProductionTab rate 계산 일치 — getBldProdMult, getBldUpgradeMult, getAddonMult 추가 | BUG-P06 | MEDIUM |
| P5-8 | 프레스티지 후 마일스톤 보존 — confirmLaunch()에서 gs.milestones 저장/복원 | BUG-P08 | MEDIUM |
| P5-9 | 발사 실패 시 오버레이 타이틀 변경 — "달 탐사 성공" → success/fail 분기 | BUG-P09 | MEDIUM |
| P5-10 | auto_addon side-effect 적용 — reliabilityBonus, slotBonus, partCostMult 반영 | BUG-P13 | HIGH |
| P5-11 | housing 구매 시 유휴 인원 안내 — "배치 가능 인원 증가" 명시 + 유휴 인원 표시 | DESIGN-004 | MEDIUM |
| P5-12 | 프레스티지 후 생산 탭 강제 전환 — confirmLaunch() 후 switchMainTab('production') | DESIGN-007 | MEDIUM |
| P5-13 | 조립 비용 0.32 → 투명한 계산 + 보상 공식 시각화 — UI에 비용 분해, 문스톤 예상치 표시 | DESIGN-006 + 보상시각화 | LOW |

### 3. UI팀장 (dev/ui) — 10건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| U5-1 | 9px → 10px 최소 폰트 정책 — .rc-art-label, .rsh-c2-status, .rdp-viz-hd, .qs-section-hd, .lc-fail-lvl, .rc-stat-hd | Art Issue 1 | HIGH |
| U5-2 | CSS 변수 토큰 추가 — --amber-dim:#7a5100, --green-deep:#0a1a0a, --text-muted:#6a8a6a, --locked:#1a3a1a + 하드코딩 치환 | Art Issue 2 | HIGH |
| U5-3 | 건물 오버레이 초기 설명 — bov-desc-hint → bld.desc 기본 표시 (JS 수정 필요 시 프로그래머에게 위임) | Art Issue 5 | MEDIUM |
| U5-4 | 건물 production-pulse 애니메이션 — @keyframes bld-production-pulse 2.4s | Art 4.1-A | MEDIUM |
| U5-5 | 탭 전환 fade+slide 진입 애니메이션 — @keyframes tab-enter 0.18s | Art 4.1-C | MEDIUM |
| U5-6 | 연구 완료 flash 이펙트 — @keyframes research-complete 0.7s | Art 4.1-D | MEDIUM |
| U5-7 | IGNITION 화면 플래시 — body.ignition-flash::before amber flash | Art 4.2-B | LOW |
| U5-8 | 지평선 스캔라인 sweep — #world-bg::after scan-sweep 8s | Art 4.2-C | LOW |
| U5-9 | CRT 터미널 강화 — 배경 깊이 그라디언트 + 패널 격자 + 건물별 색상 (amber/cyan) | Art 5.2 | MEDIUM |
| U5-10 | 연구 트리 카드 간 관계선 — .rsh-tier-arrow CSS 의사 요소 가로선 | Art Issue 4 | LOW |

### 4. 사운드 디렉터 (dev/sound) — 2건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| S5-1 | 발사 실패 폭발 SFX — P5-1 연동, 실패 시 재생 | TASK-1 연동 | MEDIUM |
| S5-2 | 오프라인 복귀 알림 SFX — P5-3 연동, 복귀 보고서 표시 시 재생 | TASK-4 연동 | LOW |

### 5. TA (dev/ta) — 2건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| T5-1 | 발사 실패 ASCII 시각화 — 폭발 프레임 2~3종 (로켓 해체 장면) | TASK-1 연동 | MEDIUM |
| T5-2 | 오프라인 복귀 보고서 ASCII 아트 — 터미널 스타일 리포트 프레임 | TASK-4 연동 | LOW |

### 6. QA팀장 (dev/qa) — 5건
| # | 태스크 | 출처 | 우선순위 |
|---|--------|------|----------|
| Q5-1 | 기획 수치 변경 검증 — orbit_200, PHASE 고도, 신뢰도, 품질 효율 | D5-1~6 | HIGH |
| Q5-2 | 프로그래밍 버그 수정 검증 — 13건 전량 | P5-1~13 | HIGH |
| Q5-3 | UI 비주얼 변경 QA — 폰트, 토큰, 애니메이션 | U5-1~10 | MEDIUM |
| Q5-4 | Playwright 스모크 업데이트 — 발사 실패, 오프라인 복귀, 마일스톤 | — | HIGH |
| Q5-5 | 전체 리그레션 — Sprint 4 테스트 포함 | — | HIGH |

---

## 머지 순서 (의존성)
1. `dev/design` → sprint/5 (수치 데이터 선행)
2. `dev/ta` → sprint/5 (ASCII 에셋)
3. `dev/programmer` → sprint/5 (코어 로직)
4. `dev/sound` → sprint/5 (독립적)
5. `dev/ui` → sprint/5 (위 항목에 의존)
6. `dev/qa` → sprint/5 QA 통과 확인

## Definition of Done
- 발사 신뢰도 기반 성공/실패 판정 동작
- orbit_200 마일스톤 달성 가능 확인
- TIER-6 연구 2개 실제 효과 발동
- 오프라인 복귀 정산 화면 표시
- 9px 폰트 전량 10px 이상으로 수정
- CSS 하드코딩 색상 토큰 치환
- 애니메이션 5종 (production-pulse, tab-enter, research-complete, ignition-flash, scan-sweep) 적용
- QA 전체 스모크 PASS
- sprint/5 머지 완료
