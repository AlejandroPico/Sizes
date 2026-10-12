import initSqlJs from 'sql.js';
let db;
self.onmessage=async ({data:{id,type,payload}})=>{
 try {
  if(type==='init'){
   const base=payload.base;
   const SQL=await initSqlJs({locateFile:()=>new URL('sql-wasm.wasm',base).href});
   const response=await fetch(new URL('catalog.sqlite',base));
   if(!response.ok) throw Error('Could not load SQLite catalog');
   db=new SQL.Database(new Uint8Array(await response.arrayBuffer()));
  }
  if(!db) throw Error('Catalog not initialized');
  // Catalog JSON is authoritative; no runtime calls to external data services.
  const stmt=db.prepare('SELECT o.data,q.report FROM objects o LEFT JOIN quality q ON q.object_id=o.id ORDER BY o.extent IS NULL, o.extent, o.id');
  const objects=[]; while(stmt.step()){const row=stmt.getAsObject();objects.push({...JSON.parse(row.data),audit:row.report?JSON.parse(row.report):null});}stmt.free();
  self.postMessage({id,result:objects});
 }catch(error){self.postMessage({id,error:error.message});}
};
