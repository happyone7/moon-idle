// ─────────────────────────────────────────────
//  LUNA-7 Tutorial Bot
//  달 기지 AI 보조 시스템 — 운영센터 건설 안내
// ─────────────────────────────────────────────

const tutBot = (() => {
  // 튜토리얼 메시지 시퀀스
  const MESSAGES = [
    { text: '[ LUNA-7 AI 시스템 — 초기화 중... ]',                       delay: 35, pause: 600 },
    { text: '안녕하세요, 사령관님. 달 기지 AI 보조 시스템 LUNA-7 입니다.', delay: 42, pause: 900 },
    { text: '임무 첫 단계: ▸ 운영 센터[OPS] ◂ 를 건설하세요.',             delay: 38, pause: 500 },
    { text: '운영 센터는 수익 창출의 핵심 시설입니다. ▼',                  delay: 38, pause: 0  },
  ];

  let _state = 'hidden'; // hidden | typing | done | dismissed
  let _msgIdx  = 0;
  let _charIdx = 0;
  let _pauseUntil = 0;
  let _timer   = null;
  let _shown   = false; // 한 번이라도 표시됐는지

  // ── DOM helpers ──────────────────────────────
  function _el()     { return document.getElementById('luna-bot'); }
  function _textEl() { return document.getElementById('luna-text'); }

  // ── 봇 표시 ──────────────────────────────────
  function _show() {
    if (_state === 'dismissed') return;
    const el = _el();
    if (!el) return;

    if (!_shown) {
      _shown = true;
      _state = 'typing';
      _msgIdx = 0; _charIdx = 0; _pauseUntil = 0;
      el.classList.remove('hidden');
      el.classList.add('appear');
      // 등장 애니메이션 후 타이핑 시작
      setTimeout(_tick, 700);
    } else if (_state === 'hidden') {
      _state = 'done';
      el.classList.remove('hidden');
    }
  }

  // ── 타이핑 효과 ──────────────────────────────
  function _tick() {
    if (_state !== 'typing') return;
    const now = Date.now();
    if (now < _pauseUntil) { _timer = setTimeout(_tick, 40); return; }

    const msg = MESSAGES[_msgIdx];
    const textEl = _textEl();
    if (!textEl) return;

    if (_charIdx < msg.text.length) {
      // 한 글자씩 타이핑
      _charIdx++;
      textEl.textContent = msg.text.slice(0, _charIdx);
      // 로봇 삐빅 소리 — 2글자마다 1회, 공백 제외
      const ch = msg.text[_charIdx - 1];
      if (ch !== ' ' && _charIdx % 2 === 0 && typeof playSfx === 'function') {
        const freq = 1100 + Math.random() * 400; // 1100~1500Hz 랜덤 피치
        playSfx('square', freq, 0.022, 0.012);   // SFX_GLOBAL_VOL(5x) 적용 시 실효 0.06
      }
      const jitter = msg.delay + (Math.random() * 16 - 8);
      _timer = setTimeout(_tick, jitter);
    } else {
      // 현재 메시지 완료
      if (_msgIdx < MESSAGES.length - 1) {
        _pauseUntil = now + msg.pause;
        _msgIdx++;
        _charIdx = 0;
        _timer = setTimeout(_tick, 40);
      } else {
        // 모든 메시지 완료
        _state = 'done';
        _highlightOps();
      }
    }
  }

  // ── ops_center 하이라이트 ──────────────────────
  function _highlightOps() {
    document.querySelectorAll('[data-bld="ops_center"]')
      .forEach(e => e.classList.add('tut-highlight'));
  }
  function _removeHighlight() {
    document.querySelectorAll('[data-bld="ops_center"]')
      .forEach(e => e.classList.remove('tut-highlight'));
  }

  // ── 운영센터 건설 완료 처리 ───────────────────
  function _onOpsDone() {
    const textEl = _textEl();
    if (textEl) {
      textEl.textContent = '';
      // "완료" 메시지 타이핑
      const done = '▸ 운영 센터 가동 완료. 수고하셨습니다, 사령관님.';
      let i = 0;
      const t = setInterval(() => {
        if (i < done.length) { textEl.textContent = done.slice(0, ++i); }
        else { clearInterval(t); setTimeout(dismiss, 1800); }
      }, 38);
    }
    _removeHighlight();
    _state = 'done';
  }

  // ── 닫기 (사용자 직접) ────────────────────────
  function dismiss() {
    if (_timer) clearTimeout(_timer);
    _state = 'dismissed';
    _removeHighlight();
    const el = _el();
    if (el) {
      el.classList.add('dismiss-anim');
      setTimeout(() => el.classList.add('hidden'), 380);
    }
  }

  // ── 메인 업데이트 (게임 루프에서 주기적으로 호출) ──
  function update() {
    if (_state === 'dismissed') return;

    const opsBuilt = (typeof gs !== 'undefined') && (gs.buildings.ops_center || 0) >= 1;
    const onProd   = document.getElementById('pane-production')?.classList.contains('active');

    if (opsBuilt) {
      if (_state !== 'hidden' && _state !== 'dismissed') {
        _onOpsDone();
      }
      return;
    }

    if (onProd) _show();
  }

  return { update, dismiss };
})();
