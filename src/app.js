import './styles.css';
import {loadCatalog,asset} from './catalog.js';
import {t,setLanguage,language,name,languages,categoryKey} from './i18n.js';
import {layout,extent,formatLength,autoTheme} from './scale.js';
import {icon} from './icons.js';
import {qualities,nextQuality,qualitySettings,nextTheme,themeIcon,flag} from './presentation.js';
import {buildTaxonomy,descendantObjects,nodeTitle,familyName,findNode} from './taxonomy.js';
import {thumbnailSource,fillThumbnails} from './thumbnails.js';
import {auditObject,auditSummary,reviewed} from './audit.js';
import packageInfo from '../package.json';

const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const prefs=(()=>{try{return JSON.parse(localStorage.getItem('sizes.preferences'))||{};}catch{return {};}})();
const state={catalog:[],selected:['earth','moon'],quality:'3d',lang:prefs.lang||'auto',theme:prefs.theme||'auto',category:null,query:'',replace:null,insert:'end'};
setLanguage(state.lang);
let scene,sceneModule,sceneUnavailable=false,currentLayout,resizeObserver,modalScene,modalResize,modalGeneration=0,pickerObserver,previousFocus,tree=[];
const selected=()=>state.selected.map(id=>state.catalog.find(o=>o.id===id)).filter(Boolean);
const getObject=id=>state.catalog.find(o=>o.id===id);
const readable=m=>formatLength(m,language());
const button=(label,ic,attrs='')=>`<button class="icon-btn" title="${esc(label)}" aria-label="${esc(label)}" ${attrs}>${icon(ic)}</button>`;
const translated=(es,en)=>['es','ca'].includes(language())?es:en;
const qualityLabel=()=>state.quality==='3d'?'3D':state.quality==='textured'?t('textures'):t('vector');
function savePrefs(){try{localStorage.setItem('sizes.preferences',JSON.stringify({theme:state.theme,lang:state.lang}));}catch{}}
function applyTheme(){document.documentElement.dataset.theme=state.theme==='auto'?autoTheme():state.theme;const b=$('#theme');if(b){b.innerHTML=icon(themeIcon(state.theme));b.title=`${t('theme')}: ${t(state.theme)}`;b.setAttribute('aria-label',b.title);}}
function updateUrl(){const params=new URLSearchParams();params.set('objects',state.selected.join(','));if(state.quality!=='3d')params.set('quality',state.quality);history.replaceState(null,'','#'+params);}
function parseUrl(){const params=new URLSearchParams(location.hash.slice(1));if(params.has('objects'))state.selected=[...new Set(params.get('objects').split(','))].filter(id=>getObject(id)?.status==='ready');const requested=params.get('quality');state.quality=qualities.includes(requested)?requested:params.get('textures')==='0'?'vector':params.get('view')==='2d'?'textured':'3d';}
function render(){
 scene?.dispose();scene=null;
 $('#app').innerHTML=`<nav class="toolbar" aria-label="Sizes">${button(qualityLabel(),state.quality==='3d'?'cube':state.quality==='textured'?'image':'vector','id="quality"')}${button(t('encyclopedia'),'book','id="encyclopedia"')}${button(t('details'),'ruler','id="open-details"')}${button(t('theme'),'contrast','id="theme"')}${button(t('language'),'globe','id="language" aria-haspopup="menu" aria-expanded="false"')}${button(t('about'),'info','id="about"')}</nav><div id="language-menu" class="language-menu" role="menu" hidden></div>
 <main class="comparison"><div class="scene-scroll"><div id="stage" class="stage"><div class="scene-backdrop"></div><div id="vectors"></div><div id="labels"></div><button class="edge-add left" data-add="start" title="${esc(t('add'))}" aria-label="${esc(t('add'))}">${icon('plus')}</button><button class="edge-add right" data-add="end" id="add-object" title="${esc(t('add'))}" aria-label="${esc(t('add'))}">${icon('plus')}</button><a class="stage-credit" href="https://www.eso.org/public/images/eso0932a/" target="_blank" rel="noopener">ESO/S. Brunier · CC BY 4.0</a></div></div></main>
 <dialog id="modal"><div class="modal-head"><h2 id="modal-title"></h2><div id="modal-head-tools"></div>${button(t('close'),'x','id="close-modal"')}</div><div id="modal-body"></div></dialog><div id="toast" role="status"></div>`;
 // A single class attribute keeps the unboxed close control predictable.
 $('#close-modal').className='close-button';
 $('#quality').onclick=()=>{state.quality=nextQuality(state.quality);$('#quality').innerHTML=icon(state.quality==='3d'?'cube':state.quality==='textured'?'image':'vector');$('#quality').title=qualityLabel();$('#quality').setAttribute('aria-label',qualityLabel());changed();};
 $('#encyclopedia').onclick=()=>openEncyclopedia();$('#open-details').onclick=openDetails;
 $('#theme').onclick=()=>{state.theme=nextTheme(state.theme);savePrefs();applyTheme();};
 $('#language').onclick=toggleLanguage;
 $('#about').onclick=e=>e.altKey?openInternal():openAbout();
 $('#close-modal').onclick=closeDialog;
 $('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeDialog();});
 $('#modal').addEventListener('close',()=>{cleanupModal();scene&&(scene.visible=true);previousFocus?.isConnected&&previousFocus.focus();});
 for(const b of document.querySelectorAll('[data-add]'))b.onclick=()=>openPicker(null,b.dataset.add);
 $('#language').innerHTML=state.lang==='auto'?icon('globe'):flag(state.lang);
 resizeObserver?.disconnect();resizeObserver=new ResizeObserver(renderStage);resizeObserver.observe($('.scene-scroll'));
 tree=buildTaxonomy(state.catalog);applyTheme();renderStage();
}
function cutout(o,w,h,style=''){
 const bounds=o.visual.imageBounds;
 if(!bounds)return `<img class="flat-image" src="${asset(o,'image')}" alt="${esc(name(o))}" style="${style};width:${w}px;height:${h}px">`;
 return `<div class="image-crop" style="${style};width:${w}px;height:${h}px"><img src="${asset(o,'image')}" alt="${esc(name(o))}" style="left:${-bounds.x/bounds.width*100}%;top:${-bounds.y/bounds.height*100}%;width:${bounds.imageWidth/bounds.width*100}%;height:${bounds.imageHeight/bounds.height*100}%"></div>`;
}
async function renderStage(){
 const objects=selected(),scroll=$('.scene-scroll');if(!scroll)return;
 const height=Math.max(280,innerHeight),stage=$('#stage');currentLayout=layout(objects,scroll.clientWidth,height);
 stage.style.width=currentLayout.totalWidth+'px';stage.style.height=height+'px';
 const environments=new Set(objects.map(o=>o.environment||o.category));stage.dataset.environment=environments.size===1?[...environments][0]:'neutral';
 const settings=qualitySettings(state.quality),rendered=state.quality!=='vector'&&!sceneUnavailable;
 $('#vectors').innerHTML=objects.map(o=>{const i=currentLayout.items.find(i=>i.id===o.id);if(!i||Math.max(i.width,i.height)<.6)return '';const position=`left:${i.x-i.width/2}px;bottom:${currentLayout.baseline}px`;return state.quality!=='vector'&&o.visual.image?`<div class="vector-object ${rendered?'hidden':''}" style="${position}">${cutout(o,i.width,i.height)}</div>`:`<img class="vector-object ${rendered?'hidden':''}" src="${asset(o,'silhouette')}" alt="${esc(name(o))}" style="${position};width:${i.width}px;height:${i.height}px">`;}).join('');
 $('#labels').innerHTML=objects.map(o=>{const i=currentLayout.items.find(i=>i.id===o.id),tiny=Math.max(i.width,i.height)<1;return `<div class="object-label object-control" style="left:${i.x}px;bottom:${currentLayout.baseline-66}px;width:${Math.min(210,i.slot-8)}px"><div class="object-controls-row"><button class="object-select" data-replace="${o.id}" title="${esc(t('replace'))}: ${esc(name(o))}"><strong>${esc(name(o))}</strong>${icon('chevron')}</button>${button(t('remove'),'x',`data-remove="${o.id}"`)}</div><button class="object-measure" data-detail="${o.id}">${readable(extent(o))}${tiny?`<em>${t('tiny')}</em>`:''}</button>${tiny?'<i class="tiny-marker" aria-hidden="true"></i>':''}</div>`;}).join('');
 for(const b of document.querySelectorAll('[data-detail]'))b.onclick=()=>openEncyclopedia(b.dataset.detail);
 for(const b of document.querySelectorAll('[data-replace]'))b.onclick=()=>openPicker(b.dataset.replace);
 for(const b of document.querySelectorAll('[data-remove]'))b.onclick=()=>{state.selected=state.selected.filter(id=>id!==b.dataset.remove);changed();};
 const y=height-(currentLayout.baseline||height/2)+18;for(const b of document.querySelectorAll('.edge-add'))b.style.top=Math.min(height-40,Math.max(65,y))+'px';
 if(rendered&&objects.length){
  sceneModule||=import('./scene.js');const {ComparisonScene}=await sceneModule;if($('#stage')!==stage)return;
  if(!scene)scene=new ComparisonScene(stage,()=>{sceneUnavailable=true;scene?.dispose();scene=null;renderStage();});
  scene.update(objects,currentLayout,height,settings.mode,settings.textures,settings);
 }else{scene?.dispose();scene=null;}
}
function changed(){updateUrl();renderStage();}
function cleanupModal(){modalGeneration++;modalScene?.dispose();modalScene=null;modalResize?.disconnect();modalResize=null;pickerObserver?.disconnect();pickerObserver=null;}
function showDialog(title,body,{wide=false,kind='',tools=''}={}){
 cleanupModal();closeLanguage();const modal=$('#modal');if(!modal.open)previousFocus=document.activeElement;
 $('#modal-title').textContent=title;$('#modal-head-tools').innerHTML=tools;$('#modal-body').innerHTML=body;modal.className=[wide?'wide':'',kind].join(' ');if(!modal.open)modal.showModal();scene&&(scene.visible=false);
}
function closeDialog(){$('#modal').close();}
function closeLanguage(){const menu=$('#language-menu');if(menu)menu.hidden=true;$('#language')?.setAttribute('aria-expanded','false');}
function toggleLanguage(){
 const menu=$('#language-menu');if(!menu.hidden){closeLanguage();return;}
 menu.innerHTML=[['auto',t('auto')],...Object.entries(languages)].map(([code,label])=>`<button role="menuitemradio" aria-checked="${state.lang===code}" data-language="${code}"><span class="language-symbol">${code==='auto'?icon('globe'):flag(code)}</span><span>${esc(label)}</span>${state.lang===code?'<span class="language-check">✓</span>':''}</button>`).join('');menu.hidden=false;$('#language').setAttribute('aria-expanded','true');
 const anchor=$('#language').getBoundingClientRect();menu.style.right=Math.max(8,innerWidth-anchor.right)+'px';
 for(const b of menu.querySelectorAll('button'))b.onclick=()=>{state.lang=b.dataset.language;setLanguage(state.lang);savePrefs();render();};
 menu.querySelector('[aria-checked="true"]')?.focus();
}
addEventListener('pointerdown',e=>{if(!e.target.closest('#language-menu,#language'))closeLanguage();});

let expanded=new Set(),pickerNodes=[],pageSizes=new Map();
const objectMatches=(o,query)=>norm([name(o),...Object.values(o.names),o.id,o.family,o.parent,...o.tags].join(' ')).includes(query);
const allowedNode=node=>!state.category||descendantObjects(node).some(o=>o.category===state.category);
function openPicker(replace=null,insert='end'){
 state.replace=replace;state.insert=insert;state.query='';state.category=null;expanded=new Set();pageSizes=new Map();pickerNodes=tree;
 showDialog(replace?t('replace'):t('add'),`<div class="category-chips">${['space','life','micro','quantum','buildings','geography','objects'].map(c=>`<button class="chip" data-category="${c}">${t(categoryKey(c))}</button>`).join('')}</div><div id="catalog-results" class="catalog-results"></div>`,{wide:true,kind:'picker-dialog',tools:`<label class="compact-search">${icon('search')}<input id="object-search" type="search" placeholder="${state.catalog.length} · ${esc(t('searchShort'))}" aria-label="${esc(t('search'))}" autocomplete="off"></label>`});
 $('#object-search').oninput=e=>{state.query=e.target.value;renderPicker();};
 for(const b of document.querySelectorAll('[data-category]'))b.onclick=()=>{state.category=state.category===b.dataset.category?null:b.dataset.category;for(const chip of document.querySelectorAll('[data-category]'))chip.classList.toggle('active',chip.dataset.category===state.category);renderPicker();};
 renderPicker();$('#object-search').focus();
}
function nodeHtml(node){
 const o=node.kind==='object'?node.object:getObject(node.representative),chosen=o&&state.selected.includes(o.id)&&state.replace!==o.id;
 const label=nodeTitle(node),image=o?thumbnailSource(o,state.catalog):'';
 const expand=node.kind==='group'?`<button class="expand-family" data-expand="${node.key}" title="${esc(t('expand'))}: ${esc(label)}" aria-label="${esc(t('expand'))}: ${esc(label)}" aria-expanded="${expanded.has(node.key)}">${icon(expanded.has(node.key)?'minus':'plus')}</button>`:'';
 return `<section class="catalog-node ${node.kind==='group'?'family-node':''} ${expanded.has(node.key)?'expanded':''}" data-node="${node.key}"><div class="node-line"><button class="object-choice ${chosen?'chosen':''}" data-choice="${o?.id||''}" ${chosen?'disabled':''} title="${esc(o?name(o):label)}"><span class="object-thumb">${o?`<img src="${image}" data-thumbnail="${o.id}" alt="" loading="lazy">`:''}</span><span class="node-copy"><strong>${esc(label)}</strong>${node.kind==='object'?`<small>${o.status==='ready'?readable(extent(o)):t('pending')}</small>`:''}</span>${chosen?'<span class="chosen-mark">✓</span>':''}</button>${expand}</div>${node.kind==='group'?`<div class="branch-expansion" ${expanded.has(node.key)?'':'inert'}><div class="branch-clip"><div class="branch-body">${expanded.has(node.key)?branchHtml(node):''}</div></div></div>`:''}</section>`;
}
function branchHtml(node){const children=node.children.filter(allowedNode),limit=pageSizes.get(node.key)||30;return `<div class="node-grid">${children.slice(0,limit).map(nodeHtml).join('')}</div>${limit<children.length?`<div class="catalog-sentinel" data-page="${node.key}" aria-hidden="true"></div>`:''}`;}
function renderPicker(){
 pickerObserver?.disconnect();const query=norm(state.query),results=$('#catalog-results');if(!results)return;
 if(query){const objects=state.catalog.filter(o=>(!state.category||o.category===state.category)&&objectMatches(o,query));const limit=pageSizes.get('search')||48;results.innerHTML=objects.length?`<div class="node-grid">${objects.slice(0,limit).map(o=>nodeHtml({key:'search:'+o.id,kind:'object',object:o,representative:o.id})).join('')}</div>${limit<objects.length?'<div class="catalog-sentinel" data-page="search" aria-hidden="true"></div>':''}`:`<p class="no-results">${t('noResults')}</p>`;}
 else results.innerHTML=`<div class="node-grid root-grid">${pickerNodes.filter(allowedNode).map(nodeHtml).join('')}</div>`;
 bindPicker(results);fillThumbnails(results,state.catalog);
 pickerObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const key=e.target.dataset.page;pickerObserver.unobserve(e.target);pageSizes.set(key,(pageSizes.get(key)||(key==='search'?48:30))+48);const scroll=$('#modal-body').scrollTop;renderPicker();$('#modal-body').scrollTop=scroll;}},{root:$('#modal-body'),rootMargin:'120px'});
 for(const sentinel of results.querySelectorAll('.catalog-sentinel'))pickerObserver.observe(sentinel);
}
function bindPicker(root){
 for(const b of root.querySelectorAll('[data-choice]'))b.onclick=()=>choose(b.dataset.choice);
 for(const b of root.querySelectorAll('[data-expand]'))b.onclick=()=>{
  const key=b.dataset.expand,node=findNode(tree,key),section=b.closest('.catalog-node');if(!node)return;
  if(expanded.has(key)){expanded.delete(key);section.classList.remove('expanded');$('.branch-expansion',section).inert=true;b.innerHTML=icon('plus');b.setAttribute('aria-expanded','false');}
  else{expanded.add(key);const body=$('.branch-body',section);body.innerHTML=branchHtml(node);bindPicker(body);fillThumbnails(body,state.catalog);const expansion=$('.branch-expansion',section);expansion.inert=false;requestAnimationFrame(()=>section.classList.add('expanded'));b.innerHTML=icon('minus');b.setAttribute('aria-expanded','true');for(const sentinel of body.querySelectorAll('.catalog-sentinel'))pickerObserver?.observe(sentinel);}
 };
}
function choose(id){const o=getObject(id);if(!o)return;if(o.status!=='ready'){openEncyclopedia(id);return;}if(state.selected.includes(id)&&state.replace!==id)return;
 if(state.replace)state.selected=state.selected.map(old=>old===state.replace?id:old);else if(state.insert==='start')state.selected.unshift(id);else state.selected.push(id);closeDialog();changed();requestAnimationFrame(()=>{const i=currentLayout.items.find(i=>i.id===id);if(i&&$('.scene-scroll'))$('.scene-scroll').scrollLeft=Math.max(0,i.x-$('.scene-scroll').clientWidth/2);});
}

const basisLabels={
 'equatorial-diameter':['Diámetro ecuatorial','Equatorial diameter'],'mean-diameter':['Diámetro medio','Mean diameter'],'principal-axes':['Ejes principales','Principal axes'],'reference-height':['Altura de referencia','Reference height'],'representative-length':['Longitud representativa','Representative length'],'representative-height':['Altura representativa','Representative height'],'estimated-length':['Longitud estimada','Estimated length'],'representative-diameter':['Diámetro representativo','Representative diameter'],'architectural-height':['Altura arquitectónica','Architectural height'],'total-height':['Altura total','Total height'],'planned-height':['Altura proyectada','Planned height'],'overall-length':['Eslora total','Overall length'],'wingspan':['Envergadura','Wingspan'],'maximum-extent':['Extensión máxima','Maximum extent'],'reference-length':['Longitud de referencia','Reference length'],'equal-area-map-extent':['Extensión cartográfica en proyección equivalente','Equal-area projected extent'],'equivalent-area-square':['Cuadrado de superficie equivalente','Equivalent-area square'],'schwarzschild-diameter':['Diámetro de Schwarzschild','Schwarzschild diameter'],'comoving-diameter':['Diámetro comóvil observable','Observable comoving diameter'],'point-particle':['Sin diámetro físico definido','No defined physical diameter'],'charge-diameter':['Diámetro de carga','Charge diameter'],'twice-bohr-radius':['Dos veces el radio de Bohr','Twice the Bohr radius'],'covalent-diameter':['Diámetro covalente','Covalent diameter'],'predicted-covalent-diameter':['Diámetro covalente teórico','Predicted covalent diameter'],'helix-diameter':['Diámetro de la hélice','Helix diameter'],'reference-dna-segment':['Fragmento de ADN de 20 pares de bases','20-base-pair DNA segment'],'illustrative-length':['Longitud de un ejemplo','Example length'],'representative-extent':['Extensión representativa','Representative extent'],'stellar-disc-diameter':['Diámetro del disco estelar','Stellar disc diameter']
};
const basis=o=>basisLabels[o.basis]?.[['es','ca'].includes(language())?0:1]||o.basis;
const property=(key,field)=>key==='area'?`${new Intl.NumberFormat(language(),{maximumFractionDigits:2}).format(field.value/1e6)} km²`:esc(field.value+' '+field.unit);
function previewLayout(o,w,h){const d=o.dimensions,scale=Math.min((w-32)/(o.visual.rings?.outerDiameter||d.width),(h-20)/d.height);return {totalWidth:w,pixelsPerMeter:scale,baseline:(h-d.height*scale)/2,items:[{id:o.id,x:w/2,width:d.width*scale,height:d.height*scale,slot:w,visualWidth:(o.visual.rings?.outerDiameter||d.width)*scale}]};}
async function openEncyclopedia(id){
 const o=getObject(id)||selected()[0]||getObject('earth'),generation=modalGeneration+1;
 const ordered=[...selected(),...state.catalog.filter(a=>!state.selected.includes(a.id))];
 showDialog(`${familyName(o.family)} / ${name(o)}`,`<article class="entry"><div id="entry-view" class="entry-view"></div><p class="entry-summary">${esc(o.summary[language()]||o.summary.en||o.summary.es)}</p><dl class="entry-data"><dt>${t('definition')}</dt><dd>${esc(basis(o))}</dd><dt>${t('width')}</dt><dd>${readable(o.dimensions?.width)}</dd><dt>${t('height')}</dt><dd>${readable(o.dimensions?.height)}</dd>${o.dimensions?.depth?`<dt>${t('depth')}</dt><dd>${readable(o.dimensions.depth)}</dd>`:''}${Object.entries(o.properties||{}).map(([k,v])=>`<dt>${t(k)}</dt><dd>${property(k,v)}</dd>`).join('')}<dt>${t('source')}</dt><dd><a href="${esc(o.source)}" target="_blank" rel="noopener">${esc(new URL(o.source).hostname)} ↗</a></dd></dl></article>`,{kind:'encyclopedia-dialog',tools:`<label class="compact-search">${icon('search')}<input id="encyclopedia-search" type="search" placeholder="${esc(t('searchShort'))}" aria-label="${esc(t('search'))}"></label><select id="encyclopedia-select" aria-label="${t('encyclopedia')}">${ordered.map(a=>`<option value="${a.id}" ${a.id===o.id?'selected':''}>${esc(name(a))}</option>`).join('')}</select>`});
 $('#encyclopedia-select').onchange=e=>openEncyclopedia(e.target.value);
 $('#encyclopedia-search').oninput=e=>{const query=norm(e.target.value),matches=ordered.filter(a=>objectMatches(a,query));$('#encyclopedia-select').innerHTML=matches.map(a=>`<option value="${a.id}">${esc(name(a))}</option>`).join('');};
 $('#encyclopedia-search').onkeydown=e=>{if(e.key==='Enter'&&$('#encyclopedia-select').value)openEncyclopedia($('#encyclopedia-select').value);};
 const view=$('#entry-view');if(o.status!=='ready'){view.classList.add('hidden');return;}
 if(state.quality==='vector'||sceneUnavailable){const update=()=>{const i=previewLayout(o,view.clientWidth,view.clientHeight).items[0];view.innerHTML=state.quality!=='vector'&&o.visual.image?cutout(o,i.width,i.height):`<img src="${asset(o,'silhouette')}" alt="${esc(name(o))}" style="width:${i.width}px;height:${i.height}px;object-fit:fill">`;};modalResize=new ResizeObserver(update);modalResize.observe(view);update();return;}
 const {ComparisonScene}=await (sceneModule||=import('./scene.js'));if(modalGeneration!==generation||!view.isConnected)return;
 modalScene=new ComparisonScene(view,()=>{view.innerHTML=`<img src="${o.visual.image?asset(o,'image'):asset(o,'silhouette')}" alt="${esc(name(o))}" style="max-width:80%;max-height:90%;object-fit:contain">`;});
 const settings=qualitySettings(state.quality),update=()=>{if(!modalScene)return;const l=previewLayout(o,view.clientWidth,view.clientHeight);modalScene.update([o],l,view.clientHeight,settings.mode,settings.textures,settings);modalScene.copyOrientation(scene,o.id);};modalResize=new ResizeObserver(update);modalResize.observe(view);update();
}
function openDetails(){const objects=selected(),properties=['area','density'].filter(key=>objects.length>1&&objects.every(o=>o.properties?.[key]&&o.category===objects[0].category));showDialog(t('details'),`<div class="table-wrap"><table class="detail-table"><thead><tr><th>${t('name')}</th><th>${t('definition')}</th><th>${t('width')}</th><th>${t('height')}</th>${properties.map(p=>`<th>${t(p)}</th>`).join('')}</tr></thead><tbody>${objects.map(o=>`<tr><th>${esc(name(o))}</th><td>${esc(basis(o))}</td><td>${readable(o.dimensions.width)}</td><td>${readable(o.dimensions.height)}</td>${properties.map(p=>`<td>${property(p,o.properties[p])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,{wide:objects.length>3,kind:'details-dialog'});}
function openAbout(){
 showDialog('Sizes',`<div class="about-intro"><img src="./favicon.svg" alt="" width="48" height="48"><h3>${translated('Comparar para comprender.','Compare to understand.')}</h3></div><div class="about-layout"><dl class="project-facts"><div><dt>${translated('Autor','Author')}</dt><dd>Alejandro Pico</dd></div><div><dt>${translated('Propósito','Purpose')}</dt><dd>${translated('Exploración visual y divulgación','Visual exploration and education')}</dd></div><div><dt>${translated('Carácter','Character')}</dt><dd>${translated('Proyecto personal · abierto','Personal · open project')}</dd></div><div><dt>${translated('Edición','Edition')}</dt><dd>${packageInfo.version}</dd></div></dl><div class="about-copy"><p>${translated('Sizes convierte las medidas en una experiencia visual. Pon una persona junto a una ballena, compara la Tierra con la Luna o descubre cómo se relacionan las escalas más pequeñas con las más grandes.','Sizes turns measurements into a visual experience. Place a person next to a whale, compare Earth with the Moon, or discover how the smallest scales relate to the largest.')}</p><p>${translated('Elige, combina y explora. Cada comparación ofrece otra forma de mirar objetos familiares y de entender aquellos que nunca hemos tenido delante. La enciclopedia acompaña el recorrido con sus historias, medidas y referencias.','Choose, combine and explore. Each comparison offers another way to see familiar objects and understand those we have never encountered. The encyclopedia adds context, measurements and references.')}</p></div></div><nav class="about-links"><a href="https://alejandropico.github.io/Portfolio/" target="_blank" rel="noopener"><span>${translated('Autor','Author')}</span><strong>Alejandro Pico · Portfolio</strong>${icon('arrow')}</a><a href="https://github.com/AlejandroPico/Sizes" target="_blank" rel="noopener"><span>${translated('Proyecto','Project')}</span><strong>GitHub</strong>${icon('arrow')}</a></nav>`,{kind:'about-dialog'});
}

let inventoryFilter='all',inventoryCategory='',inventoryQuery='',inventoryOrigin='';
function internalTabs(){return '<div class="internal-tabs"><button id="inventory-tab" class="active">Inventario</button><button id="prompt-tab">Superprompt</button></div>';}
function openInternal(){showDialog('Sizes',`<div id="internal-content"></div>`,{wide:true,kind:'internal-dialog',tools:internalTabs()});$('#inventory-tab').onclick=renderInventory;$('#prompt-tab').onclick=renderPrompt;inventoryFilter='all';inventoryCategory='';inventoryOrigin='';inventoryQuery='';renderInventory();}
const audit=o=>o.audit||auditObject(o);
function inventoryObjects(){return state.catalog.filter(o=>{
 const a=audit(o),condition=inventoryFilter==='errors'?a.errors>0:inventoryFilter==='warnings'?a.warnings>0:inventoryFilter==='reviewed'?reviewed(o):inventoryFilter==='unreviewed'?!reviewed(o):inventoryFilter==='pending'?o.status!=='ready':inventoryFilter==='clean'?!a.errors&&!a.warnings:inventoryFilter==='image'?!o.visual.texture&&!o.visual.image&&!o.visual.glb:inventoryFilter==='model'?!o.visual.glb:true;
 return condition&&(!inventoryCategory||o.category===inventoryCategory)&&(!inventoryOrigin||o.source.includes(inventoryOrigin))&&norm(JSON.stringify(o)).includes(norm(inventoryQuery));
 });}
function renderInventory(){
 $('#inventory-tab').classList.add('active');$('#prompt-tab').classList.remove('active');const summary=auditSummary(state.catalog);
 $('#internal-content').innerHTML=`<div class="inventory-tools"><label class="compact-search">${icon('search')}<input type="search" id="inventory-search" value="${esc(inventoryQuery)}" placeholder="Buscar entre ${summary.total} registros" aria-label="Buscar en el inventario"></label><select id="inventory-filter" aria-label="Estado de los registros">${Object.entries({all:'Todos',errors:'Con fallos',warnings:'Con avisos',clean:'Sin incidencias',reviewed:'Revisados',unreviewed:'Sin revisar',pending:'Sin medidas',image:'Sin imagen realista',model:'Sin modelo 3D observado'}).map(([value,label])=>`<option value="${value}" ${inventoryFilter===value?'selected':''}>${label}</option>`).join('')}</select><div class="export-buttons">${['xlsx','csv','json','txt'].map(f=>`<button data-export="${f}" title="Descargar ${f.toUpperCase()}" aria-label="Descargar ${f.toUpperCase()}">${icon('download')}<span>${f.toUpperCase()}</span></button>`).join('')}<a href="./catalog.sqlite" download="Sizes.sqlite" title="Descargar SQLite">${icon('download')}<span>SQL</span></a></div></div><div class="audit-summary"><span><b>${summary.total}</b> registros</span><button data-summary="categories"><b>${Object.keys(summary.categories).length}</b> categorías</button><button data-summary="origins"><b>${Object.keys(summary.origins).length}</b> orígenes</button><button data-filter="errors" class="issue-error"><b>${summary.errors}</b> con fallos</button><button data-filter="warnings" class="issue-warning"><b>${summary.warnings}</b> con avisos</button><button data-filter="reviewed"><b>${summary.reviewed}</b> revisados</button><button data-summary="structure">Estructura</button></div><div id="audit-breakdown" hidden></div><div class="inventory-result-line" id="inventory-result-line"></div><div class="table-wrap inventory-table" id="inventory-table"></div>`;
 $('#inventory-search').oninput=e=>{inventoryQuery=e.target.value;updateInventory();};$('#inventory-filter').onchange=e=>{inventoryFilter=e.target.value;updateInventory();};
 for(const b of document.querySelectorAll('[data-filter]'))b.onclick=()=>{inventoryFilter=b.dataset.filter;$('#inventory-filter').value=inventoryFilter;updateInventory();};
 for(const b of document.querySelectorAll('[data-summary]'))b.onclick=()=>{
  const panel=$('#audit-breakdown'),key=b.dataset.summary;if(!panel.hidden&&panel.dataset.section===key){panel.hidden=true;return;}panel.hidden=false;panel.dataset.section=key;
  panel.innerHTML=key==='structure'?`<p>${summary.folders} carpetas · ${summary.resources} recursos comprobados · SQLite esquema 2. Las incidencias se calculan a partir de los registros y archivos del proyecto.</p>`:Object.entries(summary[key]).sort((a,b)=>b[1]-a[1]).map(([value,count])=>`<button data-breakdown="${value}">${esc(key==='categories'?t(categoryKey(value)):value)} <b>${count}</b></button>`).join('')+'<button data-breakdown="">Todos</button>';
  for(const item of panel.querySelectorAll('[data-breakdown]'))item.onclick=()=>{if(key==='categories')inventoryCategory=item.dataset.breakdown;else inventoryOrigin=item.dataset.breakdown;updateInventory();};
 };
 for(const b of document.querySelectorAll('[data-export]'))b.onclick=()=>exportInventory(b.dataset.export);
 updateInventory();
}
function updateInventory(){
 const objects=inventoryObjects();$('#inventory-result-line').textContent=`${objects.length} / ${state.catalog.length}${inventoryCategory?' · '+t(categoryKey(inventoryCategory)):''}${inventoryOrigin?' · '+inventoryOrigin:''}`;
 $('#inventory-table').innerHTML=`<table><thead><tr><th>Objeto</th><th>Medida</th><th>Representación</th><th>Revisión</th><th>Incidencias</th><th>Origen</th></tr></thead><tbody>${objects.map(o=>{const a=audit(o);return `<tr class="${a.errors?'has-errors':a.warnings?'has-warnings':''}" data-inventory-id="${o.id}"><th>${esc(name(o))}<small>${esc(o.id)} · ${esc(familyName(o.family))}</small></th><td>${readable(extent(o))}<small>${esc(basis(o))}</small></td><td>${esc(o.visual.glb?'Modelo 3D':o.visual.image?'Recorte realista':o.visual.texture?'Textura':'Esquema')}<small>${o.visual.glb||o.visual.image||o.visual.texture||o.visual.silhouette}</small></td><td>${reviewed(o)?'Revisado':'Sin revisar'}<small>${esc(o.review?.date||'')}</small></td><td><details class="issue-details"><summary><span class="issue-error">${a.errors} ${a.errors===1?'fallo':'fallos'}</span> · <span class="issue-warning">${a.warnings} ${a.warnings===1?'aviso':'avisos'}</span></summary><ul>${a.issues.map(i=>`<li class="issue-${i.severity}"><b>${esc(i.code)}</b>${esc(i.message)}</li>`).join('')}</ul></details></td><td><a href="${esc(o.source)}" target="_blank" rel="noopener">${esc(new URL(o.source).hostname)} ↗</a><small>${esc(o.sourceRetrieved||'')}</small></td></tr>`;}).join('')}</tbody></table>`;
}
function inventoryRows(objects){return objects.map(o=>({id:o.id,nombre:name(o),carpeta:o.folder,categoria:o.category,familia:o.family,estado:o.status,revision:o.reviewStatus||'initial',fecha_revision:o.review?.date||'',anchura_m:o.dimensions?.width??'',altura_m:o.dimensions?.height??'',profundidad_m:o.dimensions?.depth??'',definicion:o.basis,imagen:o.visual.image||o.visual.texture||'',modelo_3d:o.visual.glb||'',representacion:o.visual.fidelity,fallos:audit(o).errors,avisos:audit(o).warnings,incidencias:audit(o).issues.map(i=>`${i.code}: ${i.message}`).join('\n'),fuente:o.source,fecha_fuente:o.sourceRetrieved,etiquetas:o.tags.join(', ')}));}
async function exportInventory(format){const objects=inventoryObjects(),rows=inventoryRows(objects);
 if(format==='xlsx'){const {exportXlsx}=await import('./export.js');download(exportXlsx(rows),'Sizes-inventario.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}
 else if(format==='json')download(JSON.stringify({resumen:auditSummary(objects),registros:objects},null,2),'Sizes-inventario.json','application/json');
 else if(format==='txt')download(rows.map(row=>Object.entries(row).map(([key,value])=>key+': '+value).join('\n')).join('\n\n'),'Sizes-inventario.txt','text/plain');
 else{const quote=value=>'"'+String(value??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const headers=Object.keys(rows[0]||inventoryRows(state.catalog)[0]);download('\ufeff'+[headers.map(quote).join(';'),...rows.map(row=>headers.map(h=>quote(row[h])).join(';'))].join('\r\n'),'Sizes-inventario.csv','text/csv');}
}
function markdown(text){return text.split(/\n\s*\n/).map(block=>{if(/^#{1,6} /.test(block)){const level=block.match(/^#+/)[0].length;return `<h${level}>${esc(block.replace(/^#+ /,''))}</h${level}>`;}return `<p>${esc(block).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replaceAll('\n','<br>')}</p>`;}).join('');}
async function renderPrompt(){
 $('#inventory-tab').classList.remove('active');$('#prompt-tab').classList.add('active');$('#internal-content').innerHTML=`<div class="prompt-actions"><a href="./AGENTS.md" download="AGENTS.md" title="Descargar AGENTS.md">${icon('download')}AGENTS.md</a></div><article class="prompt-content">${t('loading')}</article>`;
 const response=await fetch(new URL('AGENTS.md',new URL(import.meta.env.BASE_URL,location.href)));const text=response.ok?await response.text():'No se ha podido cargar AGENTS.md.';if($('.prompt-content'))$('.prompt-content').innerHTML=markdown(text);
}
function download(content,filename,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
addEventListener('hashchange',()=>{parseUrl();changed();});
addEventListener('keydown',e=>{if(e.key==='Escape')closeLanguage();if(e.altKey&&e.key.toLowerCase()==='i'){e.preventDefault();openInternal();}else if(!$('#modal')?.open&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)&&e.key.toLowerCase()==='e')openEncyclopedia();});
setInterval(()=>{if(state.theme==='auto')applyTheme();},60000);
async function start(){try{state.catalog=await loadCatalog();parseUrl();render();updateUrl();}catch(error){$('#app').innerHTML=`<div class="load-error"><p>${t('failed')}</p><button class="primary" id="retry">${t('retry')}</button></div>`;$('#retry').onclick=()=>location.reload();console.error(error);}}
start();
