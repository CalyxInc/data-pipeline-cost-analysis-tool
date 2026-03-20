## Context

`calcMongoDB(m)` computes the MongoDB tier for Section 2 using `m > MONGO_M50_LIMIT` (900). `calcFleetMongo(fleetDC, fleetPCV)` in Section 3 was already fixed to use `W = DC×6 + PCV > MONGO_M50_EQ_LIMIT` (2700). The constants `MONGO_DC_WEIGHT = 6` and `MONGO_M50_EQ_LIMIT = 2700` are already defined.

## Goals / Non-Goals

**Goals:**
- Fix `calcMongoDB` to use the same weighted equivalent units model as `calcFleetMongo`
- Section 2 MongoDB tier and cost now match Section 3 logic

**Non-Goals:**
- Not changing any UI layout or labels
- No spec delta needed — main spec already reflects weighted equivalent units

## Decisions

**Change `calcMongoDB(m)` to `calcMongoDB(mDC, mPCV)`**
- Compute `W = mDC * MONGO_DC_WEIGHT + mPCV` internally
- Use `W > MONGO_M50_EQ_LIMIT` for tier upgrade
- Update `calcTotal(n, mDC, mPCV, pipeline)` call: `calcMongoDB(mDC, mPCV)` instead of `calcMongoDB(mDC + mPCV)`

## Risks / Trade-offs

- [Risk] Section 2 MongoDB tier now upgrades earlier for DC-heavy scenarios → Correct behaviour, matches source of truth and Section 3.
