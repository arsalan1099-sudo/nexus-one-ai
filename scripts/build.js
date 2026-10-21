import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const result=await build({entryPoints:['web/app.js'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2022'],write:false,legalComments:'inline'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');const template=await readFile('web/index.template.html','utf8');await mkdir('dist',{recursive:true});await writeFile('dist/index.html',template.replace('<!-- APP_SCRIPT -->',()=>'<script>'+js+'</script>'));console.log('Built self-contained dist/index.html; backend supplies CSP hashes.');

const assistantBuild=await build({entryPoints:['web/assistant.js'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2022'],write:false,legalComments:'inline'});
const assistantJs=assistantBuild.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const assistantTemplate=await readFile('web/assistant.template.html','utf8');
await writeFile('dist/assistant.html',assistantTemplate.replace('/* NEXUS_ASSISTANT_JS */',()=>assistantJs));
console.log('Built /assistant interface');
