# Design: Selectable base-month in Projected AWS Bill (forecast.html)

**Date:** 2026-07-16
**Tool:** `forecast.html` (0014 house-scale forecast model)
**Requested by:** manager review

## Problem

The Projected AWS Bill macro card (Section 02) and the monthly timeline chart
(Section 03) hardcode a single June-2026 base (`BASE_REALTIME` = $30,268, with
`BASE_BILL.s3` = $7,900). The manager observed that the base itself **grows over
time**: the existing 現況 fleet (406 DC / 247 PCV) keeps accumulating S3 storage
every month it runs, so a bill dated October is larger than one dated June even
with zero new houses. The current model omits this — the base is treated as
fixed regardless of month.

The manager wants to **select which month's bill is the base**, and see the
corresponding base cost for that month.

## Grounding (0014 §4)

- S3 is the **only** line item whose per-camera cost grows with time
  ("S3 是唯一『每台成本會隨時間長』的項"). EC2 realtime and IoT are fixed $/device;
  MSK and MongoDB are stepped tiers that only jump at capacity walls.
- Bucket-B accumulation slope: **DC $1.4 / camera / month, PCV $0.10 / camera / month**.
- Applied to the existing fleet: `406 × 1.4 + 247 × 0.10 = $593.1 / month`.
- June 2026 = the actual, image-verified bill anchor; later months are projections.

## Model

Only S3 moves with the selected base month. Add one derived constant and one
pure function inside the `/* CALC-START */ … /* CALC-END */` block:

```js
// existing-fleet S3 accretion (bucket-B on the 現況 fleet) — 0014 §4
const S3_BASE_GROWTH = BASE_DC * S3_DC_B + BASE_PCV * S3_PCV_B; // 593.1 $/month

// base line items for month offset k from the June-2026 anchor (k=0 → June).
// Only S3 grows; every other item is steady-state. MongoDB time-accumulation is
// deliberately NOT modelled here (stepped tier; per 0014 opening Extended barely
// changes cost, so flat within the 18-month horizon is defensible).
function baseBillForMonth(k) {
  const s3Growth = S3_BASE_GROWTH * k;
  return {
    k,
    s3: BASE_BILL.s3 + s3Growth,
    s3Growth,
    realtime: BASE_REALTIME + s3Growth,
    billTotal: BASE_BILL_TOTAL + s3Growth,
  };
}
```

### Month semantics (confirmed)

Selecting month M means: **the existing fleet has aged to month M**
(S3 accumulated to that month). Newly-deployed batches remain decoupled — each
still accumulates over its own `N` (avg months online). No double counting:
base = the 653 existing cameras' aged cost; batches = added houses' own
accumulation. This matches 0014's "same-maturity snapshot" logic.

## Wiring

- `calcFleet(batches, includeRerun, baseMonth = 0)` — reads
  `baseBillForMonth(baseMonth)` for its base + grand total; returns extra fields
  `baseMonth`, `baseS3`, `s3Growth` for rendering. The default `0` (= June) keeps
  every existing `verify.mjs` assertion (`f.base === 30268`) unchanged.
- New UI state `baseMonth = 0`.
- New `<select id="base-month">` in the Projected AWS Bill card header, offsets
  0–18, labels `2026/06 (實際帳單)` … `2027/12 (推估)` (only offset 0 is the actual
  bill; the rest are marked 推估). `onchange → baseMonth = value; renderFleet()`.
- `renderFleet()` base row becomes dynamic: label shows the selected month; the
  `S3 $…` figure in the breakdown shows the grown value; when `k > 0`, append a
  note e.g. `S3 +$2,372（現況艦隊累積 4 個月）`. Grand total reflects the new base.

## Timeline (Section 03) — "also fix"

`calcTimelineSeries` currently uses flat `BASE_REALTIME`. Change the base at
month point `t` to `baseBillForMonth(t + 1).realtime` (timeline `t=0` = 2026/7 =
June + 1). The base line now slopes up ~$593/mo even with zero deploys.

This is **naturally consistent** with the macro card: the timeline's October
point and the card's "October" selection both ride the single $593 slope off the
June anchor, so they agree — no separate control is added to the timeline.

## Tests (verify.mjs)

Export `baseBillForMonth` (and `S3_BASE_GROWTH`) from the factory; add:

- `baseBillForMonth(0).s3 === 7900`, `.realtime === 30268` (June unchanged).
- `baseBillForMonth(4).s3 ≈ 10272`, `.realtime ≈ 32640` (October).
- `baseBillForMonth(1).s3Growth ≈ 593.1` (slope locked).
- Existing `calcFleet(..., false)` 2-arg assertions stay green (default k=0).

## Out of scope

- MongoDB / MSK time-accumulation of the base (stepped; flat within horizon).
- Coupling the timeline's start month to the macro-card selector (they already
  agree by construction).
- Any change to Section 01 (per-house margin explorer).

## Follow-up: selectable start/end for the Section 03 timeline

Manager follow-up: let the timeline pick a **start (起始 base) and end month** so
he can run financial planning from an arbitrary start date.

- **Reindex to absolute month offset `k`** from the June-2026 anchor (same `k` as
  `baseBillForMonth`), replacing the fixed relative `TL_SPAN` / `monthLabel(i)`
  axis. Window `[tlStart, tlEnd]`; horizon `TL_MONTH_MAX = 30` (2028/12, chosen).
- `calcTimelineSeries(deploys, kStart, kEnd)` loops `k` over the window;
  base = `baseBillForMonth(k).realtime` (起始 base = existing fleet aged to the
  start month, same $593/mo slope). `deploys[].month` becomes absolute `k`; a
  deploy before the window start counts as already-online, after the end is
  hidden.
- UI: two selects **起始月份 (base)** / **終止月份** in the left panel over
  2026/06–2028/12, `end > start` enforced; chart header, hint, and readout labels
  are dynamic to the chosen window.
- Decoupled from Section 02's base-month picker (separate blocks).
- `verify.mjs`: export + assert `calcTimelineSeries` (point count, base slope,
  deploy activation, arbitrary window).

## Files touched

- `forecast.html` — constants + `baseBillForMonth`, `calcFleet` signature,
  timeline base, base-month `<select>` markup, `renderFleet` base row, state +
  handler; **plus** absolute-`k` timeline reindex, `tlStart`/`tlEnd` state,
  window selects + handlers, dynamic labels.
- `verify.mjs` — base-month + timeline-window assertions.
