import { DatabaseSync } from 'node:sqlite';
import { readdir, readFile, mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { auditObject,auditSummary } from '../src/audit.js';

await mkdir('data',{recursive:true}); await mkdir('public',{recursive:true});
const database = new DatabaseSync(':memory:');
database.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE objects(id TEXT PRIMARY KEY, folder TEXT UNIQUE NOT NULL, category TEXT NOT NULL, family TEXT NOT NULL, parent TEXT, status TEXT NOT NULL, featured INTEGER NOT NULL, width REAL, height REAL, depth REAL, extent REAL, basis TEXT NOT NULL, measurement_status TEXT NOT NULL, data TEXT NOT NULL);
 CREATE TABLE translations(object_id TEXT REFERENCES objects(id), language TEXT, name TEXT, summary TEXT, PRIMARY KEY(object_id,language));
 CREATE TABLE tags(object_id TEXT REFERENCES objects(id), tag TEXT, PRIMARY KEY(object_id,tag));
 CREATE TABLE assets(object_id TEXT REFERENCES objects(id), kind TEXT, path TEXT, fidelity TEXT, PRIMARY KEY(object_id,kind));
 CREATE TABLE sources(object_id TEXT REFERENCES objects(id), url TEXT, retrieved TEXT, PRIMARY KEY(object_id,url));
 CREATE TABLE quality(object_id TEXT PRIMARY KEY REFERENCES objects(id), report TEXT NOT NULL);
 CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE INDEX object_family ON objects(category,family); CREATE INDEX object_size ON objects(extent); CREATE INDEX tag_search ON tags(tag);`);
const objects=[];
const qualityReports=new Map();
for(const dir of (await readdir('objetos',{withFileTypes:true})).filter(d=>d.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
 const o=JSON.parse(await readFile(join('objetos',dir.name,'meta.json'),'utf8'));
 if(o.folder!==dir.name) throw Error(`Folder mismatch: ${dir.name}`);
 if(!/^[a-z0-9_-]+$/.test(o.id)) throw Error(`Invalid ID ${o.id}`);
 const dims=o.dimensions;
 const valid=dims&&[dims.width,dims.height].every(n=>Number.isFinite(n)&&n>0);
 if(o.status==='ready'&&!valid) throw Error(`Invalid ready dimensions ${o.id}`);
 const extent=valid?Math.max(dims.width,dims.height,dims.depth||0):null;
 database.prepare('INSERT INTO objects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(o.id,o.folder,o.category,o.family,o.parent||null,o.status,o.featured?1:0,dims?.width??null,dims?.height??null,dims?.depth??null,extent,o.basis,o.measurementStatus,JSON.stringify(o));
 for(const [lang,name] of Object.entries(o.names)) database.prepare('INSERT INTO translations VALUES (?,?,?,?)').run(o.id,lang,name,o.summary[lang] || null);
 for(const tag of new Set(o.tags)) database.prepare('INSERT INTO tags VALUES (?,?)').run(o.id,tag);
 database.prepare('INSERT INTO sources VALUES (?,?,?)').run(o.id,o.source,o.sourceRetrieved);
 const assetChecks={};
 for(const [kind,path] of Object.entries(o.visual).filter(([k,v])=>['silhouette','texture','textureLow','clouds','glb','model','image'].includes(k)&&v)) {
   if(path.includes('..') || path.includes('/') || path.includes('\\')) throw Error(`Nonlocal asset ${o.id}`);
   const bytes=await readFile(join('objetos',dir.name,path));
   assetChecks[kind]={exists:true,path,bytes:bytes.length};
   database.prepare('INSERT INTO assets VALUES (?,?,?,?)').run(o.id,kind,path,o.visual.fidelity);
 }
 const audit=auditObject(o,assetChecks);qualityReports.set(o.id,audit);database.prepare('INSERT INTO quality VALUES (?,?)').run(o.id,JSON.stringify(audit));
 objects.push(o);
}
const hash=createHash('sha256').update(JSON.stringify(objects)).digest('hex');
database.prepare('INSERT INTO metadata VALUES (?,?)').run('schema_version','2');
database.prepare('INSERT INTO metadata VALUES (?,?)').run('catalog_sha256',hash);
database.prepare('INSERT INTO metadata VALUES (?,?)').run('object_count',String(objects.length));
database.exec(`VACUUM INTO '${resolve('data/catalog.sqlite').replaceAll('\\','/').replaceAll("'","''")}.next'`);
database.close();
await copyFile('data/catalog.sqlite.next','data/catalog.sqlite');
const {unlink}=await import('node:fs/promises'); await unlink('data/catalog.sqlite.next');
await copyFile('data/catalog.sqlite','public/catalog.sqlite');
await cp('objetos','public/objetos',{recursive:true});
await copyFile('node_modules/sql.js/dist/sql-wasm.wasm','public/sql-wasm.wasm');
await copyFile('AGENTS.md','public/AGENTS.md');
await copyFile('favicon.svg','public/favicon.svg');
const reports=objects.map(o=>({...o,audit:qualityReports.get(o.id)}));
await writeFile('data/quality-report.json',JSON.stringify({schema:2,catalogHash:hash,summary:auditSummary(reports),objects:reports.map(o=>({id:o.id,...o.audit}))},null,2)+'\n');
await copyFile('data/quality-report.json','public/quality-report.json');
await writeFile('data/catalog-summary.json',JSON.stringify({schema:2,count:objects.length,ready:objects.filter(o=>o.status==='ready').length,pending:objects.filter(o=>o.status==='pending').length,hash},null,2)+'\n');
console.log(`${objects.length} entries · ${objects.filter(o=>o.status==='ready').length} comparable · SQLite ${(await import('node:fs/promises')).stat?Math.round((await (await import('node:fs/promises')).stat('data/catalog.sqlite')).size/1024):''} KB`);
