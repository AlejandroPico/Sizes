export const reviewed=o=>['source-checked','reviewed','verified'].includes(o.reviewStatus);
export function auditObject(o,assetChecks={}){
 const issues=[];
 const add=(code,severity,message)=>issues.push({code,severity,message});
 const dims=o.dimensions;
 if(!dims)add('MISSING_MEASURES','error',o.basis==='point-particle'?'No tiene un diámetro físico definido. Se conserva como referencia sin compararlo.':'Faltan medidas utilizables. El registro está pendiente y no se representa a una escala inventada.');
 else if(![dims.width,dims.height].every(n=>Number.isFinite(n)&&n>0)||dims.depth!==null&&dims.depth!==undefined&&!(Number.isFinite(dims.depth)&&dims.depth>0))add('INVALID_MEASURES','error','Las dimensiones contienen valores inválidos.');
 if(!o.names?.es||!o.names?.en)add('MISSING_NAMES','error','Falta el nombre en castellano o inglés.');
 if(!o.summary?.es||!o.summary?.en)add('MISSING_DESCRIPTION','warning','La descripción está incompleta.');
 if(!o.category||!o.family)add('MISSING_TAXONOMY','error','Falta categoría o familia.');
 if(!o.source)add('MISSING_SOURCE','error','No hay una fuente registrada.');
 else{try{const url=new URL(o.source);if(url.protocol!=='https:')add('SOURCE_PROTOCOL','warning','La fuente no usa HTTPS.');if(url.pathname==='/'||/\/animals\/?$|\/Constants\/?$|\/tools\/sbdb_lookup.html$/.test(url.pathname))add('BROAD_SOURCE','warning','La fuente es general: falta una referencia específica para esta medida.');}catch{add('INVALID_SOURCE','error','La dirección de la fuente no es válida.');}}
 if(!o.basis)add('MISSING_BASIS','error','No está definida la medida utilizada.');
 if(!reviewed(o))add('UNREVIEWED','warning','No consta una revisión científica de la ficha.');
 if(reviewed(o)&&!o.review?.date)add('REVIEW_DATE','warning','La revisión no tiene fecha ni alcance documentados.');
 if(o.visual?.schematicWidth)add('SCHEMATIC_WIDTH','warning','La anchura es ilustrativa: la altura es la medida de referencia.');
 if(o.basis==='equivalent-area-square')add('EQUIVALENT_AREA','warning','Se representa una superficie equivalente; falta el contorno real.');
 if(o.measurementStatus==='theoretical')add('THEORETICAL','warning','El tamaño depende de un modelo teórico.');
 if(!o.visual?.texture&&!o.visual?.image&&!o.visual?.glb)add('ILLUSTRATIVE_IMAGE','warning','Solo dispone de una representación esquemática.');
 if(o.visual?.fidelity==='generated-realistic')add('GENERATED_IMAGE','info','Recorte realista generado: no es una fotografía observada.');
 if(!o.visual?.glb&&o.category!=='geography')add('NO_MEASURED_3D','warning','No hay un modelo 3D observado; se usa una ilustración o un recorte cuando corresponde.');
 for(const [kind,check] of Object.entries(assetChecks))if(check.exists===false)add('MISSING_ASSET','error',`Falta el recurso local ${kind}: ${check.path}.`);
 return {errors:issues.filter(i=>i.severity==='error').length,warnings:issues.filter(i=>i.severity==='warning').length,reviewed:reviewed(o),issues,assets:assetChecks,structure:{folder:o.folder,metadata:true,resources:Object.keys(assetChecks).length}};
}
export function auditSummary(objects){
 const categories={},origins={};let errors=0,warnings=0,reviewedCount=0,resourceCount=0;
 for(const o of objects){const audit=o.audit||auditObject(o);categories[o.category]=(categories[o.category]||0)+1;let origin='Sin fuente';try{origin=new URL(o.source).hostname;}catch{}origins[origin]=(origins[origin]||0)+1;errors+=audit.errors>0?1:0;warnings+=audit.warnings>0?1:0;reviewedCount+=audit.reviewed?1:0;resourceCount+=audit.structure.resources;}
 return {total:objects.length,comparable:objects.filter(o=>o.status==='ready').length,pending:objects.filter(o=>o.status!=='ready').length,errors,warnings,reviewed:reviewedCount,unreviewed:objects.length-reviewedCount,categories,origins,folders:objects.length,resources:resourceCount};
}
