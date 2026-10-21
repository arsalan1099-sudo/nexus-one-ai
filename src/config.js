import {z} from 'zod';
import {resolvePublicOrigin} from './origin.js';
const required=z.string().min(1);
export function readConfig(env=process.env){
 const normalized={...env};
 normalized.APP_ORIGIN=resolvePublicOrigin(env);
 const schema=z.object({NODE_ENV:z.enum(['production','development']).default('production'),PORT:z.coerce.number().int().min(1).max(65535).default(3000),APP_ORIGIN:z.string().url(),FIREBASE_PROJECT_ID:required,FIREBASE_WEB_API_KEY:required,FIREBASE_APP_ID:required,FIREBASE_AUTH_DOMAIN:required,POLLINATIONS_API_KEY:required,TEXT_MODEL:required,IMAGE_MODEL:required,VISION_MODEL:z.string().min(1).default("openai/gpt-5.4-nano"),VISION_DAILY_LIMIT:z.coerce.number().int().min(1).max(1000).default(10),REDIS_URL:z.string().regex(/^rediss?:\/\//),ALLOWED_UIDS:required,DAILY_REQUEST_LIMIT:z.coerce.number().int().min(1).max(10000).default(100),USER_MINUTE_LIMIT:z.coerce.number().int().min(1).max(60).default(5),IMAGE_DAILY_LIMIT:z.coerce.number().int().min(1).max(1000).default(10),PROJECT_DAILY_LIMIT:z.coerce.number().int().min(1).max(1000).default(10),TRUST_PROXY_HOPS:z.coerce.number().int().min(0).max(2).default(0)});
 const parsed=schema.safeParse(normalized);if(!parsed.success)throw Error('Invalid or missing configuration: '+parsed.error.issues.map(i=>i.path.join('.')).join(', '));const c=parsed.data;
 const origin=new URL(c.APP_ORIGIN);if(origin.origin!==c.APP_ORIGIN||origin.username||origin.password)throw Error('APP_ORIGIN must be an origin without path or trailing slash.');if(c.NODE_ENV==='production'&&origin.protocol!=='https:')throw Error('Production requires an HTTPS APP_ORIGIN.');
 if(env.FIREBASE_AUTH_EMULATOR_HOST)throw Error('Auth emulator is not permitted by this server entry point.');
 c.allowedUIDs=new Set(c.ALLOWED_UIDS.split(',').map(s=>s.trim()).filter(Boolean));if(c.allowedUIDs.has('*')||c.allowedUIDs.size===0)throw Error('Explicit allowed Firebase UIDs are required.');
 c.publicConfig={firebase:{apiKey:c.FIREBASE_WEB_API_KEY,authDomain:c.FIREBASE_AUTH_DOMAIN,projectId:c.FIREBASE_PROJECT_ID,appId:c.FIREBASE_APP_ID},chatPath:'/api/chat',imagePath:'/api/image',projectPath:'/api/project',visionPath:'/api/vision'};return c;
}
