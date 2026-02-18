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

function renderUnlocks() {
  // Map of tab id suffix -> element id
  const TAB_MAP = {
    tab_production: 'nav-tab-production',
    tab_research:   'nav-tab-research',
    tab_assembly:   'nav-tab-assembly',
    tab_launch:     'nav-tab-launch',
    tab_mission:    'nav-tab-mission',
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

