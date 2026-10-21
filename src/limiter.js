import {withDeadline} from './deadline.js';
import {createHash} from 'node:crypto';
// Shared atomic counters. Fixed windows; failed upstream requests count against quotas.
export function createLimiter(redis,config){return async function consume(scope,id,limit,seconds){const key='nexus:'+scope+':'+createHash('sha256').update(id).digest('hex')+':'+Math.floor(Date.now()/1000/seconds);const count=await withDeadline(redis.withCommandOptions({timeout:3000}).eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",{keys:[key],arguments:[String(seconds+1)]}));return Number(count)<=limit;};}
