# Sprint 7 QA 리포트

- **작성자**: QAEngineer
- **작성일**: 2026-02-21
- **대상 브랜치**: master (sprint/7 수정 사항)
- **검증 파일**:
  - `js/world.js`
  - `js/game-data.js`

---

## 검증 항목 요약

| 항목 | 설명 | 판정 |
|------|------|------|
| P7-1 | 오버레이 팝업 위치 수정 (requestAnimationFrame) | PASS |
| P7-2 | 애드온 가격 인상 | PASS |
| P7-3 | ADDON_POSITIONS 간격 최소화 | PASS |
| P7-4 | ASCII 기반부 폭 수정 | PASS |

---

## 검증 항목 1: P7-4 ASCII 기반부 폭 수정

### 1a. wb-ops 업그레이드 변형 기반부 (6개 위치)

검증 조건:
- `' ██████████'` (1공백+10블록=11자) 존재하지 않아야 함
- 대신 `'████████████'` (12블록) 이어야 함

| 라인 | 위치 | 실제 값 | 블록 수 | 판정 |
|------|------|---------|---------|------|
| L156 | ops_premium tier>=2 | `████████████` | 12 | PASS |
| L164 | ops_premium tier<2 | `████████████` | 12 | PASS |
| L176 | ops_24h tier>=2 | `████████████` | 12 | PASS |
| L184 | ops_24h tier<2 | `████████████` | 12 | PASS |
| L195 | ops_sales tier>=2 | `████████████` | 12 | PASS |
| L203 | ops_sales tier<2 | `████████████` | 12 | PASS |

**소결론**: 모든 wb-ops 업그레이드 변형 기반부 6개 위치 전부 12블록 확인. **PASS**

---

### 1b. wb-refinery 기반부 (3개 위치)

검증 조건:
- `'███████████'` (11블록) 존재하지 않아야 함
- 대신 `'██████████'` (10블록) 이어야 함

| 라인 | 위치 | 실제 값 | 블록 수 | 판정 |
|------|------|---------|---------|------|
| L316 | refinery tier>=3 | `██████████` | 10 | PASS |
| L325 | refinery tier>=1 | `██████████` | 10 | PASS |
| L333 | refinery default | `██████████` | 10 | PASS |

**소결론**: wb-refinery 기반부 3개 위치 전부 10블록 확인. 11블록 문자열 미존재. **PASS**

---

### 1c. _scaffoldAscii 기반부

검증 조건:
- `'  ████████'` (2공백+8블록=10자) 존재하지 않아야 함
- 대신 `'  ███████'` (2공백+7블록=9자) 이어야 함

| 라인 | 위치 | 실제 값 | 전체 자수 | 판정 |
|------|------|---------|----------|------|
| L638 | _scaffoldAscii 기반부 | `  ███████` | 9 (공백2+블록7) | PASS |

**소결론**: _scaffoldAscii 기반부가 9자(2공백+7블록)로 수정됨. **PASS**

---

## 검증 항목 2: P7-1 오버레이 팝업 위치 수정

`openBldOv` 함수(js/world.js L750~L950) 검사:

```javascript
// Position — display:block 먼저 적용 후 다음 프레임에서 실제 높이 반영
const ovW = 490;
ovEl.style.width = ovW + 'px';
ovEl.style.display = 'block';
requestAnimationFrame(() => {
  const r   = el.getBoundingClientRect();
  const ovH = ovEl.offsetHeight || 260;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top  = ty + 'px';
});
```

- `display = 'block'` 설정 후 `requestAnimationFrame` 내부에서 `getBoundingClientRect()` 및 `offsetHeight`를 참조하는 방식 적용됨.
- 동일 패턴이 `openAddonOv`(L1057~L1071), `openGhostOv`(L1230~L1244)에도 일관 적용되어 있음.
- 팝업이 실제 렌더링 높이를 반영하여 위치를 계산하므로 위치 오류가 해소됨.

**판정: PASS**

---

## 검증 항목 3: P7-2 애드온 가격 인상

`js/game-data.js` BUILDING_ADDONS 첫 구매 비용 목록:

| 애드온 ID | 이름 | 비용 | 5,000 이상 여부 |
|-----------|------|------|-----------------|
| addon_inv_bank | 투자 은행 | `{money: 5000}` | YES (5,000) |
| addon_tech_hub | 기술 스타트업 허브 | `{money: 8000}` | YES (8,000) |
| addon_launch_ctrl | 발사 제어 타워 | `{money: 15000, electronics: 1500}` | YES (15,000) |
| addon_vif | 수직 통합 시설 | `{money: 15000, metal: 2000}` | YES (15,000) |

모든 첫 구매 비용이 5,000 이상이며, 기존 800~2,000 수준에서 전면 인상되었음. 최저가 `addon_inv_bank`의 5,000도 기존 최고가(2,000)보다 2.5배 높아짐.

**판정: PASS**

---

## 검증 항목 4: P7-3 ADDON_POSITIONS 간격 최소화

`js/world.js` L15~L18:

```javascript
const ADDON_POSITIONS = {
  ops_center:  940,   // 860 + 12자×6.6px ≈ 79px → 940
  launch_pad: 2800,   // 2700 + 15자×6.6px ≈ 99px → 2800
};
```

| 키 | 현재 값 | 기준값 | 판정 |
|----|---------|--------|------|
| ops_center | 940 | 940 (기존 1030에서 수정) | PASS |
| launch_pad | 2800 | 2800 (기존 2870에서 수정) | PASS |

주석에 계산 근거(`12자×6.6px ≈ 79px`, `15자×6.6px ≈ 99px`)도 명시되어 있어 의도적 수정임이 확인됨.

**판정: PASS**

---

## 최종 판정

| 항목 | 판정 |
|------|------|
| P7-1 오버레이 팝업 위치 수정 | **PASS** |
| P7-2 애드온 가격 인상 | **PASS** |
| P7-3 ADDON_POSITIONS 간격 최소화 | **PASS** |
| P7-4 ASCII 기반부 폭 수정 (1a/1b/1c) | **PASS** |

## 종합 판정: **PASS**

Sprint 7 수정 사항 P7-1~P7-4 전 항목 검증 통과. sprint/7 → master 머지 승인.
