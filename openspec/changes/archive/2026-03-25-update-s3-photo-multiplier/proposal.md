## Why

DC pipeline 的照片乘數從 3 張降為 2 張，PCV pipeline 從 3 張降為 1 張，直接影響 S3 儲存量與成本計算。Source of truth（`0003-pipeline-cost-analysis.md`）已於 2026-03-25 更新，tool 中的 S3 成本常數需同步更新。

## What Changes

- **BREAKING**: 更新 `calcS3IT_DC()` 的所有常數值（N=1: $10.02→$6.69, N=2: $15.93→$10.63, N=3: $21.84→$14.57, N≥4: $14.12+$2.57×N → $9.41+$1.72×N）
- **BREAKING**: 更新 `calcS3IT_PCV()` 的所有常數值（N=1: $1.67→$0.56, N=2: $2.66→$0.89, N=3: $3.65→$1.22, N≥4: $2.35+$0.43×N → $0.77+$0.15×N）
- 更新 S3 Standard (Cropped) 的基礎 GB/月常數（DC: 392.34→261.56 GB/cam/mo, PCV: 65.39→21.80 GB/cam/mo）

## Capabilities

### New Capabilities

（無新增功能）

### Modified Capabilities

- `camera-cost-calculator`: S3 IT 成本公式常數更新，反映 DC 2 張照片、PCV 1 張照片的新假設
- `s3-storage-mode`: S3 Standard (Cropped) 基礎儲存量更新，DC 261.56 GB/cam/mo、PCV 21.80 GB/cam/mo

## Impact

- `index.html` 中的 `calcS3IT_DC()`、`calcS3IT_PCV()` 函數常數
- `S3_STD_DC_PER_MONTH`、`S3_STD_PCV_PER_MONTH` 常數
- Section 01（單台相機成本）和 Section 03（Fleet 總成本）的計算結果均會受影響
