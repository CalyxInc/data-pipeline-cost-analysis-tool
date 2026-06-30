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
  const r = api.calcAll(0);
  assert.deepEqual(r.d, { dc: 406, pcv: 247, lc: 406 }, 'baseline device counts');
  approx(r.ec2.cost, 4664, 5, 'baseline EC2 (right-sized, below measured 5100)');
  approx(r.s3.cost, 7900, 0.5, 'baseline S3 exact');
  assert.equal(r.msk.cost, 1281, 'baseline MSK tier = 4x large');
  assert.equal(r.mongo.cost, 6900, 'baseline Mongo = M50');
  approx(r.iot.cost, 2014, 1, 'baseline IoT');
  approx(r.total, 22758, 10, 'baseline total ~22.76k (doc measured 23.2k)');
}

// ── +500 house (houses = 500), single Version-B MongoDB model ─
{
  const r = api.calcAll(500);
  assert.deepEqual(r.d, { dc: 906, pcv: 747, lc: 906 }, '+500 device counts');
  approx(r.ec2.cost, 9900, 60, '+500 EC2 ~9900');
  assert.equal(r.ec2.m7g, 4, '+500 m7g = 4');
  approx(r.s3.cost, 17900, 50, '+500 S3 ~17900');
  assert.equal(r.msk.cost, 1900, '+500 MSK = 6x large (>1630, <=2450)');
  assert.equal(r.mongo.cost, 9400, '+500 Mongo = M50 + Extended');
  assert.equal(r.mongo.tierName, 'M50 + Extended', '+500 Mongo tier name');
  approx(r.iot.cost, 4494, 1, '+500 IoT');
}

// ── MongoDB tier thresholds (single model) ───────────────────
{
  // ≤4TB → M50; 4–8TB → M50 + Extended; >8TB → M80 / sharding
  assert.equal(api.calcAll(0).mongo.tierName, 'M50', 'baseline ≤4TB band');
  assert.equal(api.calcAll(800).mongo.tierName, 'M50 + Extended', '4–8TB band (lc 1206 ~6.4TB)');
  const over = api.calcAll(1500);   // lc 1906 → fsUsed ~9.2TB
  assert.equal(over.mongo.tierName, 'M80 / sharding', '>8TB band');
  assert.equal(over.mongo.cost, 18000, '>8TB cost');
  assert.equal(over.mongo.overflow, true, '>8TB sets overflow');
}

// ── full +500 total cross-check ──────────────────────────────
// Exact total uses the precise node-cost constants (g6 = 0.805×720 = $579.6,
// m7g = 0.653×720 = $470.16) with the single Version-B MongoDB model, so the
// aggregate lands at ~$43,579 — close to but not equal to the doc's rounded ~$43,700.
{
  approx(api.calcAll(500).total, 43579, 20, '+500 total ~43.6k (Version B model)');
}

console.log('All forecast calc assertions passed ✓');
