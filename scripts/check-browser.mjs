import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5180','--strictPort'],{stdio:'pipe'});
const base='http://127.0.0.1:5180/';
const catalogSummary=JSON.parse(await readFile('data/catalog-summary.json','utf8'));
let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({locale:'es-ES',timezoneId:'Europe/Madrid',viewport:{width:1440,height:1100}});
 const page=await context.newPage();const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(base);await page.locator('.object-label').first().waitFor();await page.locator('canvas.scene-canvas').waitFor();
 await page.waitForTimeout(1200);await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 assert.equal(await page.locator('.object-control').count(),2);
 assert.equal(await page.locator('header,h1,footer,.presets,.comparison-summary').count(),0);
 await page.locator('#add-object').click();await page.locator('#object-search').fill('jupiter');await page.locator('[data-choice="jupiter"]').click();assert.equal(await page.locator('.object-control').count(),3);
 await page.locator('#three').click();await page.waitForTimeout(1000);await page.screenshot({path:'test-results/three.png',fullPage:true});
 await page.locator('[data-remove="jupiter"]').click();await page.locator('[data-replace="moon"]').first().click();await page.locator('#object-search').fill('marte');await page.locator('[data-choice="mars"]').click();assert.ok(page.url().includes('earth%2Cmars'));
 await page.locator('#encyclopedia').click();await page.locator('#entry-three').click();await page.locator('.entry-view canvas').waitFor();await page.locator('#close-modal').click();assert.equal(await page.locator('.entry-view canvas').count(),0);
 await page.locator('#about').click({modifiers:['Alt']});assert.equal(await page.locator('.inventory-table tbody tr').count(),catalogSummary.count);
 const dl=page.waitForEvent('download');await page.locator('[data-export="xlsx"]').click();const download=await dl;await download.saveAs('test-results/inventory.xlsx');
 await page.locator('#prompt-tab').click();await page.waitForFunction(()=>document.querySelector('.prompt-content')?.textContent.includes('Sizes'));await page.locator('#close-modal').click();
 await page.goto(base+'#objects=sun,mercury,venus,earth,moon,mars,jupiter,saturn,uranus,neptune,pluto,ceres,eris,makemake,haumea,vesta,bennu,eros,sirius,betelgeuse,sagittarius-a,milky-way,andromeda,observable-universe,human,elephant,blue-whale,giraffe,icon-of-the-seas,eiffel');await page.locator('.object-control').first().waitFor();assert.equal(await page.locator('.object-control').count(),30);assert.ok(await page.locator('.scene-scroll').evaluate(el=>el.scrollWidth>el.clientWidth));
 await page.goto(base+'#objects=planck-length,observable-universe');await page.locator('.tiny-marker').waitFor();await page.screenshot({path:'test-results/extreme.png',fullPage:true});
 await page.goto(base+'#objects=country-724,country-250');await page.locator('.object-label').first().waitFor();await page.locator('#textures').click();await page.screenshot({path:'test-results/geography.png',fullPage:true});
 await page.locator('#language').click();await page.locator('[data-setting="ja"]').click();assert.equal(await page.locator('html').getAttribute('lang'),'ja');
 await page.locator('#language').click();await page.locator('[data-setting="es"]').click();
 await page.locator('#theme').click();await page.locator('[data-setting="night"]').click();await page.locator('#close-modal').click();
 await page.goto(base+'#objects=human,elephant,blue-whale');await page.locator('.object-control').first().waitFor();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#add-object').click();await page.locator('#object-search').fill('ballena');assert.ok(await page.locator('.object-choice').count()>=2);await page.screenshot({path:'test-results/mobile-picker.png',fullPage:true});await page.keyboard.press('Escape');
 await page.goto(base+'#objects=');await page.locator('#add-object').waitFor();await page.locator('#add-object').click();await page.locator('#object-search').fill('tierra');await page.locator('[data-choice="earth"]').click();assert.equal(await page.locator('.object-control').count(),1);
 await page.goto(base+'#objects=phobos&view=3d&textures=0');await page.locator('canvas.scene-canvas').waitFor();await page.waitForTimeout(900);await page.locator('#textures').click();await page.waitForTimeout(900);await page.screenshot({path:'test-results/phobos.png',fullPage:true});
 // Plain vector fallback remains useful when WebGL is unavailable.
 const fallback=await browser.newContext({locale:'en-US',viewport:{width:1000,height:800}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).startsWith('webgl'))return null;return original.call(this,type,...args);};});
 const plain=await fallback.newPage();await plain.goto(base);await plain.locator('.object-control').first().waitFor();await plain.locator('.vector-object:not(.hidden)').first().waitFor({timeout:45000});assert.equal(await plain.locator('html').getAttribute('lang'),'en');
 await fallback.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await writeFile('test-results/browser-report.json',JSON.stringify({passed:true,errors,externalRequests:external,checks:['2D and 3D','add/replace/remove','encyclopedia lifecycle','711-entry inventory and XLSX','superprompt','30-object lineup','extreme scale','country outlines','Japanese and browser language','mobile search','empty state','WebGL fallback']},null,2));
 console.log('Browser checks passed on desktop and mobile. No external runtime requests.');
}finally{await browser?.close();server.kill();}
