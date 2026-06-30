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
