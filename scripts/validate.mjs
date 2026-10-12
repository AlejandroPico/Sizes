import { DatabaseSync } from 'node:sqlite';
import { readdir,readFile,stat } from 'node:fs/promises';
import { join } from 'node:path';
import { dictionaries } from '../src/i18n.js';
const db=new DatabaseSync('data/catalog.sqlite',{readOnly:true});
const rows=db.prepare('SELECT data FROM objects').all().map(r=>JSON.parse(r.data));
const dirs=(await readdir('objetos',{withFileTypes:true})).filter(d=>d.isDirectory());
if(dirs.length!==rows.length)throw Error('Folder / SQLite count mismatch');
for(const o of rows){
 if(/[. ]$/.test(o.folder)||/[<>:"/\\|?*]/.test(o.folder))throw Error(`Nonportable folder name ${o.id}`);
 const meta=JSON.parse(await readFile(join('objetos',o.folder,'meta.json'),'utf8'));if(JSON.stringify(meta)!==JSON.stringify(o))throw Error(`Stale SQLite ${o.id}`);
 if(o.status==='ready'&&!(o.dimensions?.width>0&&o.dimensions?.height>0))throw Error(`Bad dimension ${o.id}`);
 if(o.status==='pending'&&o.dimensions!==null)throw Error(`Pending placeholder ${o.id}`);
 if(!o.source.startsWith('https://'))throw Error(`Missing provenance ${o.id}`);
 if(!o.summary.es||!o.summary.en)throw Error(`Missing summary ${o.id}`);
 for(const key of ['silhouette','texture','textureLow','glb','model','clouds','image'])if(o.visual[key])await stat(join('objetos',o.folder,o.visual[key]));
 const quality=db.prepare('SELECT report FROM quality WHERE object_id=?').get(o.id);if(!quality)throw Error(`Missing quality report ${o.id}`);
 if(o.visual.imageBounds){const b=o.visual.imageBounds;if(!(b.x>=0&&b.y>=0&&b.width>0&&b.height>0&&b.x+b.width<=b.imageWidth&&b.y+b.height<=b.imageHeight))throw Error(`Invalid crop bounds ${o.id}`);}
}
for(const [lang,dict] of Object.entries(dictionaries))for(const key of Object.keys(dictionaries.en))if(!dict[key])throw Error(`Translation missing ${lang}/${key}`);
const agents=await readFile('AGENTS.md','utf8');const words=agents.split(/\s+/).length;
if(words<10000)throw Error(`Superprompt too short (${words} words)`);
if(!agents.includes('castellano')||agents.includes('durable project superprompt'))throw Error('Superprompt must be in Spanish');
const quality=JSON.parse(await readFile('data/quality-report.json','utf8'));if(quality.objects.length!==rows.length)throw Error('Stale quality report');
await stat('favicon.svg');await stat('dist/favicon.svg');await stat('dist/catalog.sqlite');await stat('dist/AGENTS.md');
db.close();console.log(`Validated ${rows.length} objects, their local assets, SQLite integrity, 10 UI languages and ${words} superprompt words.`);
