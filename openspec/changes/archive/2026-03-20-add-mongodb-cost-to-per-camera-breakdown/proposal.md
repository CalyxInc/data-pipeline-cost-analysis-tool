## Why

Section 1's per-camera cost breakdown is missing MongoDB as a line item. MongoDB costs have been revised to fixed constants per camera type ($11.28/DC, $1.88/PCV), and should appear alongside EC2, S3 IT, and MSK to give users a complete per-camera cost view.

## What Changes

- Add MongoDB as a new cost line item in Section 1 (Per-Camera Cost) cost breakdown panel
- DC camera MongoDB cost: $11.28 / 台 / 月 (constant, does not vary with N or M)
- PCV camera MongoDB cost: $1.88 / 台 / 月 (constant, does not vary with N or M)
- Per-camera monthly total increases to reflect MongoDB addition (EC2 + S3 IT + MSK + MongoDB)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `camera-cost-calculator`: Section 1 cost breakdown gains a new "MongoDB" line item with fixed per-camera cost values ($11.28 DC / $1.88 PCV); total per-camera cost formula updated accordingly.

## Impact

- `index.html`: Section 1 cost breakdown rendering and per-camera total calculation
- `openspec/specs/camera-cost-calculator/spec.md`: Spec updated to document MongoDB as a per-camera cost component
