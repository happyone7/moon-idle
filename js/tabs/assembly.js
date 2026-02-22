// ============================================================
//  ASSEMBLY TAB — Sprint 3 (P3-1~P3-4)
//  3-column layout: LEFT(parts+slots) CENTER(rocket+BOM) RIGHT(class+specs+quality)
// ============================================================

// ── 조립 스테이지 ASCII 아트 (mockups/ascii-art/assembly/) ──
const STAGE_ASCII_ART = {
  raw_refine: `    ┌──────────────┐
    │   FURNACE    │
    │  ╔════════╗  │
    │  ║ *####* ║  │
    │  ║ ##  ## ║  │
    │  ║ *####* ║← 1800C
    │  ╚══╤═╤══╝  │
    └─────┤ ├─────┘
     ┌────┘ └────┐
     │ INGOT  AL │
     │ ████████ │
     └───────────┘
  RAW ORE → REFINED ALLOY`,

  structure_fab: `  ╔═══════════════════╗
  ║   PRESS  50 TON   ║
  ║   ╔═══════════╗   ║
  ║   ║ ▼▼▼▼▼▼▼▼▼ ║   ║
  ║   ╠═══════════╣   ║
  ║   ║ ░░░░░░░░░ ║   ║
  ║   ║  AL SHEET  ║   ║
  ║   ╚═══════════╝   ║
  ╚═══════════════════╝
    ┌─────────────────┐
    │ FORMED PANEL OK │
    └─────────────────┘
  THICKNESS: 2.4mm PASS`,

  propulsion_asm: `       ┌───┐
       │INJ│ INJECTOR
       └─┬─┘
      ╔══╧══╗
      ║CHAM ║ CHAMBER
      ║ *#* ║
      ╚══╤══╝
       ╔═╧═╗
       ║NOZ║ NOZZLE
      ╔╝   ╚╗
     ╔╝ ▼▼▼ ╚╗
    ╔╝  ▼▼▼▼  ╚╗
    ╚═══════════╝
  ENGINE ASSY COMPLETE`,

  avionics_install: `  ┌─────────────────────┐
  │ AVIONICS BAY        │
  │  ┌─────┐  ┌─────┐  │
  │  │ CPU │──│ IMU │  │
  │  └──┬──┘  └──┬──┘  │
  │     │  ┌─────┤     │
  │  ┌──┴──┤ GPS ├──┐  │
  │  │COMMS│└─────┘ │  │
  │  └──┬──┘    ┌───┘  │
  │  ═══╪═══════╪═══   │
  │     HARNESS WIRE    │
  └─────────────────────┘
  BOARDS: 4/4  WIRED OK`,

  static_fire: `  ┌────────────────────┐
  │    TEST STAND      │
  │  ╔══════════╗      │
  │  ║  ENGINE  ║      │
  │  ╚════╤═════╝      │
  │    ╔══╧══╗         │
  │   ╔╝    ╚╗         │
  │  ╔╝ ▼▼▼▼ ╚╗       │
  │  ║ *FLAME* ║← 3400C
  │  ║ * ▼▼▼ * ║       │
  │  ╚═════════╝       │
  └────────────────────┘
  THRUST: 845kN  PASS`,

  stage_integration: `        ╔═╗
        ║P║ PAYLOAD
       ╔╝ ╚╗
       ║ 2S ║ STAGE 2
       ║    ║
      ╔╝    ╚╗
      ║ INTERSTAGE
      ╠══════╣
      ║  1S  ║ STAGE 1
      ║      ║
      ║      ║
      ╚══╤╤══╝
        ──┘└──
  SECTIONS MATED  BOLT OK`,

  launch_prep: `      ╔═╗
      ║ ║
     ╔╝ ╚╗    CRAWLER
     ║   ║  ┌──────────
     ║   ║  │TRANSPORT→
     ║   ║  └──────────
    ╔╝   ╚╗
    ║     ║ UMBILICAL
    ║   ←─╫──┐
    ╚══╤╤═╝  │ PAD
  ╔════╧╧════╧════════╗
  ║    LAUNCH  PAD    ║
  ╚═══════════════════╝`,
};


// ── 선택된 로켓 클래스 (기본: vega) ──
if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'vega';

function selectRocketClass(classId) {
  const rc = ROCKET_CLASSES.find(c => c.id === classId);
  if (!rc) return;
  // 해금 확인
  if (rc.unlock && !isPhaseComplete(rc.unlock)) {
    notify('해금 조건 미충족', 'red');
    return;
  }
  gs.assembly.selectedClass = classId;
  playSfx('triangle', 350, 0.05, 0.025, 480);
  renderAssemblyTab();
}

/** 페이즈 완료 여부 확인 (PHASES 데이터 참조) */
function isPhaseComplete(phaseKey) {
  if (!phaseKey) return true;
  // phaseKey 예: 'phase_2' → PHASES index 1
  const match = phaseKey.match(/phase_(\d+)/);
  if (!match) return false;
  const idx = parseInt(match[1]) - 1;
  if (typeof PHASES === 'undefined' || !PHASES[idx]) return false;
  const ph = PHASES[idx];
  const maxAlt = gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;
  return maxAlt >= ph.targetAlt && gs.launches >= ph.targetLaunches;
}

function abortAssembly() {
  // 조립 프로세스 제거됨 — 더 이상 사용하지 않음
}

// craftPart: 공정 1회 시작 (craftPartCycle wrapper)
function craftPart(pid) { craftPartCycle(pid); }

function selectQuality(qid) {
  const q = QUALITIES.find(x => x.id === qid);
  if (q && q.locked) { notify('이 품질등급은 아직 잠겨 있습니다', 'red'); return; }
  gs.assembly.selectedQuality = qid;
  playSfx('triangle', 400, 0.04, 0.02, 500);
  renderAssemblyTab();
}

function startAssembly(slotIdx) {
  // 조립 프로세스 제거됨 — 부품+연료 100% 시 즉시 발사 가능
}

function updateAssemblyJobs(now=Date.now()) {
  // 조립 프로세스 제거됨 — 빈 함수로 유지 (호환성)
}


// ============================================================
//  BOM HELPERS — 선택 클래스 기반 부품 목록 생성
// ============================================================
function getBomForClass(classId) {
  if (typeof ROCKET_BOM === 'undefined') return [];
  const scale = ROCKET_BOM.scaleFactor[classId] || 1;
  return ROCKET_BOM.baseBom.map(item => ({
    ...item,
    qty: Math.ceil(item.qty * scale),
    unitMassKg: Math.round(item.unitMassKg * scale),
    totalMassKg: Math.round(item.totalMassKg * scale),
    subParts: item.subParts
      ? item.subParts.map(sp => ({ ...sp, massKg: Math.round(sp.massKg * scale) }))
      : undefined,
  }));
}

/** 간이 인벤토리: parts 완성도를 BOM 카테고리별로 매핑 */
function getBomPartStatus(bomItem) {
  const catMap = {
    structure:  'hull',
    propellant: 'propellant',
    propulsion: 'engine',
    electronics:'engine',
    payload:    'hull',
  };
  const partId = catMap[bomItem.category];
  if (partId) {
    const p = PARTS.find(x => x.id === partId);
    if (p && (gs.parts[partId]||0) >= p.cycles) return 'ok';
    if ((gs.parts[partId]||0) > 0 || (gs.mfgActive && gs.mfgActive[partId])) return 'progress';
  }
  return 'missing';
}


// ============================================================
//  MK1 부품 제작 패널 헬퍼
// ============================================================
function _renderMk1Parts() {
  const now = Date.now();
  const mk1Parts = PARTS.filter(p => !p.minQuality);
  let html = '';

  mk1Parts.forEach(p => {
    const count  = gs.parts[p.id] || 0;
    const done   = count >= p.cycles;
    const active = !!(gs.mfgActive && gs.mfgActive[p.id]);
    const pct    = done ? 100 : Math.floor((count / p.cycles) * 100);
    const cycleCostStr = getCostStr(p.cost);
    const affordable   = canAfford(p.cost);

    // 진행 바 (공정 전체)
    const barFill  = Math.round((count / p.cycles) * 20);
    const barEmpty = 20 - barFill;
    const barHtml  = `<span style="color:var(--green)">${'█'.repeat(barFill)}</span><span style="color:var(--green-dim)">${'░'.repeat(barEmpty)}</span>`;

    // 현재 공정 타이머
    let cycleTimerHtml = '';
    if (active && !done) {
      const job = gs.mfgActive[p.id];
      const remain = Math.max(0, Math.ceil((job.endAt - now) / 1000));
      const total  = Math.max(1, Math.ceil((job.endAt - job.startAt) / 1000));
      const cPct   = Math.min(100, Math.floor(((total - remain) / total) * 100));
      cycleTimerHtml = `<div class="mfg-cycle-bar"><div class="mfg-cycle-fill" style="width:${cPct}%"></div></div>
<div style="font-size:9px;color:var(--amber)">공정 중 ${cPct}% — ${remain}s 남음</div>`;
    }

    // 버튼
    let btnHtml;
    if (done) {
      btnHtml = `<span style="color:var(--green);font-size:11px;">✓ 완성</span>`;
    } else if (active) {
      btnHtml = `<button class="btn btn-sm btn-amber" style="font-size:10px;padding:2px 8px" disabled>진행 중...</button>`;
    } else {
      btnHtml = `<button class="btn btn-sm${affordable ? '' : ' btn-amber'}" onclick="craftPartCycle('${p.id}')" ${affordable ? '' : 'disabled'} style="font-size:10px;padding:2px 8px">▶ 공정 시작</button>`;
    }

    html += `<div class="mfg-part-item${done ? ' mfg-part-done' : active ? ' mfg-part-active' : ''}">
  <div class="mfg-part-header">
    <span style="color:${done ? 'var(--green)' : 'var(--green-mid)'}">${p.icon} ${p.name}</span>
    <span style="font-size:10px;color:${done ? 'var(--green)' : 'var(--green-dim)'};">${count}/${p.cycles}</span>
  </div>
  <div class="mfg-bar-row">${barHtml} <span style="font-size:9px;margin-left:4px;color:var(--green-dim)">${pct}%</span></div>
  ${cycleTimerHtml}
  <div class="mfg-part-footer">
    ${done ? '' : `<span style="font-size:9px;color:var(--green-dim)">공정당: ${cycleCostStr} · ${p.cycleTime}초</span>`}
    ${btnHtml}
  </div>
</div>`;
  });

  // 연료 주입 섹션 (진행도 기반)
  const fuelPct = gs.fuelInjection || 0;
  const fuelBarFill  = Math.round((fuelPct / 100) * 20);
  const fuelBarEmpty = 20 - fuelBarFill;
  const fuelBarHtml  = `<span style="color:var(--amber)">${'█'.repeat(fuelBarFill)}</span><span style="color:var(--green-dim)">${'░'.repeat(fuelBarEmpty)}</span>`;
  const fuelDone     = fuelPct >= 100;
  const injecting    = !!gs.fuelInjecting;
  const hasFuelRes   = (gs.res.fuel || 0) >= 1;
  const F_INJ        = BALANCE.FUEL_INJECT;
  // 남은 시간 계산
  const fuelRemainPct = Math.max(0, F_INJ.maxPct - fuelPct);
  const fuelEtaSec    = injecting && F_INJ.pctPerSec > 0 ? Math.ceil(fuelRemainPct / F_INJ.pctPerSec) : 0;
  const fuelEtaStr    = fuelEtaSec > 0 ? fmtTime(fuelEtaSec) : '';

  let fuelBtnLabel, fuelBtnClass, fuelBtnDisabled;
  if (fuelDone) {
    fuelBtnLabel = '주입 완료';
    fuelBtnClass = 'btn btn-sm btn-amber';
    fuelBtnDisabled = true;
  } else if (injecting) {
    fuelBtnLabel = '⏸ 주입 중단';
    fuelBtnClass = 'btn btn-sm btn-active-inject';
    fuelBtnDisabled = false;
  } else {
    fuelBtnLabel = '▶ 주입 시작';
    fuelBtnClass = 'btn btn-sm' + (hasFuelRes ? '' : ' btn-amber');
    fuelBtnDisabled = !hasFuelRes;
  }

  html += `<div class="mfg-fuel-section${injecting ? ' mfg-fuel-active' : ''}">
  <div class="mfg-part-header">
    <span style="color:${fuelDone ? 'var(--amber)' : injecting ? 'var(--cyan)' : 'var(--green-mid)'}">⛽ 연료 주입${injecting ? ' [진행 중]' : ''}</span>
    <span style="font-size:10px;color:${fuelDone ? 'var(--amber)' : 'var(--green-dim)'};">${fuelPct.toFixed(1)}/100%</span>
  </div>
  <div class="mfg-bar-row">${fuelBarHtml}${fuelEtaStr ? ` <span style="font-size:9px;margin-left:4px;color:var(--cyan)">${fuelEtaStr}</span>` : ''}</div>
  <div class="mfg-part-footer">
    ${fuelDone
      ? `<span style="font-size:9px;color:var(--amber)">연료 탱크 가득</span>`
      : `<span style="font-size:9px;color:var(--green-dim)">소모: LOX ${F_INJ.fuelPerSec}/초 · +${F_INJ.pctPerSec}%/초</span>`}
    <button class="${fuelBtnClass}" onclick="toggleFuelInjection()" ${fuelBtnDisabled ? 'disabled' : ''} style="font-size:10px;padding:2px 8px">${fuelBtnLabel}</button>
  </div>
</div>`;

  // 전체 완성도 표시
  const totalPct = typeof getRocketCompletion === 'function' ? getRocketCompletion() : 0;
  const totalFill = Math.round((totalPct / 100) * 24);
  html += `<div class="mfg-completion-bar">
  <div style="font-size:10px;color:var(--green-mid);margin-bottom:3px">로켓 완성도</div>
  <div style="font-size:13px;letter-spacing:1px">
    <span style="color:${totalPct >= 100 ? 'var(--green)' : 'var(--amber)'}">${'█'.repeat(totalFill)}</span><span style="color:var(--green-dim)">${'░'.repeat(24 - totalFill)}</span>
    <span style="font-size:11px;color:${totalPct >= 100 ? 'var(--green)' : 'var(--amber)'}"> ${totalPct}%</span>
  </div>
</div>`;

  // 부품+연료 100% → 즉시 발사 가능 (조립 프로세스 제거됨)
  if (totalPct >= 100) {
    html += `<div class="mfg-launch-go-wrap">
  <button class="btn btn-full btn-launch-go" onclick="switchMainTab('launch')">
    &#128640; 발사하러 가기
  </button>
</div>`;
  }

  return html;
}

// ============================================================
//  RENDER: ASSEMBLY TAB (Sprint 3 — 3-column)
// ============================================================
function renderAssemblyTab() {
  ensureAssemblyState();
  if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'vega';
  const pd = gs.parts;
  const selClass = gs.assembly.selectedClass;
  const rc = (typeof ROCKET_CLASSES !== 'undefined')
    ? ROCKET_CLASSES.find(c => c.id === selClass) || ROCKET_CLASSES[0]
    : null;

  // ── RIGHT COLUMN (class/specs/quality) ──

  // 1. Rocket class selection grid
  const classGrid = document.getElementById('asm-class-grid');
  if (classGrid && typeof ROCKET_CLASSES !== 'undefined') {
    let html = '<div class="asm-class-grid">';
    ROCKET_CLASSES.forEach(c => {
      const unlocked = !c.unlock || isPhaseComplete(c.unlock);
      const selected = c.id === selClass;
      const cls = `asm-class-btn${selected ? ' selected' : ''}${!unlocked ? '' : ''}`;
      html += `<button class="${cls}" onclick="selectRocketClass('${c.id}')" ${unlocked ? '' : 'disabled'}>
        <span class="asm-radio"></span>
        ${c.icon} ${c.name}
        ${!unlocked ? `<span class="lock-icon">[LOCKED]</span>` : ''}
      </button>`;
    });
    html += '</div>';
    classGrid.innerHTML = html;
  }

  // 2. Class specs
  const specsEl = document.getElementById('asm-class-specs');
  if (specsEl && rc) {
    specsEl.innerHTML = `
      <div style="font-size:13px;letter-spacing:2px;color:var(--green);text-shadow:var(--glow-strong);margin-bottom:4px;">
        ${rc.icon} ${rc.nameEn || rc.name}
      </div>
      <div style="font-size:10px;color:var(--green-dim);margin-bottom:2px;">${rc.name}</div>
      <div style="font-size:10px;color:var(--green-mid);margin-bottom:6px;">${rc.desc}</div>
      <hr class="asm-specs-divider">
      <div class="asm-specs-row"><span>총 중량</span><span class="val">${rc.totalMassKg.toLocaleString()} kg</span></div>
      <div class="asm-specs-row"><span>추력</span><span class="val">${rc.thrustKN.toLocaleString()} kN</span></div>
      <div class="asm-specs-row"><span>Isp</span><span class="val">${rc.ispSec} s</span></div>
      <div class="asm-specs-row"><span>목표 ΔV</span><span class="val">${rc.deltaVMs.toLocaleString()} m/s</span></div>
      <hr class="asm-specs-divider">
      <div class="asm-specs-row"><span>스케일 팩터</span><span class="val">${ROCKET_BOM.scaleFactor[rc.id]}x</span></div>
    `;
  }

  // 3. Quality selector
  let qualHtml = '';
  QUALITIES.forEach(q => {
    const active = gs.assembly.selectedQuality === q.id;
    const locked = q.locked;
    qualHtml += `<button class="btn q-btn${active ? ' selected' : ''}${locked ? ' locked' : ''}" onclick="selectQuality('${q.id}')" ${locked ? 'disabled' : ''}>
      ${q.icon} ${q.name}${locked ? ' <span class="lock-icon">[LOCKED]</span>' : ''}
    </button>`;
  });
  let qualSel = document.getElementById('quality-selector');
  if (qualSel) qualSel.innerHTML = qualHtml;

  // 4. Parts checklist — 공정 기반 진행도 표시
  let partsHtml = _renderMk1Parts();
  let checklist = document.getElementById('parts-checklist');
  if (checklist) checklist.innerHTML = partsHtml;

  // 5. Science box
  const q = getQuality(gs.assembly.selectedQuality);
  const sci = getRocketScience(q.id);
  const reward = getMoonstoneReward(q.id);
  const asmCost = getAssemblyCost(q.id);
  const asmCostStr = getCostStr(asmCost);
  // P5-13: 조립 비용 분해 표시 + 문스톤 예상치 공식 시각화
  const partCostSum = PARTS.reduce((sum, p) => {
    const c = getPartCost(p);
    return sum + Object.values(c).reduce((a, v) => a + v, 0);
  }, 0);
  const addonPCMult = typeof getAddonPartCostMult === 'function' ? getAddonPartCostMult() : 1;
  const costBreakdown = `부품합계 × costMult(${q.costMult}) × 0.32 × addonMult(${addonPCMult.toFixed(2)})`;

  // 문스톤 공식: floor((altitude/20) * rewardMult) + fusionBonus + floor(launches/4)
  const msBase = Math.floor((sci.altitude / 20) * q.rewardMult);
  const msLaunchBonus = Math.floor(gs.launches / 4);
  const msMilestoneM = typeof getMilestoneMsBonus === 'function' ? getMilestoneMsBonus() : 1;
  const msFormula = `floor(${Math.floor(sci.altitude)}/20 × ${q.rewardMult}) + ${fusionBonus} + floor(${gs.launches}/4) = ${msBase + fusionBonus + msLaunchBonus} × ${msMilestoneM.toFixed(1)}`;

  const sciBox = document.getElementById('science-box');
  if (sciBox) sciBox.innerHTML = `
    <div style="font-size:9px;color:var(--green-dim);letter-spacing:.1em;margin-bottom:2px;">// 로켓 제원 — ${q.name}</div>
    <div>Δv: <span class="val">${sci.deltaV.toFixed(2)} km/s</span>  TWR: <span class="val">${sci.twr.toFixed(2)}</span></div>
    <div>신뢰도: <span class="val">${sci.reliability.toFixed(1)}%</span>  고도: <span class="val">${Math.floor(sci.altitude)} km</span></div>
    <div>조립: <span class="val">${fmtTime(q.timeSec)}</span>  비용: <span class="ms-val">${asmCostStr}</span></div>
    <div style="font-size:9px;color:var(--green-dim);margin-top:2px;">비용산출: ${costBreakdown}</div>
    <div>문스톤: <span class="ms-val">+${reward}</span></div>
    <div style="font-size:9px;color:var(--green-dim);">산출: ${msFormula}</div>
  `;

  // ── CENTER COLUMN ──

  // 6. Rocket ASCII art — 공유 함수 사용
  const artDisplay = document.getElementById('rocket-art-display');
  if (artDisplay) artDisplay.innerHTML = getRocketArtHtml();

  // 7. Assembly stage progress (P3-4)
  renderAssemblyStageProgress();

  // 8. BOM table (P3-3)
  renderBomTable(selClass);

  // Parts checklist — 공정 기반 (두 번째 렌더 패스)
  checklist = document.getElementById('parts-checklist');
  if (checklist) checklist.innerHTML = _renderMk1Parts();

  // Quality selector — with tier sub-labels (time + cost multiplier)
  qualHtml = '';
  QUALITIES.forEach(q => {
    const active = gs.assembly.selectedQuality === q.id;
    const locked = q.locked;
    const subLabel = locked ? '[LOCKED]' : `${fmtTime(q.timeSec)} · x${q.costMult} 비용`;
    qualHtml += `<button class="btn q-btn${active ? ' selected' : ''}${locked ? ' locked' : ''}" data-qid="${q.id}" onclick="selectQuality('${q.id}')" ${locked ? 'disabled' : ''}>
      <span class="q-btn-label q-lbl-${q.id}">${q.icon} ${q.name}</span>
      <span class="q-btn-sub">${subLabel}</span>
    </button>`;
  });
  qualSel = document.getElementById('quality-selector');
  if (qualSel) qualSel.innerHTML = qualHtml;

  // ── LEFT COLUMN (parts + launch status) ──

  // 9. 발사 준비 상태 (조립 슬롯 제거됨 — 부품+연료 100% = 즉시 발사 가능)
  const rktCompletion = typeof getRocketCompletion === 'function' ? getRocketCompletion() : 0;
  const canLaunchNow = rktCompletion >= 100;
  const ms = getMoonstoneReward(gs.assembly.selectedQuality || 'proto');
  let slotsHtml = '';
  if (canLaunchNow) {
    slotsHtml = `<div class="slot-card slot-ready">
      <div class="slot-card-header">
        <span class="slot-title glow">// 발사 준비 완료</span>
        <span class="slot-state ready">GO!</span>
      </div>
      <div style="font-size:12px;color:var(--green);margin-bottom:4px;">선택: ${q.name}</div>
      <div style="font-size:12px;color:var(--green);margin-bottom:8px;text-shadow:var(--glow);">예상 문스톤: +${ms}개</div>
      <button class="btn btn-full btn-sm btn-amber" onclick="switchMainTab('launch')">[ &#128640; 발사하러 가기 ]</button>
    </div>`;
  } else {
    slotsHtml = `<div class="slot-card">
      <div class="slot-card-header">
        <span class="slot-title">// 발사 대기</span>
        <span class="slot-state idle">대기 중</span>
      </div>
      <div style="font-size:12px;color:var(--green-mid);margin-bottom:4px;">선택: ${q.name}</div>
      <div style="font-size:11px;color:var(--green-dim);margin-bottom:8px;">
        로켓 완성도: ${rktCompletion}% — 부품 제작 및 연료 주입을 완료하세요
      </div>
      <button class="btn btn-full btn-sm btn-amber" disabled>
        [ 완성도 ${rktCompletion}% — 대기 중 ]
      </button>
    </div>`;
  }
  const slotsWrap = document.getElementById('assembly-slots-wrap');
  if (slotsWrap) slotsWrap.innerHTML = slotsHtml;
}


// ============================================================
//  P3-4: 7-STAGE ASSEMBLY PROGRESS DISPLAY
// ============================================================
function renderAssemblyStageProgress() {
  const el = document.getElementById('asm-stage-progress');
  if (!el || typeof ASSEMBLY_STAGES === 'undefined') return;

  // 조립 프로세스 제거됨 — 로켓 완성도 기반으로 스테이지 표시
  const totalStages = ASSEMBLY_STAGES.length;
  let currentStageIdx = -1;
  const overallPct = typeof getRocketCompletion === 'function' ? getRocketCompletion() : 0;

  if (overallPct >= 100) {
    currentStageIdx = totalStages; // 모두 완료
  } else if (overallPct > 0) {
    currentStageIdx = Math.min(
      Math.floor((overallPct / 100) * totalStages),
      totalStages - 1
    );
  }

  // 전체 진행 바 계산
  const barTotal = 27;
  const barFilled = Math.round((overallPct / 100) * barTotal);
  const barEmpty = barTotal - barFilled;

  // 현재 기체 이름
  const q = getQuality(gs.assembly.selectedQuality);
  const rc = (typeof ROCKET_CLASSES !== 'undefined')
    ? ROCKET_CLASSES.find(c => c.id === (gs.assembly.selectedClass || 'vega'))
    : null;
  const vehicleName = rc ? `${rc.name} — ${q.name}` : q.name;

  let html = `<span class="ascii-prog-title">  ASSEMBLY PROGRESS — ${vehicleName}</span>\n\n`;
  html += `  <span class="ascii-prog-bar-done">${'\u2588'.repeat(barFilled)}</span>`;
  html += `<span class="ascii-prog-bar-empty">${'\u2591'.repeat(barEmpty)}</span>`;
  html += ` <span class="ascii-prog-pct">${Math.floor(overallPct)}%</span>\n\n`;

  ASSEMBLY_STAGES.forEach((stage, i) => {
    const stageBarLen = 10;
    let stateClass, labelClass, statusText, fillCount;

    if (currentStageIdx > i || (currentStageIdx >= totalStages)) {
      // 완료 스테이지
      stateClass = 'ascii-stage-done';
      labelClass = 'ascii-stage-label-done';
      statusText = 'DONE';
      fillCount = stageBarLen;
    } else if (currentStageIdx === i) {
      // 진행 중 스테이지
      stateClass = 'ascii-stage-active';
      labelClass = 'ascii-stage-label-active';
      // 이 스테이지 내의 진행률 계산
      const stageStart = (i / totalStages) * 100;
      const stageEnd = ((i + 1) / totalStages) * 100;
      const stagePct = Math.min(100, Math.max(0,
        ((overallPct - stageStart) / (stageEnd - stageStart)) * 100
      ));
      fillCount = Math.round((stagePct / 100) * stageBarLen);
      statusText = `${Math.floor(stagePct)}% ACTIVE`;
    } else {
      // 잠금 스테이지
      stateClass = 'ascii-stage-locked';
      labelClass = 'ascii-stage-label-locked';
      statusText = 'LOCKED';
      fillCount = 0;
    }

    const stageLabel = `STAGE ${String(stage.stage).padStart(2, '0')}: ${stage.name}`;
    const paddedLabel = stageLabel.padEnd(22);
    const barDone = '\u2588'.repeat(fillCount);
    const barRem = '\u2591'.repeat(stageBarLen - fillCount);

    html += `  <span class="${labelClass}">${paddedLabel}</span>`;
    html += `<span class="${stateClass}">[${barDone}${barRem}]</span>`;
    html += ` <span class="${stateClass}">${statusText}</span>\n`;
  });

  el.innerHTML = html;
}


// ============================================================
//  P3-3: BOM TABLE (Bill of Materials)
// ============================================================
function renderBomTable(classId) {
  const wrap = document.getElementById('asm-bom-table-wrap');
  if (!wrap || typeof ROCKET_BOM === 'undefined') return;

  const bom = getBomForClass(classId);
  const rc = (typeof ROCKET_CLASSES !== 'undefined')
    ? ROCKET_CLASSES.find(c => c.id === classId) || ROCKET_CLASSES[0]
    : null;

  let html = `<table class="bom-table">
    <thead><tr>
      <th style="width:34%;">부품명</th>
      <th style="width:16%;">소재</th>
      <th style="width:14%;">필요량</th>
      <th style="width:14%;">보유</th>
      <th style="width:22%;">상태</th>
    </tr></thead><tbody>`;

  bom.forEach(item => {
    const status = getBomPartStatus(item);
    const statusClass = status === 'ok' ? 'status-ok'
      : status === 'progress' ? 'status-in-progress'
      : 'status-missing';
    const statusIcon = status === 'ok' ? '&#10003; 확보'
      : status === 'progress' ? '&#9654; 진행'
      : '&#10007; 대기';
    const nameColor = status === 'ok' ? 'var(--green-mid)'
      : status === 'progress' ? 'var(--amber)'
      : 'var(--green-dim)';

    const qtyStr = item.qty > 1 ? `${item.icon} x${item.qty}` : item.icon;

    html += `<tr>
      <td style="color:${nameColor}">${qtyStr} ${item.name}</td>
      <td>${item.material}</td>
      <td>${item.totalMassKg.toLocaleString()}kg</td>
      <td style="color:${status === 'ok' ? 'var(--green)' : status === 'missing' ? 'var(--red)' : 'var(--amber)'}">
        ${status === 'ok' ? item.totalMassKg.toLocaleString() + 'kg' : status === 'progress' ? '...' : '0kg'}
      </td>
      <td class="${statusClass}">${statusIcon}</td>
    </tr>`;

    // Sub-parts
    if (item.subParts) {
      item.subParts.forEach(sp => {
        html += `<tr class="bom-sub">
          <td style="color:var(--green-dim);">&nbsp;&nbsp;└ ${sp.name}</td>
          <td>-</td>
          <td>${sp.massKg.toLocaleString()}kg</td>
          <td>-</td>
          <td>-</td>
        </tr>`;
      });
    }
  });

  // Total mass row
  const totalMass = bom.reduce((s, item) => s + item.totalMassKg, 0);
  html += `<tr style="border-top:1px solid var(--green-dim);">
    <td style="color:var(--green);font-weight:bold;">합계</td>
    <td>-</td>
    <td style="color:var(--amber);">${totalMass.toLocaleString()}kg</td>
    <td>-</td>
    <td>-</td>
  </tr>`;

  html += '</tbody></table>';
  wrap.innerHTML = html;
}
