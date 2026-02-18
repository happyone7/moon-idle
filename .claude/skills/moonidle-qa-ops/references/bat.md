# BAT (Build Acceptance Test)

Required before every build. Verifies basic game loop and core features work correctly.

## When to Run
- **Pre-build only** (not during unit QA)
- After integration QA passes, before commanding builder to build

## Basic Loop Verification

### Title -> Hub Entry
- [ ] Title screen displays on game start
- [ ] Start button click -> transitions to Hub
- [ ] Hub UI (currency, skill nodes, deploy button) displays correctly

### Hub -> InGame Entry
- [ ] Deploy button click -> transitions to InGame
- [ ] InGameUI (TopHUD, BottomBar, InventoryBar) visible on screen
- [ ] Wave counter, HP bar, currency display correct

### InGame Combat
- [ ] Tower auto-placement or manual placement works
- [ ] Monsters spawn and follow path
- [ ] Tower attacks -> monster hit -> Bit gained on kill

### Run End -> Hub Return
- [ ] RunEnd panel shows when base HP 0 or wave cleared
- [ ] Bit accumulated correctly on Hub return
- [ ] Re-deploy possible

### Console
- [ ] 0 Error logs (NullReference, MissingReference, etc.)
- [ ] No critical Warnings

## Pass Criteria
- **All items pass**: Proceed to build
- **Any item fails**: Block build, fix and re-verify
