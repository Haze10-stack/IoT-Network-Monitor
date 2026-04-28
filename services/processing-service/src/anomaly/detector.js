const { Device, Alert } = require('../db/mongo');
const { getVendor }     = require('../oui/vendorLookup');  // offline, sync

// ── Config ───────────────────────────────────────────────────────────────────
const TRAFFIC_SPIKE_THRESHOLD = 50;
const RSSI_DROP_THRESHOLD     = 20;
const WINDOW_MS               = 5000;
const RSSI_NOISE_FLOOR        = -85;   // ignore signals weaker than this

const windowMap = new Map();

/**
 * Main entry — called for each packet consumed from Kafka.
 */
async function processPacket(record) {
  const { nodeId, mac, rssi, type: frameType, subtype, receivedAt } = record;

  // ── 0. Filter noise ───────────────────────────────────────────────────────
  if (rssi < RSSI_NOISE_FLOOR) return;                  // too weak — ignore
  if (mac === 'FF:FF:FF:FF:FF:FF') return;              // broadcast — ignore
  if (mac === '00:00:00:00:00:00') return;              // null MAC — ignore

  // ── 1. Offline vendor lookup (instant, no API call) ───────────────────────
  const vendor = getVendor(mac);

  // ── 2. Upsert device ──────────────────────────────────────────────────────
  const device = await Device.findOneAndUpdate(
    { mac },
    {
      $set:  { nodeId, lastSeen: new Date(receivedAt), vendor },
      $inc:  { seenCount: 1 },
      $push: {
        rssiHistory: {
          $each:  [{ rssi, ts: new Date(receivedAt) }],
          $slice: -20,
        },
      },
      $setOnInsert: { firstSeen: new Date(receivedAt) },
    },
    { upsert: true, new: true }
  );

  // ── 3. Smarter rogue detection ─────────────────────────────────────────────
  // Only alert if vendor is Unknown AND this is the first time we see it.
  // Known vendors (Apple, Samsung, etc.) never trigger rogue alerts.
  if (vendor === 'Unknown' && device.seenCount === 1) {
    await raiseAlert({
      type:     'rogue_device',
      severity: 'high',
      message:  `New unknown device detected: ${mac}`,
      mac,
      nodeId,
    });
  }

  // ── 4. RSSI anomaly ────────────────────────────────────────────────────────
  if (device.rssiHistory.length >= 2) {
    const history = device.rssiHistory;
    const prev    = history[history.length - 2].rssi;
    if (Math.abs(rssi - prev) > RSSI_DROP_THRESHOLD) {
      await raiseAlert({
        type:     'signal_anomaly',
        severity: 'low',
        message:  `RSSI anomaly on ${mac} (${vendor}): ${prev} → ${rssi} dBm`,
        mac,
        nodeId,
      });
    }
  }

  // ── 5. Traffic spike ───────────────────────────────────────────────────────
  await checkTrafficSpike(nodeId, receivedAt);
}

async function checkTrafficSpike(nodeId, receivedAt) {
  const now = typeof receivedAt === 'number' ? receivedAt : Date.parse(receivedAt);
  if (!windowMap.has(nodeId)) windowMap.set(nodeId, []);
  const window = windowMap.get(nodeId);
  const cutoff = now - WINDOW_MS;
  while (window.length && window[0] < cutoff) window.shift();
  window.push(now);

  if (window.length >= TRAFFIC_SPIKE_THRESHOLD) {
    const recent = await Alert.findOne({
      type:      'traffic_spike',
      nodeId,
      createdAt: { $gte: new Date(now - 10000) },
    });
    if (!recent) {
      await raiseAlert({
        type:     'traffic_spike',
        severity: 'medium',
        message:  `Traffic spike on node ${nodeId}: ${window.length} packets in ${WINDOW_MS/1000}s`,
        nodeId,
      });
    }
  }
}

async function raiseAlert(data) {
  const alert = await Alert.create(data);
  console.log(`[alert] [${data.severity.toUpperCase()}] ${data.message}`);
  return alert;
}

module.exports = { processPacket };