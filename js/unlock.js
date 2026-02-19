// ============================================================
//  UNLOCK SYSTEM
// ============================================================
let _prevUnlocks = {};

function applyUnlocks(unlockList) {
  if (!Array.isArray(unlockList)) return;
  unlockList.forEach(key => {
    gs.unlocks[key] = true;
  });
  renderUnlocks();
}

const TAB_UNLOCK_NAMES = {
  tab_production: () => t('tab_production'),
  tab_research:   () => t('tab_research'),
  tab_assembly:   () => t('tab_assembly'),
  tab_launch:     () => t('tab_launch'),
  tab_mission:    () => t('tab_mission'),
  tab_automation: () => 'AUTOMATION',
};
function _tabUnlockLabel(tabKey) {
  const entry = TAB_UNLOCK_NAMES[tabKey];
  if (typeof entry === 'function') return entry();
  return entry || tabKey;
}

function _showUnlockBanner(tabKey) {
  const label = _tabUnlockLabel(tabKey);
  const banner = document.getElementById('tab-unlock-flash');
  if (!banner) return;
  banner.innerHTML = `
    <div class="tuf-inner">
      <div class="tuf-top">// SYSTEM UNLOCK</div>
      <div class="tuf-main">[ ${label.toUpperCase()} ]</div>
      <div class="tuf-sub">NEW TAB AVAILABLE</div>
    </div>`;
  banner.classList.remove('tuf-hidden');
  banner.classList.add('tuf-visible');
  playSfx('square', 880, 0.15, 0.06, 1200);
  setTimeout(() => {
    banner.classList.remove('tuf-visible');
    banner.classList.add('tuf-hidden');
  }, 2600);
}

function renderUnlocks() {
  // Map of tab id suffix -> element id
  const TAB_MAP = {
    tab_production: 'nav-tab-production',
    tab_research:   'nav-tab-research',
    tab_assembly:   'nav-tab-assembly',
    tab_launch:     'nav-tab-launch',
    tab_mission:    'nav-tab-mission',
    tab_automation: 'nav-tab-automation',
  };

  Object.entries(TAB_MAP).forEach(([key, elId]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    const nowUnlocked = !!gs.unlocks[key];
    const wasUnlocked = !!_prevUnlocks[key];
    if (nowUnlocked) {
      el.style.display = '';
      if (!wasUnlocked) {
        // Flash animation for newly revealed tab
        el.classList.add('new-unlock');
        setTimeout(() => el.classList.remove('new-unlock'), 800);
        // Dramatic unlock banner
        _showUnlockBanner(key);
      }
    } else {
      el.style.display = 'none';
    }
  });

  // Track previous state
  _prevUnlocks = Object.assign({}, gs.unlocks);

  // Re-render production tab to show newly unlocked buildings
  if (activeTab === 'production') renderProductionTab();
}


// ============================================================
//  AUTO UNLOCK (tick마다 호출 — 조건 달성 시 자동 해금)
// ============================================================
function checkAutoUnlocks() {
  let changed = false;

  // 연구소 구매 → 연구 탭 해금
  if (!gs.unlocks.tab_research && (gs.buildings.research_lab || 0) >= 1) {
    gs.unlocks.tab_research = true;
    changed = true;
    notify('[ 연구소 완공 ] 연구 탭 해금!', 'amber');
  }

  // 첫 발사 완료 → 자동화 탭 해금
  if (!gs.unlocks.tab_automation && (gs.launches || 0) >= 1) {
    gs.unlocks.tab_automation = true;
    changed = true;
    notify('[ 첫 발사 완료 ] 자동화 탭 해금!', 'amber');
  }

  if (changed) renderUnlocks();
}


// ============================================================
//  NOTIFICATIONS
// ============================================================
function notify(msg, type='') {
  const el = document.createElement('div');
  el.className = 'notif-item' + (type ? ' ' + type : '');
  el.textContent = msg;
  const notif = document.getElementById('notif');
  if (notif) notif.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

