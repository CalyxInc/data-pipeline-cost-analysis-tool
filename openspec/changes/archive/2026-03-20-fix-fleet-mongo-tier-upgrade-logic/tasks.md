## 1. Fix calcFleetMongo

- [x] 1.1 Change `calcFleetMongo(fleetM)` signature to `calcFleetMongo(fleetDC, fleetPCV)`
- [x] 1.2 Compute `W = fleetDC * MONGO_DC_WEIGHT + fleetPCV` inside the function
- [x] 1.3 Replace `fleetM > MONGO_M50_LIMIT` with `W > MONGO_M50_EQ_LIMIT` for tier upgrade condition
- [x] 1.4 Return `W` from the function for use in the fleet note

## 2. Update renderFleet call site

- [x] 2.1 Pass `fleetDC` and `fleetPCV` to `calcFleetMongo` (compute from batches)
- [x] 2.2 Update fleet note to show W value: `"MongoDB 已升級至 M60（fleet W=" + mongo.W + " > 2700）"`

## 3. Validation

- [x] 3.1 Verify M_DC=450, M_PCV=0 → W=2700 → tier M50, cost $6,019
- [x] 3.2 Verify M_DC=451, M_PCV=0 → W=2706 → tier M60, cost $10,600
- [x] 3.3 Verify M_DC=340, M_PCV=240 → W=2280 → tier M50 (unchanged from before)
