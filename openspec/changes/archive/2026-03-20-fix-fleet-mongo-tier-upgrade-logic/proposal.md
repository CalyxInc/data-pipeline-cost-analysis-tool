## Why

Section 3's fleet MongoDB tier upgrade uses a simple total camera count (`M > 900`) which is inconsistent with the source of truth. The correct model weights DC cameras at ×6 equivalent units, so the upgrade threshold should be `W = DC×6 + PCV > 2,700` — matching the MongoDB capacity planner in Section 2.

## What Changes

- `calcFleetMongo(fleetM)` replaced with `calcFleetMongo(fleetDC, fleetPCV)` using weighted equivalent units
- M50 → M60 upgrade condition: `W = fleetDC×6 + fleetPCV > 2,700` (was: `fleetM > 900`)
- Fleet MongoDB tag, note, and proportion bar update accordingly

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `camera-cost-calculator`: Section 3 MongoDB tier upgrade logic updated from simple total count to weighted equivalent units; the `MongoDB 成本依總相機數分段計算` requirement is superseded.

## Impact

- `index.html`: `calcFleetMongo` function and `renderFleet` call site
- `openspec/specs/camera-cost-calculator/spec.md`: MongoDB fleet tier requirement updated
