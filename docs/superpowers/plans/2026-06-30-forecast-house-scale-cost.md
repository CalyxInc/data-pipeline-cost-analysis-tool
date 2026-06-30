# forecast.html (0014 House-Scale Cost Tool) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `forecast.html` — an interactive house-scale cost estimator implementing the 0014 forecast model (DC/PCV/loadcell driven, 5 core cost items, MongoDB Version A/B toggle, capacity-gate warnings).

**Architecture:** Single self-contained static HTML file (no build), modeled on `index.html`'s design system. Calculation logic is a block of **pure functions** (take `houses` + `version`, return numbers — no DOM access) delimited by `/* CALC-START */ … /* CALC-END */` markers. A Node harness (`verify.mjs`) extracts that block and asserts it against 0014's anchor values, giving a real test cycle without a browser. A `render()` function reads the sliders/toggle, calls the pure functions, and writes the DOM.

**Tech Stack:** Vanilla HTML/CSS/JS. Node ≥18 (built-in test runner via `node:assert`, no packages) for the verification harness only.

## Global Constraints

- Single static file `forecast.html`; no build step, no package manager, no external assets (matches repo convention).
- Do NOT modify `index.html`.
- All cost constants come verbatim from 0014; define them once at the top of the calc block.
- Calc functions inside `/* CALC-START */ … /* CALC-END */` MUST be pure (no `document`, no DOM) so the Node harness can eval them.
- Baseline (現況): DC 406 / PCV 247 / loadcell 406. Doc measured core total ~$23,200 (EC2 measured ~$5,100).
- UI language: 繁體中文 + mono font, matching `index.html`.

---

### Task 1: Calc core + verification harness

Builds the pure calculation block and a Node harness that asserts the 0014 anchor values. This is the correctness-critical task; everything else is DOM wiring.

**Files:**
- Create: `forecast.html` (only the `<script>` calc block in this task; minimal skeleton around it)
- Create: `verify.mjs` (Node test harness, repo root)

**Interfaces:**
- Produces (all inside `/* CALC-START */ … /* CALC-END */`, pure):
  - `devices(houses) → { dc, pcv, lc }`
  - `calcEC2(d) → { cost, g6, m7g, dcG6 }`
  - `calcS3(d) → { cost, data }`
  - `calcMSK(d) → { cost, rate, tierName, limit, overflow }`
  - `calcMongo(d, version) → { cost, fsUsed, tierName, overflow }` where `version` is `'A'` or `'B'`
  - `calcIoT(d) → { cost }`
  - `calcAll(houses, version) → { d, ec2, s3, msk, mongo, iot, total }`
  - Constants `BASELINE_MEASURED_TOTAL = 23200`, `EC2_MEASURED = 5100` (for UI annotation)

- [ ] **Step 1: Write the failing verification harness**

Create `verify.mjs`:

```js
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./forecast.html', import.meta.url), 'utf8');
const m = html.match(/\/\* CALC-START \*\/([\s\S]*?)\/\* CALC-END \*\//);
assert(m, 'CALC-START/CALC-END markers not found in forecast.html');

const factory = new Function(
  m[1] + '\nreturn { devices, calcEC2, calcS3, calcMSK, calcMongo, calcIoT, calcAll, BASELINE_MEASURED_TOTAL, EC2_MEASURED };'
);
const api = factory();

const approx = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ~${b} (±${tol})`);

// ── 現況 baseline (houses = 0) ───────────────────────────────
{
  const r = api.calcAll(0, 'A');
  assert.deepEqual(r.d, { dc: 406, pcv: 247, lc: 406 }, 'baseline device counts');
  approx(r.ec2.cost, 4664, 5, 'baseline EC2 (right-sized, below measured 5100)');
  approx(r.s3.cost, 7900, 0.5, 'baseline S3 exact');
  assert.equal(r.msk.cost, 1281, 'baseline MSK tier = 4x large');
  assert.equal(r.mongo.cost, 6900, 'baseline Mongo = M50');
  approx(r.iot.cost, 2014, 1, 'baseline IoT');
  approx(r.total, 22758, 10, 'baseline total ~22.76k (doc measured 23.2k)');
}

// ── +500 house (houses = 500), Version A ─────────────────────
{
  const r = api.calcAll(500, 'A');
  assert.deepEqual(r.d, { dc: 906, pcv: 747, lc: 906 }, '+500 device counts');
  approx(r.ec2.cost, 9900, 60, '+500 EC2 ~9900');
  assert.equal(r.ec2.m7g, 4, '+500 m7g = 4');
  approx(r.s3.cost, 17900, 50, '+500 S3 ~17900');
  assert.equal(r.msk.cost, 1900, '+500 MSK = 6x large (>1630, <=2450)');
  assert.equal(r.mongo.cost, 11000, '+500 Mongo Version A = M60+Ext');
  approx(r.iot.cost, 4494, 1, '+500 IoT');
}

// ── +500 house, Version B (only Mongo differs) ───────────────
{
  const a = api.calcAll(500, 'A');
  const b = api.calcAll(500, 'B');
  assert.equal(b.mongo.cost, 9400, '+500 Mongo Version B = M50+Ext');
  assert.equal(a.ec2.cost, b.ec2.cost, 'A/B differ only in Mongo (EC2 same)');
  assert.equal(a.msk.cost, b.msk.cost, 'A/B differ only in Mongo (MSK same)');
}

// ── tier thresholds ──────────────────────────────────────────
{
  // fsUsed crosses 4TB → Mongo upgrades. Find a houses value > 4TB.
  const big = api.calcAll(800, 'A');   // lc=1206 → fsUsed ~6.4TB
  assert.equal(big.mongo.tierName, 'M60 + Extended', 'A: 4-8TB band');
  assert.equal(api.calcAll(800, 'B').mongo.tierName, 'M50 + Extended', 'B: 4-8TB band');
}

console.log('All forecast calc assertions passed ✓');
```

- [ ] **Step 2: Run the harness to verify it fails**

Run: `node verify.mjs`
Expected: FAIL — `CALC-START/CALC-END markers not found` (file doesn't exist / no calc block yet). If `forecast.html` is absent, Node throws ENOENT — also an acceptable initial failure.

- [ ] **Step 3: Write the calc block + minimal skeleton**

Create `forecast.html` with this minimal skeleton (full layout/CSS comes in Task 2):

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="UTF-8"><title>House-Scale 成本試算</title></head>
<body>
<script>
/* CALC-START */
// ── EC2 ──
const G6_MONTHLY  = 0.805 * 720;   // $580 / g6.xlarge / month
const M7G_MONTHLY = 0.653 * 720;   // $470 / m7g.4xlarge / month
const DC_RATE  = 0.05;             // msg/s per DC camera
const PCV_RATE = 1 / 120;          // msg/s per PCV camera (~0.00833)
const LC_RATE  = 1.0;              // msg/s per loadcell
const GPU_FACTOR = 0.267;          // KEDA avg fractional g6 nodes per msg/s (5.4/20.3)
const DC_G6_MIN = 2, PCV_G6_MIN = 1;        // KEDA min replicas
const DC_M7G_THROUGHPUT = 41.4;    // msg/s per m7g node (DC BWDC)
const PCV_M7G_THROUGHPUT = 5.0;    // msg/s per m7g node (PCV VBWE)

// ── baseline (現況) ──
const BASE_DC = 406, BASE_PCV = 247, BASE_LC = 406;
const BASELINE_MEASURED_TOTAL = 23200;   // doc measured core total
const EC2_MEASURED = 5100;               // doc measured realtime EC2

// ── S3 ──
const S3_DC_GB = 261.56, S3_PCV_GB = 21.80;   // GB / camera / month
const S3_BASE_COST = 7900;
const S3_BASE_DATA = BASE_DC * S3_DC_GB + BASE_PCV * S3_PCV_GB;  // ~111,578 GB

// ── MSK (fixed cluster cost, stepped) ──
const MSK_OTHER = 937;             // other sensors msg/s, assumed constant
const MSK_TIERS = [
  { limit: 1630, cost: 1281, name: '4× m7g.large' },
  { limit: 2450, cost: 1900, name: '6× m7g.large' },
  { limit: 3260, cost: 2000, name: '4× m7g.xlarge' },
];

// ── MongoDB ──
const MONGO_LOGICAL_RATIO = 0.71;  // logical→disk (compression + index)
const MONGO_NONLC_GB = 2135;       // non-loadcell data (camera collections, no archive)
const MONGO_PER_LC_GB = 5.7;       // logical GB per loadcell (183-day window)
const TB = 1000;                   // GB per TB (decimal, matches doc fsUsed convention)
const MONGO_COST = { m50: 6900, m60_ext: 11000, m50_ext: 9400, beyond: 18000 };

// ── AWS IoT Core ──
const IOT_PER_LC = 4.96;

function devices(houses) {
  return { dc: BASE_DC + houses, pcv: BASE_PCV + houses, lc: BASE_LC + houses };
}

function calcEC2(d) {
  const dcFlow = d.dc * DC_RATE;
  const pcvFlow = d.pcv * PCV_RATE;
  const dcG6 = Math.max(DC_G6_MIN, dcFlow * GPU_FACTOR);
  const g6 = dcG6 + Math.max(PCV_G6_MIN, pcvFlow * GPU_FACTOR);
  const m7g = Math.ceil(dcFlow / DC_M7G_THROUGHPUT) + Math.ceil(pcvFlow / PCV_M7G_THROUGHPUT);
  return { cost: g6 * G6_MONTHLY + m7g * M7G_MONTHLY, g6, m7g, dcG6 };
}

function calcS3(d) {
  const data = d.dc * S3_DC_GB + d.pcv * S3_PCV_GB;
  return { cost: S3_BASE_COST * data / S3_BASE_DATA, data };
}

function calcMSK(d) {
  const rate = MSK_OTHER + d.lc * LC_RATE + d.dc * DC_RATE + d.pcv * PCV_RATE;
  let tier = MSK_TIERS.find(t => rate <= t.limit);
  const overflow = !tier;
  if (!tier) tier = MSK_TIERS[MSK_TIERS.length - 1];
  return { cost: tier.cost, rate, tierName: tier.name, limit: tier.limit, overflow };
}

function calcMongo(d, version) {
  const fsUsed = MONGO_LOGICAL_RATIO * (MONGO_NONLC_GB + MONGO_PER_LC_GB * d.lc);
  let cost, tierName, overflow = false;
  if (fsUsed <= 4 * TB) { cost = MONGO_COST.m50; tierName = 'M50'; }
  else if (fsUsed <= 8 * TB) {
    if (version === 'B') { cost = MONGO_COST.m50_ext; tierName = 'M50 + Extended'; }
    else { cost = MONGO_COST.m60_ext; tierName = 'M60 + Extended'; }
  } else { cost = MONGO_COST.beyond; tierName = 'M80 / sharding'; overflow = true; }
  return { cost, fsUsed, tierName, overflow };
}

function calcIoT(d) { return { cost: d.lc * IOT_PER_LC }; }

function calcAll(houses, version) {
  const d = devices(houses);
  const ec2 = calcEC2(d), s3 = calcS3(d), msk = calcMSK(d);
  const mongo = calcMongo(d, version), iot = calcIoT(d);
  return { d, ec2, s3, msk, mongo, iot, total: ec2.cost + s3.cost + msk.cost + mongo.cost + iot.cost };
}
/* CALC-END */
</script>
</body>
</html>
```

- [ ] **Step 4: Run the harness to verify it passes**

Run: `node verify.mjs`
Expected: PASS — prints `All forecast calc assertions passed ✓`

- [ ] **Step 5: Commit**

```bash
git add forecast.html verify.mjs
git commit -m "feat: forecast.html calc core + verification harness"
```

---

### Task 2: Static layout + CSS (design system + two sections + toggle)

Builds the full visual shell — no calc wiring yet (placeholders show `—`). Reuses `index.html`'s design system verbatim.

**Files:**
- Modify: `forecast.html` (replace `<head>` and `<body>` skeleton)

**Interfaces:**
- Produces these element IDs that Task 3 & 4 read/write:
  - Input: `#houses-slider`, `#houses-input`; toggle buttons `.version-tab[data-version]`
  - Device readout: `#dev-dc`, `#dev-pcv`, `#dev-lc`, `#dev-cameras`, `#dev-houses`
  - Hero: `#fc-total`, `#fc-multiplier`
  - Cost rows (value / sub / pct / bar): `result-ec2`/`ec2-detail`/`pct-ec2`/`bar-ec2`; same pattern for `s3`, `msk`, `mongo`, `iot`
  - Note: `#fc-note`
  - Capacity gates: `#gate-mongo-*`, `#gate-msk-*`, `#gate-gpu-*` (defined in Task 4)

- [ ] **Step 1: Copy the design system and add the version-tab style**

Replace the `<head>` of `forecast.html`. Copy the **entire `<style>` block from `index.html` verbatim** (lines 7–727: the `:root` custom properties through `.storage-tab` rules). Then append these additions inside the same `<style>`, before `</style>`:

```css
/* version A/B toggle reuses .storage-tabs / .storage-tab markup+style */
/* device readout */
.dev-readout { display:flex; flex-wrap:wrap; gap:14px 22px; margin-top:18px; padding-top:16px; border-top:1px solid var(--border); }
.dev-item { display:flex; flex-direction:column; gap:2px; }
.dev-item .v { font-size:1.15rem; font-weight:700; color:var(--teal); font-variant-numeric:tabular-nums; }
.dev-item .k { font-size:0.58rem; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); }
.hero-sub { font-size:0.60rem; color:var(--muted); margin-top:4px; letter-spacing:0.04em; }
.multiplier { color:var(--purple); font-weight:700; }
/* capacity gate card */
.gate { border:1px solid var(--border); border-radius:4px; padding:14px 16px; }
.gate + .gate { margin-top:12px; }
.gate-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
.gate-title { font-size:0.82rem; font-weight:600; color:var(--text); }
.gate-status { font-size:0.62rem; letter-spacing:0.06em; }
.gate.ok .gate-status { color:var(--green); }
.gate.warn { border-color:rgba(180,83,9,0.35); background:var(--amber-dim); }
.gate.warn .gate-status { color:var(--amber); }
.gate.over { border-color:rgba(220,38,38,0.35); background:var(--red-dim); }
.gate.over .gate-status { color:var(--red); }
.gate-bar-wrap { height:8px; background:var(--dim); border-radius:4px; overflow:hidden; margin:6px 0; }
.gate-bar { height:100%; background:var(--teal); border-radius:4px; transition:width 0.3s ease; }
.gate.warn .gate-bar { background:var(--amber); }
.gate.over .gate-bar { background:var(--red); }
.gate-detail { font-size:0.62rem; color:var(--muted); font-variant-numeric:tabular-nums; letter-spacing:0.04em; }
```

- [ ] **Step 2: Write the `<body>` markup (above the `<script>`)**

Replace the `<body>` content (keep the existing `<script>` calc block from Task 1 at the end). Insert:

```html
<header>
  <span class="title">House-Scale Forecast</span>
  <span class="subtitle">擴增 house 成本試算<span class="dot">·</span>0014 model<span class="dot">·</span>DC + PCV + loadcell</span>
</header>

<!-- MongoDB Version toggle -->
<div class="storage-tabs">
  <button class="storage-tab version-tab active" data-version="A">Version A · M50 ≤ 4 TB（現況）</button>
  <button class="storage-tab version-tab" data-version="B">Version B · M50 → 8 TB（CC-770）</button>
</div>

<div class="section-label">
  <span class="section-label-text"><em>01</em>試算成本 &nbsp;·&nbsp; Forecast Cost</span>
  <span class="section-label-line"></span>
</div>

<div class="grid">
  <!-- Left: input -->
  <div class="panel">
    <div class="panel-header">Parameters</div>
    <div class="panel-body">
      <div class="param">
        <div class="param-header">
          <span class="param-name"><em>+Houses</em> &nbsp;新增 house 數</span>
          <span class="param-range">0 – 1,600</span>
        </div>
        <div class="param-controls">
          <input type="range" id="houses-slider" min="0" max="1600" value="500">
          <input type="number" id="houses-input" min="0" max="1600" value="500">
        </div>
      </div>
      <div style="font-size:0.60rem;color:var(--muted);letter-spacing:0.04em;line-height:1.6">
        每 house = +1 DC +1 PCV +1 loadcell，疊加於現況基準（DC 406 / PCV 247 / loadcell 406）
      </div>
      <div class="dev-readout">
        <div class="dev-item"><span class="v" id="dev-dc">—</span><span class="k">DC</span></div>
        <div class="dev-item"><span class="v" id="dev-pcv">—</span><span class="k">PCV</span></div>
        <div class="dev-item"><span class="v" id="dev-lc">—</span><span class="k">Loadcell</span></div>
        <div class="dev-item"><span class="v" id="dev-cameras">—</span><span class="k">總相機</span></div>
        <div class="dev-item"><span class="v" id="dev-houses">—</span><span class="k">總 house</span></div>
      </div>
    </div>
  </div>

  <!-- Right: results -->
  <div class="panel">
    <div class="panel-header">Cost Breakdown <span style="margin-left:auto;font-size:0.60rem;color:var(--muted);letter-spacing:0">core 5 items / month</span></div>
    <div class="hero">
      <div>
        <div class="hero-label">核心月費合計</div>
        <div class="hero-value" id="fc-total">—</div>
        <div class="hero-sub">vs 現況 <span class="multiplier" id="fc-multiplier">—</span> &nbsp;·&nbsp; 現況實測基準 ~$23,200</div>
      </div>
      <div class="hero-unit">USD / 月</div>
    </div>
    <div class="cost-rows">
      <div class="cost-row">
        <div class="cost-left"><div class="cost-name">EC2 realtime</div><div class="cost-sub" id="ec2-detail">—</div><div class="cost-bar-wrap"><div class="cost-bar" id="bar-ec2" style="width:0%"></div></div></div>
        <div class="cost-right"><div class="cost-value" id="result-ec2">—</div><div class="cost-pct" id="pct-ec2">—</div></div>
      </div>
      <div class="cost-row">
        <div class="cost-left"><div class="cost-name">S3 (ai-eye-images)</div><div class="cost-sub" id="s3-detail">—</div><div class="cost-bar-wrap"><div class="cost-bar" id="bar-s3" style="width:0%"></div></div></div>
        <div class="cost-right"><div class="cost-value" id="result-s3">—</div><div class="cost-pct" id="pct-s3">—</div></div>
      </div>
      <div class="cost-row">
        <div class="cost-left"><div class="cost-name">MSK <span class="scheme-tag normal" id="msk-tag">—</span></div><div class="cost-sub" id="msk-detail">—</div><div class="cost-bar-wrap"><div class="cost-bar" id="bar-msk" style="width:0%"></div></div></div>
        <div class="cost-right"><div class="cost-value" id="result-msk">—</div><div class="cost-pct" id="pct-msk">—</div></div>
      </div>
      <div class="cost-row">
        <div class="cost-left"><div class="cost-name">MongoDB Atlas <span class="scheme-tag normal" id="mongo-tag">—</span></div><div class="cost-sub" id="mongo-detail">—</div><div class="cost-bar-wrap"><div class="cost-bar" id="bar-mongo" style="width:0%"></div></div></div>
        <div class="cost-right"><div class="cost-value" id="result-mongo">—</div><div class="cost-pct" id="pct-mongo">—</div></div>
      </div>
      <div class="cost-row">
        <div class="cost-left"><div class="cost-name">AWS IoT Core</div><div class="cost-sub" id="iot-detail">—</div><div class="cost-bar-wrap"><div class="cost-bar" id="bar-iot" style="width:0%"></div></div></div>
        <div class="cost-right"><div class="cost-value" id="result-iot">—</div><div class="cost-pct" id="pct-iot">—</div></div>
      </div>
    </div>
    <div class="result-note-wrap"><div id="fc-note"></div></div>
  </div>
</div>

<div class="section-gap"></div>

<div class="section-label">
  <span class="section-label-text"><em>02</em>容量關卡 &nbsp;·&nbsp; Capacity Gates</span>
  <span class="section-label-line"></span>
</div>

<div class="grid" style="grid-template-columns:1fr;">
  <div class="panel">
    <div class="panel-header">Capacity Gates <span style="margin-left:auto;font-size:0.60rem;color:var(--muted);letter-spacing:0">跳階風險</span></div>
    <div class="panel-body" id="gates"></div>
  </div>
</div>
```

- [ ] **Step 3: Verify it renders and calc still passes**

Run: `node verify.mjs`
Expected: PASS (calc block untouched).
Then run: `open forecast.html`
Expected: page renders with header, A/B toggle, slider, device readout, hero `—`, five cost rows showing `—`, and an empty Capacity Gates panel. No console errors.

- [ ] **Step 4: Commit**

```bash
git add forecast.html
git commit -m "feat: forecast.html static layout + design system"
```

---

### Task 3: render() wiring + slider/toggle interaction

Connects inputs → pure calc → DOM. After this, Section 01 is fully live.

**Files:**
- Modify: `forecast.html` (append to the `<script>`, AFTER `/* CALC-END */`)

**Interfaces:**
- Consumes: `calcAll`, `devices`, `BASELINE_MEASURED_TOTAL` from Task 1; element IDs from Task 2.
- Produces: global `render()`, `state.version`; `linkSlider()` helper (also used by Task 4 if needed).

- [ ] **Step 1: Append render + wiring code (after `/* CALC-END */`, before `</script>`)**

```js
const state = { version: 'A' };
const fmt0 = v => '$' + Math.round(v).toLocaleString('en-US');
const num = v => Math.round(v).toLocaleString('en-US');

function setRow(key, cost, total, detail) {
  document.getElementById('result-' + key).textContent = fmt0(cost);
  document.getElementById('pct-' + key).textContent = (cost / total * 100).toFixed(1) + '%';
  document.getElementById('bar-' + key).style.width = (cost / total * 100) + '%';
  if (detail != null) document.getElementById(key + '-detail').textContent = detail;
}

function render() {
  const houses = parseInt(document.getElementById('houses-input').value, 10) || 0;
  const r = calcAll(houses, state.version);

  // device readout
  document.getElementById('dev-dc').textContent = num(r.d.dc);
  document.getElementById('dev-pcv').textContent = num(r.d.pcv);
  document.getElementById('dev-lc').textContent = num(r.d.lc);
  document.getElementById('dev-cameras').textContent = num(r.d.dc + r.d.pcv);
  document.getElementById('dev-houses').textContent = num(houses);

  // hero
  document.getElementById('fc-total').textContent = fmt0(r.total);
  document.getElementById('fc-multiplier').textContent =
    (r.total / BASELINE_MEASURED_TOTAL).toFixed(2) + '×';

  // rows
  setRow('ec2', r.ec2.cost, r.total, `g6 ${r.ec2.g6.toFixed(1)} 台 · m7g ${r.ec2.m7g} 台`);
  setRow('s3', r.s3.cost, r.total, `新增資料 ${num(r.s3.data)} GB/月`);
  setRow('msk', r.msk.cost, r.total, `${r.msk.rate.toFixed(0)} msg/s · ${r.msk.tierName}`);
  setRow('mongo', r.mongo.cost, r.total, `fsUsed ${(r.mongo.fsUsed / 1000).toFixed(2)} TB · ${r.mongo.tierName}`);
  setRow('iot', r.iot.cost, r.total, `${num(r.d.lc)} loadcell × $4.96`);

  // tags
  const mskTag = document.getElementById('msk-tag');
  mskTag.textContent = r.msk.tierName;
  mskTag.className = 'scheme-tag ' + (r.msk.cost > 1281 ? 'upgrade' : 'normal');
  const mongoTag = document.getElementById('mongo-tag');
  mongoTag.textContent = r.mongo.tierName;
  mongoTag.className = 'scheme-tag ' + (r.mongo.tierName === 'M50' ? 'normal' : 'upgrade');

  // note
  document.getElementById('fc-note').textContent =
    houses === 0
      ? '現況：公式 right-size 後 EC2 ~$4,664（實測 ~$5,100，DC m7g over-provisioned）；總計 ~$22,760 vs 實測 $23,200。'
      : '';

  renderGates(r);  // defined in Task 4
}

function linkSlider(sliderId, inputId, min, max) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);
  slider.addEventListener('input', () => { input.value = slider.value; render(); });
  input.addEventListener('input', () => {
    let v = parseInt(input.value, 10);
    if (isNaN(v)) return;
    v = Math.max(min, Math.min(max, v));
    input.value = v; slider.value = v; render();
  });
}

// version A/B toggle
document.querySelectorAll('.version-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.version-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.version = btn.dataset.version;
    render();
  });
});

linkSlider('houses-slider', 'houses-input', 0, 1600);

// stub so Task 3 runs standalone before Task 4 lands renderGates
if (typeof renderGates === 'undefined') { window.renderGates = function () {}; }

render();
```

- [ ] **Step 2: Verify calc harness still green**

Run: `node verify.mjs`
Expected: PASS (calc block unchanged; new code is after CALC-END).

- [ ] **Step 3: Verify interaction in browser**

Run: `open forecast.html`
Expected, with slider at 500 / Version A:
- Device readout: DC 906, PCV 747, Loadcell 906, 總相機 1,653, 總 house 500.
- Hero ≈ `$45,294`, multiplier ≈ `1.95×`.
- Rows: EC2 ~$9,859, S3 ~$17,932, MSK $1,900 (tag `6× m7g.large`, amber), MongoDB $11,000 (tag `M60 + Extended`, amber), IoT ~$4,494.
- Drag slider to 0: hero ≈ `$22,758`, multiplier `0.98×`, note about現況 appears, MSK tag back to normal `4× m7g.large`, Mongo `M50`.
- Click Version B (slider still 500): MongoDB → $9,400 (`M50 + Extended`), hero → ~$43,694. Click Version A: reverts.
No console errors.

- [ ] **Step 4: Commit**

```bash
git add forecast.html
git commit -m "feat: forecast.html render wiring + A/B toggle + slider"
```

---

### Task 4: Capacity gates (Section 02)

Renders three gate cards (MongoDB fsUsed, MSK msg/s, GPU g6) that change color and message as thresholds trip.

**Files:**
- Modify: `forecast.html` (append `renderGates` to `<script>`, after `render` definition; remove the Task 3 stub)

**Interfaces:**
- Consumes: the `r` object from `calcAll` (passed by `render()`); `#gates` container from Task 2.
- Produces: global `renderGates(r)`.

- [ ] **Step 1: Remove the stub and add renderGates**

Delete the stub line from Task 3:

```js
if (typeof renderGates === 'undefined') { window.renderGates = function () {}; }
```

Add this `renderGates` function (place it above the final `render();` call):

```js
const MONGO_MAX_REPLICAS_NOTE = 'KEDA max_replicas';
function gate(title, status, statusClass, pct, detail) {
  const cls = statusClass;
  const w = Math.min(100, Math.max(0, pct));
  return `<div class="gate ${cls}">
    <div class="gate-head"><span class="gate-title">${title}</span><span class="gate-status">${status}</span></div>
    <div class="gate-bar-wrap"><div class="gate-bar" style="width:${w}%"></div></div>
    <div class="gate-detail">${detail}</div>
  </div>`;
}

function renderGates(r) {
  const out = [];

  // MongoDB: fsUsed vs 4TB / 8TB
  {
    const tb = r.mongo.fsUsed / 1000;
    const wall = state.version === 'A' ? 4 : 8;
    let cls, status;
    if (r.mongo.overflow) { cls = 'over'; status = '超過 8 TB → M80 / sharding'; }
    else if (tb > 4) { cls = 'warn'; status = state.version === 'A' ? '4–8 TB → 升 M60 + Extended' : '4–8 TB → M50 + Extended'; }
    else { cls = 'ok'; status = '在 4 TB 內 · M50'; }
    out.push(gate('MongoDB fsUsed', status, cls, tb / wall * 100,
      `fsUsed ${tb.toFixed(2)} TB / 牆 ${wall} TB（Version ${state.version}）`));
  }

  // MSK: msg/s vs broker capacity
  {
    const top = 3260;
    let cls, status;
    if (r.msk.overflow) { cls = 'over'; status = '超過 4× xlarge 容量（3,260 msg/s）'; }
    else if (r.msk.cost > 1281) { cls = 'warn'; status = '需升 broker：' + r.msk.tierName; }
    else { cls = 'ok'; status = '4× m7g.large 足夠（≤1,630）'; }
    out.push(gate('MSK broker', status, cls, r.msk.rate / top * 100,
      `${r.msk.rate.toFixed(0)} msg/s · 容量上限 ${num(r.msk.limit)}（≤60% 安全線）`));
  }

  // GPU: DC g6 vs max_replicas=10
  {
    const max = 10;
    const dcG6 = r.ec2.dcG6;
    let cls, status;
    if (dcG6 > max) { cls = 'warn'; status = '超過 max_replicas=10 → 需調高上限 + 擴 GPU NodePool'; }
    else { cls = 'ok'; status = '在 max_replicas=10 內'; }
    out.push(gate('GPU (DC g6)', status, cls, dcG6 / max * 100,
      `DC g6 平均 ${dcG6.toFixed(1)} 台 / max_replicas ${max}`));
  }

  document.getElementById('gates').innerHTML = out.join('');
}
```

- [ ] **Step 2: Verify calc harness still green**

Run: `node verify.mjs`
Expected: PASS.

- [ ] **Step 3: Verify gates in browser**

Run: `open forecast.html`
Expected:
- Slider 0 (現況), Version A: all three gates green/ok — MongoDB `3.16 TB / 4 TB`, MSK `1,365 msg/s` ok, GPU `5.4 台 / 10` ok.
- Slider 500, Version A: MongoDB **warn** (`5.18 TB`, 4–8 TB → M60+Ext), MSK **warn** (`6× m7g.large`), GPU **warn** (`12.1 台 > 10`).
- Switch to Version B at 500: MongoDB warn text becomes `M50 + Extended`, wall shows `/ 8 TB`.
- Slider ~1600: MSK gate goes **over** (msg/s > 3,260) and/or MongoDB **over** (>8 TB).
No console errors.

- [ ] **Step 4: Commit**

```bash
git add forecast.html
git commit -m "feat: forecast.html capacity gates section"
```

---

### Task 5: Final cross-check, docs, polish

Locks in the anchor values end-to-end, documents the new tool, and confirms nothing regressed.

**Files:**
- Modify: `CLAUDE.md` (document the new file)
- Modify: `forecast.html` (only if cross-check surfaces a discrepancy)

- [ ] **Step 1: Add a full-anchor assertion pass to the harness**

Append to `verify.mjs` (before the final `console.log`):

```js
// ── full +500 total cross-check (A and B) ────────────────────
{
  const a = api.calcAll(500, 'A');
  approx(a.total, 45294, 80, '+500 Version A total ~45.3k');
  const b = api.calcAll(500, 'B');
  approx(b.total, 43694, 80, '+500 Version B total ~43.7k');
  approx(a.total - b.total, 1600, 1, 'A − B = M60 vs M50 compute premium ~$1,600');
}
```

- [ ] **Step 2: Run the harness**

Run: `node verify.mjs`
Expected: PASS — `All forecast calc assertions passed ✓`

- [ ] **Step 3: Document the new tool in CLAUDE.md**

Add this subsection under `## Architecture` in `CLAUDE.md`:

```markdown
### Second Tool — `forecast.html` (0014 house-scale model)

A separate static page implementing the 0014 forecast model (DC/PCV/**loadcell**, house-driven). Distinct from `index.html` (per-camera-per-month): driven by a single `+houses` slider over a fixed現況 baseline (DC 406 / PCV 247 / loadcell 406), with a MongoDB **Version A/B** toggle. Five core cost items: EC2 realtime, S3, MSK (stepped), MongoDB (fsUsed-stepped), AWS IoT Core. Calc logic is pure functions between `/* CALC-START */ … /* CALC-END */`; `verify.mjs` (`node verify.mjs`) asserts them against 0014's anchor values. Source of truth: `../calyx-infra/clusters/oregon-production/implementation-plan/0014-pipeline-cost-re-evaluation.md`.
```

- [ ] **Step 4: Final browser smoke test**

Run: `open forecast.html`
Expected: all three sections behave per Task 3 & 4 expectations; resize window narrower than 780px → grid collapses to single column (inherited from `index.html` media query). No console errors.

- [ ] **Step 5: Commit**

```bash
git add forecast.html verify.mjs CLAUDE.md
git commit -m "feat: forecast.html anchor cross-check + docs"
```

---

## Self-Review

**Spec coverage:**
- §3 core input (+houses slider, A/B toggle) → Task 2 (markup) + Task 3 (wiring). ✓
- §4.1 EC2 / §4.2 S3 / §4.3 MSK / §4.4 MongoDB / §4.5 IoT → Task 1 calc functions, each anchor-tested. ✓
- §4.6 現況 vs measured annotation → Task 3 hero `hero-sub` + `fc-note`. ✓
- §5 layout (toggle + 2 sections) → Task 2. ✓
- §5 Section 02 capacity gates (MongoDB 4/8TB, MSK broker, GPU max_replicas) → Task 4. ✓
- §6 exclusions (no per-camera-month, no fleet batches, no cropped, no EKS/rerun) → nothing in any task adds them. ✓
- §7 render architecture (single render, linkSlider, pure calc) → Task 1 + Task 3. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; expected outputs are concrete numbers. ✓

**Type consistency:** `calcAll(houses, version)` shape `{ d, ec2, s3, msk, mongo, iot, total }` used consistently in `verify.mjs` (Task 1), `render()` (Task 3), `renderGates(r)` (Task 4). Field names (`ec2.g6`, `ec2.m7g`, `ec2.dcG6`, `s3.data`, `msk.rate/tierName/limit/overflow`, `mongo.fsUsed/tierName/overflow`) match across producer and consumers. `version` is `'A'`/`'B'` throughout. `setRow(key, …)` keys (`ec2/s3/msk/mongo/iot`) match the element-ID suffixes from Task 2. ✓
```
