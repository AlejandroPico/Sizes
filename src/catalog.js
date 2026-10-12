const worker=new Worker(new URL('./catalog.worker.js',import.meta.url),{type:'module'});
export function loadCatalog(){
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Catalog load timed out')),30000);
  worker.onmessage=({data})=>{clearTimeout(timeout); data.error?reject(Error(data.error)):resolve(data.result);};
  worker.onerror=e=>{clearTimeout(timeout);reject(Error(e.message));};
  worker.postMessage({id:1,type:'init',payload:{base:new URL(import.meta.env.BASE_URL,location.href).href}});
 });
}
export const asset=(o,key)=>new URL(`objetos/${encodeURIComponent(o.folder)}/${o.visual[key]}`,new URL(import.meta.env.BASE_URL,location.href)).href;
