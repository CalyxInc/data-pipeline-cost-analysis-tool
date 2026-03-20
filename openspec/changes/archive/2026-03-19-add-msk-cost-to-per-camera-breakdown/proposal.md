## Why

Section 1's cost breakdown does not yet include MSK as a line item. MSK costs have been revised to fixed constants per camera type ($2.00/DC, $0.33/PCV), and should be surfaced in the per-camera cost breakdown so users have a complete view of all cost components.

## What Changes

- Add MSK as a new cost line item in Section 1 (Per-Camera Cost) cost breakdown panel
- DC camera MSK cost: $2.00 / 台 / 月 (constant, does not vary with N or M)
- PCV camera MSK cost: $0.33 / 台 / 月 (constant, does not vary with N or M)
- Per-camera monthly total increases to reflect MSK addition

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `camera-cost-calculator`: Section 1 cost breakdown gains a new "MSK" line item with fixed per-camera cost values ($2.00 DC / $0.33 PCV); total per-camera cost formula updated accordingly.

## Impact

- `index.html`: Section 1 cost breakdown rendering and per-camera total calculation
- `openspec/specs/camera-cost-calculator/spec.md`: Spec updated to document MSK as a cost component
