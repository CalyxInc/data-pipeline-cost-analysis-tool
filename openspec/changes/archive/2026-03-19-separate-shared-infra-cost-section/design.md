## Context

`index.html` 目前有兩個 section：
- **01 單台相機月費**：顯示 EC2、S3 IT、MSK、MongoDB 四項 per-camera 分攤費用，以及合計
- **02 艦隊總成本**：fleet batch 計算（已有獨立區塊）

MSK 和 MongoDB 的成本計算方式是「固定總月費除以 M」分攤，本質上是共享基礎設施費，不像 EC2（與 pipeline type 和相機數線性相關）或 S3 IT（per-camera 儲存量）。

## Goals / Non-Goals

**Goals:**
- Section 01 的 per-camera 月費合計只含 EC2 + S3 IT
- 新增 Section 02「共享基礎設施月費」，顯示 MSK 和 MongoDB 的**絕對總月費**（不除以 M）
- 原 Section 02（Fleet Total Cost）順延為 Section 03

**Non-Goals:**
- 不修改任何成本計算公式或常數
- 不改動 Fleet Total Cost section 的邏輯
- 不重新設計整體 UI 風格

## Decisions

**共享基礎設施區塊顯示絕對金額，不顯示 per-camera 分攤**

MSK 和 MongoDB 的月費只有兩個可能值（依 M_DC+M_PCV 的 tier），顯示總月費（如 `$1,997.76 / mo`）比除以相機數更直覺，因為這筆費用不隨每台相機線性增加。

**Section 命名：`02 共享基礎設施 · Shared Infrastructure`**

配合現有 section-label 格式（`<em>02</em>文字 &nbsp;·&nbsp; English`）。

**per-camera 合計（hero value）只加總 EC2 + S3 IT**

`render()` 中的 `r.total` 目前是四項相加。改為只加 `r.ec2.cost + r.s3` 給 section 01 的 hero value。MSK/MongoDB 的個別 cost 值仍從 `r.msk.cost` / `r.mongo.cost` 取出顯示在新區塊。

**比例 bar 只在各自區塊內計算**

Section 01 的 bar 以 EC2 + S3 IT 為分母；Section 02 的 bar 以 MSK + MongoDB 為分母（或直接不顯示 bar，因為兩者只有 tier 切換，視覺意義較低）。

## Risks / Trade-offs

- **[數值驗證基準值失效]** → 原 spec 的 scenario 驗證值（如合計 $66.82）包含 MSK + MongoDB，需在 delta spec 更新為新的 per-camera 合計基準值
- **[Section 編號跳號]** → Fleet Total Cost 從 02 改為 03，純 UI 文字改動，無邏輯影響

## Migration Plan

純前端改動，無 build 步驟。改完重新整理瀏覽器即可驗證。
