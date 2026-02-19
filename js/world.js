// ============================================================
//  WORLD — js/world.js
// ============================================================
const WORLD_POSITIONS = {
  housing:      310,  // 주거시설 맨 왼쪽
  research_lab: 510,  r_and_d:      680,
  ops_center:   860,  // addon @ 1030
  supply_depot: 1210, mine:         1420, extractor:    1560,
  refinery:     1750, cryo_plant:   1930, elec_lab:     2130,
  fab_plant:    2300, solar_array:  2490, launch_pad:   2700,
  // launch_pad addon @ 2870
};

// 애드온 건물 위치 (부모 건물 우측 고정)
const ADDON_POSITIONS = {
  ops_center:  1030,
  launch_pad: 2870,
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
          ' ███████'
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
          ' ███████'
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
          '  █████████'
        );
        return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '║ ▓▓ ▓▓ ▓▓  ║\n' +
          '╚═══════════╝\n' +
          '  █████████'
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
          '  █████████'
        );
        return (
          '╔═══════════╗\n' +
          '║  HOUSING  ║\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '║ ▒▒ ▒▒ ▒▒  ║\n' +
          '║ ░░ ░░ ░░  ║\n' +
          '╚═══════════╝\n' +
          '  █████████'
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
        '  █████████'
      );
      if (tier >= 2) return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╠═══════════╣\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╚═══════════╝\n' +
        '  █████████'
      );
      if (tier >= 1) return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '║ ░░ ░░ ░░  ║\n' +
        '╚═══════════╝\n' +
        '  █████████'
      );
      return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '║ ▒▒ ▒▒ ▒▒  ║\n' +
        '╚═══════════╝\n' +
        '  █████████'
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
          ' ██████████'
        );
        return (
          '╔══════════╗\n' +
          '║ PREMIUM  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░ VIP ░  ║\n' +
          '╚══════════╝\n' +
          ' ██████████'
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
          ' ██████████'
        );
        return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓▓▓▓▓▓▓ ║\n' +
          '║ ░░ 24H ░░║\n' +
          '╚══════════╝\n' +
          ' ██████████'
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
          ' ██████████'
        );
        return (
          '╔══════════╗\n' +
          '║ OPS CTR  ║\n' +
          '║ ▓▓░▓▓░▓▓ ║\n' +
          '║ ░▓▓░▓▓░▓ ║\n' +
          '╚══════════╝\n' +
          ' ██████████'
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
        '  ████████'
      );
      if (tier >= 1) return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '╠══════════╣\n' +
        '║ ░▓░▓░▓░  ║\n' +
        '╚══════════╝\n' +
        '  ████████'
      );
      return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ▓░▓░▓░▓  ║\n' +
        '║ ░▓░▓░▓░  ║\n' +
        '╚══════════╝\n' +
        '  ████████'
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
          '    ███████████'
        );
        return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓ ROBOT ▓  ║\n' +
          '╚═════════════╝\n' +
          '    ███████████'
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
          '    ███████████'
        );
        return (
          '     ╔═══╗\n' +
          '     ║▓▓▓║\n' +
          '╔════╩═══╩════╗\n' +
          '║  ▓▒▒▒▒▒▒▓  ║\n' +
          '╚═════════════╝\n' +
          '    ███████████'
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
        '    ███████████'
      );
      if (tier >= 1) return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╠═════════════╣\n' +
        '╚═════════════╝\n' +
        '    ███████████'
      );
      return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╚═════════════╝\n' +
        '    ███████████'
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
        '███████████'
      );
      if (tier >= 1) return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╠═╣  ╠══╣\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '███████████'
      );
      return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '███████████'
      );

    case 'wb-eleclab':
      if (tier >= 3) return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒║\n' +
        '╠══════════╣\n' +
        '║░▒░▒░▒░▒░║\n' +
        '╠══════════╣\n' +
        '║▒░▒░▒░▒░▒║\n' +
        '╚══════════╝\n' +
        '  ████████'
      );
      if (tier >= 1) return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒║\n' +
        '╠══════════╣\n' +
        '║░▒░▒░▒░▒░║\n' +
        '╚══════════╝\n' +
        '  ████████'
      );
      return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒║\n' +
        '║░▒░▒░▒░▒░║\n' +
        '╚══════════╝\n' +
        '  ████████'
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
          '   ██████████'
        );
        return (
          '╔════════════╗\n' +
          '║ SUPER-LAB  ║\n' +
          '║ ▓▓░░░░▓▓   ║\n' +
          '║ ░▓▓▓▓▓░    ║\n' +
          '╠════════════╣\n' +
          '║ [CPU-9000] ║\n' +
          '╚════════════╝\n' +
          '   ██████████'
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
          '   ██████████'
        );
        return (
          '╔════════════╗\n' +
          '║  RESEARCH  ║\n' +
          '║ ▓▓▓░▓▓▓░▓▓ ║\n' +
          '║ ░▓▓▓░▓▓▓░▓ ║\n' +
          '╠════════════╣\n' +
          '╚════════════╝\n' +
          '   ██████████'
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
        '   ██████████'
      );
      if (tier >= 1) return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '╠════════════╣\n' +
        '║ ░▓░▓░▓░▓   ║\n' +
        '╚════════════╝\n' +
        '   ██████████'
      );
      return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ▓░▓░▓░▓░   ║\n' +
        '║ ░▓░▓░▓░▓   ║\n' +
        '╠════════════╣\n' +
        '╚════════════╝\n' +
        '   ██████████'
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
          ' ████████████'
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
          ' ████████████'
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
        ' ████████████'
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
          '──╚═════════╝──'
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
          '──╚═════════╝──'
        );
        return (
          '      /▲╲\n' +
          '     / ▓ ╲\n' +
          '    /══▓══╲\n' +
          '   ╔═══════╗\n' +
          '   ║[R-PAD]║\n' +
          '──╚═════════╝──'
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
        '──╚═════════╝──'
      );
      if (tier >= 1) return (
        '      /▲╲\n' +
        '     / ▓ ╲\n' +
        '    /  ▓  ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '──╚═════════╝──'
      );
      return (
        '      /▲╲\n' +
        '     / ▓ ╲\n' +
        '    /  ▓  ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '──╚═════════╝──'
      );

    default: {
      const ic = (bld.icon || '[??]').slice(0, 5).padEnd(5);
      return (
        '╔═══════╗\n' +
        '║ ' + ic + ' ║\n' +
        '╚═══════╝\n' +
        '  █████'
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
        '  ██████'
      );
    case 'addon_tech_hub':
      return (
        '─╔══════╗\n' +
        ' ║ TECH ║\n' +
        ' ║  HUB ║\n' +
        ' ║ ▒▒▒  ║\n' +
        ' ╚══════╝\n' +
        '  ██████'
      );
    case 'addon_launch_ctrl':
      return (
        '─╔═════╗\n' +
        ' ║ CTL ║\n' +
        ' ║ TWR ║\n' +
        ' ║ ▓▓▓ ║\n' +
        ' ╚═════╝\n' +
        '  █████'
      );
    case 'addon_vif':
      return (
        '─╔═════╗\n' +
        ' ║ VIF ║\n' +
        ' ║─────║\n' +
        ' ║ FAB ║\n' +
        ' ╚═════╝\n' +
        '  █████'
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
    '  █████'
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

function openBldOv(bld, el) {
  clearTimeout(_bldOvTimer);
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  const cnt      = gs.buildings[bld.id] || 0;
  const assigned = (gs.assignments && gs.assignments[bld.id]) || 0;
  const avail    = getAvailableWorkers();
  const prod     = getProduction();

  // ── Build action list ──────────────────────────────────────
  const actions = [];

  // ── 슬롯 업그레이드 (생산 건물만, 보너스 건물 제외) ──────
  if (bld.produces !== 'bonus') {
    const slotLevel  = (gs.bldSlotLevels && gs.bldSlotLevels[bld.id]) || 0;
    const slotCap    = cnt + slotLevel;
    const slotCost   = _getBldSlotCost(bld);
    const slotAfford = canAfford(slotCost);
    actions.push({
      label: `슬롯 +1 업그레이드`,
      info: slotAfford ? getCostStr(slotCost) : `[부족]`,
      disabled: cnt === 0,
      affordable: slotAfford,
      desc: `인원 배치 슬롯 +1\n현재 슬롯: ${slotCap}개 (건물 ${cnt} + 업그 ${slotLevel})\n비용: ${getCostStr(slotCost)}`,
      type: 'slot_upgrade',
    });

    // Worker rows
    actions.push({
      label: '+ 인원 배치',
      info: `여유 ${avail}명`,
      disabled: avail <= 0 || cnt === 0 || assigned >= slotCap,
      desc: `[${bld.name}]에 인원 배치\n현재: ${assigned}명 배치 / 슬롯: ${slotCap}개\n인원 1명 → ${bld.produces === 'money' ? '₩' : ''}+${fmtDec(bld.baseRate * (prodMult[bld.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id) * getAddonMult(bld.id), 2)}/s`,
      type: 'assign',
    });
    actions.push({
      label: '- 인원 철수',
      info: `배치 ${assigned}명`,
      disabled: assigned <= 0,
      desc: `[${bld.name}]에서 인원 회수\n현재 ${assigned}명 배치 중`,
      type: 'unassign',
    });
  }

  // Named building upgrades
  const bldUpgs = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bld.id]) || [];
  bldUpgs.forEach(upg => {
    const done     = !!(gs.bldUpgrades && gs.bldUpgrades[upg.id]);
    const reqMet   = !upg.req || !!(gs.bldUpgrades && gs.bldUpgrades[upg.req]);
    const affordable = canAfford(upg.cost);
    const reqName  = upg.req ? (bldUpgs.find(u => u.id === upg.req)?.name || upg.req) : null;
    actions.push({
      label: upg.name,
      info:  done ? '[완료]' : getCostStr(upg.cost),
      done, affordable, reqMet,
      disabled: done || !reqMet || cnt === 0,
      desc:  upg.desc + (reqName && !reqMet ? `\n// 선행 필요: ${reqName}` : '') + (cnt === 0 ? '\n// 건물을 먼저 건설하세요' : ''),
      type: 'upgrade',
      upgId: upg.id,
    });
  });

  // ── Add-on A/B choice section ────────────────────────────
  const addonDef = typeof BUILDING_ADDONS !== 'undefined' && BUILDING_ADDONS[bld.id];
  if (addonDef && cnt >= 1) {
    const addonChoice = gs.addons && gs.addons[bld.id];
    // Separator
    actions.push({ type: 'sep', label: '// 애드온 슬롯' });
    if (!addonChoice) {
      addonDef.options.forEach((opt, i) => {
        const addonAfford = !opt.cost || canAfford(opt.cost);
        actions.push({
          label: `[${i === 0 ? 'A' : 'B'}] ${opt.name}`,
          info: opt.cost ? getCostStr(opt.cost) : '선택',
          affordable: addonAfford,
          disabled: false,
          desc: opt.desc + (opt.cost ? `\n// 비용: ${getCostStr(opt.cost)}` : ''),
          type: 'addon_choose',
          addonId: opt.id,
          addonBldId: bld.id,
        });
      });
    } else {
      const chosen = addonDef.options.find(o => o.id === addonChoice);
      if (chosen) {
        actions.push({ type: 'sep', label: `// ${chosen.name} 업그레이드` });
        (chosen.upgrades || []).forEach(upg => {
          const done     = !!(gs.addonUpgrades && gs.addonUpgrades[upg.id]);
          const reqMet   = !upg.req || !!(gs.addonUpgrades && gs.addonUpgrades[upg.req]);
          const affordable = canAfford(upg.cost);
          actions.push({
            label: upg.name,
            info: done ? '[완료]' : getCostStr(upg.cost),
            done, affordable, reqMet,
            disabled: done || !reqMet,
            desc: upg.desc + (!reqMet ? '\n// 선행 업그레이드 필요' : ''),
            type: 'addon_upgrade',
            upgId: upg.id,
            addonBldId: bld.id,
          });
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
    else if ((act.type === 'upgrade' || act.type === 'addon_upgrade') && !act.affordable) rowCls = 'bov-need';

    const isUpg    = act.type === 'upgrade' || act.type === 'addon_upgrade';
    const isWorker = act.type === 'assign' || act.type === 'unassign';
    let btnTxt = act.done ? '[완료]' : act.disabled ? '[잠금]' : (isUpg && !act.affordable) ? '[부족]' : '[실행]';
    const btnDis = act.done || act.disabled || (isUpg && !act.affordable);

    actRows += `<div class="bov-act ${rowCls}${isWorker ? ' bov-worker' : ''}" data-idx="${i}"
      onmouseenter="bovHover(${i})"
      onclick="bovClick(${i})">
      <span class="bov-act-label">${act.label}</span>
      <button class="bov-act-btn${btnDis ? ' dis' : ''}" tabindex="-1">${btnTxt}</button>
      <span class="bov-act-info${isUpg&&!act.affordable&&!act.done?' red':''}">${act.info}</span>
    </div>`;
  });

  // Construction cost
  const buyCost    = getBuildingCost(bld);
  const buyAfford  = canAfford(buyCost);
  const buyLabel   = cnt > 0 ? (buyAfford ? '건물 추가 건설' : '건물 추가 (자원 부족)') : (buyAfford ? '건설 시작' : '건설 (자원 부족)');

  // Production rate line
  let rateStr = '';
  if (bld.produces !== 'bonus') {
    const rate = bld.baseRate * assigned * (prodMult[bld.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id) * getAddonMult(bld.id);
    rateStr = assigned > 0 ? `${bld.produces} +${fmtDec(rate,2)}/s` : '인원 미배치';
  } else if (bld.id === 'solar_array') { rateStr = `전체 생산 +${((getSolarBonus()-1)*100).toFixed(0)}%`; }
  else if (bld.id === 'launch_pad')    { rateStr = `발사 슬롯 +${cnt}`; }
  else if (bld.id === 'housing')       { rateStr = `인원 상한 ${gs.workers}명`; }

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
<div class="bov-foot">
  <button class="bov-buy-btn${buyAfford?'':' dis'}" onclick="buyBuilding('${bld.id}')" ${buyAfford?'':'disabled'}>
    [ ${buyLabel} ] <span class="bov-buy-cost">${getCostStr(buyCost)}</span>
  </button>
</div>`;

  // Position
  const r = el.getBoundingClientRect();
  const ovW = 490, ovH = ovEl.offsetHeight || 260;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top  = ty + 'px';
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
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
  if (act.type === 'slot_upgrade')  buyBldSlotUpgrade(_bldOvBld.id);
  else if (act.type === 'assign')   assignWorker(_bldOvBld.id);
  else if (act.type === 'unassign') unassignWorker(_bldOvBld.id);
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
  if (gs.bldUpgrades[upgId]) { notify('이미 완료된 업그레이드', 'amber'); return; }
  if (upg.req && !gs.bldUpgrades[upg.req]) { notify('선행 업그레이드 필요', 'red'); return; }
  if (!canAfford(upg.cost)) { notify('자원 부족', 'red'); return; }
  spend(upg.cost);
  gs.bldUpgrades[upgId] = true;
  // Side-effects
  if (upg.wkr) { gs.workers = (gs.workers || 1) + upg.wkr; syncWorkerDots(); }
  if (upg.rel) reliabilityBonus += upg.rel;
  notify(`${bld.icon} ${upg.name} 완료`);
  playSfx('triangle', 520, 0.1, 0.04, 780);
  _triggerUpgradeAnim(bldId);
  // Refresh overlay
  const el = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (el) openBldOv(bld, el);
  renderAll();
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

  const r = el.getBoundingClientRect();
  const ovW = 420, ovH = ovEl.offsetHeight || 200;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top  = ty + 'px';
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
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
  if (bld) {
    const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
    if (pre) openBldOv(bld, pre);
  }
  renderAll();
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
    [ 건설 시작 ] <span class="bov-buy-cost">${costStr}</span>
  </button>
</div>`;

  const r = el.getBoundingClientRect();
  const ovW = 240, ovH = ovEl.offsetHeight || 200;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top  = ty + 'px';
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
}

// ─── BUILDING ANIMATIONS ──────────────────────────────────
function _triggerBuildAnim(bid) {
  setTimeout(() => {
    const pre = document.querySelector('.world-bld[data-bid="' + bid + '"]');
    if (pre) {
      pre.classList.add('wb-anim-build');
      setTimeout(() => pre.classList.remove('wb-anim-build'), 1000);
    }
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
    if (ov && !ov.matches(':hover')) closeBldOv();
  }, 150);
}

function closeBldOv() {
  const ov = document.getElementById('bld-ov');
  if (ov) ov.style.display = 'none';
}

// ─── WORKER DOTS ─────────────────────────────────────────────
let _workerDots = [];

function syncWorkerDots() {
  const layer = document.getElementById('workers-layer');
  if (!layer) return;
  const total = gs.workers || 1;

  while (_workerDots.length > total) {
    const d = _workerDots.pop();
    if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el);
  }
  while (_workerDots.length < total) {
    const el = document.createElement('span');
    el.className = 'wkr';
    el.textContent = '●';
    const x = 80 + Math.random() * 2600;
    el.style.left = Math.round(x) + 'px';
    layer.appendChild(el);
    const spd = 0.2 + Math.random() * 0.4;
    _workerDots.push({ el, x, vx: Math.random() < 0.5 ? spd : -spd });
  }
}

function _tickWorkers() {
  _workerDots.forEach(d => {
    d.x += d.vx;
    if (d.x < 20)   { d.x = 20;   d.vx =  Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    if (d.x > 3100) { d.x = 3100; d.vx = -Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    d.el.style.left = Math.round(d.x) + 'px';
  });
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
    wb.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    drag = false;
    if (wb) wb.style.cursor = 'grab';
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

    // If cursor is inside the building overlay, keep it open
    const bldOvEl = document.getElementById('bld-ov');
    if (bldOvEl && bldOvEl.style.display !== 'none') {
      const or = bldOvEl.getBoundingClientRect();
      if (e.clientX >= or.left && e.clientX <= or.right &&
          e.clientY >= or.top  && e.clientY <= or.bottom) {
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
    bldOv.addEventListener('mouseleave', closeBldOv);
  }

  setInterval(_tickWorkers, 80);
  syncWorkerDots();
}

// ─── 플로팅 숫자 스폰 ─────────────────────────────────────────
// text: 표시 문자열, type: CSS 클래스 (money/metal/fuel/elec/research/ms)
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
