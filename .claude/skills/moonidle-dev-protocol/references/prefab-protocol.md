# Prefab/Scene Management Protocol

## 1. Prefab vs Scene Object Criteria

| Criteria | Make as Prefab | Keep in Scene |
|----------|---------------|---------------|
| Reusability | Used in 2+ scenes | Exists only in this scene |
| Dynamic creation | Created via Instantiate | Never dynamically created |
| Team conflict | Multiple people may edit | Only scene owner edits |
| Data | Config via SO | Scene-specific settings |

### Must Be Prefabs
- Towers, monsters, projectiles, effects
- UI panels (HUD, popups, menus)
- Repeated objects (tiles, obstacles)

### Keep in Scene
- Main Camera, Directional Light
- EventSystem
- Canvas (root, prefab container role only)
- TitleScreenCanvas (root, prefab container role only)
- Global managers (GameManager, RunManager, MetaManager, TowerManager, WaveSpawner, PoolManager, TreasureManager, FTUEManager, SoundManager, TowerInventory, TowerDragController, PlacementGrid)
- Map objects (SpawnPoint, Waypoints, Base, Ground, Towers container)

## 2. Prefab Naming Convention

```
{Category}_{Name}.prefab

Examples:
Tower_Arrow.prefab           # Tower
Monster_Brute.prefab         # Monster
Projectile_Arrow.prefab      # Projectile
UI_TopHUD.prefab             # UI element
VFX_Explosion.prefab         # Effect
```

## 3. Prefab Variant Hierarchy (Project-Specific)

```
Tower_Base.prefab            # Base prefab
  ├── Tower_Arrow.prefab     # Variant - fast, single target
  ├── Tower_Cannon.prefab    # Variant - slow, area attack
  └── Tower_Ice.prefab       # Variant - slow effect

Monster_Base.prefab
  ├── Monster_Soul.prefab
  ├── Monster_Charger.prefab
  ├── Monster_Brute.prefab
  ├── Monster_Heavy.prefab
  ├── Monster_Quick.prefab
  └── Monster_Bit.prefab     # Variant (drop item)
```

### Nested Prefab Usage
```
Tower_Arrow.prefab
  └── Contains: ProjectileSpawnPoint (separate prefab)
  └── Contains: RangeIndicator (separate prefab)
```

### Depth Limit
- Max 3 levels: Root > Child > GrandChild
- Overrides must be Applied or Reverted (never leave pending)

## 4. Folder Structure

```
Assets/Project/Prefabs/
├── Towers/
│   ├── Tower_Arrow.prefab
│   ├── Tower_Cannon.prefab
│   └── Tower_Ice.prefab
├── Monsters/
│   ├── Monster_Soul.prefab
│   ├── Monster_Charger.prefab
│   ├── Monster_Brute.prefab
│   ├── Monster_Heavy.prefab
│   ├── Monster_Quick.prefab
│   └── Monster_Bit.prefab
├── Projectiles/
│   ├── Projectile_Arrow.prefab
│   ├── Projectile_Cannon.prefab
│   └── Projectile_Ice.prefab
├── Effects/
└── UI/
    ├── Panels/
    │   ├── UI_HubPanel.prefab
    │   ├── UI_RunEndPanel.prefab
    │   ├── UI_SettingsOverlay.prefab
    │   ├── UI_TowerPurchasePanel.prefab
    │   ├── UI_TowerInfoTooltip.prefab
    │   ├── UI_IdleBitOverlay.prefab
    │   ├── UI_TitleScreenPanel.prefab
    │   ├── UI_TreasureChoiceUI.prefab
    │   ├── UI_RunEndOverlay.prefab
    │   └── UI_CorePopup.prefab
    └── HUD/
        ├── UI_TopHUD.prefab
        ├── UI_BottomBar.prefab
        ├── UI_InventoryBar.prefab
        ├── UI_HpWarningOverlay.prefab
        ├── UI_BossHpBar.prefab
        └── UI_GuideText.prefab
```

## 5. UI Prefab Extraction Targets (GameScene)

UI objects currently placed directly in scene that need prefab extraction:

### Under Canvas (15 items)
| Scene Object | Prefab Name | Category |
|-------------|-------------|----------|
| TopHUD | UI_TopHUD.prefab | HUD |
| BottomBar | UI_BottomBar.prefab | HUD |
| InventoryBar | UI_InventoryBar.prefab | HUD |
| HpWarningOverlay | UI_HpWarningOverlay.prefab | HUD |
| BossHpBarContainer | UI_BossHpBar.prefab | HUD |
| GuideTextContainer | UI_GuideText.prefab | HUD |
| HubPanel | UI_HubPanel.prefab | Panels |
| RunEndPanel | UI_RunEndPanel.prefab | Panels |
| SettingsOverlay | UI_SettingsOverlay.prefab | Panels |
| TowerPurchasePanel | UI_TowerPurchasePanel.prefab | Panels |
| TowerInfoTooltip | UI_TowerInfoTooltip.prefab | Panels |
| IdleBitOverlay | UI_IdleBitOverlay.prefab | Panels |
| TreasureChoiceUI | UI_TreasureChoiceUI.prefab | Panels |
| RunEndOverlay | UI_RunEndOverlay.prefab | Panels |
| CorePopupContainer | UI_CorePopup.prefab | Panels |

### Under TitleScreenCanvas (1 item)
| Scene Object | Prefab Name | Category |
|-------------|-------------|----------|
| TitleScreenPanel | UI_TitleScreenPanel.prefab | Panels |

### Extraction Roles
- **UI Lead**: Performs scene object -> prefab extraction (via manage_prefabs)
- **Programming Lead**: Verifies SerializeField reference reconnection after extraction
- **Order**: UI Lead extracts -> save scene -> Programming Lead verifies references -> play-mode test

## 6. Scene Edit Protocol

### Pre-Edit Checklist
```
1. "Does this work REQUIRE modifying the scene file?"
   -> If solvable with prefab only, do not touch scene

2. "Is another agent currently editing this scene?"
   -> Check Sprint Progress document
   -> If editing in progress, wait until they finish

3. "Is the object I'm adding a prefab?"
   -> If not, create prefab first, then place in scene
```

### Post-Edit Checklist
```
1. Removed all test objects added for debugging?
2. New objects converted to prefabs?
3. No broken object references?
4. Committed immediately? (scene files must be committed right after editing)
```

## 7. Do NOT

- Create objects directly in scene without making them prefabs first
- Put Materials in Prefabs folder -> use `Art/Materials/`
- Have multiple people edit scene simultaneously -> one person at a time
- Leave prefab Overrides without Applying -> causes conflicts
- Delay commits after editing -> commit immediately
- Edit files in another team's folder -> check file ownership first
