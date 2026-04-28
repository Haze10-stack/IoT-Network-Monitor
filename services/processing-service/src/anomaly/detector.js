const { Device, Alert } = require('../db/mongo');
const { getVendor }     = require('../oui/vendorLookup');  // offline, sync
// Local allowlist for trusted MACs (add your own as needed)
const ALLOWLIST = new Set([
  // Example: 'AA:BB:CC:DD:EE:FF',
]);

// Helper: check if MAC is locally administered (second least significant bit of first byte is 1)
function isLocallyAdministered(mac) {
  if (!mac || mac.length < 2) return false;
  const firstByte = parseInt(mac.slice(0, 2), 16);
  return (firstByte & 0x02) === 0x02;
}

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
  let vendor = getVendor(mac);
  if (isLocallyAdministered(mac)) {
    vendor = 'Local/Private';
  }

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

  // ── 3. Improved rogue detection ───────────────────────────────────────────
  // Only alert if:
  //   - vendor is Unknown
  //   - not in allowlist
  //   - not locally administered
  //   - seen at least 10 times (to avoid alerting on every new/temporary device)
  const isUnknown = getVendor(mac) === 'Unknown';
  const isAllowed = ALLOWLIST.has(mac.toUpperCase());
  const isLocal = isLocallyAdministered(mac);
  const shouldAlert = isUnknown && !isAllowed && !isLocal && device.seenCount >= 10;
  // Debug log for every packet
  console.log(`[debug] MAC=${mac} vendor=${vendor} seenCount=${device.seenCount} allowlist=${isAllowed} local=${isLocal} shouldAlert=${shouldAlert}`);
  if (shouldAlert) {
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