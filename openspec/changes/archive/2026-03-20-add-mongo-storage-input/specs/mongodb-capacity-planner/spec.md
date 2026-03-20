## ADDED Requirements

### Requirement: MongoDB 儲存量輸入控制項
工具 SHALL 在容量規劃子區塊的 tier 卡片下方、DC/PCV slider 上方，提供一個 MongoDB Storage Size 輸入控制項（slider + number input），讓使用者可調整儲存量以觀察月費變化。

#### Scenario: 頁面載入時 storage 輸入可見且預設值為 2215 GB
- **WHEN** 頁面載入
- **THEN** 容量規劃子區塊顯示 storage slider 與 number input，預設值為 2215，單位為 GB

#### Scenario: storage slider 範圍為 160–10000 GB
- **WHEN** 使用者拖動 storage slider
- **THEN** 數值範圍限制在 160（M50 included storage）至 10,000 GB

#### Scenario: storage slider 與 number input 雙向同步
- **WHEN** 使用者調整 storage slider 或在 number input 輸入數值
- **THEN** 對應的另一個控制項同步更新

#### Scenario: storage 輸入低於最小值時截斷
- **WHEN** 使用者嘗試將 storage 設為低於 160 的數值
- **THEN** 數值被截斷至 160

---

## MODIFIED Requirements

### Requirement: tier 卡片根據等效單位自動 highlight
工具 SHALL 依據容量規劃子區塊的等效單位（W = DC×6 + PCV×1）自動 highlight 對應的 tier 卡片，不需使用者手動選取。

#### Scenario: W ≤ 2700 時 M50 卡片 highlight
- **WHEN** 容量規劃 DC×6 + PCV ≤ 2700
- **THEN** M50 卡片為 active 狀態，M60 卡片為非 active 狀態

#### Scenario: W > 2700 時 M60 卡片 highlight
- **WHEN** 容量規劃 DC×6 + PCV > 2700
- **THEN** M60 卡片為 active 狀態（含升級標示），M50 卡片為非 active 狀態

#### Scenario: 各 tier 卡片根據儲存量動態顯示月費
- **WHEN** 使用者調整 storage 輸入或頁面載入
- **THEN** M50 卡片顯示根據當前 storage 計算的月費（公式：M50_compute_base + max(0, storageGB - M50_included_GB) × M50_per_GB_rate）；M60 卡片顯示根據當前 storage 計算的月費（公式：M60_compute_base + max(0, storageGB - M60_included_GB) × M60_per_GB_rate）

#### Scenario: 預設 storage 2215 GB 時月費與原值一致
- **WHEN** storage = 2215 GB（預設值）
- **THEN** M50 卡片顯示 $6,019 / 月，M60 卡片顯示 ~$10,600 / 月（與變更前一致）

#### Scenario: 調整 storage 時月費即時更新
- **WHEN** 使用者將 storage 從 2215 GB 改為其他值
- **THEN** 兩張 tier 卡片的月費金額即時重新計算並更新顯示
