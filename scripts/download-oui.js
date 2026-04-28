#!/usr/bin/env node
/**
 * download-oui.js
 * ---------------
 * Downloads the IEEE OUI list and converts it to a compact JSON file
 * that vendorLookup.js loads at startup — zero API calls, zero rate limits.
 *
 * Run once (or via Docker build):
 *   node scripts/download-oui.js
 *
 * Output: services/processing-service/src/oui/oui-db.json
 *   { "FC:FB:FB": "Apple, Inc.", "D8:BB:2C": "Samsung Electronics", ... }
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const OUI_URL    = 'http://standards-oui.ieee.org/oui/oui.txt';
const OUI_BACKUP = 'https://raw.githubusercontent.com/wireshark/wireshark/master/manuf';
const OUT_FILE   = path.join(__dirname, '../services/processing-service/src/oui/oui-db.json');

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/**
 * Parse IEEE oui.txt format:
 *   FC-FB-FB   (hex)\t\tApple, Inc.
 * Returns { "FC:FB:FB": "Apple, Inc.", ... }
 */
function parseIEEE(text) {
  const db = {};
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.includes('(hex)')) continue;
    // Format: "FC-FB-FB   (hex)\t\tVendor Name"
    const tabIdx = line.lastIndexOf('\t');
    if (tabIdx === -1) continue;
    const vendor = line.slice(tabIdx + 1).trim();
    if (!vendor) continue;
    // Extract prefix: "FC-FB-FB" → "FC:FB:FB"
    const match = line.match(/^([0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2})/i);
    if (!match) continue;
    const prefix = match[1].replace(/-/g, ':').toUpperCase();
    db[prefix] = vendor;
  }
  return db;
}

/**
 * Parse Wireshark manuf format (backup source):
 *   FC:FB:FB\tApple_Inc\tApple, Inc.
 */
function parseWireshark(text) {
  const db = {};
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const prefix = parts[0].trim().toUpperCase();
    if (prefix.length !== 8) continue; // only OUI (XX:XX:XX), skip full MACs
    const vendor = (parts[2] || parts[1]).trim();
    if (vendor) db[prefix] = vendor;
  }
  return db;
}

async function main() {
  // Ensure output directory exists
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let db = {};

  // Try IEEE first, fall back to Wireshark mirror
  for (const [label, url, parser] of [
    ['IEEE OUI', OUI_URL, parseIEEE],
    ['Wireshark manuf', OUI_BACKUP, parseWireshark],
  ]) {
    try {
      console.log('[download-oui] Trying ' + label + ' ...');
      const text = await download(url);
      db = parser(text);
      const count = Object.keys(db).length;
      if (count < 1000) throw new Error('Too few entries: ' + count);
      console.log('[download-oui] Parsed ' + count + ' vendors from ' + label);
      break;
    } catch (err) {
      console.warn('[download-oui] ' + label + ' failed: ' + err.message);
    }
  }

  if (Object.keys(db).length === 0) {
    console.error('[download-oui] All sources failed. Saving empty DB.');
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(db, null, 0)); // compact JSON
  const sizeKB = Math.round(fs.statSync(OUT_FILE).size / 1024);
  console.log('[download-oui] Saved to ' + OUT_FILE + ' (' + sizeKB + ' KB)');
}

main().catch(err => { console.error(err); process.exit(1); });