## Context

`calcFleetMongo` currently receives `fleetM` (total camera count) and compares against `MONGO_M50_LIMIT = 900`. The MongoDB capacity planner (Section 2) and the source of truth both use a weighted equivalent unit model: each DC camera counts as 6 units, each PCV camera as 1 unit. The M50 tier handles up to 2,700 eq, M60 up to 5,400 eq. The constants `MONGO_DC_WEIGHT = 6`, `MONGO_M50_EQ_LIMIT = 2700`, `MONGO_M60_EQ_LIMIT = 5400` already exist in `index.html`.

## Goals / Non-Goals

**Goals:**
- Fix `calcFleetMongo` to use `W = DC×6 + PCV` for tier selection
- Align Section 3 upgrade threshold with Section 2 capacity planner and source of truth
- Update the fleet note to show W value for transparency

**Non-Goals:**
- Not changing Section 2 capacity planner (already correct)
- Not changing per-camera MongoDB constants ($11.28 DC / $1.88 PCV)
- Not adding overflow handling beyond M60 in fleet cost (out of scope)

## Decisions

**1. Change `calcFleetMongo` signature to accept `(fleetDC, fleetPCV)`**
- Compute `W = fleetDC * MONGO_DC_WEIGHT + fleetPCV` inside the function
- Use `W > MONGO_M50_EQ_LIMIT` (2700) for M50→M60 upgrade
- Rationale: Reuses existing constants; consistent with `calcMongoCapacity` logic in Section 2

**2. Update `renderFleet` call site**
- Pass `fleetDC` and `fleetPCV` separately (both already computed as batch aggregates)
- Update fleet note to show `W` value: `"MongoDB 已升級至 M60（fleet W=" + W + " > 2700）"`

## Risks / Trade-offs

- [Risk] Upgrade now triggers earlier for DC-heavy fleets (DC > 450 台 instead of > 900 台) → This is the correct behaviour per source of truth; the previous logic was wrong.
