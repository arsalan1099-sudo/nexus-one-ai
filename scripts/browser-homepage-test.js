import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
const now=Math.floor(Date.now()/1000);
const token=[{alg:'RS256',typ:'JWT'},{iss:'https://securetoken.google.com/nexus-test',aud:'nexus-test',sub:'approved',user_id:'approved',iat:now,exp:now+3600,auth_time:now,email:'user@example.test',email_verified:true,firebase:{identities:{email:['user@example.test']},sign_in_provider:'password'}}].map(v=>Buffer.from(JSON.stringify(v)).toString('base64url')).join('.')+'.fixture-signature';
const config={NODE_ENV:'development',APP_ORIGIN:'',allowedUIDs:new Set(['approved']),USER_MINUTE_LIMIT:5,DAILY_REQUEST_LIMIT:100,publicConfig:{firebase:{apiKey:'fixture-key',authDomain:'nexus-test.firebaseapp.com',projectId:'nexus-test',appId:'1:123:web:test'},chatPath:'/api/chat'}};
let requests=0;
const app=createApp({config,html:await readFile('dist/index.html','utf8'),assistantHtml:await readFile('dist/assistant.html','utf8'),citizenHtml:await readFile('dist/citizen-demo.html','utf8'),verifyToken:async value=>{assert.equal(value,token);return {uid:'approved',email_verified:true}},consume:async()=>true,provider:{chat:async()=>{requests++;return {text:'Authenticated test response <img src=x onerror=alert(1)>'}}},ready:async()=>{},log:()=>{}});
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));config.APP_ORIGIN='http://127.0.0.1:'+server.address().port;
let browser;const errors=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://identitytoolkit.googleapis.com/**',async route=>{const url=route.request().url();const body=url.includes('signInWithPassword')?{localId:'approved',email:'user@example.test',idToken:token,registered:true,refreshToken:'fixture-refresh',expiresIn:'3600'}:url.includes('lookup')?{users:[{localId:'approved',email:'user@example.test',emailVerified:true,providerUserInfo:[{providerId:'password',email:'user@example.test',federatedId:'user@example.test'}],createdAt:String(Date.now()),lastLoginAt:String(Date.now())}]}:{email:'user@example.test'};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});});
 await page.goto(config.APP_ORIGIN);await page.waitForFunction(()=>!document.getElementById('authSubmit').disabled);
 await page.fill('#email','user@example.test');await page.fill('#password','secure-test-password');await page.click('#authSubmit');await page.waitForSelector('#authOverlay',{state:'hidden'});
 assert.equal(await page.locator('h1').textContent(),'What can I help with?');
 assert.equal(await page.locator('#imageMode').isVisible(),false);
 await page.fill('#prompt','test request');await page.click('#send');await page.waitForSelector('.message.assistant');assert.equal(requests,1);assert.match(await page.locator('.message.assistant').textContent(),/Authenticated test response/);assert.equal(await page.locator('.message.assistant img').count(),0);
 await page.click('#menuToggle');await page.click('#newChat');assert.equal(await page.locator('.message').count(),0);assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
 await page.click('#signOut');await page.click('#offlineBtn');await page.fill('#prompt','12500*0.18+450');await page.click('#send');assert.match(await page.locator('.message.assistant').textContent(),/2,700/);assert.equal(requests,1);
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.goto(config.APP_ORIGIN+'/citizen');await page.waitForSelector('[name=income]');
 for(let i=0;i<9;i++){await page.click('#menuToggle');await page.locator('[data-citizen-nav] button').nth(i).click();await page.click('button[type=submit]');assert.equal(await page.locator('.chat-result').count(),i+1);}
 await page.click('#newChat');assert.equal(await page.locator('.chat-result').count(),0);assert.equal(await page.locator('[name=income]').inputValue(),'55000');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);console.log('PASS rebuilt homepage, collapsed menus, mocked Firebase sign-in and authenticated HTTP request, sign-out, offline calculation, all 9 Citizen tools, new chat and mobile/desktop layouts; no browser runtime errors. Live Firebase/provider credentials were not used.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
