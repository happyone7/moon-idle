// ============================================================
//  INTERNATIONALIZATION (i18n)
//  Supported: 'en' (default), 'ko'
// ============================================================

const I18N = {
  en: {
    // Title
    title_subtitle: 'Lunar Rocket Facility',

    // Nav tabs
    tab_launch:     'Launch Control',
    tab_production: 'Production Hub',
    tab_research:   'Research Lab',
    tab_assembly:   'Assembly Bay',
    tab_mission:    'Missions',

    // Topbar
    tb_day:         'Day',
    tb_workers:     'Workers',

    // Common buttons / labels
    btn_build:      'Build',
    btn_add:        '+1',
    btn_short:      'Short',
    btn_sound_on:   'SND:ON',
    btn_sound_off:  'SND:OFF',
    btn_bgm:        'BGM',
    btn_lang:       'KO',

    // Title screen
    title_new_game: 'New Game',
    title_continue: 'Continue',
    title_no_save:  '// No save data',

    // Panel headers
    ph_production:  'Production Hub',
    ph_research:    'Research Lab',
    ph_assembly:    'Assembly Bay',
    ph_mission:     'Mission Status',

    // Production tab
    prod_status:    (income, assigned, total) =>
      `[ Income: $${income}/s ]  [ Workers: ${assigned}/${total} deployed ]`,
    prod_hint:      '// Hover over world buildings to assign workers',
    prod_unbuilt:   'Not built',
    prod_no_worker: 'No workers',

    // Resource names
    res_money:      'Funds',
    res_iron:       'Iron',
    res_copper:     'Copper',
    res_fuel:       'Fuel',
    res_electronics:'Electronics',
    res_research:   'Research',
    res_workers:    'Workers',
    res_free:       'free',

    // Notification (short)
    notif_afford:   'Insufficient resources',
    notif_locked:   'Unlock required',

    // LC panel titles
    lc_checklist:   'PRE-LAUNCH GO / NO-GO',
    lc_quest_title: '// MISSION OBJECTIVES',
    lc_history:     'Launch History',
    lc_stats:       'Statistics',

    // LC quest
    q_main_title:   '// MAIN MISSION',
    q_main_desc:    'Complete the first launch to the Moon.',
    q_done_title:   '✔ Mission Complete!',
    q_done_desc:    'First launch successful. Collect exploration score.',
    q_sub_ops:      'Deploy an Operations Center',
    q_sub_money:    'Accumulate $1,000',
    q_sub_mine:     'Build a Mine',
    q_sub_lab:      'Build a Research Lab',
    q_sub_research: 'Research 1 technology',
    q_sub_pad:      'Build a Launch Pad',
    q_sub_assemble: 'Assemble a rocket',
    q_ready:        '▶ Ready to launch!',

    // LC history / stats
    hist_none:      '// No launch history',
    hist_col_no:    'NO.',
    hist_col_veh:   'Vehicle',
    hist_col_alt:   'Altitude',
    hist_col_rel:   'Reliability',
    stat_launches:  'Total Launches',
    stat_max_alt:   'Max Altitude',
    stat_moonstone: 'Space Score',
    stat_bonus:     'Production Bonus',

    // LC GO/NO-GO checklist
    chk_pad:        'Launch Pad Structure',
    chk_prop:       'Propellant Load',
    chk_veh:        'Vehicle Assembly',
    chk_nav:        'Navigation System',
    chk_eng:        'Engine Systems',
    chk_wx:         'Weather Conditions',
    chk_ok:         '// All Systems Nominal',
    chk_ng:         '// Pre-Launch Check Required',

    // LC failure modes
    fail_engine:    'Engine Shutdown',
    fail_gyro:      'Gyro Malfunction',
    fail_maxq:      'MaxQ Overpressure',
    fail_lox:       'LOX Cutoff',
    fail_guidance:  'Guidance System',

    // LC sbar labels
    lc_dv:          'Δv (km/s)',
    lc_rel:         'Reliability',
    lc_twr:         'TWR',
    lc_no_data:     '// No data',

    // LC commit box
    lc_commit_hd:   '| LAUNCH COMMIT |',
    lc_success_pct: 'Success%',
    lc_target_alt:  'Target Alt',
    lc_moonstone:   'Space Score',
    lc_btn_launch:  '[ ▶▶ EXECUTE LAUNCH ]',
    lc_btn_abort:   '[ ABORT ]',

    // Assembly tab
    asm_parts:      'Parts Status',
    asm_quality:    'Quality Grade',
    asm_slots:      'Assembly Slots',

    // Right panel
    rp_workers:     '◆ Workers',
    rp_launches:    'Launches',

    // Category headers
    cat_funds:      '// Funds',
    cat_materials:  '// Materials',
    cat_research:   '// Research',
  },

  ko: {
    tab_launch:     '발사 통제',
    tab_production: '생산 허브',
    tab_research:   '연구소',
    tab_assembly:   '조립동',
    tab_mission:    '미션 현황',

    tb_day:         'Day',
    tb_workers:     '인원',

    btn_build:      '건설',
    btn_add:        '+1동',
    btn_short:      '부족',
    btn_sound_on:   'SND:ON',
    btn_sound_off:  'SND:OFF',
    btn_bgm:        'BGM',
    btn_lang:       'EN',

    title_new_game: '새 게임',
    title_continue: '이어하기',
    title_no_save:  '// 저장 데이터 없음',

    ph_production:  '생산 허브',
    ph_research:    '연구소',
    ph_assembly:    '로켓 조립동',
    ph_mission:     '미션 진행 현황',

    prod_status:    (income, assigned, total) =>
      `[ 수입: $${income}/s ]  [ 인원: ${assigned}/${total}명 배치 ]`,
    prod_hint:      '// 세계관 건물에 마우스를 오버하면 인원 배치 메뉴가 열립니다',
    prod_unbuilt:   '미건설',
    prod_no_worker: '인원 미배치',

    res_money:      '자금',
    res_iron:       '철광석',
    res_copper:     '구리',
    res_fuel:       '연료',
    res_electronics:'전자부품',
    res_research:   '연구',
    res_workers:    '인원',
    res_free:       '여유',

    title_subtitle: '달 탐사 로켓 제작소',

    notif_afford:   '자원 부족',
    notif_locked:   '잠금 해제 필요',

    lc_checklist:   'PRE-LAUNCH GO / NO-GO',
    lc_quest_title: '// MISSION OBJECTIVES',
    lc_history:     '발사 이력',
    lc_stats:       '통계',

    q_main_title:   '// MAIN MISSION',
    q_main_desc:    '달로 가는 우주선 첫 발사를 완료하세요.',
    q_done_title:   '✔ 임무 완료!',
    q_done_desc:    '달 탐사 로켓 첫 발사 성공. 계속 발사하여 탐사 점수를 모으세요.',
    q_sub_ops:      '운영센터를 배치하세요',
    q_sub_money:    '자금 $1,000 확보',
    q_sub_mine:     '광산을 건설하세요',
    q_sub_lab:      '연구소를 건설하세요',
    q_sub_research: '기술을 1개 연구하세요',
    q_sub_pad:      '발사대를 건설하세요',
    q_sub_assemble: '로켓을 조립하세요',
    q_ready:        '▶ 이제 발사 버튼을 누르세요!',

    hist_none:      '// 발사 기록 없음',
    hist_col_no:    'NO.',
    hist_col_veh:   '기체',
    hist_col_alt:   '고도',
    hist_col_rel:   '신뢰도',
    stat_launches:  '총 발사',
    stat_max_alt:   '최고 고도',
    stat_moonstone: '탐사 점수',
    stat_bonus:     '생산 보너스',

    // LC GO/NO-GO checklist
    chk_pad:        '발사대 구조',
    chk_prop:       '추진제 주입',
    chk_veh:        '기체 조립',
    chk_nav:        '항법 장치',
    chk_eng:        '엔진 계통',
    chk_wx:         '기상 조건',
    chk_ok:         '// 전 계통 이상 없음',
    chk_ng:         '// 발사 전 확인 필요',

    // LC failure modes
    fail_engine:    '엔진 정지',
    fail_gyro:      '자이로 오작동',
    fail_maxq:      'MaxQ 과부하',
    fail_lox:       'LOX 차단',
    fail_guidance:  '유도 계통',

    lc_dv:          'Δv (km/s)',
    lc_rel:         '신뢰도',
    lc_twr:         'TWR',
    lc_no_data:     '// 데이터 없음',

    lc_commit_hd:   '│ LAUNCH COMMIT │',
    lc_success_pct: '성공률',
    lc_target_alt:  '목표 고도',
    lc_moonstone:   '탐사 점수',
    lc_btn_launch:  '[ ▶▶ 발사 실행 ]',
    lc_btn_abort:   '[ ABORT ]',

    asm_parts:      '부품 현황',
    asm_quality:    '품질 등급',
    asm_slots:      '조립 슬롯',

    rp_workers:     '◆ 인원',
    rp_launches:    '발사',

    cat_funds:      '// 자금',
    cat_materials:  '// 소재',
    cat_research:   '// 연구',
  },
};

// ── 현재 언어 가져오기 ─────────────────────────────────────
function getLang() {
  return (gs && gs.settings && gs.settings.lang) ? gs.settings.lang : 'en';
}

// ── 번역 함수 ─────────────────────────────────────────────
function t(key, ...args) {
  const lang = getLang();
  const dict = I18N[lang] || I18N['en'];
  const val  = dict[key] !== undefined ? dict[key] : (I18N['en'][key] !== undefined ? I18N['en'][key] : key);
  if (typeof val === 'function') return val(...args);
  return val;
}

// ── data-i18n 속성 적용 ────────────────────────────────────
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  // Language toggle button
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = getLang() === 'en' ? '한국어' : 'EN';
}

// ── 언어 전환 ──────────────────────────────────────────────
function toggleLang() {
  if (!gs || !gs.settings) return;
  gs.settings.lang = getLang() === 'en' ? 'ko' : 'en';
  applyI18n();
  renderAll();
  saveGame();
}
