import {withDeadline} from './deadline.js';
import {readFile} from 'node:fs/promises';
import {initializeApp,applicationDefault,cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {createClient} from 'redis';
import {readConfig} from './config.js';
import {readAdminServiceAccount} from './credentials.js';
import {createApp} from './app.js';
import {createLimiter} from './limiter.js';
import {createProvider} from './provider.js';
try{
 const config=readConfig();const serviceAccount=await readAdminServiceAccount();if(!serviceAccount&&process.env.NEXUS_ALLOW_WORKLOAD_IDENTITY!=='true')throw Error('Firebase Admin credential source not configured.');initializeApp({credential:serviceAccount?cert(serviceAccount):applicationDefault(),projectId:config.FIREBASE_PROJECT_ID});const redis=createClient({url:config.REDIS_URL,disableOfflineQueue:true,commandsQueueMaxLength:128,socket:{connectTimeout:5000,reconnectStrategy:retries=>Math.min(retries*250,3000)}});redis.on('error',()=>console.error('Redis connection error.'));await redis.connect();const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');const citizenHtml=await readFile(new URL('../dist/citizen-demo.html',import.meta.url),'utf8');const assistantHtml=await readFile(new URL('../dist/assistant.html',import.meta.url),'utf8');const app=createApp({config,html,citizenHtml,assistantHtml,verifyToken:(token,revoked)=>getAuth().verifyIdToken(token,revoked),consume:createLimiter(redis,config),provider:createProvider(config),ready:()=>withDeadline(redis.withCommandOptions({timeout:3000}).ping())});const server=app.listen(config.PORT,'0.0.0.0',()=>console.log('NEXUS server listening on port '+config.PORT));server.requestTimeout=65000;server.headersTimeout=15000;
 let closing=false;async function shutdown(){if(closing)return;closing=true;server.close(async()=>{await redis.quit().catch(()=>{});process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}catch(e){console.error(e.message?.startsWith('Invalid or missing configuration')?e.message:'Startup failed. Check configuration, credentials, build and Redis connectivity.');process.exit(1);}
