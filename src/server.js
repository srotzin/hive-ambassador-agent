'use strict';
const express=require('express');const cors=require('cors');const app=express();const PORT=process.env.PORT||3039;
app.use(cors());app.use(express.json());app.use('/',require('./routes/health'));app.use('/',require('./routes/ambassador'));
app.get('/',(_,r)=>r.json({service:'hive-ambassador-agent',version:'1.0.0',description:'Ecosystem ambassador — outreach, partnership proposals, cross-platform presence, developer relations',endpoints:{execute:'POST /v1/ambassador/execute',record:'GET /v1/ambassador/record/:id',stats:'GET /v1/ambassador/stats',records:'GET /v1/ambassador/records',health:'GET /health',pulse:'GET /.well-known/hive-pulse.json',ai:'GET /.well-known/ai.json'}}));
const hc=require('./services/hive-client');
app.listen(PORT,async()=>{console.log(`[hive-ambassador-agent] Listening on port ${PORT}`);try{await hc.registerWithHiveTrust()}catch(e){}try{await hc.registerWithHiveGate()}catch(e){}});
module.exports=app;
