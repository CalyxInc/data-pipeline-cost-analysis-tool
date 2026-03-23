## 1. Global State & S3 Cost Functions

- [x] 1.1 Add `let storageMode = "s3it"` state variable at the top of the JS section (near existing constants)
- [x] 1.2 Add `calcS3Std_DC(n)` and `calcS3Std_PCV(n)` functions that return `calcS3IT_DC(n) * 0.15` and `calcS3IT_PCV(n) * 0.15`
- [x] 1.3 Add dispatcher functions `calcS3_DC(n)` and `calcS3_PCV(n)` that check `storageMode` and delegate to the IT or Standard functions
- [x] 1.4 Add `s3Label()` helper that returns `"S3 Intelligent-Tiering"` or `"S3 Standard (Cropped)"` based on `storageMode`
- [x] 1.5 Add `s3LabelShort()` helper that returns `"S3 IT 合計"` or `"S3 Std 合計"` for Section 03

## 2. Tab Bar UI

- [x] 2.1 Add CSS styles for the global storage mode tab bar (positioned between header and Section 01, max-width 1000px, `--teal` active state)
- [x] 2.2 Add HTML for the tab bar with two options: "S3 Intelligent-Tiering" (default active) and "S3 Standard (Cropped)"
- [x] 2.3 Add JS event listeners on the tab buttons to update `storageMode` and toggle active class

## 3. Section 01 — Per-Camera Cost Integration

- [x] 3.1 Update `calcTotal()` to use `calcS3_DC(n)` / `calcS3_PCV(n)` instead of `calcS3IT_DC(n)` / `calcS3IT_PCV(n)`
- [x] 3.2 Update `render()` to use `s3Label()` for the S3 cost row label
- [x] 3.3 Wire tab switch to call `render()` so Section 01 updates immediately

## 4. Section 03 — Fleet Total Cost Integration

- [x] 4.1 Update `renderFleet()` S3 aggregation to use `calcS3_DC(n)` / `calcS3_PCV(n)` instead of `calcS3IT_DC` / `calcS3IT_PCV`
- [x] 4.2 Update `renderBatchList()` batch S3 subtotal to use `calcS3_DC(n)` / `calcS3_PCV(n)`
- [x] 4.3 Update S3 label in fleet cost breakdown to use `s3LabelShort()`
- [x] 4.4 Wire tab switch to call `renderBatchList()` / `renderFleet()` so Section 03 updates immediately

## 5. Verification

- [x] 5.1 Verify S3 IT mode produces identical results to current behavior (DC: N=12 → $44.96, PCV: N=12 → $7.51)
- [x] 5.2 Verify S3 Standard mode produces correct values (DC: N=12 → $6.74, PCV: N=12 → $1.13)
- [x] 5.3 Verify switching tabs updates all sections simultaneously and non-S3 costs remain unchanged
