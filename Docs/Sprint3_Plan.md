# Sprint 3 Plan — 조립·임무 탭 퀄업 + 공통 비주얼

> **목표**: v7 목업 대비 가장 큰 갭인 조립 탭 3-column 레이아웃, 임무 탭 서브탭 시스템, 공통 프로그레스 바 퀄업
> **기준**: v7_mockup_gap_analysis.md HIGH #1~#9 집중
> **소요 예상**: 병렬 에이전트 1시간 (단일 6~8시간)

---

## 팀장별 업무

### 1. 프로그래밍팀장 (dev/programmer)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| P3-1 | 조립 탭 3-column 레이아웃 구조 변환 (HTML + CSS) | v7c 1260~1610 | HIGH |
| P3-2 | 로켓 클래스 시스템 구현 (NANO~SUPER HEAVY, game-data.js에 데이터) | v7c 1270~1290 | HIGH |
| P3-3 | BOM 테이블 동적 생성 + 부품 계층 표시 (assembly.js) | v7c 1467~1605 | HIGH |
| P3-4 | 7단계 조립 진행 표시 구현 (assembly.js) | v7c 1428~1450 | HIGH |
| P3-5 | 임무 탭 서브탭 시스템 구현 (mission.js, index.html 구조 변경) | v7e 1856~1861 | HIGH |

### 2. UI팀장 (dev/ui)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| U3-1 | 조립 탭 3-column CSS 포팅 (v7c 스타일 적용) | v7c CSS 전체 | HIGH |
| U3-2 | BOM 테이블 CSS + 호버 하이라이트 + 어노테이션 | v7c 1478~1605 | HIGH |
| U3-3 | 프로그레스 바 shimmer + leading edge 전 탭 적용 | v7c progress-shimmer | HIGH |
| U3-4 | 임무 탭 서브탭 CSS + 페이즈 타임라인 노드 스타일 | v7e 231~500 | HIGH |
| U3-5 | 앰버 프로그레스 바 변형 CSS (열 관리 브랜치) | v7b amber-fill | MED |

### 3. 기획팀장 (dev/design)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| D3-1 | 로켓 클래스 명세 (5종 스펙: 중량, 추력, Isp, ΔV, 해금 조건) | v7c 1294~1320 | HIGH |
| D3-2 | BOM 부품 목록 명세 (클래스별 필요 부품, 소재, 수량) | v7c 1467~1605 | HIGH |
| D3-3 | 7단계 조립 스테이지 명세 (각 단계 조건, 소요 시간) | v7c 1433~1439 | HIGH |
| D3-4 | 업적 시스템 기획 (업적 목록 20개+, 조건, 보상) | v7e 1262~1335 | MED |

### 4. TA (dev/ta)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| T3-1 | 연구 카드별 ASCII 아트 제작 (기술 10종+ 전용 ASCII 시각화) | v7b 1181~1220 | HIGH |
| T3-2 | 7단계 조립 진행 ASCII 아트 템플릿 | v7c 1429~1439 | HIGH |
| T3-3 | 조립 도구 패널 ASCII 아트 | v7c 1453~1462 | MED |
| T3-4 | 리스크 태그 펄스 애니메이션 CSS | v7c risk-tag | MED |

### 5. 사운드 디렉터 (dev/sound)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| S3-1 | 조립 완료 스테이지별 SFX 추가 (7단계 각 완료 사운드) | — | MED |
| S3-2 | 탭 전환 SFX (현재 무음) | — | LOW |

### 6. QA팀장 (dev/qa)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| Q3-1 | 조립 탭 3-column 레이아웃 QA (반응형 포함) | — | HIGH |
| Q3-2 | BOM 테이블 인터랙션 QA (호버 하이라이트) | — | HIGH |
| Q3-3 | 임무 서브탭 전환 QA | — | HIGH |
| Q3-4 | Playwright 스모크 테스트 업데이트 (조립/임무 탭 변경분) | — | HIGH |

### 7. 빌더 (dev/build)
| # | 태스크 | 참조 | 우선순위 |
|---|--------|------|----------|
| B3-1 | Sprint 3 완료 후 Electron 빌드 검증 | — | MED |

---

## 머지 순서 (의존성)
1. `dev/design` → sprint/3 (데이터 명세 선행)
2. `dev/ta` → sprint/3 (ASCII 아트 에셋)
3. `dev/programmer` → sprint/3 (코어 로직)
4. `dev/sound` → sprint/3 (독립적)
5. `dev/ui` → sprint/3 (위 항목에 의존)
6. `dev/qa` → sprint/3 QA 통과 확인
7. `dev/build` → sprint/3 (최종)

## Definition of Done
- 조립 탭 3-column 정상 작동 + BOM 테이블 호버 하이라이트
- 프로그레스 바 shimmer + leading edge 전 탭 적용
- 임무 탭 4개 서브탭 전환 정상
- QA 스모크 PASS
- sprint/3 머지 완료
