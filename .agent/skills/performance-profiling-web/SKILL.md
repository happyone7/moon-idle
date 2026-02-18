---
name: performance-profiling-web
description: Browser performance profiling workflow for web games. Use for CPU/memory profiling, long-task detection, frame pacing analysis, and optimization prioritization.
---

# Performance Profiling Web

Use this skill to profile and optimize browser runtime behavior.

## Workflow

1. Establish baseline on target devices.
2. Capture:
- FPS/frame pacing.
- Main-thread long tasks.
- Memory usage over time.
3. Identify hotspots:
- Render thrash, GC spikes, timer pressure, heavy DOM churn.
4. Apply fixes in priority:
- Algorithm/data model.
- Render update reduction.
- Allocation reduction/object reuse.
5. Re-measure and keep a before/after log.

## Targets

- Stable frame pacing under active gameplay.
- No repeated long tasks during core interactions.
- No unbounded memory growth in extended sessions.
