## Why

`calcMongoDB(m)` — used by Section 2 (Shared Infrastructure) to display the MongoDB tier and total monthly cost — still uses the old simple threshold `M > 900`. Section 3 was already fixed to use `W = DC×6 + PCV > 2700`. Section 2 should use the same weighted equivalent units model to be consistent.

## What Changes

- `calcMongoDB(m)` signature changes to `calcMongoDB(mDC, mPCV)`, using `W = mDC×6 + mPCV > 2700`
- `calcTotal` call site updated to pass `mDC, mPCV` separately
- Section 2 MongoDB tier display now reflects the correct upgrade threshold

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — logic fix only, no spec-level requirement changes needed; main spec was already updated by fix-fleet-mongo-tier-upgrade-logic)_

## Impact

- `index.html`: `calcMongoDB` function and `calcTotal` call site
