import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=(p)=>readFileSync(p,'utf8');
const files=['web/assistant.js','web/assistant-standalone.js','src/app.js','src/schema.js','src/provider.js','scripts/build.js'];
let passes=0;
for(const file of files){execFileSync('node',['--check',file],{stdio:'pipe'});passes++;}
const backend=read('src/app.js'),schema=read('src/schema.js'),provider=read('src/provider.js'),config=read('src/config.js'),ui=read('web/assistant-standalone.js'),html=read('dist/assistant.html'),index=read('web/assistant.template.html');
for(const [desc,condition] of [
 ['vision requires verified auth',backend.includes("verifyToken(header.slice(7),true)")],
 ['vision origin bound',backend.includes("req.get('origin')!==config.APP_ORIGIN")],
 ['vision additional quotas',backend.includes("daily-vision")],
 ['vision separate 3MB limit',backend.includes("req.path==='/vision'?'3mb':'256kb'")],
 ['image validation',schema.includes('function validateVisionDataUri')],
 ['vision provider is pinned',provider.includes("fetcher('https://gen.pollinations.ai/v1/chat/completions'")],
 ['public config does not leak secret',!config.includes('publicConfig={POLLINATIONS_API_KEY')],
 ['client same origin API calls',ui.includes('url.origin!==location.origin')],
 ['client uses safe plain text DOM',ui.includes('e.textContent=String(text)')],
 ['explicit camera/photo upload',ui.includes('Upload')||ui.includes('photoFile')],
 ['microphone requires consent',ui.includes('window.confirm(\'Enable microphone dictation?')],
 ['offline explicitly not AI',ui.includes('not a running AI model')],
 ['local save is opt-in',ui.includes('saveChat()')],
 ['front-end no secret API key',!index.includes('sk_')&&!ui.includes('POLLINATIONS_API_KEY')],
 ['no unsafe inline CSP',!backend.includes("'unsafe-inline'")],
 ['full HTML generated',html.includes('data-example=')&&html.includes('attachFile')&&html.includes('NEXUS ONE')],
 ]){assert.ok(condition,desc);passes++;}
console.log('RC7 dependency-free syntax/contract checks: '+passes+'/'+passes+' passed');
