## Context

`index.html` 有三組場景各自使用 DC / PCV slider：Section 01（主要成本試算）、MSK 容量規劃子區塊、MongoDB 容量規劃子區塊。六組 slider/number input 目前 `min` 屬性均為 0，導致使用者可以輸入低於現況的相機數，與工具「預估未來擴展成本」的定位不符。

## Goals / Non-Goals

**Goals:**
- 將所有 DC slider/input 的 `min` 屬性從 0 改為 340
- 將所有 PCV slider/input 的 `min` 屬性從 0 改為 240
- 確保 number input 的截斷驗證邏輯同步使用新的 `min` 值

**Non-Goals:**
- 不修改最大值（DC 3000、PCV 10000 不變）
- 不修改預設值（已是 340 / 240）
- 不修改 N slider 的範圍

## Decisions

### D1：修改位置

直接更新 HTML `min` 屬性（`<input type="range">` 與 `<input type="number">`）以及 JS 中 `wire()` 函式的 `min` 參數。共 3 個場景 × 2 個相機類型 = 6 對 slider/input：

| 場景 | slider id | input id | min |
|------|----------|----------|-----|
| Section 01 DC | `dc-slider` | `dc-input` | 340 |
| Section 01 PCV | `pcv-slider` | `pcv-input` | 240 |
| MSK DC | `msk-dc-slider` | `msk-dc-input` | 340 |
| MSK PCV | `msk-pcv-slider` | `msk-pcv-input` | 240 |
| MongoDB DC | `mongo-dc-slider` | `mongo-dc-input` | 340 |
| MongoDB PCV | `mongo-pcv-slider` | `mongo-pcv-input` | 240 |

- **理由**：HTML `min` 屬性本身就有瀏覽器原生限制效果；JS `wire()` 中的 `Math.max(min, ...)` 截斷邏輯確保手動輸入也受限

## Risks / Trade-offs

- [Risk] 使用者若直接貼上低於最小值的數字到 number input，截斷邏輯會默默修正為最小值，沒有 UI 警示
  → Mitigation：現有截斷行為一致（原本就如此），無需額外 UX 改動
