import test from 'node:test';
import assert from 'node:assert/strict';
import {layout,formatLength,extent,autoTheme} from '../src/scale.js';
import {exportXlsx} from '../src/export.js';
import {unzipSync,strFromU8} from 'fflate';
import {displayDimensions,usesImage} from '../src/representation.js';
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
test('Portrait sequences scroll vertically without shrinking to fit the whole list',()=>{
 const objects=Array.from({length:15},(_,i)=>object(String(i),10,10));
 const single=layout(objects.slice(0,1),390,844,{vertical:true}),many=layout(objects,390,844,{vertical:true});
 assert.equal(many.pixelsPerMeter,single.pixelsPerMeter);assert.ok(many.items[0].width>300);assert.equal(many.totalWidth,390);assert.ok(many.totalHeight>5000);
 for(let i=1;i<many.items.length;i++)assert.ok(many.items[i].centerY>many.items[i-1].labelY+60);
 const moon=layout([object('earth',12756000),object('moon',3474800)],390,844,{vertical:true});assert.ok(Math.abs(moon.items[0].width/moon.items[1].width-12756000/3474800)<1e-12);
 assert.equal(layout([],390,844,{vertical:true}).totalHeight,844);
});
test('A building with a schematic width retains image proportions and measured height',()=>{
 const o=object('building',80,443.2);o.visual={schematicWidth:true,image:'building.png',imageBounds:{width:502,height:1526}};
 const result=layout([o],1100,800);assert.ok(Math.abs(result.items[0].width/result.items[0].height-502/1526)<1e-12);assert.ok(Math.abs(result.items[0].height/result.pixelsPerMeter-443.2)<1e-9);assert.equal(o.dimensions.width,80);
});
test('Image fallbacks preserve anatomy and their reference axis without changing stored measurements',()=>{
 const animal=object('animal',18,4.5);animal.visual={image:'animal.png',imageScaleBasis:'width',imageBounds:{width:1200,height:400}};
 assert.deepEqual(displayDimensions(animal),{width:18,height:6});assert.equal(animal.dimensions.height,4.5);assert.deepEqual(displayDimensions(animal,'vector'),{width:18,height:4.5});
 const cell=object('red-blood-cell',7.5e-6);cell.visual={kind:'sphere',image:'cell.png',imageScaleBasis:'width',imageBounds:{width:900,height:600}};
 assert.equal(usesImage(cell),false);assert.deepEqual(displayDimensions(cell),cell.dimensions?{width:7.5e-6,height:7.5e-6}:null);assert.equal(usesImage(cell,'textured'),true);
 const model=object('asteroid',500);model.visual={glb:'model.glb',image:'preview.png',imageScaleBasis:'width',imageBounds:{width:800,height:600}};assert.equal(usesImage(model),false);assert.equal(usesImage(model,'textured'),true);
});
test('Theme uses local clock and date',()=>{
 assert.equal(autoTheme(new Date(2026,5,15,12)),'morning');assert.equal(autoTheme(new Date(2026,5,15,19)),'afternoon');assert.equal(autoTheme(new Date(2026,11,15,3)),'night');
});
test('Excel export retains SI numbers and stores formula-like strings as text',()=>{
 const files=unzipSync(exportXlsx([{id:'=1+1',width_m:1.616255e-35,name:'A&B <Earth>'}]));
 const sheet=strFromU8(files['xl/worksheets/sheet1.xml']);
 assert.ok(sheet.includes('<v>1.616255e-35</v>'));assert.ok(sheet.includes('=1+1'));assert.ok(!sheet.includes('<f>'));assert.ok(sheet.includes('A&amp;B &lt;Earth&gt;'));
});
