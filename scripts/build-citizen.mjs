import {readFile,writeFile,mkdir} from 'node:fs/promises';
const source=await readFile('web/citizen.js','utf8');
const template=await readFile('web/citizen.template.html','utf8');
// Inline this self-contained module for file:// offline operation, without external dependencies.
const js=source.replace(/^export\s+(?=(?:const|function|class)\b)/gm,'').replace(/<\/script/gi,'<\\/script')+'\nmountCitizenWorkspace();';
if(!template.includes('/* CITIZEN_JS */'))throw Error('Missing citizen build marker');
await mkdir('dist',{recursive:true});
await writeFile('dist/citizen-demo.html',template.replace('/* CITIZEN_JS */',js));
console.log('Built standalone dist/citizen-demo.html');
