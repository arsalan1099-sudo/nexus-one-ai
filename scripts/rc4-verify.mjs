// Dependency-free source/distribution smoke check for offline CI preparation.
// This is NOT a substitute for npm test or live integration testing.
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const results=[];
function check(label,fn){fn();results.push('PASS '+label);}
const app=read('src/app.js'),cfg=read('src/config.js'),web=read('web/index.template.html'),built=read('dist/index.html');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
check('RC4 manifest / lockfile version match',()=>assert.equal(pkg.version,lock.version));
check('Credential parser and Render origin resolver shipped',()=>{assert.match(read('src/server.js'),/readAdminServiceAccount/);assert.match(read('src/config.js'),/resolvePublicOrigin/);});
check('Render Blueprint wires private free preview quota store',()=>{const y=read('render.yaml');assert.match(y,/type: keyvalue/);assert.match(y,/persistenceMode: 'off'/);assert.equal((y.match(/plan: free/g)||[]).length,2);assert.doesNotMatch(y,/plan: (?:starter|standard|pro)/);assert.match(y,/property: connectionString/);assert.match(y,/sync: false/);});
check('Static HTML build contains local bundled JavaScript',()=>assert.match(built,/<script>[^]*?<\/script>/));
check('Static HTML does not load external scripts',()=>assert.doesNotMatch(built,/<script\s+src\s*=/i));
check('Built HTML uses RC3 theme',()=>assert.ok(built.includes('RC3 Elite visual refinement')));
check('Template uses the same RC3 styling',()=>assert.ok(web.includes('RC3 Elite visual refinement')));
check('Mobile media query exists',()=>assert.match(built,/@media\(max-width:600px\)/));
check('Reduced-motion support exists',()=>assert.match(built, /prefers-reduced-motion:reduce/));
check('App uses explicit trusted proxy hop settings',()=>assert.match(app, /app\.set\('trust proxy',config\.TRUST_PROXY_HOPS\?\?0\)/));
check('Pre-auth quota keys off the resolved client IP',()=>assert.match(app, /req\.ip\|\|req\.socket\.remoteAddress/));
check('Pre-auth quota does not blindly accept X-Forwarded-For',()=>assert.doesNotMatch(app, /req\.get\('x-forwarded-for'\)/i));
check('Config defaults to zero trusted proxies',()=>assert.match(cfg,/TRUST_PROXY_HOPS:[^\n]*default\(0\)/));
check('Additional cost-sensitive usage limits configured',()=>{assert.match(cfg,/IMAGE_DAILY_LIMIT:/);assert.match(cfg,/PROJECT_DAILY_LIMIT:/);});
check('Server enforces image and project quotas',()=>{assert.match(app,/daily-image/);assert.match(app,/daily-project/);});
check('Server checks revoked Firebase tokens',()=>assert.match(app,/verifyToken\(header\.slice\(7\),true\)/));
check('Server requires verified approved account',()=>{assert.match(app,/claims\.email_verified/);assert.match(app,/config\.allowedUIDs\.has/);});
check('Application enforces API origin',()=>assert.match(app,/req\.get\('origin'\)!==config\.APP_ORIGIN/));
check('Server security headers include CORP and COOP',()=>{assert.match(app,/Cross-Origin-Resource-Policy/);assert.match(app,/Cross-Origin-Opener-Policy/);});
check('Provider credentials remain server-side',()=>{assert.match(read('src/provider.js'),/POLLINATIONS_API_KEY/);assert.doesNotMatch(read('web/app.js'),/POLLINATIONS_API_KEY/);});
check('Container drops privileges and remains read-only',()=>{assert.match(read('compose.yaml'),/read_only: true/);assert.match(read('compose.yaml'),/no-new-privileges:true/);});
check('CI contains real test and browser steps',()=>{assert.match(read('.github/workflows/ci.yml'),/npm run check/);assert.match(read('.github/workflows/ci.yml'),/test:browser/);});
for(const dir of ['src','web','scripts','test'])for(const f of readdirSync(new URL(dir+'/',root)).filter(x=>/\.(?:m?js)$/.test(x))){const abs=new URL(dir+'/'+f,root);execFileSync(process.execPath,['--check',abs.pathname]);}
results.push('PASS Syntax parse all source/test/script JavaScript files');
console.log(results.join('\n'));console.log('TOTAL '+results.length+' dependency-free checks passed');

