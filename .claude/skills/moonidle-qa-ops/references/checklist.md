# QA Checklist

## Core Loop (required every QA session)

### Game Start
- [ ] Hub screen displays on game start
- [ ] Bit/Core currency shown correctly in Hub
- [ ] "Deploy" button click enters stage

### Combat (InGame)
- [ ] Wave counter displays and increments correctly
- [ ] Monsters follow path
- [ ] Tower placement works (cost deducted)
- [ ] Tower attacks -> monster HP decreases -> Bit gained on kill
- [ ] Base HP decrease reflected in HealthBar
- [ ] Base HP 0 -> RunEnd panel displays

### Run End
- [ ] RunEnd panel shows earned Bit
- [ ] Bit accumulated on Hub return

### Permanent Growth (Hub)
- [ ] Skill nodes displayed (locked/unlocked states)
- [ ] Skill purchase possible when Bit sufficient
- [ ] Level increases after purchase, Bit deducted
- [ ] Max level prevents further purchase
- [ ] Insufficient Bit prevents purchase

### Modifier Application
- [ ] Attack skill -> tower damage increase confirmed
- [ ] Attack speed skill -> tower attack interval decrease confirmed
- [ ] Base HP skill -> starting HP increase confirmed

## Content (Phase 3)

### Stage Progression
- [ ] Stage 1 clear -> Stage 2 unlocked
- [ ] Stage 2 clear -> Stage 3 unlocked
- [ ] Each stage boss appears and can be defeated

### Tower Upgrade
- [ ] Click placed tower -> upgrade UI displays
- [ ] Upgrade cost deducted, level increases
- [ ] Max level prevents upgrade

## Non-Functional Verification

### Console
- [ ] 0 Error logs
- [ ] No critical Warnings

### Performance
- [ ] Smooth play without frame drops
- [ ] No memory leak signs (during repeated play)

### Save/Load
- [ ] Data persists after app restart
- [ ] Skill levels, Bit, stage unlock status preserved

## Screenshot Naming Convention
```
Assets/Screenshots/qa_{sprint}_{item}.png
Example: qa_sprint4_hub.png, qa_sprint4_combat.png
```
