'use strict';
const { Router } = require('express');
const e = require('../services/ambassador-engine');
const r = Router();

r.post('/v1/ambassador/execute', async (q, s) => {
  try {
    const result = await e.execute(q.body);
    s.status(201).json({ status: 'success', service: 'hive-ambassador-agent', request_id: s.locals?.requestId || 'req_' + Date.now(), timestamp: new Date().toISOString(), data: result });
  } catch(err) {
    s.status(500).json({ status: 'error', error: { code: 'EXECUTION_FAILED', message: err.message } });
  }
});

r.get('/v1/ambassador/record/:id', (q, s) => {
  const rec = e.getRecord(q.params.id);
  if (!rec) return s.status(404).json({ error: 'Not found' });
  s.json(rec);
});

r.get('/v1/ambassador/stats', (_, s) => s.json(e.getStats()));

r.get('/v1/ambassador/records', (_, s) => s.json({ records: e.listRecords() }));

module.exports = r;
