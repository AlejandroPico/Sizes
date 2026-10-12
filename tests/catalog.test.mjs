import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {buildTaxonomy,descendantObjects,findNode} from '../src/taxonomy.js';
import {auditObject,auditSummary} from '../src/audit.js';
import {qualities,nextQuality,qualitySettings,nextTheme,themeIcon,flag} from '../src/presentation.js';
const db=new DatabaseSync('data/catalog.sqlite',{readOnly:true});
const catalog=db.prepare('SELECT data FROM objects').all().map(row=>JSON.parse(row.data));db.close();
test('Nested taxonomy covers the whole catalog, including pending entries',()=>{
 const tree=buildTaxonomy(catalog),covered=new Set(tree.flatMap(descendantObjects).map(o=>o.id));
 assert.equal(covered.size,catalog.length);
 assert.equal(findNode(tree,'atoms').representative,'carbon');assert.equal(findNode(tree,'dogs').representative,'dog-labrador');
 assert.equal(findNode(tree,'moons-jupiter').representative,'ganymede');
 assert.ok(findNode(tree,'moons-jupiter').children.some(n=>n.object.status==='pending'));
 assert.equal(findNode(tree,'animals').children[0].children.find(n=>n.key==='dogs').children.length,2);
});
test('Quality has exactly three cyclic levels and a lighter textured renderer',()=>{
 assert.deepEqual(qualities,['3d','textured','vector']);assert.equal(nextQuality('3d'),'textured');assert.equal(nextQuality('textured'),'vector');assert.equal(nextQuality('vector'),'3d');
 assert.ok(qualitySettings('textured').segments<qualitySettings('3d').segments);assert.ok(qualitySettings('textured').pixelRatio<qualitySettings('3d').pixelRatio);
 assert.equal(qualitySettings('vector').textures,false);
});
test('Themes cycle without a settings dialog and have distinct icons',()=>{
 assert.equal(nextTheme('auto'),'morning');assert.equal(nextTheme('night'),'auto');assert.equal(new Set(['auto','morning','afternoon','night'].map(themeIcon)).size,4);assert.ok(flag('ja').includes('circle'));
});
test('Missing measurements are reported without assigning a placeholder radius',()=>{
 const pending=catalog.find(o=>o.status==='pending');const a=auditObject(pending);assert.ok(a.issues.some(i=>i.code==='MISSING_MEASURES'&&i.severity==='error'));assert.equal(pending.dimensions,null);
 const broken=auditObject(catalog.find(o=>o.id==='earth'),{texture:{exists:false,path:'missing.png'}});assert.ok(broken.issues.some(i=>i.code==='MISSING_ASSET'));
});
test('A valid build is not treated as a scientific review',()=>{
 const o=catalog.find(o=>o.id==='earth');assert.ok(auditObject(o).issues.some(i=>i.code==='UNREVIEWED'));
 const checked={...o,reviewStatus:'reviewed',review:{date:'2026-10-12',scope:['measurements'],source:o.source}};assert.equal(auditObject(checked).reviewed,true);assert.ok(!auditObject(checked).issues.some(i=>i.code==='UNREVIEWED'));
 const summary=auditSummary([o,checked]);assert.equal(summary.reviewed,1);assert.equal(summary.unreviewed,1);
});
