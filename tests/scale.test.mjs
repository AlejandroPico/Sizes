import test from 'node:test';
import assert from 'node:assert/strict';
import {layout,formatLength,extent,autoTheme} from '../src/scale.js';
import {exportXlsx} from '../src/export.js';
import {unzipSync,strFromU8} from 'fflate';
const object=(id,width,height=width)=>({id,dimensions:{width,height,depth:null},visual:{}});
test('Moon and Earth share one physical scale',()=>{
 const earth=object('earth',12756000),moon=object('moon',3474800);
 const result=layout([earth,moon],1100,420);
 assert.ok(Math.abs(result.items[0].width/result.items[1].width-12756000/3474800)<1e-12);
 assert.equal(result.items[0].width,result.items[0].height);
});
test('Planck to observable universe does not inflate small objects',()=>{
 const result=layout([object('planck',1.616255e-35),object('universe',8.8e26)],800,420);
 assert.ok(result.items[0].width>0&&result.items[0].width<1e-50);
 assert.ok(result.items.every(i=>Number.isFinite(i.x)&&Number.isFinite(i.width)));
});
test('Non-spherical objects keep their width and height; unlimited lineup scrolls',()=>{
 const objects=Array.from({length:30},(_,i)=>object(String(i),i+1,(i+1)/3));
 const result=layout(objects,800,420);
 assert.equal(result.items.length,30);assert.ok(result.totalWidth>800);
 for(const i of result.items)assert.ok(Math.abs(i.width/i.height-3)<1e-12);
});
test('Empty comparison and missing measures are honest',()=>{
 assert.deepEqual(layout([],800,420),{items:[],pixelsPerMeter:0,totalWidth:800});
 assert.equal(extent({dimensions:null}),null);assert.equal(formatLength(null),'—');assert.ok(formatLength(1e-35).includes('10^'));
});
test('Theme uses local clock and date',()=>{
 assert.equal(autoTheme(new Date(2026,5,15,12)),'morning');assert.equal(autoTheme(new Date(2026,5,15,19)),'afternoon');assert.equal(autoTheme(new Date(2026,11,15,3)),'night');
});
test('Excel export retains SI numbers and stores formula-like strings as text',()=>{
 const files=unzipSync(exportXlsx([{id:'=1+1',width_m:1.616255e-35,name:'A&B <Earth>'}]));
 const sheet=strFromU8(files['xl/worksheets/sheet1.xml']);
 assert.ok(sheet.includes('<v>1.616255e-35</v>'));assert.ok(sheet.includes('=1+1'));assert.ok(!sheet.includes('<f>'));assert.ok(sheet.includes('A&amp;B &lt;Earth&gt;'));
});
