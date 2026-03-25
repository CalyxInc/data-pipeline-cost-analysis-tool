# s3-storage-mode

## Purpose

本規格定義全域 S3 儲存方案切換功能，允許使用者在 S3 Intelligent-Tiering 與 S3 Standard (Cropped) 兩種定價模式之間切換，影響所有 Section 的 S3 成本計算與標籤顯示。

## Requirements

### Requirement: 全域 S3 儲存方案切換 Tab
工具 SHALL 在 header 與 Section 01 之間提供一個全域 tab bar，允許使用者切換兩種 S3 儲存方案：
- **S3 Intelligent-Tiering**（預設）：使用現有 S3 IT 定價公式
- **S3 Standard (Cropped)**：S3 IT 費用 × 0.15（影像裁切後尺寸為原始的 15%）

Tab 選擇為全域狀態，影響 Section 01、02、03 中所有 S3 相關成本計算與標籤顯示。

#### Scenario: 頁面載入時預設為 S3 Intelligent-Tiering
- **WHEN** 頁面載入
- **THEN** S3 Intelligent-Tiering tab 為 active 狀態，所有 S3 成本使用現有 IT 公式計算

#### Scenario: 切換至 S3 Standard (Cropped)
- **WHEN** 使用者點擊 S3 Standard (Cropped) tab
- **THEN** 該 tab 變為 active 狀態，所有 Section 的 S3 成本即時以 S3 IT 費用 × 0.15 重新計算

#### Scenario: 切換回 S3 Intelligent-Tiering
- **WHEN** 使用者點擊 S3 Intelligent-Tiering tab
- **THEN** 該 tab 變為 active 狀態，所有 Section 的 S3 成本即時還原為 IT 公式計算結果

#### Scenario: 非 S3 成本不受影響
- **WHEN** 使用者切換 S3 儲存方案 tab
- **THEN** EC2、MSK、MongoDB、EKS 成本維持不變，僅 S3 成本改變

---

### Requirement: S3 Standard (Cropped) 成本計算公式
當儲存方案為 S3 Standard (Cropped) 時，工具 SHALL 使用以下公式計算 S3 成本：
- DC pipeline：S3_Std_DC(N) = S3_IT_DC(N) × 0.15
- PCV pipeline：S3_Std_PCV(N) = S3_IT_PCV(N) × 0.15

#### Scenario: S3 Standard DC 成本（N >= 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = DC，N >= 4
- **THEN** S3 成本 = ($9.41 + $1.72 × N) × 0.15

#### Scenario: S3 Standard DC 成本（N < 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = DC，N = 1
- **THEN** S3 成本 = $6.69 × 0.15 = $1.0035；N=2 時 $10.63 × 0.15 = $1.5945；N=3 時 $14.57 × 0.15 = $2.1855

#### Scenario: S3 Standard PCV 成本（N >= 4）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，Pipeline Type = PCV，N >= 4
- **THEN** S3 成本 = ($0.77 + $0.15 × N) × 0.15

#### Scenario: 數值驗證（DC 基準，S3 Standard）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，N=12, Pipeline Type=DC
- **THEN** S3 成本 = ($9.41 + $1.72 × 12) × 0.15 = $30.05 × 0.15 = $4.5075

#### Scenario: 數值驗證（PCV 基準，S3 Standard）
- **WHEN** 儲存方案 = S3 Standard (Cropped)，N=12, Pipeline Type=PCV
- **THEN** S3 成本 = ($0.77 + $0.15 × 12) × 0.15 = $2.57 × 0.15 = $0.3855

---

### Requirement: S3 成本標籤隨儲存方案動態顯示
工具 SHALL 根據當前選擇的儲存方案，動態更新所有 S3 相關標籤文字。

#### Scenario: S3 IT 模式下的標籤
- **WHEN** 儲存方案 = S3 Intelligent-Tiering
- **THEN** Section 01 顯示「S3 Intelligent-Tiering」；Section 03 顯示「S3 IT 合計」

#### Scenario: S3 Standard 模式下的標籤
- **WHEN** 儲存方案 = S3 Standard (Cropped)
- **THEN** Section 01 顯示「S3 Standard (Cropped)」；Section 03 顯示「S3 Std 合計」

---

### Requirement: Tab bar 視覺設計
Tab bar SHALL 使用與現有設計系統一致的視覺風格，位於 header 下方、Section 01 上方，視覺層級高於 section 內部控制項。

#### Scenario: Tab bar 位置與寬度
- **WHEN** 頁面載入
- **THEN** Tab bar 位於 header 與第一個 section-label 之間，最大寬度與頁面內容區域一致（max-width: 1000px）

#### Scenario: Active tab 視覺狀態
- **WHEN** 某 tab 為 active
- **THEN** Active tab 使用 `--teal` 色系突顯，inactive tab 使用淡色背景
