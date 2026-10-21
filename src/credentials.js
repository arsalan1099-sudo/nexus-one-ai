// Secrets are supplied by the host, never by the public HTML.
import {readFile} from 'node:fs/promises';

export function parseServiceAccount(source, expectedProjectId){
  let data;
  try { data=JSON.parse(source); } catch { throw Error('Invalid Firebase Admin service-account JSON.'); }
  if (!data || data.type!=='service_account' || typeof data.private_key!=='string' ||
      !data.private_key.includes('-----BEGIN PRIVATE KEY-----') ||
      typeof data.client_email!=='string' || !data.client_email.includes('@') ||
      typeof data.project_id!=='string' || data.project_id!==expectedProjectId) {
    throw Error('Firebase Admin credential is incomplete or from a different Firebase project.');
  }
  return data;
}

// Returns null only when external workload identity is intentionally configured.
export async function readAdminServiceAccount(env=process.env){
  if(env.FIREBASE_ADMIN_JSON_B64 && env.GOOGLE_APPLICATION_CREDENTIALS){
    throw Error('Provide only one Firebase Admin credential source.');
  }
  if(env.FIREBASE_ADMIN_JSON_B64){
    const encoded=env.FIREBASE_ADMIN_JSON_B64.trim();
    if(encoded.length>25000 || encoded.length<32 || !/^[a-zA-Z0-9+/]+={0,2}$/.test(encoded)){
      throw Error('Invalid Firebase Admin credential encoding.');
    }
    const bytes=Buffer.from(encoded,'base64');
    if(bytes.toString('base64')!==encoded){throw Error('Invalid Firebase Admin credential encoding.');}
    return parseServiceAccount(bytes.toString('utf8'),env.FIREBASE_PROJECT_ID);
  }
  if(env.GOOGLE_APPLICATION_CREDENTIALS){
    const raw=await readFile(env.GOOGLE_APPLICATION_CREDENTIALS,'utf8');
    return parseServiceAccount(raw,env.FIREBASE_PROJECT_ID);
  }
  return null;
}
