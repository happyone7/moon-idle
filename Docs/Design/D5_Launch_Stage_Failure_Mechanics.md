# D5 — 발사 단계별 실패/성공 메카닉 종합 제안서

| 항목 | 내용 |
|------|------|
| **문서 ID** | D5_Launch_Stage_Failure_Mechanics |
| **작성자** | 기획팀장 (Game Designer) |
| **작성일** | 2026-02-23 |
| **버전** | v1.0 |
| **상태** | 제안 (총괄PD 리뷰 대기) |
| **관련 파일** | `js/balance-data.js`, `js/game-state.js`, `js/tabs/launch.js` |

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [발사 단계 정의](#2-발사-단계-정의)
3. [로켓 스펙 요소 (능력치) 설계](#3-로켓-스펙-요소-능력치-설계)
4. [단계별 기본 실패 확률](#4-단계별-기본-실패-확률)
5. [로켓 클래스별 차이](#5-로켓-클래스별-차이)
6. [제작 공정에 따른 스펙 편차 (랜덤성)](#6-제작-공정에-따른-스펙-편차-랜덤성)
7. [스펙 -> 단계별 성공률 변환 공식](#7-스펙--단계별-성공률-변환-공식)
8. [밸런스 수치 테이블 (종합)](#8-밸런스-수치-테이블-종합)
9. [기존 시스템과의 호환성](#9-기존-시스템과의-호환성)
10. [구현 가이드 (프로그래밍팀장용)](#10-구현-가이드-프로그래밍팀장용)

---

## 1. 디자인 원칙

총괄PD가 강조한 3대 원칙을 모든 설계에 관통시킨다.

### 1.1 실제 로켓 발사 연상
- 8단계는 실제 Falcon 9 / Saturn V 발사 시퀀스를 기반으로 설계
- 각 단계의 실패 모드는 실제 사고 사례에서 차용 (챌린저 Max-Q, 아리안5 분리 실패 등)
- 텔레메트리에 실제 항공우주 용어 사용 (MECO, TLI, LOI 등)

### 1.2 극명한 희비교차
- 단계가 진행될수록 긴장감 증가 — 후반 단계 실패 시 손실감이 크도록 설계
- "거의 성공할 뻔했다" 경험(LOI에서 실패 등)이 플레이어에게 강한 동기 부여
- 성공 시 단계별 축적된 긴장감이 한꺼번에 해소되는 카타르시스

### 1.3 목표 가시성
- 각 스펙 요소가 어떤 단계에 영향을 주는지 UI에서 명확히 표시
- "구조강도를 올리면 Max-Q 통과율이 올라간다" 같은 직관적 인과관계
- 로켓 클래스 선택 시 "이 로켓으로 어디까지 갈 수 있는지" 사전 예측 가능

---

## 2. 발사 단계 정의

기존 8단계(stage index 4~11)를 유지하되, 각 단계에 실제 로켓 발사의 핵심 이벤트를 매핑한다.

| # | stage index | 단계명 (EN) | 단계명 (KR) | 실제 대응 | 핵심 위험 요소 | 실패 모드 |
|---|-------------|-------------|-------------|-----------|----------------|-----------|
| 1 | 4 | LIFTOFF | 점화/이륙 | 엔진 점화 ~ 타워 클리어 | 엔진 시동 실패, 추력 부족 | 엔진 점화 불량으로 발사대 귀환 |
| 2 | 5 | MAX-Q | 최대 동압 | 가속 중 최대 공력 하중 | 기체 구조 파괴, 공기역학 하중 | 동압 초과로 기체 공중 분해 |
| 3 | 6 | MECO | 주엔진 차단 | 1단 엔진 연소 종료 | 엔진 조기/지연 차단, 연소 이상 | 연소 이상으로 궤도 미달 |
| 4 | 7 | STG SEP | 단분리 | 1단 분리 + 2단 점화 | 분리 볼트 작동 불량, 충돌 | 분리 실패로 2단 점화 불능 |
| 5 | 8 | ORBIT | 궤도 진입 | 지구 저궤도(LEO) 삽입 | 속도/방향 오차, 항법 오류 | 궤도 삽입 실패로 대기권 재진입 |
| 6 | 9 | TLI | 달 전이 궤도 | Trans-Lunar Injection 점화 | 2단 재점화 실패, 연료 부족 | 전이 궤도 진입 실패 |
| 7 | 10 | LOI | 달 궤도 포획 | Lunar Orbit Insertion | 감속 연소 오차, 포획 실패 | 달 궤도 포획 실패로 이탈 |
| 8 | 11 | LANDING | 달 착륙 | 하강 + 터치다운 | 착지 속도 초과, 센서 오류 | 착륙 실패 — 표면 충돌 |

### 2.1 단계별 실패 존 (Fail Zone)

기존 `_getFailZone()` 함수와 일치:

| 존 | 포함 단계 | 연출 테마 |
|----|-----------|-----------|
| **ground** | LIFTOFF(4), MAX-Q(5) | 지상/저고도 폭발 — 화염+연기 |
| **high_atm** | MECO(6), STG SEP(7) | 고고도 기체 분해 — 잔해 산란 |
| **space** | ORBIT(8), TLI(9) | 우주 공간 엔진 고장 — 표류 |
| **lunar** | LOI(10), LANDING(11) | 달 표면 충돌 — 임팩트 크레이터 |

---

## 3. 로켓 스펙 요소 (능력치) 설계

### 3.1 4대 스펙 요소 정의

현재 `getRocketScience()`의 deltaV, twr, reliability, altitude를 기반으로, 발사 단계별 성공률에 영향을 주는 **4대 스펙 요소**를 정의한다.

| 스펙 요소 | ID | 설명 | 영향 단계 | 현재 코드 연결점 |
|-----------|-----|------|-----------|------------------|
| **구조강도** | `structural` | 기체가 공기역학 하중/진동을 견디는 능력 | LIFTOFF, **MAX-Q**, STG SEP | `dryMassMult` 역수 (가벼울수록 구조 약함) |
| **추진안정성** | `propulsion` | 엔진 연소/재점화의 안정성 | **LIFTOFF**, MECO, **TLI** | `thrust`, `isp` 기반 |
| **항전신뢰도** | `avionics` | 항법/제어 시스템의 정밀도 | STG SEP, **ORBIT**, LOI, **LANDING** | `reliability` 기존 값 활용 |
| **열방호도** | `thermal` | 열/극저온 환경 내구성 | MECO, **ORBIT**, **LOI**, LANDING | 연구 Branch T 진행도 기반 |

> **굵은 글씨** = 해당 스펙의 주요 영향(primary) 단계. 나머지는 보조 영향(secondary).

### 3.2 스펙 요소 계산 공식

각 스펙 요소는 0~100 범위의 점수로 산출된다.

```javascript
// ── 구조강도 (structural) ──
// 기본값 50 + 품질 보정 + 클래스 보정 + 연구 보정
structural = clamp(
  50
  + qualityBonus.structural        // 품질별 고정 보너스
  + classBonus[classId].structural  // 클래스별 보정
  + (gs.upgrades.alloy ? 8 : 0)    // CFRP 적층 연구
  + (gs.upgrades.precision_mfg ? 6 : 0)  // 정밀 제조 공정
  + rollVariance.structural,       // 제작 랜덤 편차
  0, 100
);

// ── 추진안정성 (propulsion) ──
// TWR 기반 + 품질/클래스 보정 + 연구 보정
propulsion = clamp(
  50
  + qualityBonus.propulsion
  + classBonus[classId].propulsion
  + (gs.upgrades.fuel_chem ? 5 : 0)     // 고압 연소실
  + (gs.upgrades.catalyst ? 8 : 0)      // 터보펌프 기초
  + (gs.upgrades.lightweight ? 6 : 0)   // 재생 냉각 노즐
  + (gs.upgrades.fusion ? 10 : 0)       // 핀치 연소
  + rollVariance.propulsion,
  0, 100
);

// ── 항전신뢰도 (avionics) ──
// 기존 reliability를 0~100 스케일로 변환 + 보정
avionics = clamp(
  50
  + qualityBonus.avionics
  + classBonus[classId].avionics
  + (gs.upgrades.electronics_basics ? 5 : 0)  // 자이로 안정화
  + (gs.upgrades.microchip ? 8 : 0)           // 관성 항법
  + (gs.upgrades.reliability ? 10 : 0)        // GPS 보정
  + (gs.upgrades.telemetry ? 6 : 0)           // 원격 측정
  + (gs.upgrades.automation ? 5 : 0)          // 자율 비행
  + rollVariance.avionics,
  0, 100
);

// ── 열방호도 (thermal) ──
// Branch T 연구 진행도 기반
thermal = clamp(
  50
  + qualityBonus.thermal
  + classBonus[classId].thermal
  + (gs.upgrades.hire_worker_1 ? 5 : 0)   // 기초 절열재
  + (gs.upgrades.launch_ctrl ? 8 : 0)     // 삭마 코팅
  + (gs.upgrades.mission_sys ? 8 : 0)     // 능동 냉각
  + (gs.upgrades.multipad ? 6 : 0)        // 열차폐 타일
  + (gs.upgrades.heat_recov ? 8 : 0)      // 열 재생 코팅
  + rollVariance.thermal,
  0, 100
);
```

### 3.3 스펙 -> 단계 영향 매핑 (가중치)

각 단계의 성공률은 4대 스펙의 가중 합산으로 결정된다.

| 단계 | structural | propulsion | avionics | thermal | 합계 |
|------|------------|------------|----------|---------|------|
| LIFTOFF (4) | 0.15 | **0.50** | 0.20 | 0.15 | 1.00 |
| MAX-Q (5) | **0.55** | 0.10 | 0.15 | 0.20 | 1.00 |
| MECO (6) | 0.10 | **0.40** | 0.20 | **0.30** | 1.00 |
| STG SEP (7) | **0.30** | 0.15 | **0.40** | 0.15 | 1.00 |
| ORBIT (8) | 0.10 | 0.20 | **0.35** | **0.35** | 1.00 |
| TLI (9) | 0.10 | **0.45** | 0.25 | 0.20 | 1.00 |
| LOI (10) | 0.10 | 0.20 | **0.40** | **0.30** | 1.00 |
| LANDING (11) | 0.15 | 0.15 | **0.45** | 0.25 | 1.00 |

**설계 근거:**
- **LIFTOFF**: 엔진이 실제로 점화되는 순간 → 추진안정성이 지배적
- **MAX-Q**: 최대 동압 = 기체에 가장 큰 공력 하중 → 구조강도가 지배적
- **MECO**: 엔진 연소 종료 시 열/압력 급변 → 추진+열방호
- **STG SEP**: 정밀한 분리 시퀀스 → 항전(제어)+구조(분리 메커니즘)
- **ORBIT**: 궤도 삽입 정밀도 → 항전(궤도 계산)+열(대기 잔여 마찰)
- **TLI**: 2단 재점화 → 추진안정성이 지배적
- **LOI**: 달 궤도 감속 정밀도 → 항전(궤도 역학)+열(방열)
- **LANDING**: 최종 착륙 제어 → 항전(센서/제어)이 가장 중요

---

## 4. 단계별 기본 실패 확률

### 4.1 기본(base) 실패율 설계

전체 기본 성공률 목표: **BALANCE.ROCKET.baseReliability = 70%**

8단계를 모두 통과해야 성공이므로, 각 단계의 성공률 곱이 70%가 되도록 설계한다.
단, 모든 단계를 균등하게 나누지 않고 **후반 단계일수록 실패율이 높아지도록** 차등 배분한다.

이는 "거의 다 왔는데 실패" 경험을 만들어 희비교차를 극대화하는 전략이다.

| 단계 | 기본 성공률 (%) | 기본 실패율 (%) | 누적 성공률 (%) | 설계 의도 |
|------|----------------|----------------|----------------|-----------|
| LIFTOFF (4) | 97.0 | 3.0 | 97.0 | 점화는 비교적 안정적 |
| MAX-Q (5) | 95.5 | 4.5 | 92.6 | 대기권 구간 주요 위험 |
| MECO (6) | 96.5 | 3.5 | 89.4 | 엔진 차단은 비교적 안정적 |
| STG SEP (7) | 95.0 | 5.0 | 84.9 | 분리는 기계적 위험 큼 |
| ORBIT (8) | 94.0 | 6.0 | 79.8 | 궤도 삽입 정밀도 요구 |
| TLI (9) | 93.5 | 6.5 | 74.6 | 재점화 위험 높음 |
| LOI (10) | 95.5 | 4.5 | 71.2 | 달 포획은 상대적 안정 |
| LANDING (11) | 98.5 | 1.5 | **70.1** | 여기까지 오면 거의 성공 |

> **누적 성공률 70.1%** -- BALANCE.ROCKET.baseReliability(70%)과 조화

### 4.2 실패율 커브 설계 철학

```
실패율(%)
 7 |
 6 |               ●(TLI)
 5 |          ●(ORBIT)
 5 |     ●(STG SEP)
 4.5|  ●(MAX-Q)          ●(LOI)
 3.5|      ●(MECO)
 3 | ●(LIFTOFF)
 1.5|                              ●(LANDING)
   +-----+-----+-----+-----+-----+-----+-----+------→ 단계
    LFT  MXQ  MECO  SEP  ORB  TLI  LOI  LAND
```

- 전반부(LIFTOFF~MECO): 낮은 실패율 -- "순조롭게 시작"
- 중반부(STG SEP~TLI): 높은 실패율 -- "긴장의 절정"
- 후반부(LOI~LANDING): 실패율 감소 -- "여기까지 왔으면 거의 된다"

이 커브는 실제 로켓 발사 통계(SpaceX Falcon 9 실패 이력 참고)를 반영하면서도,
게임적으로 "중반부 고비"를 넘기면 보상을 기대할 수 있는 구조를 만든다.

---

## 5. 로켓 클래스별 차이

### 5.1 클래스별 스펙 보정값

각 로켓 클래스는 4대 스펙에 고유한 보정값을 가진다.

| 클래스 | ID | structural | propulsion | avionics | thermal | 설계 근거 |
|--------|----|------------|------------|----------|---------|-----------|
| 베가 | `vega` | +0 | +0 | +0 | +0 | 기준점. 단순 구조, 기본 장비 |
| 아르고 | `argo` | +3 | +5 | +2 | +2 | 스러스터 추가로 추진 소폭 향상 |
| 헤르메스 | `hermes` | +5 | +8 | +6 | +4 | 2단 구조로 전반적 향상, 구조 복잡성 증가 |
| 아틀라스 | `atlas` | +4 | +10 | +8 | +7 | 재사용 구조, 고성능 엔진, 열방호 강화 |
| 셀레네 | `selene` | +2 | +12 | +10 | +10 | 3단 초대형, 항전/열 기술 필수 |
| 아르테미스 | `artemis` | +0 | +15 | +12 | +12 | 극대형 재사용, 추진 최강이나 구조 리스크 동등 |

### 5.2 클래스별 강점/약점 분석

| 클래스 | 강한 단계 | 약한 단계 | 해설 |
|--------|-----------|-----------|------|
| **베가** | 없음 (기본) | 후반 전체 | 프로토타입급. 고도 10km 도달이 목표. 후반 단계는 사실상 도달 불가 |
| **아르고** | LIFTOFF, TLI | MAX-Q | 추진력 향상이 핵심. 가벼운 기체라 Max-Q 취약 |
| **헤르메스** | ORBIT, STG SEP | TLI, LOI | 2단 구조 도입으로 분리/궤도 능력 향상. 달 도달은 아직 부족 |
| **아틀라스** | MECO, TLI | MAX-Q | 강력한 엔진의 재점화 안정성 우수. 중량 증가로 Max-Q 부담 |
| **셀레네** | LOI, ORBIT | STG SEP | 달 임무 특화. 3단 분리가 가장 복잡 |
| **아르테미스** | TLI, LOI, LANDING | MAX-Q, STG SEP | 최종 클래스. 추진/항전/열 극강이나, 극대형이라 구조 위험 잔존 |

### 5.3 클래스 진행에 따른 난이도 곡선

```
전체 성공률
  95%|                                           ◆ (ARTEMIS + ELITE + 풀연구)
  90%|                                  ◆ (SELENE + ADV)
  85%|                        ◆ (ATLAS + STD)
  80%|              ◆ (HERMES + STD)
  70%|    ◆ (ARGO + PROTO)
  60%| ◆ (VEGA + PROTO)
     +------+-------+-------+-------+-------+-------→ 진행도
       시작    Phase1  Phase2  Phase3  Phase4  Phase5
```

클래스와 품질, 연구를 모두 올리면 최종적으로 95% 이상의 성공률에 도달 가능.
하지만 완전한 100%는 불가능 (maxReliability = 99.5% 유지).

---

## 6. 제작 공정에 따른 스펙 편차 (랜덤성)

### 6.1 기본 개념

로켓을 조립할 때마다 각 스펙 요소에 **랜덤 편차(rollVariance)**가 적용된다.
이는 "같은 재료, 같은 설계도라도 제작 품질이 매번 다르다"는 현실감을 반영한다.

### 6.2 편차 범위

| 품질 (Quality) | 편차 범위 | 표준편차(sigma) | 설계 의도 |
|----------------|-----------|-----------------|-----------|
| PROTO-MK1 | -8 ~ +8 | 4.0 | 수제작, 품질 편차 큼 |
| STD-MK2 | -5 ~ +5 | 2.5 | 표준화된 공정, 안정적 |
| ADV-MK3 | -3 ~ +3 | 1.5 | 고도화된 품질 관리 |
| ELITE-MK4 | -2 ~ +2 | 1.0 | 최고급 정밀 제작 |

### 6.3 편차 생성 알고리즘

```javascript
// 정규분포 근사 (Box-Muller 변환)
function gaussianRandom(mean, sigma) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sigma * z;
}

// 제작 시 스펙 편차 생성 (4개 스펙 각각 독립)
function generateRollVariance(qualityId) {
  const sigmaMap = { proto: 4.0, standard: 2.5, advanced: 1.5, elite: 1.0 };
  const maxMap   = { proto: 8,   standard: 5,   advanced: 3,   elite: 2   };
  const sigma = sigmaMap[qualityId] || 4.0;
  const max   = maxMap[qualityId]   || 8;

  return {
    structural: clamp(Math.round(gaussianRandom(0, sigma)), -max, max),
    propulsion: clamp(Math.round(gaussianRandom(0, sigma)), -max, max),
    avionics:   clamp(Math.round(gaussianRandom(0, sigma)), -max, max),
    thermal:    clamp(Math.round(gaussianRandom(0, sigma)), -max, max),
  };
}
```

### 6.4 플레이어 체감 설계

- **PROTO**: 편차 범위 16 (=-8~+8). "운이 좋으면 대박, 나쁘면 쪽박" 느낌
- **ELITE**: 편차 범위 4 (=-2~+2). "항상 안정적, 기대를 배신하지 않는" 느낌
- 편차는 조립 완료 시 확정되며, 발사 전 UI에서 **스펙 요소 바 그래프**로 표시
- 편차가 +방향이면 초록색 화살표, -방향이면 빨간색 화살표로 시각 표현

### 6.5 편차 저장

```javascript
// gs.assembly.jobs[i]에 rollVariance 필드 추가
// 조립 완료 시 generateRollVariance()로 생성하여 저장
gs.assembly.jobs[slotIdx] = {
  quality: 'proto',
  class: 'vega',
  startAt: ...,
  endAt: ...,
  rollVariance: { structural: +3, propulsion: -2, avionics: +1, thermal: -5 },
};
```

---

## 7. 스펙 -> 단계별 성공률 변환 공식

### 7.1 핵심 공식

```javascript
// 1단계: 4대 스펙을 가중 합산하여 "단계 스코어" 산출
stageScore = (structural * W_structural) + (propulsion * W_propulsion)
           + (avionics * W_avionics) + (thermal * W_thermal);
// W_xxx = 섹션 3.3의 가중치 테이블 값

// 2단계: 스코어를 성공률로 변환 (S-커브 매핑)
// stageScore 범위: 0~100
// 성공률 범위: baseFloor(60%) ~ baseCeiling(99.5%)
stageSuccessRate = baseFloor + (baseCeiling - baseFloor) * sigmoid(stageScore);

// sigmoid 함수: 중앙(50) 부근에서 급격히 변화
function sigmoid(score) {
  // k = 기울기 파라미터 (0.08 = 적당한 곡선)
  // mid = 중앙점 (50)
  return 1 / (1 + Math.exp(-0.08 * (score - 50)));
}
```

### 7.2 매개변수

| 매개변수 | 값 | 설명 |
|----------|-----|------|
| `baseFloor` | 60% | 스펙이 최저(0)일 때 성공률 하한 |
| `baseCeiling` | 99.5% | 스펙이 최고(100)일 때 성공률 상한 (= maxReliability) |
| `sigmoid_k` | 0.08 | S-커브 기울기. 높을수록 중간 구간에서 급변 |
| `sigmoid_mid` | 50 | S-커브 중앙점 |

### 7.3 스코어 -> 성공률 변환 테이블 (참조용)

| 단계 스코어 | sigmoid 출력 | 성공률 (%) |
|-------------|-------------|------------|
| 0 | 0.018 | 60.7 |
| 10 | 0.047 | 61.9 |
| 20 | 0.119 | 64.7 |
| 30 | 0.269 | 70.6 |
| 40 | 0.500 | 79.8 |
| 50 | 0.731 | 88.9 |
| 60 | 0.881 | 94.8 |
| 70 | 0.953 | 97.6 |
| 80 | 0.982 | 98.8 |
| 90 | 0.993 | 99.2 |
| 100 | 0.998 | 99.5 |

### 7.4 전체 성공률 계산

```javascript
// 각 단계 성공률의 곱 = 전체 미션 성공률
overallSuccessRate = stage4Rate * stage5Rate * stage6Rate * stage7Rate
                   * stage8Rate * stage9Rate * stage10Rate * stage11Rate;
```

### 7.5 예시 계산

#### 예시 A: VEGA + PROTO (초기 상태, 연구 없음)

```
스펙 계산 (기본값 50 + 클래스(0) + 품질(아래) + 편차(0 가정)):
  qualityBonus.proto: structural=+0, propulsion=+0, avionics=+0, thermal=+0

  structural = 50 + 0 + 0 = 50
  propulsion = 50 + 0 + 0 = 50
  avionics   = 50 + 0 + 0 = 50
  thermal    = 50 + 0 + 0 = 50

단계별 스코어 (모두 50):
  모든 단계: 50*W1 + 50*W2 + 50*W3 + 50*W4 = 50*(1.0) = 50

성공률: sigmoid(50) = 0.731 → 60 + 39.5*0.731 = 88.9%

전체 성공률: 0.889^8 = 39.3%
```

> 초기 상태에서 ~39%: "조금 힘들지만 운이 좋으면 된다" -- 첫 발사 자동 성공 이후 도전감 제공

#### 예시 B: ATLAS + ADV (Phase 3, 주요 연구 완료)

```
스펙 계산:
  qualityBonus.advanced: structural=+6, propulsion=+8, avionics=+10, thermal=+6
  classBonus.atlas:      structural=+4, propulsion=+10, avionics=+8, thermal=+7
  연구 보정 (예시 - 주요 연구 완료):
    structural: alloy(+8) + precision_mfg(+6) = +14
    propulsion: fuel_chem(+5) + catalyst(+8) + lightweight(+6) = +19
    avionics:   electronics_basics(+5) + microchip(+8) + reliability(+10) + telemetry(+6) = +29
    thermal:    hire_worker_1(+5) + launch_ctrl(+8) + mission_sys(+8) = +21

  structural = 50 + 6 + 4 + 14 = 74
  propulsion = 50 + 8 + 10 + 19 = 87
  avionics   = 50 + 10 + 8 + 29 = 97 (clamp 100)
  thermal    = 50 + 6 + 7 + 21 = 84

단계별 스코어:
  LIFTOFF:  74*0.15 + 87*0.50 + 97*0.20 + 84*0.15 = 11.1 + 43.5 + 19.4 + 12.6 = 86.6
  MAX-Q:    74*0.55 + 87*0.10 + 97*0.15 + 84*0.20 = 40.7 + 8.7 + 14.6 + 16.8 = 80.8
  MECO:     74*0.10 + 87*0.40 + 97*0.20 + 84*0.30 = 7.4 + 34.8 + 19.4 + 25.2 = 86.8
  STG SEP:  74*0.30 + 87*0.15 + 97*0.40 + 84*0.15 = 22.2 + 13.1 + 38.8 + 12.6 = 86.7
  ORBIT:    74*0.10 + 87*0.20 + 97*0.35 + 84*0.35 = 7.4 + 17.4 + 34.0 + 29.4 = 88.2
  TLI:      74*0.10 + 87*0.45 + 97*0.25 + 84*0.20 = 7.4 + 39.2 + 24.3 + 16.8 = 87.7
  LOI:      74*0.10 + 87*0.20 + 97*0.40 + 84*0.30 = 7.4 + 17.4 + 38.8 + 25.2 = 88.8
  LANDING:  74*0.15 + 87*0.15 + 97*0.45 + 84*0.25 = 11.1 + 13.1 + 43.7 + 21.0 = 88.9

성공률 (sigmoid 변환):
  LIFTOFF: sigmoid(86.6) → ~98.5%
  MAX-Q:   sigmoid(80.8) → ~98.0%
  MECO:    sigmoid(86.8) → ~98.5%
  STG SEP: sigmoid(86.7) → ~98.5%
  ORBIT:   sigmoid(88.2) → ~98.7%
  TLI:     sigmoid(87.7) → ~98.6%
  LOI:     sigmoid(88.8) → ~98.8%
  LANDING: sigmoid(88.9) → ~98.8%

전체 성공률: 0.985 * 0.980 * 0.985 * 0.985 * 0.987 * 0.986 * 0.988 * 0.988 = ~89.1%
```

> Phase 3 풀연구 + ADV 품질: ~89% -- 안정적이지만 가끔 실패, 연구/업그레이드 동기 유지

---

## 8. 밸런스 수치 테이블 (종합)

### 8.1 `BALANCE.LAUNCH_STAGES` (신규 추가)

프로그래밍팀장이 `balance-data.js`에 바로 추가할 수 있는 데이터 구조:

```javascript
BALANCE.LAUNCH_STAGES = {
  // sigmoid 매개변수
  sigmoid_k: 0.08,
  sigmoid_mid: 50,
  baseFloor: 60,      // 최저 성공률 (%)
  baseCeiling: 99.5,   // 최고 성공률 (%) = maxReliability

  // 단계별 스펙 가중치 [structural, propulsion, avionics, thermal]
  stageWeights: {
    4:  [0.15, 0.50, 0.20, 0.15],  // LIFTOFF
    5:  [0.55, 0.10, 0.15, 0.20],  // MAX-Q
    6:  [0.10, 0.40, 0.20, 0.30],  // MECO
    7:  [0.30, 0.15, 0.40, 0.15],  // STG SEP
    8:  [0.10, 0.20, 0.35, 0.35],  // ORBIT
    9:  [0.10, 0.45, 0.25, 0.20],  // TLI
    10: [0.10, 0.20, 0.40, 0.30],  // LOI
    11: [0.15, 0.15, 0.45, 0.25],  // LANDING
  },
};
```

### 8.2 `BALANCE.SPEC_QUALITY_BONUS` (신규 추가)

```javascript
BALANCE.SPEC_QUALITY_BONUS = {
  //                structural  propulsion  avionics  thermal
  proto:           { s: 0,      p: 0,       a: 0,     t: 0    },
  standard:        { s: 3,      p: 4,       a: 5,     t: 3    },
  advanced:        { s: 6,      p: 8,       a: 10,    t: 6    },
  elite:           { s: 10,     p: 12,      a: 15,    t: 10   },
};
```

### 8.3 `BALANCE.SPEC_CLASS_BONUS` (신규 추가)

```javascript
BALANCE.SPEC_CLASS_BONUS = {
  //             structural  propulsion  avionics  thermal
  vega:         { s: 0,      p: 0,       a: 0,     t: 0    },
  argo:         { s: 3,      p: 5,       a: 2,     t: 2    },
  hermes:       { s: 5,      p: 8,       a: 6,     t: 4    },
  atlas:        { s: 4,      p: 10,      a: 8,     t: 7    },
  selene:       { s: 2,      p: 12,      a: 10,    t: 10   },
  artemis:      { s: 0,      p: 15,      a: 12,    t: 12   },
};
```

### 8.4 `BALANCE.SPEC_RESEARCH_BONUS` (신규 추가)

```javascript
BALANCE.SPEC_RESEARCH_BONUS = {
  // 연구 ID -> 스펙 보정 { s, p, a, t }
  // Branch S (구조)
  alloy:             { s: 8,  p: 0, a: 0, t: 0 },
  precision_mfg:     { s: 6,  p: 0, a: 0, t: 0 },
  // Branch P (추진)
  fuel_chem:         { s: 0,  p: 5, a: 0, t: 0 },
  catalyst:          { s: 0,  p: 8, a: 0, t: 0 },
  lightweight:       { s: 0,  p: 6, a: 0, t: 0 },
  fusion:            { s: 0,  p: 10, a: 0, t: 0 },
  cryo_storage:      { s: 0,  p: 3, a: 0, t: 0 },
  // Branch A (항전)
  electronics_basics:{ s: 0,  p: 0, a: 5, t: 0 },
  microchip:         { s: 0,  p: 0, a: 8, t: 0 },
  reliability:       { s: 0,  p: 0, a: 10, t: 0 },
  telemetry:         { s: 0,  p: 0, a: 6, t: 0 },
  automation:        { s: 0,  p: 0, a: 5, t: 0 },
  // Branch T (열보호)
  hire_worker_1:     { s: 0,  p: 0, a: 0, t: 5 },
  launch_ctrl:       { s: 0,  p: 0, a: 0, t: 8 },
  mission_sys:       { s: 0,  p: 0, a: 0, t: 8 },
  multipad:          { s: 0,  p: 0, a: 0, t: 6 },
  heat_recov:        { s: 0,  p: 0, a: 0, t: 8 },
  // Branch E (경제) - 직접적 스펙 영향 없음
  // Branch O (자동화) - 직접적 스펙 영향 없음
  // Branch M (제조) -- alloy, precision_mfg는 위에 포함
  rocket_eng:        { s: 2,  p: 2, a: 0, t: 0 },
  // Branch X (전문화) - 직접적 스펙 영향 없음
};
```

### 8.5 `BALANCE.ROLL_VARIANCE` (신규 추가)

```javascript
BALANCE.ROLL_VARIANCE = {
  //          sigma  max
  proto:    { sigma: 4.0, max: 8  },
  standard: { sigma: 2.5, max: 5  },
  advanced: { sigma: 1.5, max: 3  },
  elite:    { sigma: 1.0, max: 2  },
};
```

### 8.6 종합 성공률 기대값 테이블

아래는 편차=0, 주요 연구 완료 기준의 예상 전체 성공률이다.

| 조합 | structural | propulsion | avionics | thermal | 전체 성공률 (예상) |
|------|------------|------------|----------|---------|-------------------|
| VEGA + PROTO (초기) | 50 | 50 | 50 | 50 | ~39% |
| VEGA + PROTO (일부 연구) | 58 | 55 | 55 | 55 | ~52% |
| ARGO + STD (Phase 1) | 62 | 64 | 57 | 55 | ~62% |
| HERMES + STD (Phase 2) | 70 | 75 | 73 | 68 | ~81% |
| ATLAS + ADV (Phase 3) | 74 | 87 | 97 | 84 | ~89% |
| SELENE + ADV (Phase 4) | 66 | 89 | 99 | 90 | ~88% |
| SELENE + ELITE (Phase 4) | 72 | 93 | 100 | 96 | ~93% |
| ARTEMIS + ELITE (Phase 5) | 66 | 100 | 100 | 99 | ~92% |
| ARTEMIS + ELITE + 풀연구 | 80 | 100 | 100 | 100 | ~96% |

### 8.7 첫 발사 특별 규칙

기존 코드의 `isFirstLaunch` 규칙을 유지한다:

```javascript
// gs.launches === 0 이면 모든 단계 자동 성공
// 이는 튜토리얼 경험: "첫 발사는 반드시 성공하여 시스템을 이해시킨다"
```

---

## 9. 기존 시스템과의 호환성

### 9.1 `getRocketScience()` 변경 사항

기존 함수를 확장하여 4대 스펙 값을 반환한다.

```javascript
// 기존 반환값 유지
// { deltaV, twr, reliability, altitude }

// 신규 추가 반환값
// {
//   ...기존,
//   specs: { structural, propulsion, avionics, thermal },
//   rollVariance: { structural, propulsion, avionics, thermal },  // 현재 슬롯 편차
//   stageRates: { 4: 98.5, 5: 97.2, ..., 11: 99.1 },            // 단계별 성공률
//   overallRate: 89.1,                                             // 전체 성공률
// }
```

### 9.2 `reliability` 필드 호환

- 기존 `reliability`는 **기존 방식의 전체 성공률**로 유지 (레거시 호환)
- 새로운 `overallRate`가 실제 발사 판정에 사용됨
- UI에서는 `overallRate`를 표시하되, 기존 `reliability` 필드명도 유지

### 9.3 `executeLaunch()` 변경 사항

```javascript
// 기존: perStageProb = reliability^(1/8) * 100 → 균등 분배
// 변경: 각 단계별 stageRates[i]를 개별 적용

for (let i = 4; i <= 11; i++) {
  const stageRate = sci.stageRates[i];
  const success = Math.random() * 100 < stageRate;
  stageRolls.push({ stage: i, success, rate: stageRate });
  if (!success && firstFailStage === -1) firstFailStage = i;
}
```

### 9.4 기존 발사 기록(`gs.history`) 호환

기존 history 항목에 스펙/편차 정보를 추가 저장:

```javascript
gs.history.push({
  ...기존 필드,
  specs: sci.specs,
  rollVariance: sci.rollVariance,
  stageRates: sci.stageRates,
  overallRate: sci.overallRate,
});
```

### 9.5 `BALANCE.ROCKET.baseReliability` 역할 변경

- 기존: 직접 발사 성공률로 사용
- 변경: 기본 스펙(50) 상태에서의 **기대 전체 성공률 참조값**으로 역할 변경
- 실제 계산은 4대 스펙 기반 시스템으로 대체
- 값(70)은 참조/디버그 용도로 유지

---

## 10. 구현 가이드 (프로그래밍팀장용)

### 10.1 구현 우선순위

| 순서 | 작업 | 파일 | 난이도 |
|------|------|------|--------|
| 1 | `BALANCE.LAUNCH_STAGES` 등 데이터 추가 | `balance-data.js` | 낮음 |
| 2 | `generateRollVariance()` 함수 구현 | `game-state.js` | 낮음 |
| 3 | `computeSpecs()` 함수 구현 (4대 스펙 산출) | `game-state.js` | 중간 |
| 4 | `getRocketScience()` 확장 | `game-state.js` | 중간 |
| 5 | `executeLaunch()` 수정 (개별 단계 성공률 적용) | `launch.js` | 중간 |
| 6 | 조립 완료 시 rollVariance 생성/저장 | `game-state.js` | 낮음 |
| 7 | 발사 전 UI에 스펙 바 그래프 + 단계별 예상 성공률 표시 | `launch.js` | 중간 |
| 8 | 발사 기록에 스펙/편차 저장 | `launch.js` | 낮음 |

### 10.2 데이터 구조 요약 (balance-data.js에 추가)

```javascript
// ── 발사 단계별 성공률 시스템 (D5) ────────────────────────────
LAUNCH_STAGES: {
  sigmoid_k: 0.08,
  sigmoid_mid: 50,
  baseFloor: 60,
  baseCeiling: 99.5,
  stageWeights: { /* 섹션 8.1 참조 */ },
},
SPEC_QUALITY_BONUS: { /* 섹션 8.2 참조 */ },
SPEC_CLASS_BONUS:   { /* 섹션 8.3 참조 */ },
SPEC_RESEARCH_BONUS:{ /* 섹션 8.4 참조 */ },
ROLL_VARIANCE:      { /* 섹션 8.5 참조 */ },
```

### 10.3 함수 시그니처

```javascript
// game-state.js
function gaussianRandom(mean, sigma) → number
function generateRollVariance(qualityId) → { structural, propulsion, avionics, thermal }
function computeSpecs(qualityId, classId, rollVariance) → { structural, propulsion, avionics, thermal }
function getStageSuccessRate(stageIdx, specs) → number (0~100)

// getRocketScience() 확장 — 기존 호출 코드와 호환 유지
function getRocketScience(qualityId, classId?, rollVariance?) → {
  deltaV, twr, reliability, altitude,  // 기존
  specs, rollVariance, stageRates, overallRate  // 신규
}
```

### 10.4 UI 표시 제안 (UI팀장 참조)

발사 통제 탭(`launch.js`)의 사전 발사 패널에 아래 정보를 추가 표시:

```
┌─────────────────────────────────────┐
│ // ROCKET SPECS                      │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░ 구조강도  74  (+3▲)  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 추진안정  87  (-2▼)  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 항전신뢰  97  (+1▲)  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░ 열방호도  84  (-5▼)  │
│                                      │
│ 예상 성공률: 89.1%                    │
│ ── 단계별 ──                          │
│ LFT 98.5 > MXQ 98.0 > MECO 98.5     │
│ SEP 98.5 > ORB 98.7 > TLI 98.6      │
│ LOI 98.8 > LAND 98.8                 │
└─────────────────────────────────────┘
```

---

## 부록 A: 실제 로켓 발사 실패 통계 참고

본 설계의 실패율 분포는 아래 실제 데이터를 참고하였다:

| 실제 실패 사례 | 단계 | 원인 |
|----------------|------|------|
| CRS-7 (2015) | MAX-Q | 헬륨 탱크 지주 파손 → 기체 분해 |
| Amos-6 (2016) | LIFTOFF (시험) | 산화제 탱크 파열 → 폭발 |
| Beresheet (2019) | LANDING | 자이로 오류 → 달 표면 충돌 |
| Zuma (2018) | STG SEP | 페어링 분리 실패 (Northrop 어댑터) |
| Mars Climate Orbiter (1999) | LOI | 단위 변환 오류 → 궤도 포획 실패 |
| Ariane 5 Flight 501 (1996) | LIFTOFF | 관성 항법 소프트웨어 오류 |

## 부록 B: 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-02-23 | 초안 작성 |
