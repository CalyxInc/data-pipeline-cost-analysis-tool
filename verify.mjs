import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./forecast.html', import.meta.url), 'utf8');
const m = html.match(/\/\* CALC-START \*\/([\s\S]*?)\/\* CALC-END \*\//);
assert(m, 'CALC-START/CALC-END markers not found in forecast.html');

const factory = new Function(
  m[1] + '\nreturn { devices, mskCost, mongoCost, mongoFsUsed, calcMargin, calcMacro, BASE_BILL_TOTAL };'
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
  // S3 per-house = (0.04+1.9·12)+(0.05+0.09·12) = 22.84 + 1.13 = 23.97
  approx(r.s3.perHouse, 23.97, 0.01, 'S3 per-house at N=12');
  approx(r.s3.total, 11985, 1, 'S3 margin total at N=12');
  approx(r.iot.total, 2480, 1, 'IoT margin total = 500 × $4.96');
  // stepped increments (over baseline)
  assert.equal(r.msk.total, 719, 'MSK increment = $2,000 − $1,281');
  assert.equal(r.msk.upgraded, true, '+500 crosses MSK tier');
  assert.equal(r.mongo.total, 2500, 'MongoDB increment = $9,400 − $6,900');
  assert.equal(r.mongo.tierName, 'M50 + Extended', '+500 MongoDB tier');
  assert.equal(r.mongo.upgraded, true, '+500 crosses MongoDB tier');
  // aggregate
  approx(r.marginTotal, 22884, 2, '+500/N=12 margin total');
  approx(r.perHouse, 45.77, 0.02, '+500/N=12 avg per-house');
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

// ── calcMacro(500, 12) — base + margin = total ────────────────
{
  const mac = api.calcMacro(500, 12);
  assert.equal(mac.base, 34614, 'macro base');
  approx(mac.margin, 22884, 2, 'macro margin = calcMargin total');
  approx(mac.total, 57498, 2, 'macro grand total = base + margin');
}

// ── M=0 degenerate: linear marginal rate, no stepped increment ─
{
  const r = api.calcMargin(0, 12);
  assert.equal(r.msk.total, 0, 'M=0 no MSK increment');
  assert.equal(r.mongo.total, 0, 'M=0 no MongoDB increment');
  // per-house = linear-only next-house rate = 10.4 + (0.04+1.9·12)+(0.05+0.09·12) + 4.96
  approx(r.perHouse, 10.4 + 23.97 + 4.96, 0.02, 'M=0 per-house = linear next-house rate');
}

console.log('All forecast calc assertions passed ✓');
