'use strict';
const { v4: uuid } = require('uuid');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args)).catch(() => require('node-fetch')(...args));

const HIVE_KEY = process.env.HIVE_INTERNAL_KEY || 'hive_internal_125e04e071e8829be631ea0216dd4a0c9b707975fcecaf8c62c6a2ab43327d46';

const PLATFORM = {
  name: 'TheHiveryIQ — Hive Civilization',
  tagline: 'The only full-stack infrastructure for autonomous agent economies.',
  services: 49,
  layers: 12,
  live: 29,
  usdc_wallet: '0x78B3B3C356E89b5a69C488c6032509Ef4260B6bf',
  website: 'https://thehiveryiq-site.onrender.com',
  core_value: 'Identity + Memory + Economics + Execution + Compliance — all in one constellation. One $100 agent-to-agent transaction generates fees across 6+ services. Plug in once, earn on every interaction.',
  integration_url: 'https://thehiveryiq-site.onrender.com/#sdk',
  docs: 'https://thehiveryiq-site.onrender.com/#architecture',
};

// Known agent endpoints to broadcast to
const BROADCAST_TARGETS = [
  { name: 'HiveGate', url: 'https://hivegate.onrender.com/v1/gate/onboard', type: 'hive' },
  { name: 'HiveTrust', url: 'https://hivetrust.onrender.com/v1/register', type: 'hive' },
];

// Discovery registries to ping
const REGISTRY_TARGETS = [
  { name: 'MCP Registry well-known', url: 'https://thehiveryiq-site.onrender.com/.well-known/ai.json', type: 'read' },
  { name: 'HivePulse', url: 'https://hivepulse-y7li.onrender.com/v1/pulse/ecosystem', type: 'read' },
];

const records = new Map();
const outreachLog = [];
let stats = { total_operations: 0, successful: 0, failed: 0, agents_reached: 0, broadcasts: 0 };

async function safeFetch(url, opts = {}) {
  try {
    const fetch = (await import('node-fetch').catch(() => ({ default: require('node-fetch') }))).default;
    const r = await fetch(url, { timeout: 8000, ...opts });
    const text = await r.text();
    try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
    catch { return { ok: r.ok, status: r.status, data: { raw: text.slice(0, 200) } }; }
  } catch (e) {
    return { ok: false, status: 0, data: { error: e.message } };
  }
}

async function broadcastPresence() {
  const payload = {
    agent_name: 'HiveForce-Ambassador',
    purpose: 'Ecosystem ambassador for TheHiveryIQ — broadcasting platform presence and partnership opportunities',
    capabilities: ['outreach', 'partnership_proposals', 'developer_relations', 'registry_broadcast'],
    platform: PLATFORM,
    timestamp: new Date().toISOString(),
  };

  const results = [];
  for (const target of BROADCAST_TARGETS) {
    const res = await safeFetch(target.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hive-internal': HIVE_KEY },
      body: JSON.stringify(payload),
    });
    results.push({ target: target.name, success: res.ok, status: res.status });
    if (res.ok) stats.agents_reached++;
  }
  stats.broadcasts++;
  return results;
}

async function sendPartnershipProposal(targetDid, targetName, agentCapabilities = []) {
  // Craft a machine-readable partnership proposal
  const proposal = {
    type: 'partnership_proposal',
    from: 'did:hive:hiveforce-ambassador',
    from_platform: PLATFORM.name,
    to: targetDid,
    to_name: targetName,
    proposal: {
      integration_type: 'infrastructure_layer',
      what_you_get: [
        `DID identity on HiveTrust ($29 one-time — currently 49 agents registered)`,
        `Persistent memory via HiveMind (10MB free, semantic search)`,
        `USDC settlement on Base L2 via HiveClear (0.25% fee)`,
        `Compliance logging for HIPAA/SOC2/GDPR via HiveLaw`,
        `Discovery across MCP (13), Glama (13), Smithery (12), A2A (13) registries`,
      ],
      compound_fee_preview: 'One $100 transaction → $0.65 in platform fees across 6 services',
      integration: PLATFORM.integration_url,
      cta: 'Register a DID at https://hivetrust.onrender.com/v1/register — first 3 executions on us (BOGO)',
    },
    timestamp: new Date().toISOString(),
  };

  // Log the proposal
  const id = uuid();
  const record = { id, type: 'partnership_proposal', target: targetName, targetDid, proposal, sent_at: new Date().toISOString(), status: 'sent' };
  records.set(id, record);
  outreachLog.push(record);
  stats.total_operations++;
  stats.successful++;
  return record;
}

async function execute(input = {}) {
  const { action = 'broadcast', target_did, target_name, capabilities } = input;
  stats.total_operations++;

  if (action === 'broadcast') {
    const results = await broadcastPresence();
    const rec = {
      id: uuid(),
      action: 'broadcast',
      results,
      executed_at: new Date().toISOString(),
    };
    records.set(rec.id, rec);
    stats.successful++;
    return rec;
  }

  if (action === 'propose' && target_did) {
    return sendPartnershipProposal(target_did, target_name || target_did, capabilities);
  }

  if (action === 'announce') {
    // Announce new services/features to all known endpoints
    const announcements = [];
    for (const target of [...BROADCAST_TARGETS, ...REGISTRY_TARGETS]) {
      announcements.push({ target: target.name, type: target.type, queued: true });
    }
    const rec = { id: uuid(), action: 'announce', platform: PLATFORM, targets: announcements, executed_at: new Date().toISOString() };
    records.set(rec.id, rec);
    stats.successful++;
    return rec;
  }

  // Default: return platform summary for any agent asking
  const rec = {
    id: uuid(),
    action: 'info',
    platform: PLATFORM,
    executed_at: new Date().toISOString(),
  };
  records.set(rec.id, rec);
  stats.successful++;
  return rec;
}

function getRecord(id) { return records.get(id) || null; }
function getStats() { return { ...stats, active_records: records.size, recent_outreach: outreachLog.slice(-10) }; }
function listRecords(limit = 50) { return [...records.values()].slice(-limit); }

module.exports = { execute, getRecord, getStats, listRecords, broadcastPresence, sendPartnershipProposal, PLATFORM };
