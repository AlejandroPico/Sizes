import { readdir, readFile, mkdir, writeFile,copyFile } from 'node:fs/promises';
import { resolve, join, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import {hasProcedural3d} from '../src/representation.js';

// This audit inspects local files, not astronomical or biological truth.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const objectsRoot = join(root, 'objetos');
const resourceKinds = ['image', 'texture', 'textureLow', 'clouds', 'silhouette', 'glb', 'model','ringTexture'];
const geometricKinds = new Set(['sphere', 'ellipsoid', 'atom', 'dna', 'virus', 'bacterium','sperm','galaxy']);
const paeth = (a,b,c) => { const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c; };

function pngInfo(bytes) {
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Cabecera PNG inválida');
 let width,height,bitDepth,colorType,interlace,transparency,palette,idat=[];
 for(let p=8;p+12<=bytes.length;) {const n=bytes.readUInt32BE(p),kind=bytes.toString('ascii',p+4,p+8),chunk=bytes.subarray(p+8,p+8+n);if(p+12+n>bytes.length)throw Error('PNG truncado');
  if(kind==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);bitDepth=chunk[8];colorType=chunk[9];interlace=chunk[12];}
  if(kind==='IDAT')idat.push(chunk);if(kind==='tRNS')transparency=chunk;if(kind==='PLTE')palette=chunk;
  p+=n+12;if(kind==='IEND')break;
 }
 if(!(width>0&&height>0))throw Error('PNG sin dimensiones');
 const result={format:'png',width,height,bitDepth,colorType,hasAlpha:[4,6].includes(colorType)||!!transparency};
 // Decode ordinary 8-bit PNGs so alpha bounds are measured rather than assumed.
 const channels=({0:1,2:3,3:1,4:2,6:4})[colorType];
 if(bitDepth!==8||interlace!==0||!channels){result.alphaInspection='Formato válido; transparencia no decodificada por esta inspección';return result;}
 const raw=inflateSync(Buffer.concat(idat)),stride=width*channels,previous=new Uint8Array(stride),line=new Uint8Array(stride);
 if(raw.length<(stride+1)*height)throw Error('Píxeles PNG incompletos');
 let minX=width,minY=height,maxX=-1,maxY=-1,visible=0,transparent=0;
 for(let y=0,p=0;y<height;y++){const filter=raw[p++];if(filter>4)throw Error('Filtro PNG inválido');
  for(let i=0;i<stride;i++){const a=i>=channels?line[i-channels]:0,b=previous[i],c=i>=channels?previous[i-channels]:0;line[i]=(raw[p++]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  for(let x=0;x<width;x++){let alpha=255;if(colorType===6)alpha=line[x*4+3];else if(colorType===4)alpha=line[x*2+1];else if(colorType===3)alpha=transparency?.[line[x]]??255;else if(colorType===0&&transparency)alpha=line[x]===transparency.readUInt16BE(0)?0:255;else if(colorType===2&&transparency)alpha=line[x*3]===transparency.readUInt16BE(0)&&line[x*3+1]===transparency.readUInt16BE(2)&&line[x*3+2]===transparency.readUInt16BE(4)?0:255;
   if(alpha<255)transparent++;if(alpha>16){visible++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  }previous.set(line);
 }
 result.transparentPixels=transparent;result.visiblePixels=visible;result.visibleBounds=visible?{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}:null;
 if(colorType===3&&!palette)throw Error('PNG indexado sin paleta');
 return result;
}
function jpegInfo(bytes){
 if(bytes[0]!==255||bytes[1]!==216)throw Error('Cabecera JPEG inválida');
 for(let p=2;p+4<bytes.length;){if(bytes[p++]!==255)continue;let marker=bytes[p++];while(marker===255)marker=bytes[p++];if(marker===217||marker===218)break;if(marker===1||marker>=208&&marker<=215)continue;const length=bytes.readUInt16BE(p);if(length<2)throw Error('Segmento JPEG inválido');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {format:'jpeg',width:bytes.readUInt16BE(p+5),height:bytes.readUInt16BE(p+3),hasAlpha:false};p+=length;}
 throw Error('JPEG sin dimensiones');
}
function svgInfo(bytes){const xml=bytes.toString('utf8');if(!/<svg\b/i.test(xml))throw Error('SVG sin elemento raíz');const tag=xml.match(/<svg\b[^>]*>/i)?.[0]||'',v=tag.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.trim().split(/[\s,]+/).map(Number);const width=Number.parseFloat(tag.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1]),height=Number.parseFloat(tag.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1]);return {format:'svg',width:Number.isFinite(width)?width:v?.[2]??null,height:Number.isFinite(height)?height:v?.[3]??null,viewBox:v||null,vector:true,containsRaster:/<image\b/i.test(xml)};}
function glbInfo(bytes){
 if(bytes.length<20||bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('GLB 2 inválido o truncado');
 let json,binaryBytes=0;for(let p=12;p+8<=bytes.length;){const n=bytes.readUInt32LE(p),type=bytes.readUInt32LE(p+4);if(p+8+n>bytes.length)throw Error('Bloque GLB truncado');if(type===0x4e4f534a)json=JSON.parse(bytes.toString('utf8',p+8,p+8+n).trim());if(type===0x004e4942)binaryBytes+=n;p+=8+n;}
 if(!json?.meshes?.length)throw Error('GLB sin mallas');const externalResources=[...(json.buffers||[]),...(json.images||[])].filter(x=>x.uri&&!x.uri.startsWith('data:')).map(x=>x.uri);const positionAccessors=json.meshes.flatMap(m=>m.primitives||[]).map(p=>json.accessors?.[p.attributes?.POSITION]).filter(Boolean);
 if(!positionAccessors.length)throw Error('GLB sin posiciones de vértices');
 return {format:'glb',version:2,meshes:json.meshes.length,vertices:positionAccessors.reduce((n,a)=>n+(a.count||0),0),animations:json.animations?.length||0,binaryBytes,externalResources,positionBounds:positionAccessors.map(a=>({min:a.min||null,max:a.max||null}))};
}
async function inspectResource(folder,kind,file){
 const local=resolve(objectsRoot,folder,file),parent=resolve(objectsRoot,folder);if(relative(parent,local).startsWith('..')||resolve(parent)===local)return {path:file,exists:false,valid:false,error:'Ruta fuera de la carpeta del objeto'};
 try{const bytes=await readFile(local);let info={};const ext=extname(file).toLowerCase();if(ext==='.png')info=pngInfo(bytes);else if(['.jpg','.jpeg'].includes(ext))info=jpegInfo(bytes);else if(ext==='.svg')info=svgInfo(bytes);else if(ext==='.glb')info=glbInfo(bytes);else if(ext==='.json'){JSON.parse(bytes.toString('utf8'));info={format:'json',descriptor:true,contains3DGeometry:false};}return {path:file,exists:true,valid:true,bytes:bytes.length,...info};}catch(e){return {path:file,exists:e.code!=='ENOENT',valid:false,error:e.message};}
}
function classify(o,assets){
 const has=k=>assets[k]?.valid===true,hasTexture=has('texture'),hasImage=has('image'),hasModel=has('glb');
 const modes=[];if(hasModel)modes.push({mode:'3d',kind:'modelo-3d',provenance:o.visual?.fidelity==='reconstructed'?'reconstrucción declarada; exactitud no auditada':'malla local; origen y exactitud no comprobados'});
 else if(hasProcedural3d(o)||geometricKinds.has(o.visual?.kind)&&!hasImage)modes.push({mode:'3d',kind:hasTexture&&!o.visual.fidelity.startsWith('procedural')?'geometría-3d-con-textura':'geometría-3d-ilustrativa',provenance:hasTexture?(o.visual?.fidelity==='observed-texture'?'textura declarada observada; geometría idealizada':o.visual?.fidelity==='partial-map'?'cartografía parcial; reverso no observado':'recurso institucional o ilustrativo; cobertura y fidelidad deben consultarse en la ficha'):'modelo conceptual, no escaneo del objeto'});
 if(hasImage)modes.push({mode:'image',kind:'imagen-plana',provenance:o.visual?.imageProvenance?.observed===false||o.visual?.fidelity==='generated-realistic'?'ilustración realista generada; no fotografía':'imagen local; origen no comprobado'});
 if(hasTexture)modes.push({mode:'texture',kind:'textura',provenance:o.visual?.fidelity||'no declarada'});
 if(has('silhouette'))modes.push({mode:'vector',kind:o.visual?.kind==='map'?'mapa-vectorial':'silueta-vectorial',provenance:o.visual?.fidelity||'no declarada'});
 return modes;
}
function actionsFor(o,assets,modes){
 const actions=[];const add=(code,priority,message)=>actions.push({code,priority,message});
 for(const [kind,r] of Object.entries(assets))if(!r.valid)add('INVALID_RESOURCE','alta',`Reparar ${kind}: ${r.error}`);
 if(!modes.length)add('NO_VISUAL','alta','Incorporar al menos una representación identificable y documentar su procedencia.');
 const dims=o.dimensions;if(!dims||!['width','height'].every(k=>Number.isFinite(dims[k])&&dims[k]>0))add('NO_COMPARABLE_MEASURE','bloqueada','Localizar medidas verificables antes de mostrarlo a escala; mantener la ficha consultable sin inventar dimensiones.');
 if(assets.glb?.externalResources?.length)add('GLB_DEPENDENCIES','alta',`Comprobar dependencias GLB: ${assets.glb.externalResources.join(', ')}.`);
 if(assets.image?.valid){const image=assets.image,b=o.visual?.imageBounds;if(image.visiblePixels===0)add('EMPTY_IMAGE','alta','La imagen no contiene píxeles visibles.');if(!image.hasAlpha)add('OPAQUE_IMAGE','media','Preparar un recorte transparente si el fondo forma parte del archivo.');if(b&&(b.imageWidth!==image.width||b.imageHeight!==image.height||b.x<0||b.y<0||b.x+b.width>image.width||b.y+b.height>image.height))add('INVALID_CROP','alta','Corregir el recorte declarado: no corresponde a las dimensiones del archivo.');if(b&&image.visibleBounds){const v=image.visibleBounds;if(v.x<b.x-8||v.y<b.y-8||v.x+v.width>b.x+b.width+8||v.y+v.height>b.y+b.height+8)add('CROP_CONTENT','media','Revisar el recorte: hay píxeles visibles fuera de los límites declarados.');}if(Math.min(image.width,image.height)<256)add('SMALL_IMAGE','media','Ampliar la resolución de la imagen para pantallas grandes.');}
 const vivid=assets.image?.valid||assets.texture?.valid||assets.glb?.valid;
 if(o.category==='buildings'&&!assets.image?.valid&&!assets.glb?.valid)add('GENERIC_BUILDING','alta','Sustituir la torre genérica por una imagen o modelo reconocible del edificio concreto; conservar su altura y declarar la anchura esquemática.');
 if(o.category==='objects'&&!vivid&&o.family!=='reference')add('GENERIC_TRANSPORT','alta','Usar un recorte lateral documentado del vehículo concreto o un modelo fiable; evitar reutilizar una silueta genérica como si fuera exacta.');
 if(o.category==='life'&&!vivid)add('LIFE_CUTOUT','alta','Incorporar un recorte anatómicamente reconocible de esta especie; si es generado, declararlo como ilustración.');
 if(o.category==='space'&&!vivid){if(o.family==='moons')add('UNKNOWN_SURFACE','media','Buscar imágenes o modelos de misiones cuando existan; para lunas no fotografiadas mantener un aspecto neutro, sin inventar cráteres ni cartografía.');else if(['planets','dwarf-planets','asteroids'].includes(o.family))add('BODY_SURFACE','alta','Buscar mapas de misiones y geometría medida; distinguir las zonas observadas de las regiones reconstruidas.');else add('COSMIC_MODEL','media','Revisar una representación conceptual reconocible, dejando claro qué tamaño se compara y qué aspecto es ilustrativo.');}
 if(o.category==='micro'&&!vivid)add('MICRO_MODEL','media','Revisar anatomía y escala del microorganismo concreto; un esquema 3D convencional no es una fotografía de microscopía.');
 if(o.category==='geography'&&o.visual?.kind!=='map')add('CITY_BOUNDARY','alta','Sustituir el cuadrado de área equivalente por el contorno administrativo correcto; declarar fecha y definición territorial.');
 if(o.visual?.fidelity==='partial-map')add('PARTIAL_MAP','media','Mantener identificables las zonas sin cartografía y evitar vender el globo como superficie totalmente observada.');
 if(assets.texture?.valid&&assets.texture.width<1024)add('LOW_TEXTURE','media','Revisar una textura más detallada si la fuente original permite mayor resolución.');
 if(assets.texture?.valid&&!assets.textureLow?.valid)add('LOW_QUALITY_TEXTURE','baja','Crear una versión reducida local para el modo de texturas de menor calidad.');
 if(assets.model?.valid&&!assets.glb?.valid)add('DESCRIPTOR_NOT_3D','informativa','model.json es un descriptor: no acredita una malla 3D.');
 if(!['verified','reviewed','source-checked'].includes(o.reviewStatus))add('NOT_SCIENTIFICALLY_REVIEWED','informativa','La inspección de archivos no sustituye la revisión científica de medidas, anatomía, cartografía o procedencia.');
 return actions;
}

const objects=[];
for(const dir of (await readdir(objectsRoot,{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
 const o=JSON.parse(await readFile(join(objectsRoot,dir.name,'meta.json'),'utf8')),assets={};
 for(const kind of resourceKinds)if(o.visual?.[kind])assets[kind]=await inspectResource(dir.name,kind,o.visual[kind]);
 const modes=classify(o,assets),actions=actionsFor(o,assets,modes);
 objects.push({id:o.id,name:o.names?.es||o.names?.en||dir.name,folder:dir.name,category:o.category,family:o.family,status:o.status,dimensions:o.dimensions,visualKind:o.visual?.kind,fidelity:o.visual?.fidelity,reviewStatus:o.reviewStatus,assets,representations:modes,preferredRepresentation:modes[0]?.kind||'ninguna',actions});
}
const count=test=>objects.filter(test).length;
const summary={objects:objects.length,comparable:count(o=>o.status==='ready'),withoutComparableMeasure:count(o=>o.actions.some(a=>a.code==='NO_COMPARABLE_MEASURE')),validGlb:count(o=>o.assets.glb?.valid),image:count(o=>o.assets.image?.valid),texture:count(o=>o.assets.texture?.valid),vector:count(o=>o.assets.silhouette?.valid),onlyVector:count(o=>o.representations.length===1&&o.representations[0].mode==='vector'),illustrativeGeometry:count(o=>o.representations.some(r=>r.kind==='geometría-3d-ilustrativa')),invalidResources:count(o=>Object.values(o.assets).some(a=>!a.valid)),highPriority:count(o=>o.actions.some(a=>a.priority==='alta')),scientificReviewClaimed:count(o=>['verified','reviewed','source-checked'].includes(o.reviewStatus))};
const groups={};for(const o of objects){const key=`${o.category}/${o.family}`;const g=groups[key]??={objects:0,images:0,textures:0,models:0,highPriority:0,blockedMeasure:0};g.objects++;g.images+=!!o.assets.image?.valid;g.textures+=!!o.assets.texture?.valid;g.models+=!!o.assets.glb?.valid;g.highPriority+=o.actions.some(a=>a.priority==='alta');g.blockedMeasure+=o.actions.some(a=>a.priority==='bloqueada');}
const report={schema:1,scope:'Inspección estática de recursos locales. No evalúa la belleza del render ni certifica revisión científica. Las capacidades declaradas no garantizan que el renderizador actual las utilice; la comprobación visual del navegador sigue siendo necesaria.',catalogFingerprint:createHash('sha256').update(JSON.stringify(objects.map(o=>({id:o.id,assets:o.assets,kind:o.visualKind,dimensions:o.dimensions})))).digest('hex'),summary,groups,objects};
await mkdir(join(root,'data'),{recursive:true});await writeFile(join(root,'data/visual-review.json'),JSON.stringify(report,null,2)+'\n');
const esc=value=>String(value??'—').replaceAll('|','\\|').replaceAll('\n',' ');
const lines=['# Revisión gráfica de Sizes','',report.scope,'','La prioridad del modo predeterminado es un modelo 3D fiable cuando existe, después una imagen realista o una textura apropiada, y finalmente una representación vectorial. Las esferas y los modelos moleculares son geometría conceptual: no equivalen a un escaneo. `model.json` nunca se cuenta como una malla.','',`Se han inspeccionado **${summary.objects} fichas**, **${summary.validGlb} GLB válidos**, **${summary.image} imágenes**, **${summary.texture} texturas** y **${summary.vector} siluetas**. Hay **${summary.invalidResources} fichas con recursos inválidos**, **${summary.highPriority} con acciones gráficas de prioridad alta** y **${summary.withoutComparableMeasure} sin dimensiones comparables**. Los problemas de medidas no se resuelven inventando tamaños. La revisión científica declarada consta en ${summary.scientificReviewClaimed} fichas; esta inspección no cambia ese estado.`, '', '## Familias y prioridades','','| Familia | Fichas | Imágenes | Texturas | GLB | Prioridad alta | Medida pendiente |','|---|---:|---:|---:|---:|---:|---:|',...Object.entries(groups).map(([k,g])=>`| ${k} | ${g.objects} | ${g.images} | ${g.textures} | ${g.models} | ${g.highPriority} | ${g.blockedMeasure} |`),'','## Revisión individual','','Cada fila corresponde a una ficha; la lista completa de dimensiones, transparencia, límites de recorte, vértices GLB y acciones se encuentra en `data/visual-review.json`. «Disponible» describe el archivo inspeccionado, no un juicio de calidad cinematográfica.','','| Objeto | Identificador | Familia | Representación disponible | Recursos | Acciones |','|---|---|---|---|---|---|',...objects.map(o=>`| ${esc(o.name)} | ${o.id} | ${o.category}/${o.family} | ${esc(o.representations.map(r=>`${r.kind}: ${r.provenance}`).join('; '))} | ${esc(Object.entries(o.assets).map(([k,a])=>`${k}: ${a.valid?'válido':'ERROR'}${a.width?` ${a.width}×${a.height}`:''}`).join('; '))} | ${esc(o.actions.filter(a=>a.priority!=='informativa').map(a=>`[${a.priority}] ${a.message}`).join(' '))||'Sin fallo estructural; pendiente de evaluación visual.'} |`),'','## Orden de trabajo recomendado','','1. Reparar recursos ilegibles, recortes incorrectos y dependencias ausentes antes de mejorar resolución.','2. Sustituir edificios y transportes genéricos por el objeto concreto; revisar anatomía de especies sin imagen.','3. Mejorar materiales, iluminación y efectos del Sol; los efectos de plasma son una recreación visual, no una simulación física certificada.','4. Revisar planetas, planetas enanos y asteroides usando los datos de misiones, distinguiendo mapas parciales y geometría idealizada.','5. Revisar microorganismos y moléculas según su estructura; no reutilizar la misma anatomía para organismos diferentes.','6. Mantener las lunas desconocidas neutras; no crear información observada que no existe.','7. Comprobar todos los resultados en escritorio y móvil y corregir las dimensiones pendientes con fuentes específicas antes de ampliar el catálogo.',''];
await writeFile(join(root,'data/visual-review.md'),lines.join('\n'));
await mkdir(join(root,'public'),{recursive:true});for(const file of ['visual-review.md','visual-review.json'])await copyFile(join(root,'data',file),join(root,'public',file));
console.log(JSON.stringify(summary,null,2));
