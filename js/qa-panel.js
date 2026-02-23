/**
 * qa-panel.js — QA Debug Panel
 * 베타 환경 전용 (hostname 'beta' 포함, localhost, 127.0.0.1, 파일 직접 열기)
 * GitHub Pages (happyone7.github.io) 에서는 완전히 숨겨짐
 */

(function () {
  'use strict';

  // ── 베타 환경 감지 ─────────────────────────────────────────
  const h = window.location.hostname;
  const isQaEnv =
    h.includes('beta') ||
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '';                 // file:// 프로토콜 (로컬 직접 열기)
  if (!isQaEnv) return;       // 베타 아니면 즉시 종료

  // ── CSS 주입 ───────────────────────────────────────────────
  const _style = document.createElement('style');
  _style.textContent = `
#qa-panel {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 9999;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  user-select: none;
}
#qa-toggle {
  background: #010800;
  border: 1px solid #ffab00;
  color: #ffab00;
  padding: 3px 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #ffab0080;
  box-shadow: 0 0 8px #ffab0040;
  display: block;
}
#qa-toggle:hover { background: #1a0d00; }
#qa-body {
  margin-top: 3px;
  background: rgba(1, 8, 0, 0.96);
  border: 1px solid #ffab00;
  padding: 6px;
  box-shadow: 0 0 16px #ffab0030;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}
.qa-btn {
  background: #0a0800;
  border: 1px solid #7a5100;
  color: #c8ffd4;
  padding: 5px 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  white-space: nowrap;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.qa-btn:hover  { background: #1a1000; border-color: #ffab00; color: #ffab00; }
.qa-btn:active { background: #2a1800; }
#qa-label {
  font-size: 9px;
  color: #7a5100;
  text-align: center;
  margin-top: 3px;
  letter-spacing: 1px;
}
`;
  document.head.appendChild(_style);

  // ── 헬퍼 ──────────────────────────────────────────────────
  function _notify(msg, warn) {
    if (typeof notify === 'function') notify(msg, warn ? 'amber' : 'green');
    else console.log('[QA]', msg);
    if (typeof renderAll === 'function') renderAll();
  }

  // ── 9개 QA 함수 ───────────────────────────────────────────

  function qaAddGold() {
    gs.res.money = (gs.res.money || 0) + 1_000_000;
    _notify('[QA] $1,000,000 추가');
  }

  function qaAddCitizen() {
    gs.citizens = (gs.citizens || 0) + 10;
    _notify('[QA] 시민 +10명');
  }

  function qaRocketReady() {
    (typeof PARTS !== 'undefined' ? PARTS : []).forEach(p => {
      gs.parts[p.id] = (gs.parts[p.id] || 0) + p.cycles;
    });
    _notify('[QA] 로켓 부품 준비 완료');
  }

  function qaAddResearch() {
    gs.res.research = (gs.res.research || 0) + 50_000;
    _notify('[QA] 연구 점수 +50,000');
  }

  function qaLearnAllResearch() {
    if (typeof UPGRADES === 'undefined') { _notify('UPGRADES 없음', true); return; }
    // 1. 전체 완료 표시
    UPGRADES.forEach(u => { gs.upgrades[u.id] = true; });
    // 2. 멀티플라이어 리셋 (전역 변수 직접 접근)
    /* eslint-disable no-global-assign */
    if (typeof prodMult        !== 'undefined') prodMult        = {};
    if (typeof globalMult      !== 'undefined') globalMult      = 1;
    if (typeof partCostMult    !== 'undefined') partCostMult    = 1;
    if (typeof researchTimeMult!== 'undefined') researchTimeMult= 1;
    if (typeof fusionBonus     !== 'undefined') fusionBonus     = 0;
    if (typeof reliabilityBonus!== 'undefined') reliabilityBonus= 0;
    if (typeof slotBonus       !== 'undefined') slotBonus       = 0;
    /* eslint-enable no-global-assign */
    // 3. 효과 재적용
    UPGRADES.forEach(u => { try { u.effect(); } catch (_) {} });
    // 4. 잠금 해제 재적용
    if (typeof applyUnlocks === 'function') {
      UPGRADES.forEach(u => { if (u.unlocks) applyUnlocks(u.unlocks); });
    }
    _notify('[QA] 모든 연구 완료');
  }

  function qaUnlockAllRockets() {
    ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5'].forEach(k => {
      gs.upgrades[k] = true;
    });
    _notify('[QA] 모든 로켓 클래스 해금');
  }

  function qaInstantPrestige() {
    if (typeof executePrestige !== 'function') { _notify('executePrestige 없음', true); return; }
    // 최소 실행 조건 충족 보장
    gs.explorationPoints = Math.max(gs.explorationPoints || 0, 1);
    gs.launches          = Math.max(gs.launches          || 0, 1);
    executePrestige();
    _notify('[QA] 프레스티지 실행');
  }

  function qaAddSpaceScore() {
    gs.spaceScore      = (gs.spaceScore      || 0) + 100;
    gs.totalSpaceScore = (gs.totalSpaceScore || 0) + 100;
    _notify('[QA] 우주 탐사 점수 +100');
  }

  function qaCompleteAllBuildings() {
    const TARGET = 5;
    Object.keys(gs.buildings || {}).forEach(id => {
      gs.buildings[id] = Math.max(gs.buildings[id] || 0, TARGET);
    });
    // 관련 탭·건물 잠금 해제
    if (typeof applyUnlocks === 'function') {
      applyUnlocks([
        'bld_supply_depot', 'bld_mine', 'bld_extractor', 'bld_refinery',
        'bld_cryo_plant',   'bld_elec_lab', 'bld_fab_plant', 'bld_research_lab',
        'bld_r_and_d',      'bld_solar_array', 'bld_launch_pad', 'addon_ops_center',
        'tab_research',     'tab_assembly', 'tab_mission',
      ]);
    }
    _notify('[QA] 모든 건물 최소 ×5 완성');
  }

  // ── 버튼 정의 ─────────────────────────────────────────────
  const BUTTONS = [
    { label: '골드 추가',     fn: qaAddGold              },
    { label: '시민 추가',     fn: qaAddCitizen           },
    { label: '로켓 준비',     fn: qaRocketReady          },
    { label: '연구점수',      fn: qaAddResearch          },
    { label: '모든 연구',     fn: qaLearnAllResearch     },
    { label: '로켓 해금',     fn: qaUnlockAllRockets     },
    { label: '프레스티지',    fn: qaInstantPrestige      },
    { label: '탐사 점수',     fn: qaAddSpaceScore        },
    { label: '건물 완성',     fn: qaCompleteAllBuildings },
  ];

  // ── 패널 DOM 생성 ─────────────────────────────────────────
  function _createPanel() {
    const existing = document.getElementById('qa-panel');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id = 'qa-panel';

    // 토글 버튼
    const toggle = document.createElement('button');
    toggle.id = 'qa-toggle';
    toggle.textContent = 'QA ▲';
    toggle.addEventListener('click', () => {
      const body = document.getElementById('qa-body');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'grid';
      toggle.textContent  = open ? 'QA ▲' : 'QA ▼';
    });

    // 버튼 그리드 (초기 접힘)
    const body = document.createElement('div');
    body.id = 'qa-body';
    body.style.display = 'none';

    BUTTONS.forEach(btn => {
      const el = document.createElement('button');
      el.className   = 'qa-btn';
      el.textContent = btn.label;
      el.addEventListener('click', () => btn.fn());
      body.appendChild(el);
    });

    // 환경 표시 레이블
    const label = document.createElement('div');
    label.id = 'qa-label';
    label.textContent = '[ BETA / QA ]';

    wrap.appendChild(toggle);
    wrap.appendChild(body);
    wrap.appendChild(label);
    document.body.appendChild(wrap);
  }

  // ── 초기화 ────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _createPanel);
  } else {
    _createPanel();
  }

})();
