import {readConfig} from '../src/config.js';
import {access} from 'node:fs/promises';
import {readAdminServiceAccount} from '../src/credentials.js';
let failures=0;
function result(ok,label){console.log((ok?'PASS ':'MISSING ')+label);if(!ok)failures++;}
try{readConfig();result(true,'Required application configuration');}catch(e){result(false,e.message);}
try{await access(new URL('../dist/index.html',import.meta.url));result(true,'Built frontend');}catch{result(false,'Run npm run build');}
try{
 const account=await readAdminServiceAccount();
 if(account)result(true,'Admin credential structure and Firebase project match');
 else result(false,'No service account configured; external workload identity must be verified on the host');
}catch{result(false,'Readable, valid Firebase Admin credential source (contents not logged)');}
console.log('Preflight checks configuration only. It does not validate real login, external connectivity or provider credit.');process.exitCode=failures?1:0;
