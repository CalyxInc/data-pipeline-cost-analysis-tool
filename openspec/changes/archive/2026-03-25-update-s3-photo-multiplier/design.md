## Context

S3 成本計算基於每個 pipeline message 產生的照片數量。業務假設已變更：
- DC: 1 msg → 2 張照片（原為 3 張）
- PCV: 1 msg → 1 張照片（原為 3 張）

Source of truth（`0003-pipeline-cost-analysis.md`）已於 2026-03-25 更新完成，tool 中的常數需要同步。

所有受影響的常數都集中在 `index.html` 的 JS 區段（約 line 1245-1268），變更範圍明確且局部。

## Goals / Non-Goals

**Goals:**
- 將 `calcS3IT_DC()`、`calcS3IT_PCV()` 的查表值和線性公式係數更新為 source of truth 的最新數值
- 將 `S3_STD_DC_PER_MONTH`、`S3_STD_PCV_PER_MONTH` 的基礎 GB/月更新為 261.56 和 21.80

**Non-Goals:**
- 不變更 S3 計算的邏輯結構（查表 + 線性公式的模式不變）
- 不變更 EC2、MSK、MongoDB 的成本計算
- 不變更 UI 佈局或互動方式

## Decisions

### 純常數替換，不重構計算邏輯

`calcS3IT_DC/PCV()` 的函數結構（N<4 查表、N≥4 線性公式）與 source of truth 的格式完全一致，直接替換數值即可。無需引入照片乘數變數或動態計算，因為這些數值已經是 source of truth 預先算好的最終結果。

### S3 Standard (Cropped) 同步更新

`S3_STD_DC_PER_MONTH` 和 `S3_STD_PCV_PER_MONTH` 基於原始 GB/月乘以 0.15 cropped ratio 再乘以 $0.023 單價。基礎 GB/月從 392.34→261.56（DC）和 65.39→21.80（PCV）變更，cropped ratio 和單價不變。

## Risks / Trade-offs

- **[低風險] 計算結果大幅變動** → 預期行為，DC S3 成本降約 33%，PCV 降約 65%，符合照片數減少的比例。使用者可能需要知道數值變動原因。
- **[無風險] 向後相容** → 純常數替換，函數簽名和調用方式完全不變，Section 01 和 Section 03 自動反映新數值。
