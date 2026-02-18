---
name: idle-game-engine
description: 방치형(Idle) 게임의 핵심 엔진 패턴 - 자원 생산, 건물 시스템, 오프라인 진행, localStorage 저장/불러오기
---

# Idle Game Engine Skill

이 스킬은 방치형 게임을 구현할 때 사용하는 공통 패턴을 정의합니다.

## 핵심 구조

### 게임 상태 (GameState)
```javascript
const gameState = {
  resources: { metal: 0, fuel: 0, electronics: 0, research: 0 },
  production: { metal: 0, fuel: 0, electronics: 0, research: 0 },
  buildings: { mine: 0, refinery: 0, electronicsLab: 0, researchLab: 0 },
  upgrades: {},
  lastSave: Date.now(),
  lastTick: Date.now(),
};
```

### 생산 루프 (Game Loop)
- `setInterval`으로 100~500ms마다 tick 실행
- 각 tick에서 `deltaTime`(초) 계산 후 자원 += 생산량 × deltaTime
- UI는 별도 requestAnimationFrame으로 업데이트

### 건물 가격 공식
```javascript
function getBuildingCost(building, count) {
  return Math.floor(BASE_COST[building] * Math.pow(1.15, count));
}
```

### 오프라인 진행
```javascript
function calculateOfflineProgress() {
  const now = Date.now();
  const elapsed = Math.min((now - gameState.lastTick) / 1000, 8 * 3600); // 최대 8시간
  applyProduction(elapsed);
  gameState.lastTick = now;
}
```

### localStorage 저장
```javascript
function saveGame() {
  gameState.lastSave = Date.now();
  localStorage.setItem('moonIdle_save', JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem('moonIdle_save');
  if (saved) {
    Object.assign(gameState, JSON.parse(saved));
    calculateOfflineProgress();
  }
}
```

## 숫자 포맷팅
```javascript
function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toString();
}
```

## 업그레이드 시스템
- 업그레이드는 `{ id, name, cost, effect, unlocked, purchased }` 구조
- 효과는 생산 배율 또는 비용 감소로 적용
- 연구 포인트로 구매

## 주의사항
- 부동소수점 누적 오류 방지: 자원 저장 시 소수점 유지, 표시 시에만 반올림
- 게임 루프는 페이지 숨김(visibilitychange) 시 일시정지 권장
