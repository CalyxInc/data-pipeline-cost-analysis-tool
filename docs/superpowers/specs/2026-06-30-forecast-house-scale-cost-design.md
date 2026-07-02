# Design — `forecast.html`（0014 House-Margin 成本試算）

> 建立日期：2026-06-30 · 重寫：2026-07-01
> 來源模型：`../calyx-infra/clusters/oregon-production/implementation-plan/0014-pipeline-cost-re-evaluation.md`
> 仿照：`index.html`（版面語彙）；配色改為 sage / charcoal / off-white（參考 Edge AI proposal）

## 1. 目的

老闆導向的靜態 HTML 成本試算：回答「多部署 M 個 house（平均上線 N 月），每 house 邊際成本多少、整體月費變多少」。`index.html`（per-camera-per-month）維持不動。

## 2. 重寫緣由（2026-07-01）

原版是「單一 +houses 滑桿 + 固定 margin 卡 + 容量關卡」。改版有三個根本變化，重寫比改快：
1. 新增 **N（平均上線月數）** 維度 —— 依 0014 §2，**S3 是唯一隨活躍月數累積**的項（桶 B ∝ N），需可調 N。
2. 架構改為**兩大區塊**（每 house 邊際 + 宏觀總成本），移除獨立容量關卡與 per-camera unit 卡。
3. **MSK / MongoDB 改為 tier-aware 邊際** —— per-house 分攤價隨 M 跨階跳動。
4. 配色全面改為 sage-green / charcoal / off-white。

## 3. 輸入

- **M** = 新增 house 數（0–1,600，預設 500）。每 house = +1 DC +1 PCV +1 loadcell，疊加於現況 DC 406 / PCV 247 / loadcell 406。
- **N** = 平均上線月數（0–36，預設 12）。僅影響 S3。

## 4. 成本模型（0014）

### 4.1 線性邊際（固定 $/裝置；S3 另 ∝ N）

| 項目 | DC 相機 | PCV 相機 | loadcell |
|------|--------:|---------:|---------:|
| EC2 realtime | $8.3 | $2.1 | — |
| S3（∝ N） | `$0.04 + $1.4·N` | `$0.05 + $0.10·N` | — |
| AWS IoT Core | — | — | $4.96 |

- EC2：GPU `流量×0.267×$580` + CPU `流量/吞吐×$470`；DC = $7.74+$0.57、PCV = $1.29+$0.78（0014 §3）。
- S3：桶 A 穩態基底（一次到位）+ 桶 B 永久累積 ∝ 活躍月數 N（0014 §2/§3）。**唯一隨 N 長的項**。
- IoT：`$2,013 ÷ 406 = $4.96/loadcell`。

### 4.2 階梯邊際（MSK / MongoDB）—— per-house = (跨階後總價 − 現況) ÷ M

**MSK**（依 msg/s，`msg/s = 895(其他固定) + loadcell×1 + DC×0.05 + PCV×0.00833`；baseline ≈ 1,323）：

| msg/s 上限（≤60% CPU） | 機型 | 月費 | 跨階點 |
|------|------|------|------|
| ≤ 1,630 | 4× m7g.large（現況） | $1,281 | — |
| ≤ 3,260 | 4× m7g.xlarge | ~$2,000 | ~+290 house |
| ≤ 6,520 | 4× m7g.2xlarge | ~$3,400 | ~+1,830 house |

**MongoDB**（依 `fsUsed`，三大 collection on-disk 拆解 ÷ 0.89）：

```
fsUsed(GB) = [4.283·loadcell + 1.066·(DC+PCV) + 0.964·PCV] / 0.89
```
（loadCellWeightData 1,739GB/406 · aIEyeImageCatalog 696GB/653 · animalVisual 238GB/247）

| fsUsed | tier | 月費 | 跨階點 |
|--------|------|------|------|
| ≤ 3,934 GB（4 TB base） | M50 | $6,900 | — |
| ≤ 7,868 GB（8 TB Extended） | M50 + Extended | ~$9,400 | ~+113 house |
| > 7,868 GB | M80 / sharding | ~$18,000 | ~+587 house |

> M50 開 Extended 至 8 TB 已由 **CC-770** 確認。

驗證：現況 fsUsed 3.0 TB、msg/s 1,323；+500 → fsUsed 7.15 TB（doc ~7.2 TB / 92%）、msg/s 1,853 → 4× xlarge。皆與 0014 §4 吻合。

## 5. 版面（兩區塊，sage 配色）

1. **Section 01 — 每 house 邊際成本**：
   - 左 panel：M、N 滑桿；裝置讀數（DC / PCV / loadcell / 總數）。
   - 右 panel：hero（每 house 平均邊際月費 + M houses 邊際總額）；5 列明細，每列 DC/PCV/loadcell chip + per-house $ + 總額 + 比例 bar；MSK/MongoDB 顯示 tier 徽章與跨階提示。
2. **Section 02 — 宏觀總成本**（dark hero 卡，老闆焦點）：
   - 三列：6 月帳單 base **$34,614** → + M houses 邊際 → = 專案總月費（含 vs base 倍率）。
   - base = 0014 §1 全帳單六項（S3 $7,900 + EC2 $12,123 + MongoDB $6,879 + IoT $2,013 + MSK $1,281 + overhead ~$4,418）。

## 6. 明確排除（0014 明說不隨相機數線性成長，故只入 base 不入 margin）

EKS 平台節點、Rerun/Train 批次、共用 overhead、Savings Plans / PPA 折扣。

## 7. 渲染 / 測試

- `calcMargin(M, N)` / `calcMacro(M, N)` 純函式於 `/* CALC-START/END */`。`render()` 讀兩滑桿 → 更新兩區塊。`linkSlider()` 同步滑桿↔數字。
- `verify.mjs`（`node verify.mjs`）以 `new Function` 抽出 calc block，斷言 base $34,614、baseline/+500 tier、`calcMargin(500,12)` 明細、S3∝N、MSK 跨階 @290、MongoDB 跨階 @113/@587、macro base+margin=total。
