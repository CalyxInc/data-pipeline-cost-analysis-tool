import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./forecast.html', import.meta.url), 'utf8');
const m = html.match(/\/\* CALC-START \*\/([\s\S]*?)\/\* CALC-END \*\//);
assert(m, 'CALC-START/CALC-END markers not found in forecast.html');

const factory = new Function(
  m[1] + '\nreturn { devices, mskCost, mongoCost, mongoFsUsed, calcMargin, calcBatchLinear, calcFleet, BASE_BILL_TOTAL, BASE_REALTIME, EC2_REALTIME, EC2_EKS, EC2_RERUN };'
);
const api = factory();

const approx = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ~${b} (±${tol})`);

// ── base bill (0014 §1, image-verified full bill) ─────────────
assert.equal(api.BASE_BILL_TOTAL, 34614, 'base bill = $34,614 (six-item June bill)');

// ── baseline devices ──────────────────────────────────────────
assert.deepEqual(api.devices(0), { dc: 406, pcv: 247, lc: 406 }, 'baseline device counts');

// ── baseline tiers (M=0) ──────────────────────────────────────
{
  const base = api.devices(0);
  const msk = api.mskCost(base);
  approx(msk.rate, 1323, 2, 'baseline MSK ~1,323 msg/s');
  assert.equal(msk.cost, 1281, 'baseline MSK = 4× m7g.large');
  assert.equal(msk.tierName, '4× m7g.large', 'baseline MSK tier name');

  const mg = api.mongoCost(base);
  approx(mg.fsUsed, 3003, 5, 'baseline MongoDB fsUsed ~3.0 TB');
  assert.equal(mg.cost, 6900, 'baseline MongoDB = M50');
  assert.equal(mg.tierName, 'M50', 'baseline MongoDB tier name');
}

// ── +500 house fsUsed / msg/s reconcile with doc §4 ───────────
{
  const d = api.devices(500);
  assert.deepEqual(d, { dc: 906, pcv: 747, lc: 906 }, '+500 device counts');
  approx(api.mongoFsUsed(d), 7148, 10, '+500 MongoDB fsUsed ~7.15 TB (doc ~7.2 TB, 92% of 8 TB)');
  const msk = api.mskCost(d);
  approx(msk.rate, 1853, 3, '+500 MSK ~1,853 msg/s');
  assert.equal(msk.cost, 2000, '+500 MSK = 4× m7g.xlarge');
}

// ── calcMargin(500, 12) — headline scenario ───────────────────
{
  const r = api.calcMargin(500, 12);
  // linear items
  approx(r.ec2.total, 5200, 1, 'EC2 margin total = 500 × $10.4');
  approx(r.ec2.perHouse, 10.4, 0.01, 'EC2 per-house = $10.4');
  // S3 per-house = (0.04+1.4·12)+(0.05+0.10·12) = 16.84 + 1.25 = 18.09
  approx(r.s3.perHouse, 18.09, 0.01, 'S3 per-house at N=12');
  approx(r.s3.total, 9045, 1, 'S3 margin total at N=12');
  approx(r.iot.total, 2480, 1, 'IoT margin total = 500 × $4.96');
  // stepped increments (over baseline)
  assert.equal(r.msk.total, 719, 'MSK increment = $2,000 − $1,281');
  assert.equal(r.msk.upgraded, true, '+500 crosses MSK tier');
  assert.equal(r.mongo.total, 2500, 'MongoDB increment = $9,400 − $6,900');
  assert.equal(r.mongo.tierName, 'M50 + Extended', '+500 MongoDB tier');
  assert.equal(r.mongo.upgraded, true, '+500 crosses MongoDB tier');
  // aggregate: 5200 + 9045 + 2480 + 719 + 2500 = 19944
  approx(r.marginTotal, 19944, 2, '+500/N=12 margin total');
  approx(r.perHouse, 39.89, 0.02, '+500/N=12 avg per-house');
}

// ── S3 grows with N; other items flat in N ────────────────────
{
  const a = api.calcMargin(500, 0), b = api.calcMargin(500, 24);
  assert.equal(a.ec2.total, b.ec2.total, 'EC2 independent of N');
  assert.equal(a.iot.total, b.iot.total, 'IoT independent of N');
  assert.equal(a.msk.total, b.msk.total, 'MSK independent of N');
  assert.equal(a.mongo.total, b.mongo.total, 'MongoDB independent of N');
  assert(b.s3.total > a.s3.total, 'S3 grows with N');
  approx(a.s3.perHouse, 0.09, 0.001, 'S3 per-house at N=0 = bucket-A base only');
}

// ── MSK tier crossing point (~+290 houses, doc "~+290 房") ─────
{
  assert.equal(api.calcMargin(289, 0).msk.upgraded, false, 'M=289 stays on 4× large');
  assert.equal(api.calcMargin(290, 0).msk.upgraded, true, 'M=290 crosses to 4× xlarge');
}

// ── MongoDB tier crossings ────────────────────────────────────
{
  assert.equal(api.calcMargin(112, 0).mongo.tierName, 'M50', 'M=112 still M50 base');
  assert.equal(api.calcMargin(113, 0).mongo.tierName, 'M50 + Extended', 'M=113 opens Extended (~4 TB)');
  const over = api.calcMargin(587, 0);
  assert.equal(over.mongo.tierName, 'M80 / sharding', 'M=587 exceeds 8 TB');
  assert.equal(over.mongo.overflow, true, 'M=587 sets MongoDB overflow');
}

// ── EC2 three-way split reconciles to the $12,123 bill line ───
{
  assert.equal(api.EC2_REALTIME + api.EC2_EKS + api.EC2_RERUN, 12123, 'EC2 split sums to $12,123');
  assert.equal(api.BASE_REALTIME, 30268, 'realtime base = $34,614 − Rerun/Train $4,346');
}

// ── calcBatchLinear(500, 12) — per-batch linear items ─────────
{
  const b = api.calcBatchLinear(500, 12);
  approx(b.ec2, 5200, 1, 'batch EC2 = 500 × $10.4');
  approx(b.s3, 9045, 1, 'batch S3 at N=12');
  approx(b.iot, 2480, 1, 'batch IoT = 500 × $4.96');
  approx(b.total, 16725, 2, 'batch linear total');
}

// ── calcFleet: single batch, rerun excluded (default) ─────────
{
  const f = api.calcFleet([{ m: 500, n: 12 }], false);
  assert.equal(f.base, 30268, 'fleet base = realtime steady-state');
  approx(f.linearTotal, 16725, 2, 'fleet linear total = Σ batch linear');
  assert.equal(f.msk.inc, 719, 'fleet MSK step increment (+500 crosses tier)');
  assert.equal(f.mongo.inc, 2500, 'fleet MongoDB step increment (+500 opens Extended)');
  assert.equal(f.rerun, 0, 'rerun excluded by default');
  // 30268 + 16725 + 719 + 2500 = 50212
  approx(f.total, 50212, 2, 'fleet total (realtime base, no rerun)');
}

// ── calcFleet: rerun toggle adds $4,346 back ──────────────────
{
  const f = api.calcFleet([{ m: 500, n: 12 }], true);
  assert.equal(f.rerun, 4346, 'rerun add-on = $4,346');
  approx(f.total, 54558, 2, 'fleet total with rerun = matches full-bill projection');
}

// ── calcFleet: stepped items are fleet-wide, not per-batch ────
// two batches summing to 500 houses must give the same steps as one 500-house batch
{
  const one = api.calcFleet([{ m: 500, n: 12 }], false);
  const two = api.calcFleet([{ m: 250, n: 12 }, { m: 250, n: 12 }], false);
  assert.equal(two.msk.inc, one.msk.inc, 'MSK step depends on fleet house total, not batch split');
  assert.equal(two.mongo.inc, one.mongo.inc, 'MongoDB step depends on fleet house total, not batch split');
  approx(two.linearTotal, one.linearTotal, 2, 'linear total additive across batch split');
  approx(two.total, one.total, 2, 'fleet total invariant to batch split (same houses/N)');
}

// ── calcFleet: batches with different N accumulate S3 independently
{
  const f = api.calcFleet([{ m: 100, n: 0 }, { m: 100, n: 24 }], false);
  // batch B (N=24) S3 must exceed batch A (N=0) S3
  assert(f.linear[1].s3 > f.linear[0].s3, 'higher-N batch accumulates more S3');
}

// ── M=0 degenerate: linear marginal rate, no stepped increment ─
{
  const r = api.calcMargin(0, 12);
  assert.equal(r.msk.total, 0, 'M=0 no MSK increment');
  assert.equal(r.mongo.total, 0, 'M=0 no MongoDB increment');
  // per-house = linear-only next-house rate = 10.4 + (0.04+1.4·12)+(0.05+0.10·12) + 4.96
  approx(r.perHouse, 10.4 + 18.09 + 4.96, 0.02, 'M=0 per-house = linear next-house rate');
}

console.log('All forecast calc assertions passed ✓');
