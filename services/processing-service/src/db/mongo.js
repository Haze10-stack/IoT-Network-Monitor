const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/netmonitor';
  await mongoose.connect(uri);
  console.log('[mongo] Connected to', uri);
}

// ── Packet record ────────────────────────────────────────────────────────────
const packetSchema = new mongoose.Schema({
  nodeId:     { type: String, required: true, index: true },
  mac:        { type: String, required: true, index: true },
  rssi:       Number,
  frameType:  Number,
  subtype:    Number,
  receivedAt: { type: Date, default: Date.now, index: true },
});

// ── Device (last-seen tracker) ───────────────────────────────────────────────
const deviceSchema = new mongoose.Schema({
  mac:       { type: String, required: true, unique: true },
  vendor:    { type: String, default: 'Unknown' },
  nodeId:    String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen:  { type: Date, default: Date.now },
  rssiHistory: [{ rssi: Number, ts: Date }],   // capped to last 20
  seenCount: { type: Number, default: 1 },
  isKnown:   { type: Boolean, default: false }, // manually whitelisted
});

// ── Alert ────────────────────────────────────────────────────────────────────
const alertSchema = new mongoose.Schema({
  type:      { type: String, enum: ['rogue_device', 'traffic_spike', 'signal_anomaly'], required: true },
  severity:  { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  message:   String,
  mac:       String,
  nodeId:    String,
  createdAt: { type: Date, default: Date.now, index: true },
  resolved:  { type: Boolean, default: false },
});

const Packet = mongoose.model('Packet', packetSchema);
const Device = mongoose.model('Device', deviceSchema);
const Alert  = mongoose.model('Alert',  alertSchema);

module.exports = { connectMongo, Packet, Device, Alert };