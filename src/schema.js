import {z} from 'zod';
export const chatSchema=z.object({messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(50000)}).strict()).min(1).max(21),persona:z.enum(['General assistant','Software architect','Defensive security','Citizen Services & Everyday Support','Medical information','Legal information']),language:z.enum(['auto','ur','en','ar','hi','es','ja']),memory:z.string().max(8000).default('')}).strict().refine(v=>v.messages.at(-1).role==='user'&&v.messages.at(-1).content.length<=6000&&v.messages.reduce((n,m)=>n+m.content.length,0)<=60000);
export const promptSchema=z.object({prompt:z.string().trim().min(1).max(6000)}).strict();
export const projectSchema=z.object({files:z.array(z.object({path:z.string().min(1).max(160).refine(p=>/^[a-zA-Z0-9_.\/-]+$/.test(p)&&!p.startsWith('/')&&p.split('/').every(s=>s&&s!=='.'&&s!=='..'&&!s.endsWith('.')&&!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))),content:z.string().max(60000)}).strict()).min(1).max(20)}).strict().refine(v=>new Set(v.files.map(f=>f.path.toLowerCase())).size===v.files.length&&v.files.reduce((n,f)=>n+f.content.length,0)<=180000).refine(v=>!v.files.some(f=>v.files.some(g=>f!==g&&g.path.toLowerCase().startsWith(f.path.toLowerCase()+'/'))));

// The base64 photo is processed only when a person explicitly submits it; no URLs are fetched.
export const visionSchema=z.object({prompt:z.string().trim().min(1).max(6000),image:z.string().min(100).max(2_800_000).regex(/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/),persona:z.enum(['General assistant','Software architect','Defensive security','Citizen Services & Everyday Support','Medical information','Legal information']).default('General assistant'),language:z.enum(['auto','ur','en','ar','hi','es','ja']).default('auto')}).strict();
export function validateVisionDataUri(uri){
 const parsed=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(uri);
 if(!parsed)return false;
 const bytes=Buffer.from(parsed[2],'base64');
 if(bytes.length<32||bytes.length>2_000_000||bytes.toString('base64')!==parsed[2])return false;
 if(parsed[1]==='png'){
  if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return false;
  if(bytes.toString('ascii',12,16)!=='IHDR'||bytes.readUInt32BE(8)!==13)return false;
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);return w>0&&h>0&&w<=2048&&h<=2048;
 }
 return bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&bytes.at(-2)===255&&bytes.at(-1)===217;
}
