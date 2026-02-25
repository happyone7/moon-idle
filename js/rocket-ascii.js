// ============================================================
//  ROCKET ASCII ART — 클래스별 정지/발사 아트 + 실패 스케일링
//  D5_Rocket_ASCII_Art_Design.md 기반 — 전수 검증 완료 (2026-02-25)
// ============================================================

const ROCKET_ASCII = {
  // ── VEGA (15×13) — 프로토타입 단발 ──
  // 디자인 문서 섹션 2.1 (lines 67-82)
  vega: {
    width: 15, height: 13,
    static: [
      '        *',
      '       /|\\',
      '      / | \\',
      '     /  |  \\',
      '    / VEGA  \\',
      '   /_________\\',
      '   |  [NAV]  |',
      '   | .-----. |',
      '   | | SYS | |',
      "   | '-----' |",
      '   |  [ENG]  |',
      '   |_________|',
      '   /_________\\',
      '     | | | |',
    ],
    launching: [
      '        *',
      '       /|\\',
      '      / | \\',
      '     /  |  \\',
      '    / VEGA  \\',
      '   /_________\\',
      '   |  [NAV]  |',
      '   | | SYS | |',
      '   |  [ENG]  |',
      '   |_________|',
      '   /_________\\',
      '     \\| | |/',
      '    \\\\| | |//',
      '   \\\\\\| | |///',
    ],
  },

  // ── ARGO (19×18) — 스러스터 강화형 ──
  // 디자인 문서 섹션 2.2 (lines 93-113)
  argo: {
    width: 19, height: 20,
    static: [
      '          *',
      '         /|\\',
      '        / | \\',
      '       /  |  \\',
      '      / ARGO  \\',
      '     /_________\\',
      '     |  [PAY]  |',
      '     | .-----. |',
      '     | | NAV | |',
      '     | | SYS | |',
      "     | '-----' |",
      '     | [AVION] |',
      '     |  O   O  |',
      '     |---------|',
      '     |  [PROP] |',
      '    /|  78 kN  |\\',
      '   / |_________| \\',
      '  /  /_________\\  \\',
      '  |   | || || |   |',
      '  T   | || || |   T',
    ],
    launching: [
      '          *',
      '         /|\\',
      '        / | \\',
      '       /  |  \\',
      '      / ARGO  \\',
      '     /_________\\',
      '     |  [PAY]  |',
      '     | | NAV | |',
      '     | [AVION] |',
      '     |  O   O  |',
      '     |  [PROP] |',
      '    /|  78 kN  |\\',
      '   / |_________| \\',
      '  /  /_________\\  \\',
      '  |   \\| || |/   |',
      '  T  \\\\| || |//  T',
      '     \\\\\\| || |///',
    ],
  },

  // ── HERMES (21×25) — 2단 궤도 진입 ──
  // 디자인 문서 섹션 2.3 (lines 125-151)
  hermes: {
    width: 21, height: 25,
    static: [
      '           *',
      '          /|\\',
      '         / | \\',
      '        /  |  \\',
      '       / HERMES\\',
      '      /_________\\',
      '      |[PAYLOAD]|',
      '      | .-----. |',
      '      | | NAV | |',
      '      | | SYS | |',
      "      | '-----' |",
      '      |         |',
      '      | [AVION] |',
      '      | O  O  O |',
      '      |  GYRO   |',
      '      |_________|',
      '      =====2=====',
      '      |[PROP-2] |',
      '      | .-----. |',
      '      | |310kN| |',
      "      | '-----' |",
      '      |_________|',
      '     /___________\\',
      '       |  |||  |',
      '      /|  |||  |\\',
      '     /_|__|||__|_\\',
    ],
    launching: [
      '           *',
      '          /|\\',
      '         / | \\',
      '        /  |  \\',
      '       / HERMES\\',
      '      /_________\\',
      '      |[PAYLOAD]|',
      '      | | NAV | |',
      '      | [AVION] |',
      '      | O  O  O |',
      '      |_________|',
      '      =====2=====',
      '      |[PROP-2] |',
      '      | |310kN| |',
      '      |_________|',
      '     /___________\\',
      '       \\|  |||  |/',
      '      \\\\|  |||  |//',
      '     \\\\\\|  |||  |///',
    ],
  },

  // ── ATLAS (23×31) — 재사용 중형 ──
  // 디자인 문서 섹션 2.4 (lines 163-196)
  atlas: {
    width: 23, height: 34,
    static: [
      '               *',
      '              /|\\',
      '             / | \\',
      '            /  |  \\',
      '           /   |   \\',
      '          /    |    \\',
      '         /   ATLAS   \\',
      '        /_____________\\',
      '        |  [PAYLOAD]  |',
      '        |  .-------.  |',
      '        |  |  NAV  |  |',
      '        |  |  SYS  |  |',
      "        |  '-------'  |",
      '        |             |',
      '        | [AVIONICS]  |',
      '        |  .-------.  |',
      '        |  | O O O |  |',
      '        |  | GYRO  |  |',
      "        |  '-------'  |",
      '        |_____________|',
      '        ======S2=======',
      '        |  [PROP-2]   |',
      '        |  .-------.  |',
      '        |  |1200kN |  |',
      "        |  '-------'  |",
      '        |_____________|',
      '       /_______________\\',
      '      / [LOX]   [RP-1]  \\',
      '     /___________________\\',
      '           | || || |',
      '         _/  || ||  \\_',
      '        /    || ||    \\',
      '       L     || ||     L',
    ],
    launching: [
      '               *',
      '              /|\\',
      '             / | \\',
      '            /  |  \\',
      '           /   |   \\',
      '         /   ATLAS   \\',
      '        /_____________\\',
      '        |  [PAYLOAD]  |',
      '        |  |  NAV  |  |',
      '        | [AVIONICS]  |',
      '        |  | O O O |  |',
      '        |_____________|',
      '        ======S2=======',
      '        |  [PROP-2]   |',
      '        |  |1200kN |  |',
      '        |_____________|',
      '       /_______________\\',
      '     /___________________\\',
      '          \\| || || |/',
      '         \\\\| || || |//',
      '        \\\\\\| || || |///',
      '       \\\\\\\\| || || |////',
    ],
  },

  // ── SELENE (27×36) — 3단 달 궤도 초대형 ──
  // 디자인 문서 섹션 2.5 (lines 208-246)
  selene: {
    width: 27, height: 39,
    static: [
      '                 *',
      '                /|\\',
      '               / | \\',
      '              /  |  \\',
      '             /   |   \\',
      '            /    |    \\',
      '           /  SELENE   \\',
      '          /             \\',
      '         /_______________\\',
      '         |   [PAYLOAD]   |',
      '         |   .-------.   |',
      '         |   | LUNAR |   |',
      '         |   |MODULE |   |',
      "         |   '-------'   |",
      '         |               |',
      '         |  [AVIONICS]   |',
      '         |   .-------.   |',
      '         |   | O O O |   |',
      '         |   | GYRO  |   |',
      "         |   '-------'   |",
      '         |_______________|',
      '         =======S3========',
      '         |   [PROP-3]    |',
      '         |   .-------.   |',
      '         |   |3500kN |   |',
      "         |   '-------'   |",
      '         |_______________|',
      '         =======S2========',
      '    /|   |   [PROP-2]    |   |\\',
      '   / |   |   .-------.   |   | \\',
      '  /  |   |   |ENGINE |   |   |  \\',
      " | B |   |   '-------'   |   | B |",
      ' | O |   |_______________|   | O |',
      ' | O |  /                 \\  | O |',
      ' | S |  \\_________________/  | S |',
      ' | T |     |  || || ||  |    | T |',
      ' |___|    /|  || || ||  |\\   |___|',
      '         /_|__||_||_||__|_\\',
    ],
    launching: [
      '                 *',
      '                /|\\',
      '               / | \\',
      '              /  |  \\',
      '           /  SELENE   \\',
      '          /             \\',
      '         /_______________\\',
      '         |   [PAYLOAD]   |',
      '         |   | LUNAR |   |',
      '         |  [AVIONICS]   |',
      '         |   | O O O |   |',
      '         |_______________|',
      '         =======S3========',
      '         |   [PROP-3]    |',
      '         |   |3500kN |   |',
      '         |_______________|',
      '         =======S2========',
      '    /|   |   [PROP-2]    |   |\\',
      '  | B |  |   |ENGINE |   |  | B |',
      '  | O |  |_______________|  | O |',
      '  | S |  \\_________________/| S |',
      '  | T |    \\| || || || |/   | T |',
      '  |___|   \\\\| || || || |//  |___|',
      '         \\\\\\| || || || |///',
    ],
  },

  // ── ARTEMIS (31×44) — 달 착륙 완전재사용 초대형 ──
  // 디자인 문서 섹션 2.6 (lines 258-306)
  artemis: {
    width: 31, height: 47,
    static: [
      '                   *',
      '                  /|\\',
      '                 / | \\',
      '                /  |  \\',
      '               /   |   \\',
      '              /    |    \\',
      '             /     |     \\',
      '            /   ARTEMIS   \\',
      '           /_______________\\',
      '           |  +---------+  |',
      '           |  |  LUNAR  |  |',
      '           |  | LANDER  |  |',
      '           |  +---------+  |',
      '           |               |',
      '           |  [AVIONICS]   |',
      '           |  +---------+  |',
      '           |  | O O O O |  |',
      '           |  |  GYRO4  |  |',
      '           |  +---------+  |',
      '           |               |',
      '           |  [NAV/COMM]   |',
      '           |  +---------+  |',
      '           |  | ANTENA  |  |',
      '           |  |  DISH   |  |',
      '           |  +---------+  |',
      '           |_______________|',
      '           =======S2========',
      '           | [PROP UPPER]  |',
      '           |  +---------+  |',
      '           |  | VAC ENG |  |',
      '           |  | 1200kN  |  |',
      '           |  +---------+  |',
      '           |_______________|',
      '          /                 \\',
      '         /  [LOX]    [CH4]   \\',
      '        /_____________________\\',
      '        |    [SUPER HEAVY]    |',
      '        |  +--------------+   |',
      '        |  |  RAPTOR x33  |   |',
      '        |  |   7500 kN    |   |',
      '        |  +--------------+   |',
      '        |_____________________|',
      '       /_______________________\\',
      '          _|  ||| ||| |||  |_',
      '         / |  ||| ||| |||  | \\',
      '        /  |  ||| ||| |||  |  \\',
      '       L   |  ||| ||| |||  |   L',
      '      LL   |__||| ||| |||__|   LL',
    ],
    launching: [
      '                   *',
      '                  /|\\',
      '                 / | \\',
      '                /  |  \\',
      '            /   ARTEMIS   \\',
      '           /_______________\\',
      '           |  |  LUNAR  |  |',
      '           |  | LANDER  |  |',
      '           |  [AVIONICS]   |',
      '           |  | O O O O |  |',
      '           |  [NAV/COMM]   |',
      '           |_______________|',
      '           =======S2========',
      '           | [PROP UPPER]  |',
      '           |  | VAC ENG |  |',
      '           |  | 1200kN  |  |',
      '           |_______________|',
      '          /                 \\',
      '        /_____________________\\',
      '        |  |  RAPTOR x33  |   |',
      '        |  |   7500 kN    |   |',
      '        |_____________________|',
      '       /_______________________\\',
      '         \\|  ||| ||| |||  |/',
      '        \\\\|  ||| ||| |||  |//',
      '       \\\\\\|  ||| ||| |||  |///',
      '      \\\\\\\\|  ||| ||| |||  |////',
    ],
  },
};

// ── 실패 프레임 크기/속도 스케일링 (D5 Section 5.1) ──
const FAIL_SCALE = {
  vega: { frameDuration: 500, shakeClass: 'shake-sm' },
  argo: { frameDuration: 600, shakeClass: 'shake-sm' },
  hermes: { frameDuration: 650, shakeClass: 'shake-md' },
  atlas: { frameDuration: 700, shakeClass: 'shake-md' },
  selene: { frameDuration: 750, shakeClass: 'shake-lg' },
  artemis: { frameDuration: 800, shakeClass: 'shake-xl' },
};

/** 클래스별 실패 프레임 + 스케일링 데이터 반환 (D5: STAGE_FAIL_FRAMES 사용) */
function getScaledFailFrames(classId, zone) {
  const baseFrames = (typeof STAGE_FAIL_FRAMES !== 'undefined' && STAGE_FAIL_FRAMES[zone])
    || (typeof STAGE_FAIL_FRAMES !== 'undefined' && STAGE_FAIL_FRAMES.ground) || [];
  const scale = FAIL_SCALE[classId] || FAIL_SCALE.vega;
  return {
    frames: baseFrames,
    frameDuration: scale.frameDuration,
    shakeClass: scale.shakeClass,
  };
}

// ============================================================
//  LAUNCH STAGE ANIMATION FRAMES — 단계별 성공/실패 프레임
//  각 단계 5초 이상 — 프레임 3~4개 × 1.2~1.7초 간격
//  { art: string[], color: CSS var, effect: string, durationMs: number }
//  fullScene: true → 로켓+배경이 하나의 완성된 장면 (로켓 아트 숨김)
// ============================================================

/** 단계별 성공 애니메이션 프레임 (로켓 클래스에 무관한 공용 프레임) */
const LAUNCH_SUCCESS_FRAMES = {
  // ── LIFTOFF (stage 4) — 점화/이륙 ──
  4: [
    {
      art: [
        '   IGNITION SEQUENCE START',
        '',
        '     .|. .|. .|.',
        '      | . | . |',
      ], color: '--amber', effect: 'shake-sm', durationMs: 1200
    },
    {
      art: [
        '   ~~ LIFTOFF ~~',
        '',
        '     \\| | |/',
        '    \\\\| | |//',
        '   \\\\\\| | |///',
      ], color: '--amber', effect: 'shake-md', durationMs: 1300
    },
    {
      art: [
        '     \\| | |/',
        '    \\\\| | |//',
        '   \\\\\\| | |///',
        '  \\\\\\\\| | |////',
        '',
        '  TOWER CLEAR',
      ], color: '--green', effect: 'shake-lg', durationMs: 1300
    },
    {
      art: [
        '    \\\\| | |//',
        '   \\\\\\| | |///',
        '  \\\\\\\\| | |////',
        ' \\\\\\\\\\| | |/////',
        '',
        '  ALTITUDE: NOMINAL',
      ], color: '--green', effect: 'rise', durationMs: 1200
    },
  ],

  // ── MAX-Q (stage 5) — 최대 동압 ──
  5: [
    {
      art: [
        '          MAX-Q',
        '    \uB3D9\uC555: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591',
        '',
        '    VIBRATION ALERT',
        '    \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591',
      ], color: '--amber', effect: 'shake', durationMs: 1500
    },
    {
      art: [
        '          MAX-Q',
        '    \uB3D9\uC555: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588',
        '',
        '    STRUCTURAL LOAD',
        '    \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593',
      ], color: '--amber', effect: 'shake-heavy', durationMs: 1500
    },
    {
      art: [
        '          MAX-Q',
        '    \uB3D9\uC555: \u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591',
        '',
        '    NOMINAL',
        '    MAX-Q \uD1B5\uACFC',
      ], color: '--green', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '    \uB3D9\uC555 \uAC10\uC18C',
        '',
        '    \uACE0\uB3C4: \uC0C1\uC2B9 \uC911',
        '    \uC18D\uB3C4: NOMINAL',
      ], color: '--green', effect: 'none', durationMs: 800
    },
  ],

  // ── MECO (stage 6) — 주엔진 차단 ──
  6: [
    {
      art: [
        '    ENGINE BURN',
        '    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588',
        '',
        '    \uC5F0\uC18C: \uC815\uC0C1 \uC9C4\uD589',
        '    \uCD94\uB825: NOMINAL',
      ], color: '--amber', effect: 'none', durationMs: 1500
    },
    {
      art: [
        '    ENGINE BURN',
        '    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588',
        '',
        '    MECO \uC900\uBE44',
        '    T+ COUNTDOWN',
      ], color: '--amber', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '        MECO',
        '      \uC5D4\uC9C4 \uCC28\uB2E8',
        '',
        '     .  .  .',
        '    \uAD00\uC131 \uBE44\uD589 \uC804\uD658',
      ], color: '--green', effect: 'none', durationMs: 1300
    },
    {
      art: [
        '    1\uB2E8 \uC5F0\uC18C \uC885\uB8CC',
        '',
        '    \uAD00\uC131 \uBE44\uD589 \uC911',
        '    V = NOMINAL',
      ], color: '--green', effect: 'none', durationMs: 1000
    },
  ],

  // ── STG SEP (stage 7) — 단분리 ──
  7: [
    {
      art: [
        '    SEPARATION',
        '    \uBD84\uB9AC \uC2DC\uD000\uC2A4...',
        '',
        '   ====X X====',
        '    \uD3ED\uBC1C \uBCFC\uD2B8 \uC791\uB3D9',
      ], color: '--amber', effect: 'none', durationMs: 1300
    },
    {
      art: [
        '    STG SEP OK',
        '    2\uB2E8 \uC810\uD654',
        '',
        '      \\| |/',
        '     \\\\| |//',
        '',
        '           v v v',
        '         [STAGE 1]',
      ], color: '--green', effect: 'none', durationMs: 1500
    },
    {
      art: [
        '    2ND STAGE',
        '    NOMINAL',
        '',
        '      \\| |/',
        '     \\\\| |//',
      ], color: '--green', effect: 'rise', durationMs: 1200
    },
    {
      art: [
        '    2\uB2E8 \uBE44\uD589 \uC815\uC0C1',
        '',
        '    \uACE0\uB3C4: \uC0C1\uC2B9 \uC911',
        '    \uC18D\uB3C4: \uC99D\uAC00 \uC911',
      ], color: '--green', effect: 'none', durationMs: 1000
    },
  ],

  // ── ORBIT (stage 8) — 궤도 진입 ──
  // fullScene: true — 로켓+배경이 하나의 완성된 장면
  8: [
    {
      art: [
        '                           *',
        '  .  *  .               . /|\\',
        ' *      .  *            / | \\',
        '  . * .   .            /  |  \\',
        '   .  * .             /________\\     ORBIT INSERT',
        '  *  .  *  .          |________|     \uC18D\uB3C4: 7.8 km/s',
        '  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~       \uACE0\uB3C4: 200 km',
        '   ~~ EARTH HORIZON ~~',
      ], color: '--cyan', effect: 'none', durationMs: 1600, fullScene: true
    },
    {
      art: [
        '  .  *  .  .  *',
        ' *      .  *',
        '  . * .   .         ---->  *',
        '   .  * .               . /|\\',
        '  *  .  *  .            [====]',
        '  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '   ~~ LEO 200km ~~',
        '    ORBIT ACHIEVED',
      ], color: '--cyan', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '  .  *  .  .  *',
        ' *      .  *',
        '  . * .   .    ---->  *',
        '   .  * .            /|\\',
        '  *  .  *  .        [====]',
        '  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '',
        '    ORBIT ACHIEVED',
      ], color: '--green', effect: 'none', durationMs: 1400, fullScene: true
    },
    {
      art: [
        '  \uADA4\uB3C4 \uC9C4\uC785 \uC131\uACF5',
        '',
        '  LEO \uC548\uC815 \uADA4\uB3C4',
        '  V = 7.8 km/s',
      ], color: '--green', effect: 'none', durationMs: 1000
    },
  ],

  // ── TLI (stage 9) — 달 전이 궤도 ──
  // fullScene: true — 로켓+지구+달이 하나의 완성된 장면
  9: [
    {
      art: [
        '                              .  (  )',
        '  .  *  .                    (    )',
        ' *      .         ===>  *   (  @  )',
        '  . * .                /|\\   (  )',
        '  ~~~~~~~~~~~~           ()',
        '   ~~ EARTH ~~',
        '                      TLI BURN',
        '                      V = 10.9 km/s',
      ], color: '--amber', effect: 'none', durationMs: 1600, fullScene: true
    },
    {
      art: [
        '                         .  (  )',
        '                        (    )',
        '   *              * -> (  @  )',
        '  (O)                   (  )',
        '  EARTH                  ()',
        '',
        '  --- TLI COMPLETE ---',
        '  \uB2EC \uC804\uC774 \uADA4\uB3C4 \uC9C4\uC785 \uC131\uACF5',
      ], color: '--green', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '                    .  (  )',
        '                   (    )',
        '  *          * -> (  @  )',
        ' (O)              (  )',
        ' EARTH             ()',
        '',
        ' --- TLI COMPLETE ---',
      ], color: '--green', effect: 'none', durationMs: 1400, fullScene: true
    },
    {
      art: [
        '  \uB2EC \uC804\uC774 \uADA4\uB3C4 \uC9C4\uC785 \uC131\uACF5',
        '',
        '  \uC9C0\uAD6C\u2192\uB2EC \uC804\uC774 \uC911',
        '  ETA: 3\uC77C',
      ], color: '--green', effect: 'none', durationMs: 1000
    },
  ],

  // ── LOI (stage 10) — 달 궤도 포획 ──
  // fullScene: true — 로켓+달이 하나의 완성된 장면
  10: [
    {
      art: [
        '       .  (    )',
        '      (        )',
        '     (  MOON    )       *  <---',
        '      (        )       /|\\',
        '       (      )       [==]',
        '        (  )       LOI BURN',
        '                  \uAC10\uC18D \uC5F0\uC18C \uC911',
      ], color: '--cyan', effect: 'none', durationMs: 1600, fullScene: true
    },
    {
      art: [
        '       .  (    )',
        '      (        )',
        '     (  MOON    )   <--- *',
        '      (        )       /|\\',
        '       (      )',
        '        (  )',
        '',
        '  \uAC10\uC18D \uC5F0\uC18C \uC9C4\uD589 \uC911...',
      ], color: '--cyan', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '       .  (    )',
        '      (   *     )',
        '     (  /|\\      )',
        '      ( [==]    )',
        '       (      )',
        '        (  )',
        '',
        '   LOI COMPLETE',
        '   \uB2EC \uADA4\uB3C4 \uD3EC\uD68D \uC131\uACF5',
      ], color: '--green', effect: 'none', durationMs: 1400, fullScene: true
    },
    {
      art: [
        '  \uB2EC \uADA4\uB3C4 \uD3EC\uD68D \uC131\uACF5',
        '',
        '  \uB2EC \uADA4\uB3C4 \uC548\uC815\uD654',
        '  \uCC29\uB959 \uC900\uBE44 \uC2DC\uC791',
      ], color: '--green', effect: 'none', durationMs: 1000
    },
  ],

  // ── LANDING (stage 11) — 달 착륙 ──
  // fullScene: true — 로켓+달 표면이 하나의 완성된 장면
  11: [
    {
      art: [
        '       *',
        '      /|\\',
        '     / | \\       DESCENT',
        '    [=====]      \uACE0\uB3C4: 15km',
        '       |         \uC18D\uB3C4: 1.7km/s',
        '       |',
        '       v',
        '   ___________',
        '  /  .  o  .  \\',
        ' / .  MOON  .  \\',
      ], color: '--cyan', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '      /|\\',
        '     / | \\       RETRO BURN',
        '    [=====]      \uACE0\uB3C4: 500m',
        '      |||        \uC18D\uB3C4: 50m/s',
        '     \\|||/',
        '    \\\\|||//',
        '   ___________',
        '  /  .  o  .  \\',
        ' / .  MOON  .  \\',
      ], color: '--amber', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '      /|\\',
        '     / | \\       TOUCHDOWN',
        '    [=====]      \uACE0\uB3C4: 0m',
        '    _|   |_      \uC18D\uB3C4: 0m/s',
        '   / |   | \\',
        '  ___________',
        '  .  .  o  .  .',
        '    . MOON .',
      ], color: '--green', effect: 'none', durationMs: 1500, fullScene: true
    },
    {
      art: [
        '                    _',
        '      /|\\          | |',
        '     / | \\         | |   MISSION',
        "    [=====]  ------' |   COMPLETE",
        '    _|   |_          |',
        '   / |   | \\         |',
        ' ___________________________',
        ' .  .  o  .  .  .  o  .  .',
        '   .  . LUNAR BASE .  .',
        '',
        ' ** TOUCHDOWN CONFIRMED **',
      ], color: '--green', effect: 'success-glow', durationMs: 1500, fullScene: true
    },
  ],
};

// ── 단계별 실패 애니메이션 프레임 (존별) ──
// D5 섹션 4 기반 — 경고 → 이상 감지 → 폭발/분해 → 잔해 4프레임 구조
const STAGE_FAIL_FRAMES = {
  // ground zone (LIFTOFF 4, MAX-Q 5) — 지상/저고도 폭발
  // D5 섹션 4.2~4.3
  ground: [
    {
      art: [
        '    !! WARNING !!',
        '',
        '    .|!  !  !|.',
        '  !! ENGINE ANOMALY !!',
      ], color: '--amber', effect: 'shake', durationMs: 1500
    },
    {
      art: [
        '    \\  * . /',
        '  . * \u2554\u2550\u2557 * .',
        ' * \u2591\u2591\u2591\u2551!\u2551\u2591\u2591\u2591 *',
        '  \u2591\u2592\u2593\u2593\u2588\u2588\u2588\u2593\u2593\u2592\u2591',
        '   \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        '     \\|/  \\|/',
        '   !!FIRE ON PAD!!',
        '  ABORT ABORT ABORT',
      ], color: '--red', effect: 'flash', durationMs: 1500
    },
    {
      art: [
        '     .   \u00B7   .',
        '   \u00B7   .   \u00B7',
        '    \u2591  \u2592\u2593\u2592  \u2591',
        '  \u2591\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591',
        '  \u2500\u2500\u2500\u2550\u2550\u2564\u2550\u2550\u2500\u2500\u2500',
        '  \u2593\u2593 PAD LOST \u2593\u2593',
        '',
        '  ~~ RUD \u2014 T+0 ~~',
      ], color: '--red', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '  .  \u00B7  .  \u00B7',
        ' \u00B7  .  \u00B7  .',
        '   .  .  .  .',
        '',
        '  ~~ RUD CONFIRMED ~~',
      ], color: '--green-dim', effect: 'none', durationMs: 800
    },
  ],

  // high_atm zone (MECO 6, STG SEP 7) — 고고도 분해
  // D5 섹션 4.4~4.5
  high_atm: [
    {
      art: [
        '    !! ALERT !!',
        '',
        '   \uAD6C\uC870 \uC774\uC0C1 \uAC10\uC9C0',
        '   SEPARATION FAIL',
      ], color: '--amber', effect: 'shake', durationMs: 1500
    },
    {
      art: [
        '     .  \\  * /  .',
        '    * .  \u2554\u2557  . *',
        '   / * . \u2551\u2551 . * \\',
        '  *  \u2591\u2592\u2593\u2588\u2551\u2551\u2588\u2593\u2592\u2591  *',
        '   . \u2592\u2593\u2588\u2588\u255A\u255D\u2588\u2588\u2593\u2592 .',
        '  * \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591  *',
        '     \u2591\u2592\u2593\u2588\u2588\u2588\u2593\u2592\u2591',
        '   !! BREAKUP !!',
      ], color: '--red', effect: 'flash', durationMs: 1500
    },
    {
      art: [
        '   .  \u00B7  .  \u00B7  .',
        '  \u00B7  . \u00B7 . \u00B7  .',
        '    \u2591 . \u2592 . \u2591',
        '   \u2591  \u2592\u2593\u2592  \u2591',
        '    .  \u00B7  .  \u00B7',
        '  // DEBRIS //',
        '   .  .  .  .',
        '',
        '  \uB3D9\uCCB4 \uACF5\uC911\uBD84\uD574 \uD655\uC778',
      ], color: '--red', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '   .  .  .  .',
        '  \u00B7  .  \u00B7  .',
        '    .  \u00B7  .',
        '',
        '  \uB3D9\uCCB4 \uACF5\uC911\uBD84\uD574 \uD655\uC778',
      ], color: '--green-dim', effect: 'none', durationMs: 800
    },
  ],

  // space zone (ORBIT 8, TLI 9) — 우주 엔진 고장
  // D5 섹션 4.6~4.7
  space: [
    {
      art: [
        '    .  *  .',
        '   *       *',
        '  . [ENGINE] .',
        '  . [CUTOFF] .',
        '   *   !   *',
        '    .  *  .',
        '  ~~~~~~~~~~~~~~~~',
        '   ~~ EARTH ~~',
      ], color: '--amber', effect: 'none', durationMs: 1500
    },
    {
      art: [
        '    .  \u00B7  .',
        '  \u00B7         \u00B7',
        '   . \u2591\u2592\u2593\u2592\u2591 .',
        '   \u2591\u2591 !! \u2591\u2591',
        '  \u00B7         \u00B7',
        ' ~~ DRIFT ~~',
        '  ~~~~~~~~~~~~~~~~',
      ], color: '--red', effect: 'none', durationMs: 1500
    },
    {
      art: [
        '   .  \u00B7  .',
        ' \u00B7         \u00B7',
        '  . \u2591\u2592\u2593\u2592\u2591 .',
        '',
        ' ~~ DRIFT ~~',
        '  \uC2E0\uD638 \uAC10\uC1E0 \uC911',
      ], color: '--red', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '   \u00B7    .    \u00B7',
        ' .    \u00B7    .',
        '    . \u00B7 . \u00B7',
        '  \u00B7    .    \u00B7',
        ' .    \u00B7    .',
        ' // LOST //',
        '   .    .    .',
        '',
        ' \uADA4\uB3C4 \uC0BD\uC785 \uC2E4\uD328',
      ], color: '--green-dim', effect: 'none', durationMs: 800
    },
  ],

  // lunar zone (LOI 10, LANDING 11) — 달 충돌
  // D5 섹션 4.8~4.9
  lunar: [
    {
      art: [
        '    . * .',
        '   *     *',
        '  .  \\\\|/  .',
        '  . --*-- .',
        '  .  /|\\\\  .',
        '   *     *',
        '  ~IMPACT~',
      ], color: '--amber', effect: 'shake', durationMs: 1500
    },
    {
      art: [
        '  \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        ' \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        '\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        ' \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        '  \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591',
        '  ___________',
        '  . . CRASH . .',
        '    ~IMPACT~',
      ], color: '--red', effect: 'flash', durationMs: 1500
    },
    {
      art: [
        '    .  \u00B7  .',
        '  _____________',
        ' /  .  \u00B7  .  \\',
        '/ \u00B7   RUD   . \\',
        '\\ .  \u00B7  .  \u00B7 /',
        ' \\_____\u25CF_____/',
        '  // MOON //',
        '',
        '  \uCC29\uB959 \uC2E4\uD328 \u2014 \uD45C\uBA74 \uCDA9\uB3CC',
      ], color: '--red', effect: 'none', durationMs: 1200
    },
    {
      art: [
        '',
        '  _____________________',
        ' /  .  \u00B7 .:. \u00B7  .  \\',
        '/ \u00B7   .  \u25CF  .   \u00B7 \\',
        '\\ .  \u00B7 DEBRIS \u00B7 . /',
        ' \\_________________/',
        '  // LUNAR SURFACE //',
      ], color: '--green-dim', effect: 'none', durationMs: 800
    },
  ],
};
