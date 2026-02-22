// ============================================================
//  WORLD — js/world.js
// ============================================================
const WORLD_POSITIONS = {
  housing:      310,  // 주거시설 맨 왼쪽
  ops_center:   510,  // addon @ 590
  research_lab: 690,  r_and_d:      860,
  supply_depot: 1210, mine:         1420, extractor:    1560,
  refinery:     1750, cryo_plant:   1930, elec_lab:     2130,
  fab_plant:    2300, solar_array:  2490, launch_pad:   2700,
  // launch_pad addon @ 2800
};

// 애드온 건물 위치 (부모 건물 우측 밀착 — 문자 폭 6.6px 기준)
const ADDON_POSITIONS = {
  ops_center:  590,   // 510 + 12자×6.6px ≈ 79px → 590
  launch_pad: 2800,   // 2700 + 15자×6.6px ≈ 99px → 2800
};

// ─── ASCII BUILDING ART (upgrade-aware, cnt-aware height, no double-width chars) ───
// cnt: 현재 건물 개수. 단계별로 더 높은/넓은 아트를 반환.
// 높이 단계: 1-2=기본, 3-5=중간, 6-9=대형, 10+=거대형
function _bldHeightTier(cnt) {
  if (cnt >= 10) return 3; // 거대형
  if (cnt >= 6)  return 2; // 대형
  if (cnt >= 3)  return 1; // 중간
  return 0;                // 기본
}

function _bldAscii(bld, cnt) {
  cnt = cnt || 1;
  const tier = _bldHeightTier(cnt);
  const bu = gs.bldUpgrades || {};
  switch (bld.wbClass) {

    case 'wb-housing':
      if (bu.hsg_township) {
        if (tier >= 2) return (
          '╔═══════╗\n' +
          '║ ▓▓▓▓  ║\n' +
          '╠═══════╣\n' +
          '║ ▓▓▓▓  ║\n' +
          '╠═══════╣\n' +
          '║ ▒▒▒▒  ║\n' +
          '║ ▒▒▒▒  ║\n' +
          '╠═══════╣\n' +
          '║ ▒▒▒▒  ║\n' +
          '╠═══════╣\n' +
          '║TWNSHIP║\n' +
          '╚═══════╝\n' +
          '█████████'
        );
        return (
          '╔═══════╗\n' +
          '║ ▓▓▓▓  ║\n' +
          '║ ▓▓▓▓  ║\n' +
          '╠═══════╣\n' +
          '║ ▒▒▒▒  ║\n' +
          '║ ▒▒▒▒  ║\n' +
          '╠═══════╣\n' +
          '║TWNSHIP║\n' +
          '╚═══════╝\n' +
          '█████████'
        );
      }
      if (bu.hsg_welfare) {
        if (tier >= 2) return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '╠═══════════╣\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '╚═══════════╝\n' +
          '█████████████'
        );
        return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '╚═══════════╝\n' +
          '█████████████'
        );
      }
      if (bu.hsg_dorm) {
        if (tier >= 2) return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '╠═══════════╣\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '║ ░░ ░░ ░░  ║\n' +
          '╚═══════════╝\n' +
          '█████████████'
        );
        return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '║ ░░ ░░ ░░  ║\n' +
          '╚═══════════╝\n' +
          '█████████████'
        );
      }
      if (tier >= 3) return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╠═══════════╣\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╠═══════════╣\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╚═══════════╝\n' +
        '█████████████'
      );
      if (tier >= 2) return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╠═══════════╣\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╚═══════════╝\n' +
        '█████████████'
      );
      if (tier >= 1) return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '║ ░░ ░░ ░░  ║\n' +
        '╚═══════════╝\n' +
        '█████████████'
      );
      return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╚═══════════╝\n' +
        '█████████████'
      );

    case 'wb-ops': {
      const isOps = bld.id === 'ops_center';
      if (isOps && bu.ops_premium) {
        if (tier >= 2) return (
          '╔══════════╗\n' +
          '║ PREMIUM  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '╠══════════╣\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░ VIP ░  ║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
        return (
          '╔══════════╗\n' +
          '║ PREMIUM  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░ VIP ░  ║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
      }
      if (isOps && bu.ops_24h) {
        if (tier >= 2) return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '╠══════════╣\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░░ 24H ░░║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
        return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░░ 24H ░░║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
      }
      if (isOps && bu.ops_sales) {
        if (tier >= 2) return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓░▓▓░▓▓ ║\n' +
          '╠══════════╣\n' +
          '║ ░▓▓░▓▓░▓ ║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
        return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓░▓▓░▓▓ ║\n' +
          '║ ░▓▓░▓▓░▓ ║\n' +
          '╚══════════╝\n' +
          '████████████'
        );
      }
      const lbl = isOps ? 'OPS CTR  ' : 'SUPPLY D ';
      if (tier >= 3) return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '╠══════════╣\n' +
        '║ ░▓░▓░▓░  ║\n' +
        '╠══════════╣\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );
      if (tier >= 1) return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '╠══════════╣\n' +
        '║ ░▓░▓░▓░  ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );
      return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '║ ░▓░▓░▓░  ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );
    }

    case 'wb-mine': {
      const isExt = bld.id === 'extractor';
      if (!isExt && bu.mine_robot) {
        if (tier >= 2) return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓ ROBOT ▓  ║\n' +
          '╠═════════════╣\n' +
          '╚═════════════╝\n' +
          '███████████████'
        );
        return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓ ROBOT ▓  ║\n' +
          '╚═════════════╝\n' +
          '███████████████'
        );
      }
      if (!isExt && bu.mine_deep) {
        if (tier >= 2) return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓▒▒▒▒▒▒▓  ║\n' +
          '╚═════════════╝\n' +
          '███████████████'
        );
        return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓▒▒▒▒▒▒▓  ║\n' +
          '╚═════════════╝\n' +
          '███████████████'
        );
      }
      if (tier >= 3) return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╠═════════════╣\n' +
        '╚═════════════╝\n' +
        '███████████████'
      );
      if (tier >= 1) return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╠═════════════╣\n' +
        '╚═════════════╝\n' +
        '███████████████'
      );
      return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╚═════════════╝\n' +
        '███████████████'
      );
    }

    case 'wb-refinery':
      if (tier >= 3) return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╠═╣  ╠══╣\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '██████████'
      );
      if (tier >= 1) return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╠═╣  ╠══╣\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '██████████'
      );
      return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '██████████'
      );

    case 'wb-eleclab':
      if (tier >= 3) return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒ ║\n' +
        '╠══════════╣\n' +
        '║░▒░▒░▒░▒░ ║\n' +
        '╠══════════╣\n' +
        '║▒░▒░▒░▒░▒ ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );
      if (tier >= 1) return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒ ║\n' +
        '╠══════════╣\n' +
        '║░▒░▒░▒░▒░ ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );
      return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒ ║\n' +
        '║░▒░▒░▒░▒░ ║\n' +
        '╚══════════╝\n' +
        '████████████'
      );

    case 'wb-research': {
      const isRnd = bld.id === 'r_and_d';
      if (!isRnd && bu.rsh_super) {
        if (tier >= 2) return (
          '╔════════════╗\n' +
          '║ SUPER-LAB  ║\n' +
          '║ ▓▓░░░░▓▓   ║\n' +
          '╠════════════╣\n' +
          '║ ░▓▓▓▓▓░    ║\n' +
          '╠════════════╣\n' +
          '║ [CPU-9000] ║\n' +
          '╚════════════╝\n' +
          '██████████████'
        );
        return (
          '╔════════════╗\n' +
          '║ SUPER-LAB  ║\n' +
          '║ ▓▓░░░░▓▓   ║\n' +
          '║ ░▓▓▓▓▓░    ║\n' +
          '╠════════════╣\n' +
          '║ [CPU-9000] ║\n' +
          '╚════════════╝\n' +
          '██████████████'
        );
      }
      if (!isRnd && bu.rsh_cross) {
        if (tier >= 2) return (
          '╔════════════╗\n' +
          '║  RESEARCH  ║\n' +
          '║ ▓▓▓░▓▓▓░▓▓ ║\n' +
          '╠════════════╣\n' +
          '║ ░▓▓▓░▓▓▓░▓ ║\n' +
          '╠════════════╣\n' +
          '╚════════════╝\n' +
          '██████████████'
        );
        return (
          '╔════════════╗\n' +
          '║  RESEARCH  ║\n' +
          '║ ▓▓▓░▓▓▓░▓▓ ║\n' +
          '║ ░▓▓▓░▓▓▓░▓ ║\n' +
          '╠════════════╣\n' +
          '╚════════════╝\n' +
          '██████████████'
        );
      }
      if (tier >= 3) return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '╠════════════╣\n' +
        '║ ░▓░▓░▓░▓   ║\n' +
        '╠════════════╣\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '╚════════════╝\n' +
        '██████████████'
      );
      if (tier >= 1) return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '╠════════════╣\n' +
        '║ ░▓░▓░▓░▓   ║\n' +
        '╚════════════╝\n' +
        '██████████████'
      );
      return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '║ ░▓░▓░▓░▓   ║\n' +
        '╠════════════╣\n' +
        '╚════════════╝\n' +
        '██████████████'
      );
    }

    case 'wb-solar':
      if (bu.sol_tracker) {
        if (tier >= 2) return (
          ' ╔╗ -- ╔╗ -- ╔╗\n' +
          ' ╠╣    ╠╣    ╠╣\n' +
          ' ╚╝    ╚╝    ╚╝\n' +
          '  │     │     │\n' +
          '  │     │     │\n' +
          ' ██████████████'
        );
        return (
          ' ╔╗ -- ╔╗\n' +
          ' ╠╣    ╠╣\n' +
          ' ╚╝    ╚╝\n' +
          '  │     │\n' +
          '  │     │\n' +
          ' ████████'
        );
      }
      if (bu.sol_hieff) {
        if (tier >= 2) return (
          ' ╔╗    ╔╗    ╔╗\n' +
          ' ╠╣▓   ╠╣▓   ╠╣▓\n' +
          ' ╚╝    ╚╝    ╚╝\n' +
          '  │     │     │\n' +
          '  │     │     │\n' +
          ' ██████████████'
        );
        return (
          ' ╔╗    ╔╗\n' +
          ' ╠╣▓   ╠╣▓\n' +
          ' ╚╝    ╚╝\n' +
          '  │     │\n' +
          '  │     │\n' +
          ' ████████'
        );
      }
      if (tier >= 3) return (
        ' ╔╗    ╔╗    ╔╗\n' +
        ' ╠╣    ╠╣    ╠╣\n' +
        ' ╚╝    ╚╝    ╚╝\n' +
        '  │     │     │\n' +
        '  │     │     │\n' +
        ' ██████████████'
      );
      return (
        ' ╔╗    ╔╗\n' +
        ' ╠╣    ╠╣\n' +
        ' ╚╝    ╚╝\n' +
        '  │     │\n' +
        '  │     │\n' +
        ' ████████'
      );

    case 'wb-launchpad':
      if (bu.pad_fuelfeed) {
        if (tier >= 2) return (
          '        *\n' +
          '      /▲▲╲\n' +
          '     /▓▓▓▓╲\n' +
          '    /══▓▓══╲\n' +
          '   ╔═════════╗\n' +
          '   ║ [PAD++] ║\n' +
          '──╚═══════════╝──'
        );
        return (
          '      /▲╲\n' +
          '     /▓▓▓╲\n' +
          '    /══▓══╲\n' +
          '   ╔═══════╗\n' +
          '   ║[PAD+] ║\n' +
          '───╚═══════╝───'
        );
      }
      if (bu.pad_reinforce) {
        if (tier >= 2) return (
          '        *\n' +
          '      /▲▲╲\n' +
          '     / ▓▓ ╲\n' +
          '    /══▓══╲\n' +
          '   ╔═══════╗\n' +
          '   ║[R-PAD]║\n' +
          '───╚═══════╝───'
        );
        return (
          '      /▲╲\n' +
          '     / ▓ ╲\n' +
          '    /══▓══╲\n' +
          '   ╔═══════╗\n' +
          '   ║[R-PAD]║\n' +
          '───╚═══════╝───'
        );
      }
      if (tier >= 3) return (
        '        *\n' +
        '       /▲╲\n' +
        '      / ▓ ╲\n' +
        '     /  ▓  ╲\n' +
        '    /   ▓   ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '───╚═══════╝───'
      );
      if (tier >= 1) return (
        '      /▲╲\n' +
        '     / ▓ ╲\n' +
        '    /  ▓  ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '───╚═══════╝───'
      );
      return (
        '      /▲╲\n' +
        '     / ▓ ╲\n' +
        '    /  ▓  ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '───╚═══════╝───'
      );

    default: {
      const ic = (bld.icon || '[??]').slice(0, 5).padEnd(5);
      return (
        '╔═══════╗\n' +
        '║ ' + ic + ' ║\n' +
        '╚═══════╝\n' +
        '█████████'
      );
    }
  }
}

// ─── ADD-ON BUILDING ASCII ART ───────────────────────────────
function _addonAscii(option) {
  if (!option) return _addonPlaceholderAscii();
  switch (option.id) {
    case 'addon_inv_bank':
      return (
        '─╔══════╗\n' +
        ' ║ INV  ║\n' +
        ' ║ BANK ║\n' +
        ' ║ $$$  ║\n' +
        ' ╚══════╝\n' +
        ' ████████'
      );
    case 'addon_tech_hub':
      return (
        '─╔══════╗\n' +
        ' ║ TECH ║\n' +
        ' ║  HUB ║\n' +
        ' ║ ▒▒▒  ║\n' +
        ' ╚══════╝\n' +
        ' ████████'
      );
    case 'addon_launch_ctrl':
      return (
        '─╔═════╗\n' +
        ' ║ CTL ║\n' +
        ' ║ TWR ║\n' +
        ' ║ ▓▓▓ ║\n' +
        ' ╚═════╝\n' +
        ' ███████'
      );
    case 'addon_vif':
      return (
        '─╔═════╗\n' +
        ' ║ VIF ║\n' +
        ' ║─────║\n' +
        ' ║ FAB ║\n' +
        ' ╚═════╝\n' +
        ' ███████'
      );
    default:
      return _addonPlaceholderAscii();
  }
}

function _addonPlaceholderAscii() {
  return (
    '─╔═════╗\n' +
    ' ║ ??? ║\n' +
    ' ║ADDON║\n' +
    ' ╚═════╝\n' +
    ' ███████'
  );
}

// ─── SCAFFOLD/CONSTRUCTION PLACEHOLDER ────────────────────
function _scaffoldAscii() {
  return (
    '     |\n' +
    '  ╔══╧══╗\n' +
    '  ║/////║\n' +
    '  ║ TBD ║\n' +
    '  ╚═════╝\n' +
    '  ███████'
  );
}

function updateWorldBuildings() {
  const layer = document.getElementById('buildings-layer');
  if (!layer) return;
  layer.innerHTML = '';

  BUILDINGS.forEach(b => {
    // Show all unlocked buildings (ghost if not built yet)
    if (!gs.unlocks || !gs.unlocks['bld_' + b.id]) return;

    const x           = WORLD_POSITIONS[b.id] || 100;
    const cnt         = gs.buildings[b.id] || 0;
    const assigned    = (gs.assignments && gs.assignments[b.id]) || 0;
    const isBonus     = b.produces === 'bonus';
    const addonDef    = typeof BUILDING_ADDONS !== 'undefined' && BUILDING_ADDONS[b.id];
    const addonChoice = gs.addons && gs.addons[b.id];

    // CSS state class
    let stateClass;
    if (cnt === 0)                     stateClass = 'wb-state-ghost';
    else if (assigned > 0 || isBonus) stateClass = 'wb-state-active';
    else                               stateClass = 'wb-state-idle';

    // ── Add-on pre (created first so parent hover can reference it) ──
    let addonPre = null;
    if (cnt >= 1 && ADDON_POSITIONS[b.id] && addonDef) {
      addonPre = document.createElement('pre');
      addonPre.style.left = ADDON_POSITIONS[b.id] + 'px';
      addonPre.dataset.addonFor = b.id;
      if (addonChoice) {
        const opt = addonDef.options.find(o => o.id === addonChoice);
        addonPre.className = 'world-bld wb-addon wb-state-active';
        addonPre.textContent = _addonAscii(opt);
        addonPre.dataset.bid = b.id + '_addon';
        addonPre.addEventListener('mouseenter', () => openAddonOv(b, opt, addonPre));
        addonPre.addEventListener('mouseleave', () => scheduleBldOvClose());
      } else {
        // Uninstalled: invisible by default, ghost-revealed on parent hover
        addonPre.className = 'world-bld wb-addon';
        addonPre.style.opacity = '0';
        addonPre.style.pointerEvents = 'none';
        addonPre.style.transition = 'opacity 0.25s';
        addonPre.textContent = _addonPlaceholderAscii();
      }
      layer.appendChild(addonPre);
    }

    // ── Parent building pre ───────────────────────────────────
    const pre = document.createElement('pre');
    if (cnt === 0) {
      pre.className = 'world-bld ' + stateClass + ' ghost-bld';
    } else {
      const workerClass = assigned > 0 ? ' active-bld has-workers' : ' active-bld';
      pre.className = 'world-bld ' + stateClass + (cnt > 0 ? workerClass : '');
    }
    pre.dataset.bid = b.id;
    pre.style.left = x + 'px';
    pre.textContent = cnt === 0 ? _scaffoldAscii() : _bldAscii(b, cnt);

    if (cnt > 0) {
      pre.addEventListener('mouseenter', () => {
        openBldOv(b, pre);
        if (addonPre && !addonChoice) addonPre.style.opacity = '0.2';
      });
      pre.addEventListener('mouseleave', () => {
        scheduleBldOvClose();
        if (addonPre && !addonChoice) addonPre.style.opacity = '0';
      });
    } else {
      pre.addEventListener('mouseenter', () => {
        clearTimeout(_bldOvTimer);
        openGhostOv(b, pre);
      });
      pre.addEventListener('mouseleave', () => {
        scheduleBldOvClose();
      });
    }
    layer.appendChild(pre);
  });
}

// ─── SLOT UPGRADE HELPERS ─────────────────────────────────────
function _getBldSlotCost(bld) {
  const level = (gs.bldSlotLevels && gs.bldSlotLevels[bld.id]) || 0;
  return { money: 500 * 2 * (level + 1) };
}

function buyBldSlotUpgrade(bldId) {
  const bld = BUILDINGS.find(b => b.id === bldId);
  if (!bld) return;
  if ((gs.buildings[bldId] || 0) === 0) { notify('건물을 먼저 건설하세요', 'red'); return; }
  const cost = _getBldSlotCost(bld);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  if (!gs.bldSlotLevels) gs.bldSlotLevels = {};
  gs.bldSlotLevels[bldId] = (gs.bldSlotLevels[bldId] || 0) + 1;
  notify(`${bld.icon} ${bld.name} — 슬롯 +1 (현재 ${gs.buildings[bldId] + gs.bldSlotLevels[bldId]}슬롯)`);
  playSfx('triangle', 580, 0.09, 0.04, 820);
  _triggerUpgradeAnim(bldId);
  const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (pre) openBldOv(bld, pre);
  renderAll();
}

// ─── BUILDING HOVER OVERLAY — 2-panel layout ─────────────────
let _bldOvTimer  = null;
let _bldOvActions = [];
let _bldOvBld    = null;
let _specPanelBld = null;

function openBldOv(bld, el, keepPosition = false) {
  clearTimeout(_bldOvTimer);
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  const cnt      = gs.buildings[bld.id] || 0;
  const assigned = (gs.assignments && gs.assignments[bld.id]) || 0;
  const avail    = getAvailableWorkers();
  const prod     = getProduction();

  // ── Build action list ──────────────────────────────────────
  const actions = [];

  // ── 직원 고용 / 시민 관리 섹션 (항상 맨 위) ───────────────
  const isHousingBld = bld.id === 'housing';
  const isProductionBld = bld.produces !== 'bonus' || bld.id === 'ops_center';
  if (cnt >= 1 && (isProductionBld || isHousingBld)) {
    if (isHousingBld) {
      // 주거 시설: 시민 분양
      const citizenCost = typeof getCitizenCost === 'function' ? getCitizenCost() : 500;
      const citizenAfford = (gs.res.money || 0) >= citizenCost;
      const citizenIcon = (typeof BLD_STAFF_ICONS !== 'undefined' && BLD_STAFF_ICONS['housing']) || '';
      actions.push({ type: 'sep', label: '// 시민 관리' });
      actions.push({
        label: `${citizenIcon} 시민 분양 (현재 ${gs.citizens || 0}명)`,
        info: `$${fmt(citizenCost)}`,
        disabled: false,
        affordable: citizenAfford,
        desc: `주거 시설에 시민 1명 입주\n현재 시민: ${gs.citizens || 0}명\n분양 비용: $${fmt(citizenCost)}`,
        type: 'alloc_citizen',
      });
    } else {
      // 생산 건물: 여유 시민을 배치 (시민 총수 증가 없음)
      const hireCost = typeof getBldWorkerCost === 'function' ? getBldWorkerCost(bld.id) : getWorkerHireCost();
      const hireAfford = (gs.res.money || 0) >= hireCost;
      const hasIdleWorker = avail > 0;
      const wkIcon = (typeof BLD_STAFF_ICONS !== 'undefined' && BLD_STAFF_ICONS[bld.id]) || '';
      actions.push({ type: 'sep', label: '// 직원 고용' });
      actions.push({
        label: hasIdleWorker
          ? `${wkIcon} 직원 고용`
          : `${wkIcon} [시민 부족]`,
        info: hasIdleWorker ? `$${fmt(hireCost)}` : `여유 없음`,
        disabled: !hasIdleWorker,
        affordable: hireAfford,
        hasIdleWorker: hasIdleWorker,
        desc: hasIdleWorker
          ? `${bld.name}에 직원 배치 (현재 ${assigned}명)\n비용: $${fmt(hireCost)}`
          : `여유 시민 없음 — 주거시설에서 시민을 분양하세요`,
        type: 'hire_bld_worker',
        bldId: bld.id,
      });
    }
  }

  // ── 건물 업그레이드 ────────────────────────────────────────
  const bldUpgs = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bld.id]) || [];
  if (bldUpgs.length > 0) {
    actions.push({ type: 'sep', label: '// 업그레이드' });
  }
  bldUpgs.forEach(upg => {
    const rawLevel = gs.bldUpgrades && gs.bldUpgrades[upg.id];
    const level    = typeof rawLevel === 'number' ? rawLevel : (rawLevel ? 1 : 0);
    const done     = !upg.repeatable && level >= 1;
    const reqMet   = !upg.req || !!(gs.bldUpgrades && gs.bldUpgrades[upg.req]);
    // Scale cost by level for repeatable upgrades
    const costScale = upg.costScale || 1;
    const scaledCost = {};
    Object.entries(upg.cost).forEach(([r, v]) => {
      scaledCost[r] = Math.floor(v * Math.pow(costScale, level));
    });
    const affordable = canAfford(scaledCost);
    const reqName  = upg.req ? (bldUpgs.find(u => u.id === upg.req)?.name || upg.req) : null;
    const levelLabel = upg.repeatable && level > 0 ? ` (Lv.${level})` : '';
    const premiumTag = upg.premium ? ' ★' : '';
    actions.push({
      label: upg.name + levelLabel + premiumTag,
      info:  done ? '[완료]' : getCostStr(scaledCost),
      done, affordable, reqMet,
      disabled: done || !reqMet || cnt === 0,
      desc:  upg.desc
        + (upg.repeatable ? `\n// 현재 ${level}단계 · 다음 비용: ${getCostStr(scaledCost)}` : '')
        + (upg.premium ? '\n// ★ 프리미엄 — 단 1회, 강력한 효과' : '')
        + (reqName && !reqMet ? `\n// 선행 필요: ${reqName}` : '')
        + (cnt === 0 ? '\n// 건물을 먼저 건설하세요' : ''),
      type: 'upgrade',
      upgId: upg.id,
      premium: !!upg.premium,
    });
  });

  // ── Add-on A/B choice section ────────────────────────────
  const addonDef = typeof BUILDING_ADDONS !== 'undefined' && BUILDING_ADDONS[bld.id];
  if (addonDef && cnt >= 1) {
    const addonChoice = gs.addons && gs.addons[bld.id];
    if (!addonChoice) {
      // 선택 전: A/B 선택지 표시 (선택 후 변경 불가 경고 포함)
      actions.push({ type: 'sep', label: '◈ 애드온 설치 — 선택 후 변경 불가' });
      addonDef.options.forEach((opt, i) => {
        const addonAfford = !opt.cost || canAfford(opt.cost);
        actions.push({
          label: `[${i === 0 ? 'A' : 'B'}] ${opt.name}`,
          info: opt.cost ? getCostStr(opt.cost) : '무료',
          affordable: addonAfford,
          disabled: false,
          desc: opt.desc
            + (opt.cost ? `\n비용: ${getCostStr(opt.cost)}` : '')
            + `\n\n⚠ A/B 중 하나만 선택 가능\n선택 후 영구 적용됩니다`,
          type: 'addon_choose',
          addonId: opt.id,
          addonBldId: bld.id,
        });
      });
    } else {
      // 선택 완료: 애드온 이름만 표시, 업그레이드는 애드온 건물 호버시 확인
      const chosen = addonDef.options.find(o => o.id === addonChoice);
      if (chosen) {
        actions.push({ type: 'sep', label: `◈ 애드온: ${chosen.name} (설치됨)` });
        actions.push({
          label: `→ 애드온 건물에 마우스를 올려 업그레이드 확인`,
          info: '',
          disabled: true,
          affordable: true,
          done: false,
          desc: `${chosen.name} 업그레이드는\n애드온 건물([${chosen.icon || 'ADN'}])에 마우스를 올리면 확인할 수 있습니다`,
          type: 'sep',
        });
      }
    }
  }

  _bldOvActions = actions;
  _bldOvBld = bld;

  // ── Build HTML ─────────────────────────────────────────────
  let actRows = '';
  actions.forEach((act, i) => {
    // Separator / section label
    if (act.type === 'sep') {
      actRows += `<div class="bov-sep-label">${act.label}</div>`;
      return;
    }

    let rowCls = '';
    if (act.done)                                                   rowCls = 'bov-done';
    else if (act.disabled)                                          rowCls = 'bov-locked';
    else if ((act.type === 'upgrade' || act.type === 'addon_upgrade' || act.type === 'addon_choose' || act.type === 'hire_worker' || act.type === 'hire_bld_worker' || act.type === 'alloc_citizen') && !act.affordable) rowCls = 'bov-need';
    if (act.premium && !act.done && !act.disabled) rowCls += (rowCls ? ' ' : '') + 'bov-premium';

    const isUpg    = act.type === 'upgrade' || act.type === 'addon_upgrade' || act.type === 'addon_choose' || act.type === 'hire_worker' || act.type === 'hire_bld_worker' || act.type === 'alloc_citizen';
    const isWorker = act.type === 'assign' || act.type === 'unassign';
    let btnTxt;
    if (act.type === 'hire_bld_worker') {
      btnTxt = act.hasIdleWorker ? '[고용]' : '[시민 부족]';
    } else if (act.type === 'alloc_citizen') {
      btnTxt = '[분양]';
    } else if (act.done) {
      btnTxt = '[완료]';
    } else if (act.disabled) {
      btnTxt = '[잠금]';
    } else if (isUpg && !act.affordable) {
      btnTxt = '[부족]';
    } else {
      btnTxt = '[실행]';
    }
    const btnDis = act.done || act.disabled || (isUpg && !act.affordable);
    const infoExtraCls = (isUpg && !act.affordable && !act.done) ? ' red' : (act.premium && !act.done ? ' amber' : '');

    actRows += `<div class="bov-act ${rowCls}${isWorker ? ' bov-worker' : ''}" data-idx="${i}"
      onmouseenter="bovHover(${i})"
      onclick="bovClick(${i})">
      <span class="bov-act-label">${act.label}</span>
      <button class="bov-act-btn${btnDis ? ' dis' : ''}" tabindex="-1">${btnTxt}</button>
      <span class="bov-act-info${infoExtraCls}">${act.info}</span>
    </div>`;
  });

  // Construction cost
  const buyCost    = getBuildingCost(bld);
  const buyAfford  = canAfford(buyCost);

  // Production rate line
  let rateStr = '';
  if (bld.produces !== 'bonus') {
    const rate = bld.baseRate * assigned * (prodMult[bld.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id) * getAddonMult(bld.id);
    rateStr = assigned > 0 ? `${bld.produces} +${fmtDec(rate,2)}/s` : '인원 미배치';
  } else if (bld.id === 'solar_array') { rateStr = `전체 생산 +${((getSolarBonus()-1)*100).toFixed(0)}%`; }
  else if (bld.id === 'launch_pad')    { rateStr = `발사 슬롯 +${cnt}`; }
  else if (bld.id === 'housing')       { rateStr = `시민 ${gs.citizens || 0}명`; }

  // 건물 미건설 시에만 건설 버튼 표시 (추가 건설 기능 제거)
  const footHtml = cnt === 0
    ? `<div class="bov-foot"><button class="bov-buy-btn${buyAfford?'':' dis'}" onclick="buyBuilding('${bld.id}')" ${buyAfford?'':'disabled'}>[ 건설 시작 ] <span class="bov-buy-cost${buyAfford?'':' red'}">${getCostStr(buyCost)}</span></button></div>`
    : '';

  ovEl.innerHTML = `
<div class="bov-head">
  <span class="bov-head-name">${bld.icon} ${bld.name}</span>
  <span class="bov-head-meta">×${cnt} &nbsp; <span style="color:var(--green-mid);font-size:11px">${rateStr}</span></span>
</div>
<div class="bov-body">
  <div class="bov-acts-col" id="bov-acts">
    ${actRows || '<div class="bov-act-empty">// 업그레이드 없음</div>'}
  </div>
  <div class="bov-desc-col" id="bov-desc">
    <div class="bov-desc-hint">${bld.desc || bld.name}<br><span style="color:var(--green-dim);font-size:10px">// 항목 hover로 상세 확인</span></div>
  </div>
</div>
${footHtml}`;

  // Position — display:block 먼저 적용 후 다음 프레임에서 실제 높이 반영
  const ovW = 490;
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
  requestAnimationFrame(() => {
    if (!keepPosition) {
      const r   = el.getBoundingClientRect();
      const ovH = ovEl.offsetHeight || 260;
      let lx = r.left - 10;
      let ty = r.top - ovH - 8;
      if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
      if (lx < 4) lx = 4;
      if (ty < 4) ty = r.bottom + 6;
      ovEl.style.left = lx + 'px';
      ovEl.style.top  = ty + 'px';
    }
  });

  // ── 전문화 서브패널 (해금된 역할이 있는 경우에만) ──────────
  const _specRoles = typeof SPECIALIST_ROLES !== 'undefined' && SPECIALIST_ROLES[bld.id];
  const _hasUnlocked = _specRoles && _specRoles.some(
    r => !r.unlockResearch || !!(gs.upgrades && gs.upgrades[r.unlockResearch])
  );
  if (_hasUnlocked && cnt >= 1) {
    requestAnimationFrame(() => openSpecPanel(bld));
  } else {
    closeSpecPanel();
  }
}

function bovHover(idx) {
  const act = _bldOvActions[idx];
  if (!act) return;
  const dp = document.getElementById('bov-desc');
  if (!dp) return;
  dp.innerHTML = `<div class="bov-desc-name">${act.label}</div><div class="bov-desc-body">${act.desc.replace(/\n/g,'<br>')}</div>`;
}

function bovClick(idx) {
  const act = _bldOvActions[idx];
  if (!act || act.type === 'sep') return;
  if (act.done || act.disabled) return;
  clearTimeout(_bldOvTimer); // 업그레이드 클릭 후 팝업 닫힘 방지
  if (act.type === 'slot_upgrade')  buyBldSlotUpgrade(_bldOvBld.id);
  else if (act.type === 'assign')   assignWorker(_bldOvBld.id);
  else if (act.type === 'unassign') unassignWorker(_bldOvBld.id);
  else if (act.type === 'hire_worker') hireWorker();
  else if (act.type === 'hire_bld_worker') hireBldWorker(act.bldId || _bldOvBld.id);
  else if (act.type === 'alloc_citizen') {
    if (typeof allocateCitizen === 'function' && allocateCitizen()) {
      notify(`시민 분양 완료 — 현재 ${gs.citizens}명`, 'green');
      playSfx('triangle', 400, 0.1, 0.05, 600);
      const el = document.querySelector('.world-bld[data-bid="housing"]');
      const bldDef = BUILDINGS ? BUILDINGS.find(b => b.id === 'housing') : null;
      if (el && bldDef) openBldOv(bldDef, el, true);
      saveGame(); renderAll();
    } else { notify('자금 부족 — 시민 분양 불가', 'red'); }
  }
  else if (act.type === 'upgrade') {
    if (!act.affordable) { notify('자원 부족', 'red'); return; }
    buyBldUpgrade(act.upgId, _bldOvBld.id);
  }
  else if (act.type === 'addon_choose') {
    buyAddonOption(act.addonBldId, act.addonId);
  }
  else if (act.type === 'addon_upgrade') {
    if (!act.affordable) { notify('자원 부족', 'red'); return; }
    buyAddonUpgrade(act.upgId, act.addonBldId);
  }
}

function buyBldUpgrade(upgId, bldId) {
  const bld  = BUILDINGS.find(b => b.id === bldId);
  const bldUpgList = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bldId]) || [];
  const upg  = bldUpgList.find(u => u.id === upgId);
  if (!upg || !bld) return;
  if (!gs.bldUpgrades) gs.bldUpgrades = {};
  const rawLevel   = gs.bldUpgrades[upgId];
  const currLevel  = typeof rawLevel === 'number' ? rawLevel : (rawLevel ? 1 : 0);
  // 일회성 업그레이드: 이미 완료 시 차단
  if (!upg.repeatable && currLevel >= 1) { notify('이미 완료된 업그레이드', 'amber'); return; }
  if (upg.req && !gs.bldUpgrades[upg.req]) { notify('선행 업그레이드 필요', 'red'); return; }
  // 반복 업그레이드: 레벨별 비용 스케일
  const costScale  = upg.costScale || 1;
  const scaledCost = {};
  Object.entries(upg.cost).forEach(([r, v]) => {
    scaledCost[r] = Math.floor(v * Math.pow(costScale, currLevel));
  });
  if (!canAfford(scaledCost)) { notify('자원 부족', 'red'); return; }
  spend(scaledCost);
  gs.bldUpgrades[upgId] = currLevel + 1;
  // Side-effects (레벨마다 누적 적용)
  if (upg.wkr)        { gs.citizens = (gs.citizens || 0) + upg.wkr; syncWorkerDots(); }
  if (upg.rel)        reliabilityBonus += upg.rel;
  if (upg.moneyBonus) { prodMult.money = (prodMult.money || 1) + upg.moneyBonus; }
  if (upg.prodBonus)  { globalMult += upg.prodBonus; }
  const newLevel = currLevel + 1;
  const levelStr = upg.repeatable ? ` Lv.${newLevel}` : '';
  notify(`${bld.icon} ${upg.name}${levelStr} 완료`);
  playSfx('triangle', 520, 0.12, 0.06, 780);
  _triggerUpgradeAnim(bldId);
  // Refresh overlay — keepPosition=true로 팝업 위치 유지, 닫힘 방지
  const el = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (el) openBldOv(bld, el, true);
  renderAll();
  clearTimeout(_bldOvTimer); // renderAll 후 mouseleave 타이머 취소
}

// ─── ADD-ON OVERLAY ──────────────────────────────────────────
function openAddonOv(bld, opt, el) {
  clearTimeout(_bldOvTimer);
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  const actions = [];
  (opt.upgrades || []).forEach(upg => {
    const done     = !!(gs.addonUpgrades && gs.addonUpgrades[upg.id]);
    const reqMet   = !upg.req || !!(gs.addonUpgrades && gs.addonUpgrades[upg.req]);
    const affordable = canAfford(upg.cost);
    actions.push({
      label: upg.name,
      info:  done ? '[완료]' : getCostStr(upg.cost),
      done, affordable, reqMet,
      disabled: done || !reqMet,
      desc: upg.desc + (!reqMet ? '\n// 선행 업그레이드 필요' : ''),
      type: 'addon_upgrade',
      upgId: upg.id,
      addonBldId: bld.id,
    });
  });

  _bldOvActions = actions;
  _bldOvBld = bld;

  let actRows = '';
  actions.forEach((act, i) => {
    let rowCls = act.done ? 'bov-done' : act.disabled ? 'bov-locked' : (!act.affordable ? 'bov-need' : '');
    let btnTxt = act.done ? '[완료]' : act.disabled ? '[잠금]' : !act.affordable ? '[부족]' : '[실행]';
    const btnDis = act.done || act.disabled || !act.affordable;
    actRows += `<div class="bov-act ${rowCls}" data-idx="${i}"
      onmouseenter="bovHover(${i})" onclick="bovClick(${i})">
      <span class="bov-act-label">${act.label}</span>
      <button class="bov-act-btn${btnDis?' dis':''}" tabindex="-1">${btnTxt}</button>
      <span class="bov-act-info">${act.info}</span>
    </div>`;
  });

  ovEl.innerHTML = `
<div class="bov-head">
  <span class="bov-head-name" style="color:var(--amber)">${opt.icon || '[?]'} ${opt.name}</span>
  <span class="bov-head-meta" style="color:var(--amber)">ADD-ON</span>
</div>
<div class="bov-body">
  <div class="bov-acts-col" id="bov-acts">
    ${actRows || '<div class="bov-act-empty">// 업그레이드 없음</div>'}
  </div>
  <div class="bov-desc-col" id="bov-desc">
    <div class="bov-desc-hint">${opt.desc.replace(/\n/g,'<br>')}</div>
  </div>
</div>`;

  // Position — display:block 먼저 적용 후 다음 프레임에서 실제 높이 반영
  const ovW = 420;
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
  requestAnimationFrame(() => {
    const r   = el.getBoundingClientRect();
    const ovH = ovEl.offsetHeight || 200;
    let lx = r.left - 10;
    let ty = r.top - ovH - 8;
    if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
    if (lx < 4) lx = 4;
    if (ty < 4) ty = r.bottom + 6;
    ovEl.style.left = lx + 'px';
    ovEl.style.top  = ty + 'px';
  });
}

function buyAddonOption(bldId, optionId) {
  const addonDef = typeof BUILDING_ADDONS !== 'undefined' && BUILDING_ADDONS[bldId];
  if (!addonDef) return;
  if (!gs.addons) gs.addons = {};
  if (gs.addons[bldId]) { notify('이미 애드온이 설치되어 있습니다', 'amber'); return; }
  const opt = addonDef.options.find(o => o.id === optionId);
  if (!opt) return;

  // 비용 체크 및 차감
  if (opt.cost) {
    if (!canAfford(opt.cost)) { notify('자원 부족', 'red'); return; }
    spend(opt.cost);
  }

  gs.addons[bldId] = optionId;
  // Apply immediate side-effects
  if (opt.effect) {
    if (opt.effect.rel)            reliabilityBonus += opt.effect.rel;
    if (opt.effect.slotBonus)      slotBonus        += opt.effect.slotBonus;
    if (opt.effect.partCostReduct) partCostMult     *= (1 - opt.effect.partCostReduct);
  }
  notify(`${opt.name} 애드온 설치 완료!`);
  playSfx('triangle', 660, 0.12, 0.06, 1000);
  updateWorldBuildings();
  const bld = BUILDINGS.find(b => b.id === bldId);
  const el  = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (bld && el) openBldOv(bld, el);
  renderAll();
  // 오버레이 갱신 (keepPosition=true — 위치 드리프트 방지)
  setTimeout(() => {
    const freshPre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
    if (freshPre && typeof openBldOv === 'function') openBldOv(BUILDINGS.find(b => b.id === bldId), freshPre, true);
  }, 60);
}

function buyAddonUpgrade(upgId, bldId) {
  const addonDef = typeof BUILDING_ADDONS !== 'undefined' && BUILDING_ADDONS[bldId];
  if (!addonDef) return;
  const addonChoice = gs.addons && gs.addons[bldId];
  if (!addonChoice) return;
  const opt = addonDef.options.find(o => o.id === addonChoice);
  if (!opt) return;
  const upg = (opt.upgrades || []).find(u => u.id === upgId);
  if (!upg) return;

  if (!gs.addonUpgrades) gs.addonUpgrades = {};
  if (gs.addonUpgrades[upgId]) { notify('이미 완료', 'amber'); return; }
  if (upg.req && !gs.addonUpgrades[upg.req]) { notify('선행 업그레이드 필요', 'red'); return; }
  if (!canAfford(upg.cost)) { notify('자원 부족', 'red'); return; }

  spend(upg.cost);
  gs.addonUpgrades[upgId] = true;
  if (upg.rel)            reliabilityBonus += upg.rel;
  if (upg.slotBonus)      slotBonus        += upg.slotBonus;
  if (upg.partCostReduct) partCostMult     *= (1 - upg.partCostReduct);
  notify(`▶ ${upg.name} 완료`);
  playSfx('triangle', 700, 0.12, 0.04, 1100);
  const bld = BUILDINGS.find(b => b.id === bldId);
  const el  = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (bld && el) openBldOv(bld, el);
  renderAll();
}

// ─── WORKER ASSIGNMENT ───────────────────────────────────────
function assignWorker(bldId) {
  if (!gs.assignments) gs.assignments = {};
  const bld      = BUILDINGS.find(b => b.id === bldId);
  if (!bld) return;
  const cnt      = gs.buildings[bldId] || 0;
  const assigned = gs.assignments[bldId] || 0;
  const slotCap  = cnt + ((gs.bldSlotLevels && gs.bldSlotLevels[bldId]) || 0);
  if (cnt === 0)                    { notify('건물이 없습니다', 'red'); return; }
  if (getAvailableWorkers() <= 0)   { notify('여유 인원 없음', 'red'); return; }
  if (assigned >= slotCap)          { notify('슬롯 수용 한도 초과 — 슬롯 업그레이드 필요', 'amber'); return; }
  gs.assignments[bldId] = assigned + 1;
  notify(`${bld.icon} ${bld.name} — 인원 배치 (${gs.assignments[bldId]}명)`);
  playSfx('triangle', 300, 0.04, 0.02, 400);
  const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (pre) openBldOv(bld, pre);
  // 플로팅 숫자: 인원 배치 피드백
  if (typeof spawnFloatNum === 'function') {
    const _pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
    if (_pre) {
      const r = _pre.getBoundingClientRect();
      spawnFloatNum('+인원', 'money', r.left + r.width / 2, r.top);
    }
  }
  renderAll();
}

function unassignWorker(bldId) {
  if (!gs.assignments || !gs.assignments[bldId]) { notify('배치된 인원 없음', 'amber'); return; }
  const bld = BUILDINGS.find(b => b.id === bldId);
  gs.assignments[bldId] = Math.max(0, gs.assignments[bldId] - 1);
  if (gs.assignments[bldId] === 0) delete gs.assignments[bldId];
  if (bld) notify(`${bld.icon} ${bld.name} — 인원 철수`);
  playSfx('triangle', 400, 0.04, 0.02, 300);
  if (bld) {
    const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
    if (pre) openBldOv(bld, pre);
  }
  renderAll();
}

// ─── 직원 고용 시스템 ─────────────────────────────────────────
function hireWorker() {
  const cost = getWorkerHireCost();
  if ((gs.res.money || 0) < cost) {
    notify('자금 부족 — 직원 고용 불가', 'red');
    return; // 팝업 유지
  }
  gs.res.money -= cost;
  gs.citizens = (gs.citizens || 0) + 1;
  notify(`직원 고용 완료 — 현재 ${gs.citizens}명`, 'green');
  playSfx('triangle', 400, 0.1, 0.05, 600);
  // 팝업 내용만 갱신 (닫지 않음)
  _refreshBldOvHousingPanel();
  saveGame();
  renderAll();
}

function _refreshBldOvHousingPanel() {
  const housingBld = BUILDINGS.find(b => b.id === 'housing');
  if (!housingBld) return;
  const pre = document.querySelector('.world-bld[data-bid="housing"]');
  if (pre) {
    openBldOv(housingBld, pre);
  } else {
    if (typeof syncWorkerDots === 'function') syncWorkerDots();
  }
}

// ─── 건물별 직접 직원 고용 ─────────────────────────────────────
function hireBldWorker(bldId) {
  const cost = typeof getBldWorkerCost === 'function' ? getBldWorkerCost(bldId) : (getWorkerHireCost ? getWorkerHireCost() : 100);
  if (!gs || !gs.res) return;
  // 여유 시민 확인 — 새 시민을 만들지 않고 기존 여유 인원을 배치
  if (getAvailableWorkers() <= 0) {
    notify('여유 시민 없음 — 주거시설 업그레이드로 시민 상한을 늘리세요', 'red');
    return;
  }
  if ((gs.res.money || 0) < cost) {
    notify('자금 부족 — 직원 고용 불가', 'red');
    return;
  }
  gs.res.money -= cost;
  if (!gs.assignments) gs.assignments = {};
  gs.assignments[bldId] = (gs.assignments[bldId] || 0) + 1;
  // gs.workers는 변경하지 않음 — 기존 여유 시민을 배치하는 것
  const assigned = gs.assignments[bldId];
  notify(`직원 배치 완료 — ${bldId} ×${assigned}명`, 'green');
  playSfx('triangle', 400, 0.12, 0.07, 600);
  if (typeof syncWorkerDots === 'function') syncWorkerDots();
  // 오버레이 갱신 (keepPosition=true — 위치 드리프트 방지)
  const el = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  const bldDef = BUILDINGS ? BUILDINGS.find(b => b.id === bldId) : null;
  if (el && bldDef) openBldOv(bldDef, el, true);
  saveGame();
  renderAll();
}

// ─── SPECIALIZATION SUB-PANEL ────────────────────────────────
function openSpecPanel(bld) {
  const panel = document.getElementById('spec-panel');
  if (!panel) return;
  _specPanelBld = bld;
  const roles = (typeof SPECIALIST_ROLES !== 'undefined' && SPECIALIST_ROLES[bld.id]) || [];
  const assigned = (gs.assignments && gs.assignments[bld.id]) || 0;
  const wkIcon = (typeof BLD_STAFF_ICONS !== 'undefined' && BLD_STAFF_ICONS[bld.id]) || '';
  const specs = (gs.specialists && gs.specialists[bld.id]) || {};

  // 해금된 역할만 표시 — 미해금은 패널 자체를 숨김
  const unlockedRoles = roles.filter(r => !r.unlockResearch || !!(gs.upgrades && gs.upgrades[r.unlockResearch]));
  if (unlockedRoles.length === 0) { closeSpecPanel(); return; }

  let html = `<div class="sp2-head">${wkIcon}&nbsp;직원 전문화</div><div class="sp2-body">`;
  unlockedRoles.forEach(r => {
    const count = specs[r.id] || 0;
    const canPromote = assigned >= 1;
    const descHtml = r.desc.replace(/\n/g, '<br>');
    html += `<div class="sp2-role">
      <div class="sp2-role-icon ${r.iconCls}"></div>
      <div class="sp2-role-info">
        <div class="sp2-role-name">${r.name} <span class="sp2-count">(${count}명)</span></div>
        <div class="sp2-role-desc">${descHtml}</div>
        <div class="sp2-cost">${wkIcon}&thinsp;×1
          <button class="sp2-btn${canPromote ? '' : ' dis'}" onclick="specClick('${bld.id}','${r.id}')">[전직]</button>
        </div>
      </div>
    </div>`;
  });
  html += `</div><div class="sp2-avail">배치 직원: ${assigned}명</div>`;
  panel.innerHTML = html;

  // Position: right side of #bld-ov
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;
  const ovRect = ovEl.getBoundingClientRect();
  panel.style.display = 'block';
  panel.style.top  = ovRect.top + 'px';
  panel.style.left = (ovRect.right + 1) + 'px';   // 1px 간격 — 사실상 인접
  // 마우스가 spec-panel 위에 있는 동안 메인 오버레이 닫힘 방지
  panel.onmouseenter = () => clearTimeout(_bldOvTimer);
  panel.onmouseleave = () => scheduleBldOvClose();
}

function closeSpecPanel() {
  const p = document.getElementById('spec-panel');
  if (p) p.style.display = 'none';
  _specPanelBld = null;
}

function specClick(bldId, specId) {
  const role = ((typeof SPECIALIST_ROLES !== 'undefined' && SPECIALIST_ROLES[bldId]) || []).find(r => r.id === specId);
  if (role && role.unlockResearch && !(gs.upgrades && gs.upgrades[role.unlockResearch])) {
    notify('연구 필요 — 연구탭에서 먼저 해금하세요', 'red');
    return;
  }
  if (typeof promoteToSpecialist !== 'function' || !promoteToSpecialist(bldId, specId)) {
    notify('배치 직원이 없습니다 — 먼저 직원을 고용하세요', 'red');
    return;
  }
  notify(`${role ? role.name : specId} 전직 완료`, 'green');
  playSfx('triangle', 600, 0.1, 0.04, 800);
  const el = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  const bldDef = typeof BUILDINGS !== 'undefined' ? BUILDINGS.find(b => b.id === bldId) : null;
  if (el && bldDef) openBldOv(bldDef, el, true);
  if (typeof saveGame === 'function') saveGame();
  if (typeof renderAll === 'function') renderAll();
}

// ─── GHOST BUILDING POPUP (미건설 건물 클릭/호버) ────────────
function openGhostOv(bld, el) {
  clearTimeout(_bldOvTimer);
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  const cost = getBuildingCost(bld);
  const affordable = canAfford(cost);
  const costStr = getCostStr(cost);
  const art = _bldAscii(bld);

  _bldOvActions = [];
  _bldOvBld = bld;

  ovEl.innerHTML = `
<div class="bov-head">
  <span class="bov-head-name">${bld.icon} ${bld.name}</span>
  <span class="ghost-tag">미건설</span>
</div>
<div class="bov-body" style="flex-direction:column;gap:6px;">
  <pre class="ghost-art-preview">${art}</pre>
  <div style="font-size:11px;color:var(--green-mid);">${bld.desc}</div>
</div>
<div class="bov-foot">
  <button class="bov-buy-btn${affordable?'':' dis'}" onclick="buyBuilding('${bld.id}')" ${affordable?'':'disabled'}>
    [ 건설 시작 ] <span class="bov-buy-cost${affordable?'':' red'}">${costStr}</span>
  </button>
</div>`;

  // Position — display:block 먼저 적용 후 다음 프레임에서 실제 높이 반영
  const ovW = 240;
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
  requestAnimationFrame(() => {
    const r   = el.getBoundingClientRect();
    const ovH = ovEl.offsetHeight || 200;
    let lx = r.left - 10;
    let ty = r.top - ovH - 8;
    if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
    if (lx < 4) lx = 4;
    if (ty < 4) ty = r.bottom + 6;
    ovEl.style.left = lx + 'px';
    ovEl.style.top  = ty + 'px';
  });
}

// ─── BUILDING ANIMATIONS ──────────────────────────────────
const _BUILD_GLITCH = '▓▒░█╔╗╚╝║═│┌┐└┘├┤┬┴┼*#+@$%&~^±';
function _triggerBuildAnim(bid) {
  setTimeout(() => {
    const pre = document.querySelector('.world-bld[data-bid="' + bid + '"]');
    if (!pre) return;

    const target = pre.textContent;
    const rows = target.split('\n');
    const n = rows.length;
    const totalFrames = 20;
    const frameDur = 48; // ms — 약 960ms 총 애니메이션
    let frame = 0;

    pre.classList.add('wb-anim-build');

    const iv = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        pre.textContent = target;
        pre.classList.remove('wb-anim-build');
        clearInterval(iv);
        return;
      }

      // 아래줄부터 위로 순차 해독 (건설 상향 효과)
      const result = rows.map((row, ri) => {
        const rowDelay = (n - 1 - ri) / n * 0.45; // 아래줄이 먼저 해독됨
        const progress = Math.max(0, Math.min(1, (frame / totalFrames - rowDelay) / 0.65));
        if (progress >= 1) return row;
        if (progress <= 0) {
          // 아직 미해독: 전체 글리치
          return row.split('').map(c => c === ' ' ? ' ' : _BUILD_GLITCH[Math.floor(Math.random() * _BUILD_GLITCH.length)]).join('');
        }
        // 부분 해독: 왼쪽부터 실제 문자로, 오른쪽은 글리치
        const revealed = Math.floor(row.length * progress);
        return row.split('').map((c, ci) => {
          if (ci < revealed || c === ' ') return c;
          return _BUILD_GLITCH[Math.floor(Math.random() * _BUILD_GLITCH.length)];
        }).join('');
      }).join('\n');

      pre.textContent = result;
    }, frameDur);
  }, 60);
}

function _triggerUpgradeAnim(bid) {
  setTimeout(() => {
    const pre = document.querySelector('.world-bld[data-bid="' + bid + '"]');
    if (pre) {
      pre.classList.add('wb-anim-upgrade');
      setTimeout(() => pre.classList.remove('wb-anim-upgrade'), 800);
    }
  }, 60);
}

function scheduleBldOvClose() {
  _bldOvTimer = setTimeout(() => {
    const ov = document.getElementById('bld-ov');
    const sp = document.getElementById('spec-panel');
    if (ov && !ov.matches(':hover') && !(sp && sp.matches(':hover'))) closeBldOv();
  }, 150);
}

function closeBldOv() {
  closeSpecPanel();
  const ov = document.getElementById('bld-ov');
  if (ov) ov.style.display = 'none';
}

// ─── WORKER DOTS ─────────────────────────────────────────────
let _workerDots = [];
let _wkrIconTick = 0;

// 열린 오버레이의 건설 버튼 비용 텍스트를 실시간 갱신 (renderAll 500ms 루프에서 호출)
function refreshBovBuyButton() {
  if (!_bldOvBld) return;
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;
  const cnt = gs.buildings[_bldOvBld.id] || 0;
  if (cnt > 0) return; // 이미 건설됨 — 버튼 없음
  const buyCost  = getBuildingCost(_bldOvBld);
  const canBuy   = canAfford(buyCost);
  const btn      = ovEl.querySelector('.bov-buy-btn');
  const costSpan = ovEl.querySelector('.bov-buy-cost');
  if (!btn || !costSpan) return;
  btn.disabled = !canBuy;
  btn.classList.toggle('dis', !canBuy);
  costSpan.classList.toggle('red', !canBuy);
}

function syncWorkerDots() {
  const layer = document.getElementById('workers-layer');
  if (!layer) return;
  const total = gs.citizens || 0;

  while (_workerDots.length > total) {
    const d = _workerDots.pop();
    if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el);
  }
  while (_workerDots.length < total) {
    const el = document.createElement('span');
    el.className = 'wkr';
    // 아이콘 머리 (배치/전문화 시 건물 아이콘 표시)
    const headEl = document.createElement('span');
    headEl.className = 'wkr-head';
    el.appendChild(headEl);
    el.appendChild(document.createTextNode('●'));
    const x = 80 + Math.random() * 2600;
    el.style.left = Math.round(x) + 'px';
    layer.appendChild(el);
    const spd = 0.2 + Math.random() * 0.4;
    _workerDots.push({ el, headEl, x, vx: Math.random() < 0.5 ? spd : -spd });
  }
  _updateWorkerDotIcons();
}

// 배치/전문화 상태에 따라 각 dot 아이콘 갱신
function _updateWorkerDotIcons() {
  if (!_workerDots.length || typeof BUILDINGS === 'undefined' || typeof BLD_STAFF_ICONS === 'undefined') return;

  // 아이콘 목록 구성: 전문가 먼저(골드), 일반 배치 직원, 나머지는 빈칸
  const iconList = []; // { html, isSpec }

  // 전문가 (specialists)
  if (gs.specialists && typeof SPECIALIST_ROLES !== 'undefined') {
    Object.entries(gs.specialists).forEach(([bldId, specMap]) => {
      const icon = BLD_STAFF_ICONS[bldId] || '';
      Object.values(specMap || {}).forEach(cnt => {
        for (let i = 0; i < (cnt || 0); i++) iconList.push({ html: icon, isSpec: true });
      });
    });
  }

  // 일반 배치 직원 (전문가 수 제외)
  BUILDINGS.forEach(b => {
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    const specCount = gs.specialists && gs.specialists[b.id]
      ? Object.values(gs.specialists[b.id]).reduce((a, v) => a + v, 0)
      : 0;
    const regular = Math.max(0, assigned - specCount);
    const icon = BLD_STAFF_ICONS[b.id] || '';
    for (let i = 0; i < regular; i++) iconList.push({ html: icon, isSpec: false });
  });

  _workerDots.forEach((d, idx) => {
    if (!d.headEl) return;
    const entry = iconList[idx];
    if (entry && entry.html) {
      d.headEl.innerHTML = entry.html;
      d.headEl.className = 'wkr-head' + (entry.isSpec ? ' wkr-head-spec' : '');
    } else {
      d.headEl.innerHTML = '';
      d.headEl.className = 'wkr-head';
    }
  });
}

function _tickWorkers() {
  _workerDots.forEach(d => {
    d.x += d.vx;
    if (d.x < 20)   { d.x = 20;   d.vx =  Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    if (d.x > 3100) { d.x = 3100; d.vx = -Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    d.el.style.left = Math.round(d.x) + 'px';
  });
  // 아이콘 주기적 갱신 (~480ms마다)
  if (++_wkrIconTick % 6 === 0) _updateWorkerDotIcons();
}

function hideTechTip() {
  const el = document.getElementById('tech-tip');
  if (el) el.style.display = 'none';
}

// ─── DRAG SCROLL INIT ────────────────────────────────────────
function initWorldDrag() {
  const wb = document.getElementById('world-bg');
  if (!wb) return;
  let drag = false, dragX = 0, dragSL = 0;

  document.addEventListener('mousedown', e => {
    if (!document.body.classList.contains('tab-production')) return;
    const r = wb.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (e.target.closest('.world-bld')) return;
    drag = true;
    dragX = e.pageX - wb.offsetLeft;
    dragSL = wb.scrollLeft;
    document.body.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    drag = false;
    document.body.style.cursor = '';
  });

  document.addEventListener('mousemove', e => {
    if (!drag) return;
    e.preventDefault();
    wb.scrollLeft = dragSL - (e.pageX - wb.offsetLeft - dragX) * 1.3;
  });

  // ─── Building hover relay (works even when #world-bg is behind #app) ───
  // #app (z-index 10) covers #world-bg (z-index 0), so mouseenter on world-bld
  // pre elements never fires. Instead we use getBoundingClientRect hit-testing.
  let _hoverBid = null;
  document.addEventListener('mousemove', function(e) {
    if (!document.body.classList.contains('tab-production')) {
      if (_hoverBid) { _hoverBid = null; }
      return;
    }
    if (drag) return; // skip during drag scroll

    // If cursor is inside the building overlay or spec-panel, keep it open
    const bldOvEl = document.getElementById('bld-ov');
    if (bldOvEl && bldOvEl.style.display !== 'none') {
      const or = bldOvEl.getBoundingClientRect();
      if (e.clientX >= or.left && e.clientX <= or.right &&
          e.clientY >= or.top  && e.clientY <= or.bottom) {
        clearTimeout(_bldOvTimer);
        return;
      }
    }
    const specPanelEl = document.getElementById('spec-panel');
    if (specPanelEl && specPanelEl.style.display !== 'none') {
      const sr = specPanelEl.getBoundingClientRect();
      if (e.clientX >= sr.left && e.clientX <= sr.right &&
          e.clientY >= sr.top  && e.clientY <= sr.bottom) {
        clearTimeout(_bldOvTimer);
        return;
      }
    }

    // Hit-test world building <pre> elements by their actual screen rect
    let found = null;
    document.querySelectorAll('.world-bld[data-bid]').forEach(pre => {
      const bid = pre.dataset.bid;
      if (!bid || bid.endsWith('_addon')) return;
      const r = pre.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom) {
        found = { bid, pre };
      }
    });

    const newBid = found ? found.bid : null;
    if (newBid === _hoverBid) return;
    _hoverBid = newBid;

    if (found) {
      const bld = BUILDINGS.find(b => b.id === found.bid);
      if (bld) {
        const cnt = gs.buildings[found.bid] || 0;
        if (cnt > 0) openBldOv(bld, found.pre);
        else         openGhostOv(bld, found.pre);
      }
    } else {
      scheduleBldOvClose();
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBldOv(); hideTechTip(); } });

  const bldOv = document.getElementById('bld-ov');
  if (bldOv) {
    bldOv.addEventListener('mouseenter', () => clearTimeout(_bldOvTimer));
    bldOv.addEventListener('mouseleave', scheduleBldOvClose);  // 즉시 닫지 않고 150ms 대기 — spec-panel 이동 여지
  }

  setInterval(_tickWorkers, 80);
  syncWorkerDots();
}

// ─── 플로팅 숫자 스폰 ─────────────────────────────────────────
// text: 표시 문자열, type: CSS 클래스 (money/iron/copper/fuel/elec/research/ms)
// x, y: 화면 좌표 (clientX/clientY 기준)
function spawnFloatNum(text, type, x, y) {
  const el = document.createElement('div');
  el.className = 'float-num' + (type ? ' ' + type : '');
  el.textContent = text;
  // 약간의 랜덤 좌우 흔들림으로 겹침 방지
  el.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
  el.style.top  = (y - 10) + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ─── ASCII 파티클 버스트 ──────────────────────────────────────
// x, y: 화면 좌표, count: 파티클 개수, color: CSS 색상 문자열(선택)
const _PARTICLE_CHARS = ['*', '+', '·', '○', '◆', '#', '▪'];
function spawnAsciiParticles(x, y, count, color) {
  const n = count || 6;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'ascii-particle';
    el.textContent = _PARTICLE_CHARS[Math.floor(Math.random() * _PARTICLE_CHARS.length)];
    const angle = (Math.PI * 2 / n) * i + Math.random() * 0.5;
    const dist  = 30 + Math.random() * 50;
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle) * dist - 20 + 'px');
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    if (color) el.style.color = color;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

