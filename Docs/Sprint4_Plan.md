# Sprint 4 Plan — 임무 콘텐츠 + 생산 월드씬 + 연구 퀄업

> **목표**: v7 목업 갭 나머지 HIGH 항목 해소, 생산 탭 월드 씬 활성화, 연구 ASCII 패널 적용, 임무 콘텐츠 완성
> **기준**: v7_mockup_gap_analysis.md HIGH #10~#14 + 잔여 MED
> **소요 예상**: 병렬 에이전트 1시간 (단일 6~8시간)

---

## 팀장별 업무

### 1. 프로그래밍팀장 (dev/programmer)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| P4-1 | 페이즈 인터랙티브 타임라인 구현 (5-노드 + 커넥터 + 미니 프로그레스) | v7e 1868~1943 | HIGH |
| P4-2 | 업적 시스템 구현 (ach-card grid, earned/locked, 조건 판정) | v7e 1262~1335 | HIGH |
| P4-3 | 프레스티지 스타 트리 구현 (star-slot grid, 업그레이드 경로) | v7e 1460~1513 | HIGH |
| P4-4 | 생산 탭: 월드 씬 활성화 — production 탭에서 #world-bg를 주 콘텐츠로 전환 (opacity 1.0, blur 제거, 스크롤 활성화) | v7a 560~746 | HIGH |
| P4-5 | 연구 탭: 활성 연구 카드에 ASCII 패널 동적 생성 (research.js) | v7b 1168~1220 | HIGH |
| P4-6 | 상단 바: ERA 뱃지 + 탭별 서브타이틀 동적 변경 | v7b/v7e | MED |

### 2. UI팀장 (dev/ui)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| U4-1 | 페이즈 타임라인 CSS (phase-dot, phase-connector, phase-info) | v7e 349~515 | HIGH |
| U4-2 | 업적 카드 CSS (ach-card, earned/locked states) | v7e 1262~1335 | HIGH |
| U4-3 | 프레스티지 UI CSS (header-card, season-badge, star-slot, reset/keep lists) | v7e 1337~1548 | HIGH |
| U4-4 | 생산 탭 월드 씬 CSS 조정 (opacity/blur 제거, 스크롤바, 건물 hover 강화) | v7a CSS 182~260 | HIGH |
| U4-5 | 리소스 바 경고 색상 (amber/red) + 태그(LOW/CRITICAL) | v7a gfill.a/gfill.r, tag.low/crit | MED |
| U4-6 | 커서 블링크 + ERA 뱃지 CSS | v7b 218~226, era-badge | LOW |

### 3. 기획팀장 (dev/design)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| D4-1 | 프레스티지 스타 트리 기획 (노드 수, 비용, 효과, 연결 경로) | v7e 1460~1513 | HIGH |
| D4-2 | 프레스티지 리셋/유지 목록 기획 (무엇이 초기화/유지되는지) | v7e 1420~1458 | HIGH |
| D4-3 | 페이즈별 ASCII 씬 콘텐츠 기획 (5개 페이즈 문구/비주얼 방향) | v7e 1957~2000 | MED |
| D4-4 | 티커 메시지 다양화 (상황별 동적 메시지 20개+) | v7a 810~826 | MED |

### 4. TA (dev/ta)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| T4-1 | 임무 페이즈별 ASCII 씬 5개 제작 (프로토타입/준궤도/궤도/시스루나/달 표면) | v7e 1957~1997 | HIGH |
| T4-2 | 연구소 시각화 ASCII (lab-viz-panel) 제작 | v7b 1260~1273 | MED |
| T4-3 | 건물 ASCII 아트 품질 향상 (v7a 수준으로) | v7a 568~734 | MED |
| T4-4 | ASCII 타임라인 스트립 제작 (임무 진행 시각화) | v7e 1734~1754 | MED |

### 5. 사운드 디렉터 (dev/sound)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| S4-1 | 업적 달성 사운드 SFX | — | MED |
| S4-2 | 프레스티지 리셋 사운드 SFX | — | MED |
| S4-3 | 페이즈 클리어 팡파레 SFX | — | MED |

### 6. QA팀장 (dev/qa)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| Q4-1 | 생산 탭 월드 씬 스크롤/건물 인터랙션 QA | — | HIGH |
| Q4-2 | 업적/프레스티지 시스템 QA (조건 판정, 리셋 정합성) | — | HIGH |
| Q4-3 | 전체 탭 프로그레스 바 시각적 일관성 QA | — | MED |
| Q4-4 | Playwright 스모크 업데이트 (업적/프레스티지 경로) | — | HIGH |
| Q4-5 | 전체 스모크 리그레션 테스트 | — | HIGH |

### 7. 빌더 (dev/build)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| B4-1 | Sprint 4 최종 Electron 빌드 + Steam 배포 준비 검증 | build-checklist.md | HIGH |

---

## 머지 순서 (의존성)
1. `dev/design` → sprint/4 (기획 데이터 선행)
2. `dev/ta` → sprint/4 (ASCII 아트 에셋)
3. `dev/programmer` → sprint/4 (코어 로직)
4. `dev/sound` → sprint/4 (독립적)
5. `dev/ui` → sprint/4 (위 항목에 의존)
6. `dev/qa` → sprint/4 QA 통과 확인
7. `dev/build` → sprint/4 (최종)

## Definition of Done
- 페이즈 인터랙티브 타임라인 정상 표시 + 노드 클릭
- 업적/프레스티지 시스템 작동 (조건 판정, 스타 트리)
- 생산 탭에서 월드 씬 주 콘텐츠로 표시 (스크롤, 건물 클릭)
- 연구 카드에 ASCII 패널 표시
- 전 탭 프로그레스 바 shimmer 적용 확인
- QA 전체 스모크 PASS
- sprint/4 머지 완료
