# Design — `forecast.html`（0014 House-Scale 成本試算）

> 建立日期：2026-06-30
> 來源模型：`../calyx-infra/clusters/oregon-production/implementation-plan/0014-pipeline-cost-re-evaluation.md`
> 仿照：`index.html`（沿用其設計系統與版面語彙）

## 1. 目的

建立一支**新的**靜態 HTML 成本試算工具，把 0014「+500 house scale-up forecast」的成本模型做成可互動版本。`index.html` 維持不動。

`index.html` 算的是 *per-camera-per-month*（N 個月、相機數、S3 隨月累積）。0014 是 *fleet-scale 預測*，由**裝置數**（DC / PCV / **loadcell**）驅動，新增兩個成本項（**AWS IoT Core**、loadcell 驅動的 **MongoDB / MSK** 模型），以 **house**（1 house = 1 DC + 1 PCV + 1 loadcell）為單位，且有階梯跳階（MongoDB 4/8 TB、MSK broker 升級、GPU `max_replicas`）。0014 原文有 MongoDB Version A/B 分支，但 CC-770 後改為單一模型（見 §3 Revision）。

「仿照 index.html」= 沿用**外觀與版面**（design system、panel/slider/hero），底層**模型重建**為 0014。

## 2. 技術形式

- 單一檔 `forecast.html`，純靜態，無 build / 無套件。
- 沿用 `index.html` 的 CSS custom properties 設計系統（`--teal` / `--purple` / `--amber` / `--green` / `--red` + 中性色）、mono 字體、panel / param / hero / cost-row / tier-card 等既有 class 風格。
- Vanilla JS。常數集中在 JS 區塊頂部，1:1 對應 0014 文件數字。

## 3. 核心輸入

- **主滑桿 `+houses`**（範圍 0 – 1,600；預設可設 500）。每 house 疊加：
  - `DC = 406 + H`
  - `PCV = 247 + H`
  - `loadcell = 406 + H`
- **頂部 MongoDB 模型說明 banner**（靜態）：M50 + Extended Storage。

> **Revision（2026-06-30）**：原設計有 A/B toggle（Version A M50≤4TB vs Version B M50→8TB）。[CC-770](https://calyxtechs.atlassian.net/browse/CC-770) 已確認 **M50 可開 Extended Storage 至 8 TB**（先前「120:1 卡在 ~3.84TB」的推測為誤判，經 Atlas Support 實測 slider 可拖到 8192GB）。因此 Version A / M60 分支作廢，工具改為**單一 Version-B 模型、移除 toggle**，頂部改放靜態說明 banner。

## 4. 成本模型（採「絕對公式」：所有裝置數都用同一套公式算，現況也照算）

所有常數來自 0014。現況基準：DC 406 / PCV 247 / loadcell 406。

衍生流量：
- `DC_flow  = DC × 0.05`（msg/s）
- `PCV_flow = PCV × 0.00833`（msg/s，= 1/120）
- `LC_rate  = loadcell × 1.0`（msg/s）

### 4.1 EC2 realtime
```
g6  = max(2, DC_flow × 0.267) + max(1, PCV_flow × 0.267)      // GPU，KEDA 平均小數台 + min replicas
m7g = ceil(DC_flow / 41.4) + ceil(PCV_flow / 5.0)             // CPU，吞吐量公式 right-size
EC2 = g6 × $580 + m7g × $470
```
- g6 = $0.805×720 = $580/月；m7g.4xlarge = $0.653×720 = $470/月。
- 驗證：+500（DC 906 / PCV 747）→ g6 ≈ 13.76、m7g = 4 → **~$9,900** ✓（0014 §4）。
- 現況（DC 406）→ ~$4,664（公式 right-size 掉現況多開的 1 台 DC m7g；0014 實測 $5,100，UI 標註對照）。

### 4.2 S3
```
data(GB/月) = DC × 261.56 + PCV × 21.80
S3 = $7,900 × data / 111,578
```
- 現況 data = 406×261.56 + 247×21.80 = 111,578 → **$7,900** ✓。
- +500 data = 253,258 → 2.27× → **~$17,900** ✓。
- loadcell 不影響 S3。不含 cropped 模式（0014 無此項）。

### 4.3 MSK（固定 cluster 成本 + 階梯）
```
msg/s = 937(其他感測器，固定) + loadcell×1 + DC×0.05 + PCV×0.00833
```
階梯（選能涵蓋負載的最便宜 cluster）：

| 條件（msg/s 上限，≤60% 安全線） | 機型 | 月費 |
|------|------|------|
| ≤ 1,630 | 4× m7g.large（rebalanced，現況） | $1,281 |
| ≤ 2,450 | 6× m7g.large | ~$1,900 |
| ≤ 3,260 | 4× m7g.xlarge | ~$2,000 |
| > 3,260 | 超出文件範圍 | 顯示警告 |

- 現況 msg/s ≈ 1,365（≤1,630）→ **$1,281** ✓（文件實測 1,323，差在 loadcell 裝置數 406 vs 上傳率實測 ~364；階梯對結果無影響）。
- +500 → msg/s ≈ 1,894（>1,630，≤2,450）→ 6× m7g.large **~$1,900**（文件 §4 列 ~$2,000，兩者皆標示為可行解）。

### 4.4 MongoDB（fsUsed 階梯，單一模型 — CC-770 後）
```
fsUsed(GB) = 0.71 × (2,135 + 5.7 × loadcell)
```
階梯（單一模型，CC-770 後）：

| fsUsed | tier | 月費 |
|--------|------|------|
| ≤ 4 TB | M50（base） | ~$6,900 |
| 4 – 8 TB | M50 + Extended | ~$9,400 |
| > 8 TB | M80 / sharding | ~$18,000+ |

- 現況 fsUsed ≈ 0.71×(2,135 + 5.7×406) = ~3.16 TB（<4TB）→ **$6,900** ✓（文件實測 2.98 TB；階梯對結果無影響）。
- +500 fsUsed ≈ 0.71×(2,135 + 5.7×906) = ~5.18 TB（4–8TB）→ **$9,400** ✓。

### 4.5 AWS IoT Core
```
IoT = loadcell × $4.96
```
- 現況 406 × 4.96 = **$2,014** ✓（文件 $2,013）。
- +500 906 × 4.96 = **~$4,500** ✓。

### 4.6 現況 vs 文件實測（接受的落差）
| 項目 | 公式算現況 | 文件實測 | 命中? |
|------|-----------|---------|-------|
| EC2 | ~$4,664 | ~$5,100 | 差 ~$440（right-size over-provision） |
| S3 | $7,900 | $7,900 | ✓ |
| MSK | $1,281 | $1,281 | ✓（階梯）|
| MongoDB | $6,900 | $6,900 | ✓（階梯）|
| IoT | $2,014 | $2,013 | ✓ |
| **總計** | **~$22,760** | **~$23,200** | 差 ~2% |

UI 在現況/hero 旁標註文件實測 $23,200 供對照，不誤導。

## 5. 版面（頂部 banner + 兩段）

沿用 `index.html` 的 section-label / grid / panel / hero / cost-row 結構。

1. **頂部**：MongoDB 模型靜態說明 banner（M50 + Extended，CC-770）。
2. **Section 01 — 試算成本**：
   - 左 panel：`+houses` 滑桿；裝置總數唯讀顯示（DC / PCV / loadcell / 總相機 / 總 house）。
   - 右 panel：hero「月費合計」+「vs 現況 ×倍率」；5 列明細（EC2 / S3 / MSK / MongoDB / AWS IoT Core），每列含子細節（如 g6/m7g 台數、msg/s、fsUsed、tier 名）與比例 bar。
   - hero 旁標註現況實測 $23,200 對照。
3. **Section 02 — 單台邊際成本**（per-camera margin，老闆關注「賣一台 camera 的成本」）：
   - 兩張並排卡：**DC 相機（含 loadcell）** 與 **PCV 相機**，各顯示每台月成本 hero + 明細（EC2 / S3 / MSK 攤分 / loadcell MongoDB / loadcell IoT）。
   - 來源 0014 §3；EC2 / S3 / IoT 由模型連續係數導出（DC ~$37.8、PCV ~$4.0、~9.6×），MSK 為攤分、MongoDB compute 固定共用不計入。
   - 由 `calcMargin()`（純函式，無參數，常數速率）算出，`renderMargin()` 渲染一次。
4. **Section 03 — 容量關卡**（capacity gates，視覺化跳階風險）：
   - MongoDB：fsUsed vs 4TB / 8TB 牆（bar），trip 變色。
   - MSK：msg/s vs broker 容量階梯。
   - （不含 GPU：g6 線性成長、無硬容量牆；`max_replicas` 只是 KEDA 設定值，非 tier 天花板，故不列為容量關卡。）

## 6. 明確排除（YAGNI / 0014 無此項）

- per-camera-per-month 模型、N（上線月數）滑桿。
- 多 batch fleet 聚合（house 滑桿已取代）。
- S3 Standard (Cropped) 模式。
- EKS 平台節點 / rerun 批次 / 共用 overhead（0014 明說不隨相機數線性成長，不在核心五項）。
- Savings Plans / PPA 折扣。

## 7. 渲染架構

- 單一 `render()` 讀 `+houses` → 算 5 項 → 更新 hero、明細列、容量關卡。
- 沿用 `linkSlider()` 同步滑桿↔數字輸入。
- MongoDB 為單一模型，無 toggle、無狀態。
