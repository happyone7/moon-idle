// ============================================================
//  AUTOMATION TAB — D6 개편: 8개 모듈 + 세부 설정 시스템
//  연구 Branch O 해금 → 즉시 Automation 탭에 등장 → 세부 설정
// ============================================================

let _autoTickCounter = 0;
const AUTO_INTERVAL_SLOW = 5;   // 건물·인원 (5tick = ~1s)
const AUTO_INTERVAL_FAST = 2;   // 파트·조립·발사 (2tick = ~0.4s)
let _autoSelectedModule = 'worker';
let _autoPrestigeTimestamp = Date.now(); // 마지막 프레스티지 시점
let _autoLaunchCooldownEnd = 0;         // 발사 쿨다운 종료 시점

// D6 모듈 정의
const AUTO_MODULE_DEFS = [
  { id:'worker',   label:'인원 배치',   icon:'[WK]', research:'auto_worker' },
  { id:'build',    label:'건설 관리',   icon:'[BD]', research:'auto_build' },
  { id:'parts',    label:'부품 제작',   icon:'[PT]', research:'auto_parts' },
  { id:'assembly', label:'로켓 조립',   icon:'[AS]', research:'auto_assembly' },
  { id:'fuel',     label:'연료 주입',   icon:'[FL]', research:'auto_fuel' },
  { id:'launch',   label:'발사 통제',   icon:'[LC]', research:'auto_launch' },
  { id:'research', label:'연구 큐',     icon:'[RS]', research:'auto_research' },
  { id:'prestige', label:'프레스티지', icon:'[PR]', research:'auto_prestige' },
];

// ─── 모듈 해금 여부 ──────────────────────────────────────────
function isAutoModuleUnlocked(moduleId) {
  const def = AUTO_MODULE_DEFS.find(m => m.id === moduleId);
  if (!def) return false;
  return !!(gs.upgrades && gs.upgrades[def.research]);
}

// ─── 모듈 활성 여부 (해금 + 토글 ON) ────────────────────────
function isAutoModuleOn(moduleId) {
  if (!isAutoModuleUnlocked(moduleId)) return false;
  return !!(gs.autoConfig && gs.autoConfig[moduleId] && gs.autoConfig[moduleId].enabled);
}

// ─── 모듈 토글 ───────────────────────────────────────────────
function toggleAutoModule(moduleId) {
  if (!isAutoModuleUnlocked(moduleId)) return;
  if (!gs.autoConfig) gs.autoConfig = {};
  if (!gs.autoConfig[moduleId]) gs.autoConfig[moduleId] = {};
  gs.autoConfig[moduleId].enabled = !gs.autoConfig[moduleId].enabled;
  saveGame();
  renderAutomationTab();
}

// ─── autoConfig 값 설정 ──────────────────────────────────────
function setAutoConfigValue(moduleId, key, value) {
  if (!gs.autoConfig) gs.autoConfig = {};
  if (!gs.autoConfig[moduleId]) gs.autoConfig[moduleId] = {};
  gs.autoConfig[moduleId][key] = value;
  saveGame();
}

// ─── 모듈 선택 ───────────────────────────────────────────────
function selectAutoModule(moduleId) {
  _autoSelectedModule = moduleId;
  renderAutomationTab();
}

// ============================================================
//  RENDER: AUTOMATION TAB
// ============================================================
function renderAutomationTab() {
  const pane = document.getElementById('pane-automation');
  if (!pane) return;

  const cfg = gs.autoConfig || {};

  // ── 헤더 ──
  let html = `<div class="at-header">
    <div class="at-title">// AUTOMATION — D6 자동화 시스템</div>
    <div class="at-ms-balance">EP ${gs.explorationPoints||0} &nbsp;|&nbsp; ★ SS ${gs.spaceScore||0}</div>
  </div>`;

  // ── 사이드바 + 메인 패널 ──
  html += `<div style="display:flex;gap:12px;margin-top:8px;">`;

  // 사이드바
  html += `<div style="min-width:160px;flex-shrink:0;">`;
  AUTO_MODULE_DEFS.forEach(m => {
    const unlocked = isAutoModuleUnlocked(m.id);
    const enabled  = isAutoModuleOn(m.id);
    const selected = _autoSelectedModule === m.id;
    let status = '🔒';
    let statusColor = 'var(--green-dim)';
    if (unlocked) {
      if (enabled) { status = '✓'; statusColor = 'var(--green)'; }
      else         { status = '○'; statusColor = 'var(--amber)'; }
    }
    const borderColor = selected ? 'var(--cyan)' : unlocked ? 'var(--green-deep)' : '#333';
    const bgColor = selected ? 'rgba(0,229,255,0.05)' : 'transparent';
    html += `<div onclick="${unlocked ? `selectAutoModule('${m.id}')` : ''}" style="cursor:${unlocked?'pointer':'default'};padding:6px 8px;margin-bottom:4px;border:1px solid ${borderColor};background:${bgColor};font-size:12px;display:flex;align-items:center;gap:6px;opacity:${unlocked?1:0.4}">
      <span style="color:${statusColor};font-size:10px">${status}</span>
      <span style="color:${unlocked?'var(--text-primary)':'var(--green-dim)'}">${m.icon} ${m.label}</span>
    </div>`;
  });
  // 대시보드 링크
  html += `<div onclick="selectAutoModule('dashboard')" style="cursor:pointer;padding:6px 8px;margin-top:8px;border:1px solid ${_autoSelectedModule==='dashboard'?'var(--cyan)':'var(--green-deep)'};background:${_autoSelectedModule==='dashboard'?'rgba(0,229,255,0.05)':'transparent'};font-size:12px;">
    <span style="color:var(--cyan)">[D] 대시보드</span>
  </div>`;
  html += `</div>`;

  // 메인 패널
  html += `<div style="flex:1;border:var(--border);padding:12px;min-height:300px;">`;
  if (_autoSelectedModule === 'dashboard') {
    html += _renderDashboardPanel();
  } else {
    html += _renderModulePanel(_autoSelectedModule, cfg);
  }
  html += `</div>`;

  html += `</div>`; // flex container end

  pane.innerHTML = html;
}

// ── 모듈 상세 패널 렌더링 ─────────────────────────────────────
function _renderModulePanel(moduleId, cfg) {
  const def = AUTO_MODULE_DEFS.find(m => m.id === moduleId);
  if (!def) return '<div style="color:var(--green-dim)">모듈을 선택하세요</div>';
  const unlocked = isAutoModuleUnlocked(moduleId);
  if (!unlocked) return `<div style="color:var(--green-dim)">🔒 "${def.label}" — 연구 "${def.research}" 완료 필요</div>`;

  const mc = cfg[moduleId] || {};
  const enabled = mc.enabled;
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <span style="font-size:14px;letter-spacing:2px;color:var(--cyan)">${def.icon} ${def.label} 자동화</span>
    <button onclick="toggleAutoModule('${moduleId}')" style="padding:4px 12px;font-size:12px;cursor:pointer;background:${enabled?'rgba(0,230,118,0.1)':'rgba(255,23,68,0.1)'};border:1px solid ${enabled?'var(--green)':'var(--red)'};color:${enabled?'var(--green)':'var(--red)'}">${enabled?'[ ON ]':'[OFF]'}</button>
  </div>`;

  switch (moduleId) {
    case 'worker':   html += _renderWorkerSettings(mc); break;
    case 'build':    html += _renderBuildSettings(mc); break;
    case 'parts':    html += _renderPartsSettings(mc); break;
    case 'assembly': html += _renderAssemblySettings(mc); break;
    case 'fuel':     html += _renderFuelSettings(mc); break;
    case 'launch':   html += _renderLaunchSettings(mc); break;
    case 'research': html += _renderResearchSettings(mc); break;
    case 'prestige': html += _renderPrestigeSettings(mc); break;
  }
  return html;
}

// ── 인원 배치 설정 ────────────────────────────────────────────
function _renderWorkerSettings(mc) {
  const ratios = mc.ratios || {};
  const builtBlds = (typeof BUILDINGS !== 'undefined' ? BUILDINGS : []).filter(b => (gs.buildings[b.id]||0)>0 && b.produces !== 'bonus');
  let html = `<div style="font-size:11px;color:var(--green-mid);margin-bottom:8px">건물별 인원 배치 비율 (%) — 합계 100% 권장</div>`;
  builtBlds.forEach(b => {
    const val = ratios[b.id] || 0;
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    const cap = (gs.buildings[b.id]||0) + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id])||0);
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:12px;">
      <span style="min-width:100px;color:var(--text-primary)">${b.name}</span>
      <input type="range" min="0" max="100" value="${val}" style="flex:1" onchange="setAutoConfigValue('worker','ratios',Object.assign(gs.autoConfig.worker.ratios||{},{'${b.id}':parseInt(this.value)}));renderAutomationTab()">
      <span style="min-width:35px;color:var(--cyan)">${val}%</span>
      <span style="min-width:40px;color:var(--green-dim)">${assigned}/${cap}</span>
    </div>`;
  });
  html += `<div style="margin-top:8px;display:flex;gap:12px;font-size:12px;">
    <label>최소 유휴 인원: <input type="number" min="0" max="99" value="${mc.minIdleWorkers||0}" style="width:40px" onchange="setAutoConfigValue('worker','minIdleWorkers',parseInt(this.value))"></label>
    <label><input type="checkbox" ${mc.autoRedistribute?'checked':''} onchange="setAutoConfigValue('worker','autoRedistribute',this.checked)"> 자동 재배치</label>
  </div>`;
  return html;
}

// ── 건설 관리 설정 ────────────────────────────────────────────
function _renderBuildSettings(mc) {
  let html = `<div style="font-size:12px;display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
    <label>최대 지출 비율: <input type="range" min="10" max="100" value="${mc.maxSpendRatio||50}" style="width:100px" onchange="setAutoConfigValue('build','maxSpendRatio',parseInt(this.value));renderAutomationTab()"> <span style="color:var(--cyan)">${mc.maxSpendRatio||50}%</span></label>
    <label><input type="checkbox" ${mc.autoUpgrade?'checked':''} onchange="setAutoConfigValue('build','autoUpgrade',this.checked)"> 자동 업그레이드</label>
    <label>최대 Lv: <input type="number" min="1" max="20" value="${mc.maxUpgradeLevel||5}" style="width:40px" onchange="setAutoConfigValue('build','maxUpgradeLevel',parseInt(this.value))"></label>
  </div>`;
  const blds = mc.buildings || {};
  const allBlds = (typeof BUILDINGS !== 'undefined' ? BUILDINGS : []).filter(b => gs.unlocks && gs.unlocks['bld_'+b.id]);
  html += `<div style="font-size:11px;color:var(--green-mid);margin-bottom:4px">건물별 자동 건설 설정</div>`;
  allBlds.forEach(b => {
    const bc = blds[b.id] || { active:true, maxCount:10 };
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;font-size:12px;">
      <input type="checkbox" ${bc.active!==false?'checked':''} onchange="let bb=gs.autoConfig.build.buildings||{};if(!bb['${b.id}'])bb['${b.id}']={active:true,maxCount:10};bb['${b.id}'].active=this.checked;setAutoConfigValue('build','buildings',bb);renderAutomationTab()">
      <span style="min-width:100px">${b.name}</span>
      <span style="color:var(--green-dim)">${gs.buildings[b.id]||0}동</span>
      <label style="font-size:11px">최대: <input type="number" min="0" max="50" value="${bc.maxCount||10}" style="width:40px" onchange="let bb=gs.autoConfig.build.buildings||{};if(!bb['${b.id}'])bb['${b.id}']={active:true,maxCount:10};bb['${b.id}'].maxCount=parseInt(this.value);setAutoConfigValue('build','buildings',bb)"></label>
    </div>`;
  });
  return html;
}

// ── 부품 제작 설정 ────────────────────────────────────────────
function _renderPartsSettings(mc) {
  const parts = (typeof PARTS !== 'undefined' ? PARTS : []);
  const targets = mc.targets || {};
  const reserves = mc.reserves || {};
  let html = `<div style="font-size:11px;color:var(--green-mid);margin-bottom:4px">부품별 목표 수량</div>`;
  parts.forEach(p => {
    const cur = gs.parts[p.id] || 0;
    const tgt = targets[p.id] !== undefined ? targets[p.id] : p.cycles;
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;font-size:12px;">
      <span style="min-width:100px">${p.name}</span>
      <span style="color:var(--green-dim)">${cur}/${tgt}</span>
      <label>목표: <input type="number" min="0" max="999" value="${tgt}" style="width:50px" onchange="let tt=gs.autoConfig.parts.targets||{};tt['${p.id}']=parseInt(this.value);setAutoConfigValue('parts','targets',tt)"></label>
    </div>`;
  });
  html += `<div style="margin-top:8px;font-size:11px;color:var(--green-mid);margin-bottom:4px">자원 유보량 (이 아래로 소비 안 함)</div>`;
  ['iron','copper','fuel','electronics'].forEach(r => {
    html += `<label style="font-size:12px;margin-right:12px">${r}: <input type="number" min="0" value="${reserves[r]||0}" style="width:60px" onchange="let rr=gs.autoConfig.parts.reserves||{};rr['${r}']=parseInt(this.value);setAutoConfigValue('parts','reserves',rr)"></label>`;
  });
  html += `<div style="margin-top:8px"><label style="font-size:12px"><input type="checkbox" ${mc.continuousCraft!==false?'checked':''} onchange="setAutoConfigValue('parts','continuousCraft',this.checked)"> 연속 제작 모드</label></div>`;
  return html;
}

// ── 로켓 조립 설정 ────────────────────────────────────────────
function _renderAssemblySettings(mc) {
  const classes = typeof ROCKET_CLASSES !== 'undefined' ? ROCKET_CLASSES : [{id:'vega',name:'Vega'}];
  const qualities = typeof QUALITIES !== 'undefined' ? QUALITIES : [{id:'proto',name:'프로토타입'}];
  let html = `<div style="font-size:12px;display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
    <label>기본 클래스: <select onchange="setAutoConfigValue('assembly','defaultClass',this.value);renderAutomationTab()">
      ${classes.map(c => `<option value="${c.id}" ${mc.defaultClass===c.id?'selected':''}>${c.name}</option>`).join('')}
    </select></label>
    <label>기본 품질: <select onchange="setAutoConfigValue('assembly','defaultQuality',this.value);renderAutomationTab()">
      ${qualities.map(q => `<option value="${q.id}" ${mc.defaultQuality===q.id?'selected':''}>${q.name}</option>`).join('')}
    </select></label>
  </div>`;
  html += `<div style="font-size:12px;display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
    <label>최소 예상 성공률: <input type="number" min="0" max="99" value="${mc.minSuccessRate||0}" style="width:40px" onchange="setAutoConfigValue('assembly','minSuccessRate',parseInt(this.value))">%</label>
    <label><input type="checkbox" ${mc.autoFuelAfter!==false?'checked':''} onchange="setAutoConfigValue('assembly','autoFuelAfter',this.checked)"> 조립 후 자동 연료 주입</label>
  </div>`;
  // 조건부 규칙은 향후 구현 (현재는 기본 클래스/품질로만 동작)
  html += `<div style="font-size:11px;color:var(--green-dim);margin-top:8px">조건부 규칙 (향후 추가 예정)</div>`;
  return html;
}

// ── 연료 주입 설정 ────────────────────────────────────────────
function _renderFuelSettings(mc) {
  return `<div style="font-size:12px;display:flex;flex-direction:column;gap:8px;">
    <label><input type="checkbox" ${mc.autoStart!==false?'checked':''} onchange="setAutoConfigValue('fuel','autoStart',this.checked)"> 자동 주입 시작</label>
    <label>목표 주입량: <input type="range" min="25" max="100" value="${mc.targetPercent||100}" style="width:150px" onchange="setAutoConfigValue('fuel','targetPercent',parseInt(this.value));renderAutomationTab()"> <span style="color:var(--cyan)">${mc.targetPercent||100}%</span></label>
    <label>최소 연료 유보: <input type="number" min="0" value="${mc.minFuelReserve||0}" style="width:60px" onchange="setAutoConfigValue('fuel','minFuelReserve',parseInt(this.value))"></label>
  </div>`;
}

// ── 발사 통제 설정 ────────────────────────────────────────────
function _renderLaunchSettings(mc) {
  return `<div style="font-size:12px;display:flex;flex-direction:column;gap:8px;">
    <label>최소 전체 성공률: <input type="number" min="0" max="99" value="${mc.minOverallRate||50}" style="width:50px" onchange="setAutoConfigValue('launch','minOverallRate',parseInt(this.value))">%</label>
    <label>최소 단계별 성공률: <input type="number" min="0" max="99" value="${mc.minStageRate||0}" style="width:50px" onchange="setAutoConfigValue('launch','minStageRate',parseInt(this.value))">%</label>
    <label>최소 EP 기대치: <input type="number" min="0" value="${mc.minExpectedEP||0}" style="width:50px" onchange="setAutoConfigValue('launch','minExpectedEP',parseInt(this.value))"></label>
    <label>발사 간 쿨다운: <input type="number" min="0" max="3600" value="${mc.cooldownSec||0}" style="width:60px" onchange="setAutoConfigValue('launch','cooldownSec',parseInt(this.value))">초</label>
    <label><input type="checkbox" ${mc.retryOnFail!==false?'checked':''} onchange="setAutoConfigValue('launch','retryOnFail',this.checked)"> 실패 시 자동 재시도</label>
  </div>`;
}

// ── 연구 큐 설정 ──────────────────────────────────────────────
function _renderResearchSettings(mc) {
  let html = `<div style="font-size:12px;display:flex;flex-direction:column;gap:8px;">
    <label><input type="checkbox" ${mc.autoQueue?'checked':''} onchange="setAutoConfigValue('research','autoQueue',this.checked)"> 자동 큐 채우기</label>
  </div>`;
  html += `<div style="font-size:11px;color:var(--green-mid);margin-top:8px">연구 우선순위 리스트는 연구 탭에서 관리</div>`;
  const reserves = mc.reserves || {};
  html += `<div style="margin-top:8px;font-size:11px;color:var(--green-mid);margin-bottom:4px">자원 유보량</div>`;
  ['research','electronics'].forEach(r => {
    html += `<label style="font-size:12px;margin-right:12px">${r}: <input type="number" min="0" value="${reserves[r]||0}" style="width:60px" onchange="let rr=gs.autoConfig.research.reserves||{};rr['${r}']=parseInt(this.value);setAutoConfigValue('research','reserves',rr)"></label>`;
  });
  return html;
}

// ── 프레스티지 설정 ───────────────────────────────────────────
function _renderPrestigeSettings(mc) {
  const ep = gs.explorationPoints || 0;
  const ss = gs.spaceScore || 0;
  const mult = typeof getPrestigeMultiplier === 'function' ? getPrestigeMultiplier() : 1;
  const ssGain = Math.floor(ep * mult);
  const ssMult = ss > 0 ? (ssGain / ss) : ssGain;
  const elapsed = Math.floor((Date.now() - _autoPrestigeTimestamp) / 1000);
  return `<div style="font-size:12px;display:flex;flex-direction:column;gap:8px;">
    <label>최소 EP 획득량: <input type="number" min="1" value="${mc.minEPGain||100}" style="width:60px" onchange="setAutoConfigValue('prestige','minEPGain',parseInt(this.value))"></label>
    <label>최소 SS 배수: <input type="number" min="1" step="0.1" value="${mc.minSSMultiplier||2.0}" style="width:60px" onchange="setAutoConfigValue('prestige','minSSMultiplier',parseFloat(this.value))">×</label>
    <label>최소 경과 시간: <input type="number" min="0" max="36000" value="${mc.minTimeSec||300}" style="width:60px" onchange="setAutoConfigValue('prestige','minTimeSec',parseInt(this.value))">초</label>
    <label>최소 발사 횟수: <input type="number" min="0" value="${mc.minLaunches||10}" style="width:50px" onchange="setAutoConfigValue('prestige','minLaunches',parseInt(this.value))"></label>
    <div style="margin-top:8px;padding:8px;border:var(--border);font-size:11px;color:var(--green-mid)">
      EP: ${ep} | 예상 SS: +${ssGain} | 현재 SS: ${ss} | 배수: ×${ssMult.toFixed(2)}<br>
      경과: ${elapsed}초 | 발사: ${gs.launches||0}회
    </div>
  </div>`;
}

// ── 대시보드 패널 ─────────────────────────────────────────────
function _renderDashboardPanel() {
  const ep = gs.explorationPoints || 0;
  const ss = gs.spaceScore || 0;
  const launches = gs.launches || 0;
  const successes = gs.successfulLaunches || 0;
  const rate = launches > 0 ? (successes / launches * 100).toFixed(0) : '--';
  const elapsed = Math.floor((Date.now() - _autoPrestigeTimestamp) / 1000);
  const mm = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  let html = `<div style="font-size:14px;letter-spacing:2px;color:var(--cyan);margin-bottom:12px">[D] 자동화 대시보드</div>`;
  html += `<div style="font-size:12px;border:var(--border);padding:8px;margin-bottom:8px;">
    <div style="color:var(--green-mid);margin-bottom:4px">// 이번 세션 통계</div>
    발사: ${launches} | 성공: ${successes} (${rate}%) | EP: ${ep} | SS: ${ss}<br>
    경과: ${mm}분 ${secs}초
  </div>`;

  // 모듈 상태 요약
  html += `<div style="font-size:12px;border:var(--border);padding:8px;">
    <div style="color:var(--green-mid);margin-bottom:4px">// 모듈 상태</div>`;
  AUTO_MODULE_DEFS.forEach(m => {
    const unlocked = isAutoModuleUnlocked(m.id);
    const on = isAutoModuleOn(m.id);
    const status = !unlocked ? '🔒 잠김' : on ? '<span style="color:var(--green)">✓ 활성</span>' : '<span style="color:var(--amber)">○ 비활성</span>';
    html += `<div style="display:flex;justify-content:space-between;padding:2px 0">${m.icon} ${m.label} <span>${status}</span></div>`;
  });
  html += `</div>`;
  return html;
}

// ============================================================
//  AUTOMATION EXECUTION — tick마다 호출
// ============================================================
function runAutomation() {
  _autoTickCounter++;
  const slowTick = (_autoTickCounter % AUTO_INTERVAL_SLOW === 0);
  const fastTick = (_autoTickCounter % AUTO_INTERVAL_FAST === 0);

  // ── Module 1: 인원 배치 ──
  if (slowTick && isAutoModuleOn('worker')) {
    _execAutoWorker();
  }

  // ── Module 2: 건설 관리 ──
  if (slowTick && isAutoModuleOn('build')) {
    _execAutoBuild();
  }

  // ── Module 3: 부품 제작 ──
  if (fastTick && isAutoModuleOn('parts')) {
    _execAutoParts();
  }

  // ── Module 4: 로켓 조립 (클래스/품질 선택) ──
  if (fastTick && isAutoModuleOn('assembly')) {
    _execAutoAssembly();
  }

  // ── Module 5: 연료 주입 ──
  if (fastTick && isAutoModuleOn('fuel')) {
    _execAutoFuel();
  }

  // ── Module 6: 발사 통제 ──
  if (fastTick && isAutoModuleOn('launch')) {
    _execAutoLaunch();
  }

  // ── Module 7: 연구 큐 ──
  if (slowTick && isAutoModuleOn('research')) {
    _execAutoResearch();
  }

  // ── Module 8: 프레스티지 ──
  if (slowTick && isAutoModuleOn('prestige')) {
    _execAutoPrestige();
  }
}

// ── 인원 배치 실행 ────────────────────────────────────────────
function _execAutoWorker() {
  const mc = gs.autoConfig.worker || {};
  const avail = typeof getAvailableWorkers === 'function' ? getAvailableWorkers() : 0;
  const minIdle = mc.minIdleWorkers || 0;
  const distributable = Math.max(0, avail - minIdle);
  if (distributable <= 0) return;

  const ratios = mc.ratios || {};
  const builtBlds = (typeof BUILDINGS !== 'undefined' ? BUILDINGS : []).filter(b => (gs.buildings[b.id]||0)>0 && b.produces !== 'bonus');
  const totalRatio = builtBlds.reduce((s, b) => s + (ratios[b.id] || 0), 0);
  if (totalRatio <= 0) {
    // 비율 미설정 시 균등 분배
    builtBlds.forEach(b => {
      const cap = (gs.buildings[b.id]||0) + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id])||0);
      const cur = (gs.assignments && gs.assignments[b.id]) || 0;
      const add = Math.min(1, cap - cur);
      if (add > 0 && distributable > 0) {
        if (!gs.assignments) gs.assignments = {};
        gs.assignments[b.id] = cur + add;
      }
    });
    return;
  }

  let remaining = distributable;
  builtBlds.forEach(b => {
    if (remaining <= 0) return;
    const ratio = (ratios[b.id] || 0) / totalRatio;
    const cap = (gs.buildings[b.id]||0) + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id])||0);
    const cur = (gs.assignments && gs.assignments[b.id]) || 0;
    const target = Math.floor(ratio * distributable);
    const add = Math.min(target, cap - cur, remaining);
    if (add > 0) {
      if (!gs.assignments) gs.assignments = {};
      gs.assignments[b.id] = cur + add;
      remaining -= add;
    }
  });
}

// ── 건설 관리 실행 ────────────────────────────────────────────
function _execAutoBuild() {
  const mc = gs.autoConfig.build || {};
  const maxSpendRatio = (mc.maxSpendRatio || 50) / 100;
  const maxSpend = Math.floor((gs.res.money || 0) * maxSpendRatio);
  const bldConfigs = mc.buildings || {};

  const affordable = (typeof BUILDINGS !== 'undefined' ? BUILDINGS : [])
    .filter(b => {
      if (!(gs.unlocks && gs.unlocks['bld_'+b.id])) return false;
      const bc = bldConfigs[b.id] || { active:true, maxCount:10 };
      if (bc.active === false) return false;
      if ((gs.buildings[b.id]||0) >= (bc.maxCount||10)) return false;
      const cost = typeof getBuildingCost === 'function' ? getBuildingCost(b) : b.cost;
      return canAfford(cost) && (cost.money||0) <= maxSpend;
    })
    .sort((a, b) => ((typeof getBuildingCost==='function'?getBuildingCost(a):a.cost).money||0) - ((typeof getBuildingCost==='function'?getBuildingCost(b):b.cost).money||0));

  if (affordable.length > 0) {
    const b = affordable[0];
    const cost = typeof getBuildingCost === 'function' ? getBuildingCost(b) : b.cost;
    spend(cost);
    gs.buildings[b.id] = (gs.buildings[b.id]||0) + 1;
    if (typeof syncWorkerDots === 'function') syncWorkerDots();
    notify(`[AUTO] ${b.icon} ${b.name} 자동 건설`, 'amber');
  }

  // 자동 업그레이드
  if (mc.autoUpgrade) {
    const maxLv = mc.maxUpgradeLevel || 5;
    (typeof BUILDINGS !== 'undefined' ? BUILDINGS : []).forEach(b => {
      if ((gs.buildings[b.id]||0) === 0) return;
      const curLv = (gs.bldStatLevels && gs.bldStatLevels[b.id]) || 0;
      if (curLv >= maxLv) return;
      const upgCost = typeof getBldUpgradeCost === 'function' ? getBldUpgradeCost(b.id) : null;
      if (upgCost && canAfford(upgCost) && (upgCost.money||0) <= maxSpend) {
        spend(upgCost);
        if (!gs.bldStatLevels) gs.bldStatLevels = {};
        gs.bldStatLevels[b.id] = curLv + 1;
      }
    });
  }
}

// ── 부품 제작 실행 ────────────────────────────────────────────
function _execAutoParts() {
  const mc = gs.autoConfig.parts || {};
  const targets = mc.targets || {};
  const reserves = mc.reserves || {};
  const parts = typeof PARTS !== 'undefined' ? PARTS : [];

  parts.forEach(p => {
    const cur = gs.parts[p.id] || 0;
    const tgt = targets[p.id] !== undefined ? targets[p.id] : p.cycles;
    if (cur >= tgt && !(mc.continuousCraft !== false)) return;
    if (gs.mfgActive && gs.mfgActive[p.id]) return;
    // 자원 유보 체크
    let reserveOk = true;
    Object.entries(reserves).forEach(([resId, minAmt]) => {
      if ((gs.res[resId]||0) < (minAmt||0)) reserveOk = false;
    });
    if (!reserveOk) return;
    if (typeof craftPartCycle === 'function') craftPartCycle(p.id);
  });
}

// ── 로켓 조립 실행 ────────────────────────────────────────────
function _execAutoAssembly() {
  const mc = gs.autoConfig.assembly || {};
  // 현재 선택 클래스/품질을 autoConfig 기본값으로 덮어쓰기
  if (gs.assembly) {
    gs.assembly.selectedClass = mc.defaultClass || 'vega';
    gs.assembly.selectedQuality = mc.defaultQuality || 'proto';
  }
}

// ── 연료 주입 실행 ────────────────────────────────────────────
function _execAutoFuel() {
  const mc = gs.autoConfig.fuel || {};
  if (!mc.autoStart) return;
  const targetPct = mc.targetPercent || 100;
  const curPct = gs.fuelInjection || 0;
  if (curPct >= targetPct) return;
  // 최소 연료 유보 체크
  if ((gs.res.fuel||0) < (mc.minFuelReserve||0)) return;
  // 연료 주입 진행 (game-state.js의 기존 연료 주입 로직 활용)
  if (typeof injectFuel === 'function' && !gs.fuelInjecting) {
    injectFuel();
  }
}

// ── 발사 통제 실행 ────────────────────────────────────────────
function _execAutoLaunch() {
  if (launchInProgress) return;
  // 쿨다운 체크
  if (Date.now() < _autoLaunchCooldownEnd) return;

  const mc = gs.autoConfig.launch || {};
  const canAutoLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  if (!canAutoLaunch) return;

  const q = typeof getQuality === 'function' ? getQuality(gs.assembly.selectedQuality || 'proto') : null;
  if (!q) return;
  const classId = gs.assembly.selectedClass || 'vega';
  const sci = typeof getRocketScience === 'function' ? getRocketScience(q.id, classId) : null;
  if (!sci) return;

  // 성공률 체크
  if (sci.overallRate < (mc.minOverallRate || 0)) return;
  // 단계별 성공률 체크
  if (mc.minStageRate > 0 && sci.stageRates) {
    for (let i = 4; i <= 11; i++) {
      if ((sci.stageRates[i]||0) < mc.minStageRate) return;
    }
  }
  // EP 기대치 체크
  const expectedEP = typeof getExplorationReward === 'function' ? getExplorationReward(q.id) : 0;
  if (expectedEP < (mc.minExpectedEP || 0)) return;

  // 발사 실행 (D5 per-stage)
  const rv = typeof generateRollVariance === 'function' ? generateRollVariance(q.id) : {};
  const sciRoll = typeof getRocketScience === 'function' ? getRocketScience(q.id, classId, rv) : sci;
  const isFirstLaunch = gs.launches === 0;
  let firstFailStage = -1;
  for (let i = 4; i <= 11; i++) {
    const rate = isFirstLaunch ? 100 : sciRoll.stageRates[i];
    if (Math.random() * 100 >= rate) { firstFailStage = i; break; }
  }
  const rollSuccess = firstFailStage === -1;
  const earned = rollSuccess ? (typeof getExplorationReward === 'function' ? getExplorationReward(q.id) : 0) : 0;

  // 부품+연료 초기화
  gs.parts = { hull:0, engine:0, propellant:0, pump_chamber:0 };
  gs.fuelInjection = 0;
  gs.fuelLoaded = false;
  gs.fuelInjecting = false;
  gs.mfgActive = {};

  gs.launches++;
  if (rollSuccess) gs.successfulLaunches = (gs.successfulLaunches||0) + 1;
  if (earned > 0) gs.explorationPoints = (gs.explorationPoints||0) + earned;

  gs.history.push({
    no: gs.launches, quality: q.name, qualityId: q.id, rocketClass: classId,
    deltaV: sciRoll.deltaV.toFixed(2), altitude: rollSuccess ? Math.floor(sciRoll.altitude) : 0,
    reliability: sciRoll.reliability.toFixed(1), overallRate: sciRoll.overallRate.toFixed(1),
    specs: sciRoll.specs, stageRates: sciRoll.stageRates,
    success: rollSuccess, earned, failStage: firstFailStage, date: `D+${gs.launches*2}`,
  });

  const icon = rollSuccess ? '✓' : '✗';
  notify(`[AUTO] ${q.icon} 자동 발사 ${icon}${rollSuccess ? ` +${earned}EP` : ''}`, rollSuccess ? 'amber' : 'red');

  // 쿨다운 설정
  _autoLaunchCooldownEnd = Date.now() + (mc.cooldownSec || 0) * 1000;
}

// ── 연구 큐 실행 ──────────────────────────────────────────────
function _execAutoResearch() {
  const mc = gs.autoConfig.research || {};
  if (!mc.autoQueue) return;
  // 연구 큐에 빈 자리가 있으면 자동 추가 (현재는 기본 큐 시스템 활용)
  // 향후 priorityList 기반으로 확장
}

// ── 프레스티지 실행 ───────────────────────────────────────────
function _execAutoPrestige() {
  const mc = gs.autoConfig.prestige || {};
  const ep = gs.explorationPoints || 0;
  const ss = gs.spaceScore || 0;
  const mult = typeof getPrestigeMultiplier === 'function' ? getPrestigeMultiplier() : 1;
  const ssGain = Math.floor(ep * mult);
  const elapsed = (Date.now() - _autoPrestigeTimestamp) / 1000;

  // 4개 조건 모두 AND
  if (ssGain < (mc.minEPGain || 100)) return;
  if (ss > 0 && (ssGain / ss) < (mc.minSSMultiplier || 2.0)) return;
  if (elapsed < (mc.minTimeSec || 300)) return;
  if ((gs.launches || 0) < (mc.minLaunches || 10)) return;

  // 프레스티지 실행
  if (typeof executePrestige === 'function') {
    const success = executePrestige();
    if (success) {
      _autoPrestigeTimestamp = Date.now();
      notify('[AUTO] 프레스티지 자동 실행', 'amber');
    }
  }
}

// ── 레거시 호환 ───────────────────────────────────────────────
// 기존 코드에서 호출하는 buyAutoUpgrade, toggleAutoUpgrade, isAutoOn 유지
function buyAutoUpgrade(id) {
  // D6: 연구 기반으로 전환 — 레거시 구매 무시
  notify('자동화는 연구 Branch O에서 해금됩니다', 'amber');
}
function toggleAutoUpgrade(id) {
  // D6: 모듈 토글로 매핑
  const moduleMap = {
    'auto_worker':'worker', 'auto_build':'build', 'auto_parts_hull':'parts',
    'auto_assemble':'assembly', 'auto_launch':'launch',
  };
  const moduleId = moduleMap[id] || id;
  toggleAutoModule(moduleId);
}
function isAutoOn(id) {
  // D6: 모듈 상태로 매핑
  const moduleMap = {
    'auto_worker':'worker', 'auto_build':'build', 'auto_parts_engine':'parts',
    'auto_parts_fueltank':'parts', 'auto_parts_control':'parts', 'auto_parts_hull':'parts',
    'auto_parts_payload':'parts', 'auto_assemble':'assembly', 'auto_addon':'build',
    'auto_addon_upg':'build', 'auto_housing_upg':'build', 'auto_launch':'launch',
  };
  return isAutoModuleOn(moduleMap[id] || id);
}
