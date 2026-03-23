# Camera Cost Calculator

## Purpose

A single-file (`index.html`) browser-based tool for calculating per-camera monthly costs across DC and PCV pipeline types, with real-time breakdown of EC2, S3 IT, MSK, and MongoDB costs based on adjustable input parameters.

---

## Source of Truth

所有計算公式中的常數（EC2 機型費率、latency、每節點 pod 數、S3 分層費率、MSK broker 費用、MongoDB tier 費用、分段閾值）均來源於：

**`benson-aws-account-oregon-ml-infra/implementation-plan/0003-pipeline-cost-analysis.md`**

當上述文件的數字更新時，應開啟新的 openspec change 同步更新 `index.html` 中的常數定義，並在 delta spec 中記錄哪些數值從什麼改成什麼、原因為何。`index.html` 本身維持靜態常數，不動態讀取來源文件。

---

## Requirements

### Requirement: 使用者可調整 4 個輸入參數
工具 SHALL 提供以下 4 個可互動輸入控制項：
- **N**（上線月數）：整數，範圍 1–24
- **M_DC**（DC 相機總數）：整數，範圍 340–3000
- **M_PCV**（PCV 相機總數）：整數，範圍 240–10000
- **Pipeline Type**：DC 或 PCV 二選一

#### Scenario: 調整 slider 時數值即時同步
- **WHEN** 使用者拖動任一 slider
- **THEN** 對應的 number input 數值同步更新，且成本結果即時重新計算

#### Scenario: 直接輸入數字時 slider 同步
- **WHEN** 使用者在 number input 中輸入有效數值
- **THEN** 對應的 slider 位置同步更新，且成本結果即時重新計算

#### Scenario: 輸入超出範圍的數值
- **WHEN** 使用者輸入小於最小值或大於最大值的數字
- **THEN** 數值被截斷至有效範圍邊界，成本結果使用截斷後數值計算

#### Scenario: M_DC 不可低於最小值 340
- **WHEN** 使用者嘗試將 M_DC 設為低於 340 的數值
- **THEN** 數值被截斷至 340

#### Scenario: M_PCV 不可低於最小值 240
- **WHEN** 使用者嘗試將 M_PCV 設為低於 240 的數值
- **THEN** 數值被截斷至 240

---

### Requirement: 系統即時計算單台相機月費並拆解各項成本
工具 SHALL 根據 4 個輸入參數及當前選擇的 S3 儲存方案，計算所選 pipeline 類型的單台相機月費，並分別顯示 **EC2**、**S3**、**MSK** 與 **MongoDB** 四項費用及合計。S3 成本 SHALL 依全域儲存方案 tab 的選擇，使用對應的計算公式（S3 IT 或 S3 Standard × 0.15）。

#### Scenario: DC pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = DC，N ≥ 4
- **THEN** EC2_DC = (⌈M_DC/91⌉ × $580 + ⌈M_DC/828⌉ × $470) / M_DC；S3 = calcS3_DC(N)（依儲存方案）；MSK_DC = $2.00；MongoDB_DC = $11.28

#### Scenario: DC pipeline 成本計算（N < 4）
- **WHEN** Pipeline Type = DC，N = 1
- **THEN** S3 = calcS3_DC(N)（依儲存方案，IT 時 $10.02，Standard 時 $1.503）；N=2 時 IT $15.93 / Std $2.3895；N=3 時 IT $21.84 / Std $3.276；MSK_DC = $2.00（所有 N 值固定）；MongoDB_DC = $11.28（所有 N 值固定）

#### Scenario: PCV pipeline 成本計算（N ≥ 4）
- **WHEN** Pipeline Type = PCV，N ≥ 4
- **THEN** EC2_PCV = (⌈M_PCV/545⌉ × $580 + ⌈M_PCV/600⌉ × $470) / M_PCV；S3 = calcS3_PCV(N)（依儲存方案）；MSK_PCV = $0.33；MongoDB_PCV = $1.88

#### Scenario: 數值驗證（DC 基準，S3 IT 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC，儲存方案 = S3 IT
- **THEN** EC2=$8.20, S3=$45.00, MSK=$2.00, MongoDB=$11.28, per-camera 合計=$66.48

#### Scenario: 數值驗證（DC 基準，S3 Standard 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=DC，儲存方案 = S3 Standard
- **THEN** EC2=$8.20, S3=$6.744, MSK=$2.00, MongoDB=$11.28, per-camera 合計=$28.22

#### Scenario: 數值驗證（PCV 基準，S3 IT 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV，儲存方案 = S3 IT
- **THEN** EC2=$4.38, S3=$7.48, MSK=$0.33, MongoDB=$1.88, per-camera 合計=$14.07

#### Scenario: 數值驗證（PCV 基準，S3 Standard 模式）
- **WHEN** N=12, M_DC=340, M_PCV=240, Pipeline Type=PCV，儲存方案 = S3 Standard
- **THEN** EC2=$4.38, S3=$1.1265, MSK=$0.33, MongoDB=$1.88, per-camera 合計=$7.72

#### Scenario: 切換儲存方案時即時更新
- **WHEN** 使用者切換全域儲存方案 tab
- **THEN** Section 01 的 S3 成本與合計即時重新計算，EC2/MSK/MongoDB 不變

---

### Requirement: EC2 實例數量標籤隨輸入參數動態顯示
工具 SHALL 在 EC2 算力欄位下方顯示當前所需 g6.xlarge 與 m7g.4xlarge 的實例數量，數量根據當前 Pipeline Type 與相機數量即時計算。

- DC pipeline：g6.xlarge 數量 = ⌈M_DC / 91⌉，m7g.4xlarge 數量 = ⌈M_DC / 828⌉
- PCV pipeline：g6.xlarge 數量 = ⌈M_PCV / 545⌉，m7g.4xlarge 數量 = ⌈M_PCV / 600⌉

#### Scenario: DC pipeline 實例數隨 M_DC 變化
- **WHEN** Pipeline Type = DC，M_DC 從任意值改變
- **THEN** EC2 標籤更新為 `g6.xlarge × ⌈M_DC/91⌉ + m7g.4xlarge × ⌈M_DC/828⌉`

#### Scenario: PCV pipeline 實例數隨 M_PCV 變化
- **WHEN** Pipeline Type = PCV，M_PCV 從任意值改變
- **THEN** EC2 標籤更新為 `g6.xlarge × ⌈M_PCV/545⌉ + m7g.4xlarge × ⌈M_PCV/600⌉`

#### Scenario: 切換 Pipeline Type 時標籤同步更新
- **WHEN** 使用者從 DC 切換至 PCV（或反之）
- **THEN** EC2 標籤立即改用對應 pipeline 的 threshold 重新計算並顯示

#### Scenario: 數值驗證（DC 基準）
- **WHEN** Pipeline Type = DC，M_DC = 340
- **THEN** EC2 標籤顯示 `g6.xlarge × 4 + m7g.4xlarge × 1`（⌈340/91⌉=4，⌈340/828⌉=1）

#### Scenario: 數值驗證（PCV 基準）
- **WHEN** Pipeline Type = PCV，M_PCV = 240
- **THEN** EC2 標籤顯示 `g6.xlarge × 1 + m7g.4xlarge × 1`（⌈240/545⌉=1，⌈240/600⌉=1）

---

### Requirement: MSK 成本依總相機數分段計算
工具 SHALL 依 M = M_DC + M_PCV 自動套用對應 MSK 方案，並在**共享基礎設施區塊**顯示目前使用的方案名稱與**總月費**（非 per-camera 分攤值）。

#### Scenario: M ≤ 945（m7g.large 方案）
- **WHEN** M_DC + M_PCV ≤ 945
- **THEN** MSK 總月費 = $1,238.88，UI 顯示「kafka.m7g.large」

#### Scenario: M > 945（m7g.xlarge 方案）
- **WHEN** M_DC + M_PCV > 945
- **THEN** MSK 總月費 = $1,997.76，UI 顯示「kafka.m7g.xlarge（升級）」

---

### Requirement: MongoDB 成本依等效單位分段計算
工具 SHALL 依 W = M_DC×6 + M_PCV 自動套用對應 MongoDB tier，並在**共享基礎設施區塊**及**艦隊總成本區塊**顯示目前使用的 tier 與**總月費**（非 per-camera 分攤值）。MongoDB 總月費 SHALL 根據容量規劃區塊的 storage 輸入動態計算，而非使用固定常數。

#### Scenario: W ≤ 2700（M50 tier）
- **WHEN** M_DC×6 + M_PCV ≤ 2,700
- **THEN** MongoDB 總月費 = calcMongoMonthly("M50")（根據當前 storage 輸入計算），UI 顯示「M50」

#### Scenario: W > 2700（M60 tier）
- **WHEN** M_DC×6 + M_PCV > 2,700
- **THEN** MongoDB 總月費 = calcMongoMonthly("M60")（根據當前 storage 輸入計算），UI 顯示「M60（升級）」

#### Scenario: 預設 storage 時總月費與原值一致
- **WHEN** storage = 2215 GB（預設值），M_DC=340, M_PCV=240
- **THEN** MongoDB 總月費 = $6,019（M50），與變更前一致

#### Scenario: 調整 storage 時共享基礎設施區塊即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 02 共享基礎設施的 MongoDB 總月費即時重新計算並更新

#### Scenario: 調整 storage 時 per-camera 成本即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 01 的 per-camera MongoDB 分攤成本即時重新計算（MongoDB 月費 ÷ 總相機數 × 權重比例）

#### Scenario: 調整 storage 時艦隊總成本即時更新
- **WHEN** 使用者調整 storage 輸入
- **THEN** Section 03 艦隊總成本中的 MongoDB 成本行即時重新計算

#### Scenario: 數值驗證（M50 邊界）
- **WHEN** M_DC=450, M_PCV=0（W = 2,700），storage = 2215 GB
- **THEN** MongoDB tier = M50（W 不超過 2,700），月費 = $6,019

#### Scenario: 數值驗證（M60 觸發）
- **WHEN** M_DC=451, M_PCV=0（W = 2,706），storage = 2215 GB
- **THEN** MongoDB tier = M60（升級），總月費 = $10,600

#### Scenario: 數值驗證（純 PCV 基準）
- **WHEN** M_DC=0, M_PCV=900（W = 900）
- **THEN** MongoDB tier = M50（與舊邏輯結果相同）

---

### Requirement: 參數 slider 依 Pipeline Type 動態顯示
工具 SHALL 在 Section 01 中根據目前選取的 Pipeline Type，只顯示與該 pipeline 相關的相機數量 slider：DC tab 只顯示 M_DC slider，PCV tab 只顯示 M_PCV slider。

#### Scenario: 選取 DC pipeline 時只顯示 M_DC slider
- **WHEN** Pipeline Type = DC
- **THEN** M_DC slider 與 number input 顯示；M_PCV slider 與 number input 隱藏

#### Scenario: 選取 PCV pipeline 時只顯示 M_PCV slider
- **WHEN** Pipeline Type = PCV
- **THEN** M_PCV slider 與 number input 顯示；M_DC slider 與 number input 隱藏

#### Scenario: 切換 Pipeline Type 時 slider 即時切換
- **WHEN** 使用者從 DC 切換至 PCV（或反之）
- **THEN** 對應 slider 立即顯示或隱藏，且成本結果使用切換後 pipeline 的相機數重新計算

---

### Requirement: 共享基礎設施月費獨立區塊
工具 SHALL 在 per-camera 月費區塊之後、艦隊總成本區塊之前，顯示一個獨立的「共享基礎設施月費」區塊，列出 MSK 與 MongoDB 的**總月費**（整個部署，非單台分攤）。MSK 行下方 SHALL 嵌入 MSK 容量規劃子區塊（詳見 `msk-capacity-planner` spec）。MongoDB 行下方 SHALL 嵌入 MongoDB Atlas 容量規劃子區塊（詳見 `mongodb-capacity-planner` spec）。

#### Scenario: 共享基礎設施區塊顯示正確總月費
- **WHEN** M_DC=340, M_PCV=240（M=580）
- **THEN** 區塊顯示 MSK 總月費 = $1,238.88（kafka.m7g.large），MongoDB 總月費 = $6,019（M50）

#### Scenario: tier 升級時共享基礎設施區塊即時更新
- **WHEN** M_DC + M_PCV 從 ≤945 增加至 >945
- **THEN** MSK 費用及方案標籤即時更新為 xlarge tier

#### Scenario: 區塊標題與編號
- **WHEN** 頁面載入
- **THEN** 區塊標題為「02 共享基礎設施 · Shared Infrastructure」，原艦隊總成本區塊標題更新為「03 艦隊總成本 · Fleet Total Cost」

#### Scenario: MSK 行下方嵌入容量規劃子區塊
- **WHEN** 頁面載入
- **THEN** Section 02 的 MSK cost row 下方顯示 MSK 容量規劃子區塊，MongoDB 行位於其下方

#### Scenario: MongoDB 行下方嵌入容量規劃子區塊
- **WHEN** 頁面載入
- **THEN** Section 02 的 MongoDB cost row 下方顯示 MongoDB Atlas 容量規劃子區塊

---

### Requirement: EKS 節點成本顯示於艦隊總成本區塊
工具 SHALL 在 Section 3 艦隊總成本區塊顯示 EKS 固定成本行，包含 Tokyo 與 Oregon 兩個 production cluster 的節點費用合計，以及各 cluster 的機型細項。

#### Scenario: EKS 行顯示兩個 cluster 合計
- **WHEN** 頁面載入或任意 slider 調整
- **THEN** Section 3 顯示 EKS 行，金額固定為 $2,107.99，不隨相機數量或 N 變動

#### Scenario: Tokyo cluster 細項展示
- **WHEN** 頁面載入
- **THEN** EKS 行下方顯示 Tokyo（ap-northeast-1）細項：t4g.medium × 28 = $883.01、m6a.xlarge × 1 = $162.94、Cluster 管理費 = $72.00，小計 $1,117.94

#### Scenario: Oregon cluster 細項展示
- **WHEN** 頁面載入
- **THEN** EKS 行下方顯示 Oregon（us-west-2）細項：t4g.medium × 14 = $343.39、t4g.xlarge × 1 = $98.11、m7g.4xlarge × 1 = $476.54、Cluster 管理費 = $72.00，小計 $990.05

#### Scenario: 艦隊月費合計含 EKS
- **WHEN** 任意有效輸入
- **THEN** 艦隊月費合計 = EC2合計 + S3 IT合計 + MSK + MongoDB Atlas + EKS（$2,107.99）

---

### Requirement: 工具無需任何安裝或 build 步驟即可執行
工具 SHALL 以單一 `index.html` 檔案交付，使用者只需在瀏覽器中開啟該檔案即可使用，無需 Node.js、網路連線或任何外部依賴。

#### Scenario: 離線開啟
- **WHEN** 使用者在無網路環境下雙擊 `index.html`
- **THEN** 工具完整載入並可正常運作，所有計算功能可用
