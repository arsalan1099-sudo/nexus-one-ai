/** NEXUS Citizen Edition RC7: deterministic, offline decision-support tools.
 * No network calls, analytics, persistence, remote execution or AI claims.
 */
export const WORKFLOWS = Object.freeze({
 budget:{label:'Smart Budget',tag:'Money',icon:'₹',subtitle:'Take control of monthly cash flow',fields:[['income','Monthly income','number',55000,0,100000000],['housing','Rent / housing','number',12000,0,100000000],['food','Food and groceries','number',8500,0,100000000],['bills','Bills & utilities','number',4500,0,100000000],['transport','Transport','number',3500,0,100000000],['other','Other expenses','number',4000,0,100000000]]},
 business:{label:'Business Planner',tag:'Business',icon:'◈',subtitle:'Understand pricing, margins and break-even',fields:[['price','Sale price per unit (₹)','number',500,0,100000000],['variable','Cost per unit (₹)','number',290,0,100000000],['fixed','Monthly fixed expenses (₹)','number',20000,0,100000000],['units','Expected monthly sales (units)','integer',120,0,10000000]]},
 career:{label:'Career Accelerator',tag:'Work',icon:'↗',subtitle:'Plan skills and job search without false promises',fields:[['hours','Study hours per week','number',8,0,168],['weeks','Planning period (weeks)','integer',8,1,520],['applications','Quality applications per week','integer',5,0,500],['portfolio','Portfolio projects planned','integer',2,0,100]]},
 study:{label:'Learning Mission',tag:'Education',icon:'✦',subtitle:'Turn a large syllabus into weekly action',fields:[['topics','Topics to learn','integer',18,1,1000],['days','Days available','integer',30,1,3650],['minutes','Study minutes per day','integer',90,1,1440],['minutesPerTopic','Estimated minutes per topic','integer',120,1,100000]]},
 emergency:{label:'Emergency Ready',tag:'Safety',icon:'✚',subtitle:'Prepare supplies and reduce avoidable gaps',fields:[['people','People in household','integer',4,1,1000],['days','Days to prepare for','integer',3,1,365],['litres','Planned water per person/day (L)','number',3,0.1,100],['water','Stored drinking water (L)','number',15,0,1000000],['foodDays','Days of suitable food on hand','integer',2,0,365]]},
 digital:{label:'Digital Shield',tag:'Security',icon:'⬡',subtitle:'Review privacy and account protection habits',fields:[['mfa','MFA on important accounts','choice','no',['yes','no']],['updates','Device and app updates current','choice','yes',['yes','no']],['backups','Backups tested','choice','no',['yes','no']],['passwords','Unique passwords or manager','choice','yes',['yes','no']],['scams','You verify unexpected links/messages','choice','yes',['yes','no']]]},
 documents:{label:'Document Desk',tag:'Services',icon:'▤',subtitle:'Generic paperwork checklist, not official eligibility',fields:[['identity','Identity document available','choice','yes',['yes','no']],['address','Address proof available','choice','no',['yes','no']],['photo','Required photo / scan ready','choice','yes',['yes','no']],['forms','Form instructions read','choice','no',['yes','no']],['receipt','Submission proof stored securely','choice','no',['yes','no']]]},
 projects:{label:'Project Operations',tag:'Planning',icon:'▦',subtitle:'Test your timeline against real work capacity',fields:[['tasks','Total tasks','integer',20,1,100000],['perTask','Estimated hours per task','number',3,0.1,10000],['weekly','Hours available each week','number',14,0.1,168],['deadline','Days until deadline','integer',30,1,3650]]},
 home:{label:'Home Resource Lab',tag:'Utilities',icon:'⌂',subtitle:'Estimate household costs with your own rates',fields:[['kwh','Monthly electricity use (kWh)','number',220,0,1000000],['rate','Estimated average rate (₹/kWh)','number',8,0,10000],['water','Water use per day (litres)','number',400,0,10000000],['people','Household size','integer',4,1,1000]]}
});
const round=(v,n=2)=>Math.round((v+Number.EPSILON)*10**n)/10**n;
const money=v=>'₹'+Math.round(v).toLocaleString('en-IN');
function readInputs(kind,raw){
 const cfg=WORKFLOWS[kind];if(!cfg)throw Error('Select an available citizen workflow.');
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid input.');
 const out={};
 for(const [key,label,type,_default,min,max] of cfg.fields){
  const value=raw[key];
  if(type==='choice') {if(typeof value!=='string'||!min.includes(value))throw Error('Invalid selection: '+label);out[key]=value;continue;}
  if(typeof value!=='string'&&typeof value!=='number')throw Error('Required: '+label);
  const s=String(value).trim();if(!/^(?:\d+)(?:\.\d+)?$/.test(s))throw Error(label+' must be a nonnegative number.');
  const num=Number(s);
  if(!Number.isFinite(num)||num<min||num>max||(type==='integer'&&!Number.isInteger(num)))throw Error(label+' is outside the allowed range.');
  out[key]=num;
 }
 return out;
}
export function analyzeCitizen(kind,raw){
 const x=readInputs(kind,raw),cfg=WORKFLOWS[kind];
 const metrics=[],findings=[],actions=[];
 const metric=(label,value)=>metrics.push({label,value:String(value)});
 const finding=(level,text)=>findings.push({level,text});
 let headline='Your action plan';let disclaimer='Estimates based on user-supplied inputs; verify facts before making important decisions.';
 switch(kind){
 case 'budget':{
  const spend=x.housing+x.food+x.bills+x.transport+x.other,surplus=x.income-spend;
  headline=surplus>=0?'Monthly budget snapshot':'Expenses exceed reported income';
  metric('Monthly expenses',money(spend));metric('Money left',money(surplus));metric('3-month expenses reserve',money(spend*3));
  if(x.income===0)finding('attention','No income entered; prioritise essentials and reliable income options.');
  if(surplus<0)finding('attention',`Expense gap: ${money(-surplus)} per month. Review essential bills first.`);
  else if(surplus===0)finding('review','No monthly buffer shown; even a small unexpected bill could cause difficulty.');
  else finding('ok',`${money(surplus)} remains after entered expenses; this is not guaranteed savings.`);
  actions.push('Review actual bank transactions and add missing expenses.','Protect essentials before discretionary spending.','Build a reserve gradually when cash flow permits.');break;}
 case 'business':{
  const margin=x.price-x.variable,profit=margin*x.units-x.fixed;
  headline=margin>0?'Business unit economics':'Pricing needs attention';
  metric('Contribution / unit',money(margin));metric('Monthly scenario',money(profit));metric('Break-even units',margin>0?String(Math.ceil(x.fixed/margin)):'Not reachable');
  if(margin<=0)finding('attention','Selling more at this price cannot cover fixed costs under these assumptions.');
  else finding(profit<0?'attention':'ok',`${x.units} expected units imply ${money(profit)} before taxes, financing and other omitted costs.`);
  actions.push('Check returns, taxes, payment fees and unsold inventory.','Test low-sales and high-cost scenarios.','Treat projected profit as an estimate, not a guarantee.');break;}
 case 'career':{
  const total=round(x.hours*x.weeks),apps=x.applications*x.weeks;
  headline='Career development roadmap';metric('Skill-building hours',total+' h');metric('Applications planned',apps);metric('Portfolio pieces',x.portfolio);
  finding('review',`Plan ${round(x.hours,1)} hours of study each week for ${x.weeks} weeks; review progress weekly.`);
  actions.push('Choose one marketable skill and a concrete portfolio deliverable.','Tailor each application to the vacancy.','Practise interviews and document feedback; job outcomes cannot be predicted.');break;}
 case 'study':{
  const capacity=x.days*x.minutes,needed=x.topics*x.minutesPerTopic,gap=needed-capacity;
  headline=gap<=0?'Study time covers estimated workload':'Study schedule needs adjustment';
  metric('Available',round(capacity/60,1)+' h');metric('Estimated required',round(needed/60,1)+' h');metric('Topics / week',Math.ceil(x.topics*7/x.days));
  finding(gap>0?'attention':'ok',gap>0?`Approximately ${round(gap/60,1)} extra hours needed using your estimates.`:'Estimated study capacity meets your plan; include review and breaks.');
  actions.push('Split topics into small daily sessions.','Add revision and practice tests.','Re-estimate difficult topics instead of rushing.');break;}
 case 'emergency':{
  const target=round(x.people*x.days*x.litres),gap=Math.max(0,round(target-x.water));
  headline='Household emergency preparedness';metric('Planned water',target+' L');metric('Additional water',gap+' L');metric('Food shortfall',Math.max(0,x.days-x.foodDays)+' day(s)');
  finding(gap>0?'attention':'ok',gap>0?`Stored water is ${gap} L below your own planning target.`:'Stored water meets the entered planning target.');
  if(x.foodDays<x.days)finding('review','Food duration is below the chosen planning period.');
  actions.push('Follow current local disaster authority and public-health advice.','Identify a safe meeting point and emergency contacts.','Keep documents, medicines and accessibility needs in mind.');
  disclaimer='This is a preparedness worksheet, not live hazard advice. Water needs vary by conditions and health; consult local official guidance.';break;}
 case 'digital':{
  const labels={mfa:'Multi-factor authentication',updates:'Updates',backups:'Tested backups',passwords:'Unique passwords',scams:'Scam verification habits'};
  const gaps=Object.keys(labels).filter(k=>x[k]==='no');headline='Personal digital safety review';
  metric('Good practices',String(5-gaps.length)+'/5');metric('Actions identified',gaps.length);metric('Network scan','Not performed');
  if(gaps.length)for(const k of gaps)finding('attention',labels[k]+' needs attention.');else finding('ok','All listed protections reported as present, but safety is not guaranteed.');
  actions.push('Never share OTPs, recovery codes or passwords.','Verify app and website addresses before entering credentials.','Treat this as a self-assessment, not a penetration test.');break;}
 case 'documents':{
  const labels={identity:'Identity document',address:'Address proof',photo:'Photo / scan',forms:'Form instructions',receipt:'Submission evidence'};
  const gaps=Object.keys(labels).filter(k=>x[k]==='no');headline='Application preparation checklist';
  metric('Checklist ready',String(5-gaps.length)+'/5');metric('Items to review',gaps.length);metric('Eligibility','Unverified');
  for(const k of gaps)finding('review',labels[k]+' not yet marked ready.');
  if(!gaps.length)finding('ok','Generic checklist complete; exact scheme requirements may still differ.');
  actions.push('Confirm eligibility, fees and forms using the official website.','Redact unnecessary sensitive information in shared copies.','Keep a local receipt or acknowledgment after submission.');
  disclaimer='Checklist only. It does not confirm eligibility or replace official legal or administrative guidance.';break;}
 case 'projects':{
  const required=x.tasks*x.perTask,available=x.weekly*x.deadline/7,delta=required-available;
  headline=delta>0?'Timeline may be unrealistic':'Timeline has estimated capacity';
  metric('Required work',round(required,1)+' h');metric('Available capacity',round(available,1)+' h');metric('Capacity gap',round(Math.max(0,delta),1)+' h');
  finding(delta>0?'attention':'ok',delta>0?'Estimated workload exceeds available hours.':'Estimated hours fit, before revisions, coordination and unforeseen delays.');
  actions.push('Identify critical tasks, dependencies and approval steps.','Reserve contingency for rework and interruptions.','Have a person validate effort estimates before committing.');break;}
 case 'home':{
  const electricity=x.kwh*x.rate,lpm=x.water/Math.max(1,x.people),monthly=x.water*30;
  headline='Home resource snapshot';metric('Electricity estimate',money(electricity));metric('Water / month',Math.round(monthly).toLocaleString('en-IN')+' L');metric('Water / person / day',round(lpm,1)+' L');
  finding('review','The electricity cost uses your flat average rate; actual bills may have slabs, taxes and fixed fees.');
  actions.push('Compare with recent meter readings and real bills.','Check for leaks and avoid avoidable usage.','Use official tariff and municipal guidance for accurate charges.');break;}
 }
 return {version:'RC7-citizen.1',mode:'offline deterministic',workflow:kind,title:cfg.label,headline,metrics,findings,actions,disclaimer,review:'HUMAN REVIEW REQUIRED',inputStored:false,externalCalls:false};
}
export function mountCitizenWorkspace(rootId='citizenWorkspace'){
 const root=document.getElementById(rootId);if(!root)return;
 const nav=root.querySelector('[data-citizen-nav]'),fields=root.querySelector('[data-citizen-fields]'),output=root.querySelector('[data-citizen-output]'),title=root.querySelector('[data-citizen-title]'),sub=root.querySelector('[data-citizen-subtitle]'),inputForm=root.querySelector('[data-citizen-form]'),message=root.querySelector('[data-citizen-status]');
 const readonly=root.querySelector('[data-citizen-readonly]');let selected='budget',last=null;
 const drawer=root.querySelector('#toolDrawer'),welcome=root.querySelector('#welcome'),thread=root.querySelector('#chatThread'),quick=root.querySelector('#quickTools');
 root.querySelector('#menuToggle').addEventListener('click',()=>{drawer.hidden=!drawer.hidden;});
 root.querySelector('#changeTool').addEventListener('click',()=>{drawer.hidden=false;});
 root.querySelector('#newChat').addEventListener('click',()=>{thread.replaceChildren();thread.hidden=true;welcome.hidden=false;clear();show('budget');drawer.hidden=true;});
 function chooseTool(key){show(key);drawer.hidden=true;const c=WORKFLOWS[key];root.querySelector('#changeTool').textContent='Change';root.querySelector('.selected-tool').firstChild.textContent=c.label;}
 for(const [key,c] of Object.entries(WORKFLOWS)){const b=document.createElement('button');b.type='button';b.textContent=c.icon+' '+c.label;b.addEventListener('click',()=>chooseTool(key));quick.append(b);}

 function clear(){last=null;output.replaceChildren();readonly.hidden=true;message.textContent='Inputs remain in this page only; no values are sent to a server.';const empty=document.createElement('div');empty.className='empty';const mark=document.createElement('div');mark.className='orb';mark.textContent='◎';const heading=document.createElement('b');heading.textContent='Your report starts here';const note=document.createElement('p');note.textContent='Run a calculation to see a useful breakdown and practical next steps.';empty.append(mark,heading,note);output.append(empty);}
 function show(name){selected=name;clear();nav.querySelectorAll('button').forEach(b=>{const on=b.dataset.kind===name;b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on);});const c=WORKFLOWS[name];title.textContent=c.label;if(sub)sub.textContent=c.subtitle;fields.replaceChildren();for(const [key,label,type,def,min,max] of c.fields){const wrap=document.createElement('label');wrap.className='citizen-field';const labelText=document.createElement('span');labelText.textContent=label;wrap.append(labelText);let input;if(type==='choice'){input=document.createElement('select');for(const val of min){const o=document.createElement('option');o.value=val;o.textContent=val==='yes'?'Yes — in place':'Not yet';input.append(o);}input.value=def;}else{input=document.createElement('input');input.type='number';input.min=String(min);input.max=String(max);input.step=type==='integer'?'1':'any';input.inputMode='decimal';input.value=String(def);input.required=true;}input.name=key;input.autocomplete='off';input.addEventListener('input',clear);wrap.append(input);fields.append(wrap);}}
 for(const [key,c] of Object.entries(WORKFLOWS)){const btn=document.createElement('button');btn.type='button';btn.dataset.kind=key;btn.className='citizen-nav-button';const glyph=document.createElement('span');glyph.className='citizen-glyph';glyph.textContent=c.icon;const words=document.createElement('span');words.textContent=c.label;btn.append(glyph,words);btn.addEventListener('click',()=>chooseTool(key));nav.append(btn);}
 function add(tag,cls,text,parent){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);(parent||output).append(el);return el;}
 inputForm.addEventListener('submit',e=>{e.preventDefault();try{const raw=Object.fromEntries(new FormData(inputForm).entries());last=analyzeCitizen(selected,raw);const user=document.createElement('div');user.className='chat-user-bubble';user.textContent=WORKFLOWS[selected].label+' — '+WORKFLOWS[selected].fields.map(f=>f[1]+': '+raw[f[0]]).join(' · ');thread.append(user);const card=document.createElement('section');card.className='chat-result';thread.append(card);const savedOutput=output;const savedReadonly=readonly;output.replaceChildren();readonly.hidden=false;message.textContent='';add('p','citizen-eyebrow','YOUR LOCAL ANALYSIS');add('h3','citizen-result-heading',last.headline);const grid=add('div','citizen-metric-grid');for(const m of last.metrics){const tile=add('div','citizen-metric','',grid);add('span','citizen-metric-label',m.label,tile);add('strong','citizen-metric-number',m.value,tile);}add('h4','','Observations');for(const f of last.findings)add('p','citizen-finding '+f.level,f.text);add('h4','','Next actions');const ol=add('ol','citizen-actions');for(const action of last.actions)add('li','',action,ol);add('p','citizen-disclaimer',last.disclaimer);const report=output.cloneNode(true);card.append(...Array.from(report.childNodes));const actions=document.createElement('div');actions.className='reportbar';const copy=document.createElement('button');copy.type='button';copy.textContent='Copy summary';copy.addEventListener('click',()=>root.querySelector('[data-citizen-copy]').click());const exp=document.createElement('button');exp.type='button';exp.textContent='Export report';exp.addEventListener('click',()=>root.querySelector('[data-citizen-export]').click());actions.append(copy,exp);card.append(actions);thread.hidden=false;welcome.hidden=true;output.replaceChildren();readonly.hidden=true;message.textContent='';}catch(err){message.textContent='Check your inputs: '+err.message;}});
 root.querySelector('[data-citizen-reset]').addEventListener('click',()=>show(selected));
 function fileExport(){if(!last){message.textContent='Create a report first.';return;}const data={...last,exportedAt:new Date().toISOString(),generatedFrom:'NEXUS Citizen offline calculators'};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nexus-citizen-'+selected+'-report.json';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='Report exported. Save it in a secure place.';}
 root.querySelector('[data-citizen-export]').addEventListener('click',fileExport);
 root.querySelector('[data-citizen-copy]').addEventListener('click',()=>{if(!last){message.textContent='Create a report first.';return;}const txt=[last.title,last.headline,...last.metrics.map(x=>x.label+': '+x.value),...last.findings.map(x=>x.text),...last.actions.map((x,i)=>(i+1)+'. '+x)].join('\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(()=>message.textContent='Summary copied.').catch(()=>message.textContent='Clipboard blocked. Use Export JSON.');else message.textContent='Clipboard unavailable. Use Export JSON.';});
 
 show('budget');
}
