## 1. Fix calcMongoDB

- [x] 1.1 Change `calcMongoDB(m)` signature to `calcMongoDB(mDC, mPCV)`
- [x] 1.2 Compute `W = mDC * MONGO_DC_WEIGHT + mPCV` inside the function
- [x] 1.3 Replace `m > MONGO_M50_LIMIT` with `W > MONGO_M50_EQ_LIMIT` for tier upgrade condition

## 2. Update calcTotal call site

- [x] 2.1 Update `calcTotal` to call `calcMongoDB(mDC, mPCV)` instead of `calcMongoDB(mDC + mPCV)`

## 3. Validation

- [x] 3.1 Verify M_DC=450, M_PCV=0 → W=2700 → Section 2 shows M50, cost $6,019
- [x] 3.2 Verify M_DC=451, M_PCV=0 → W=2706 → Section 2 shows M60, cost $10,600
- [x] 3.3 Verify M_DC=340, M_PCV=240 → W=2280 → Section 2 shows M50 (unchanged)
