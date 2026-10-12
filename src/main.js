import './styles.css';
import { loadCatalog,asset } from './catalog.js';
import { t,setLanguage,language,name,languages,categoryKey,familyLabel } from './i18n.js';
import { layout,extent,formatLength,formatRatio,autoTheme } from './scale.js';
import { icon } from './icons.js';

const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const prefs=(()=>{try{return JSON.parse(localStorage.getItem('sizes.preferences'))||{};}catch{return {};}})();
const state={catalog:[],selected:['earth','moon'],mode:'2d',textures:true,lang:prefs.lang||'auto',theme:prefs.theme||'auto',onlyReady:true,includeTheoretical:true,category:'all',family:'all',featured:true,query:'',sort:'smallest',replace:null};
setLanguage(state.lang);
let scene,sceneModule,sceneUnavailable=false,currentLayout,resizeObserver;
const selected=()=>state.selected.map(id=>state.catalog.find(o=>o.id===id)).filter(Boolean);
const readable=m=>formatLength(m,language());
const btn=(key,ic,attrs='')=>`<button class="icon-btn" title="${esc(t(key))}" aria-label="${esc(t(key))}" ${attrs}>${icon(ic)}</button>`;
const categoryList=['space','life','micro','quantum','buildings','geography','objects'];
function savePrefs(){try{localStorage.setItem('sizes.preferences',JSON.stringify({theme:state.theme,lang:state.lang}));}catch{}}
function applyTheme(){document.documentElement.dataset.theme=state.theme==='auto'?autoTheme():state.theme;}
function updateUrl(){const params=new URLSearchParams();params.set('objects',state.selected.join(','));if(state.mode==='3d')params.set('view','3d');if(!state.textures)params.set('textures','0');history.replaceState(null,'','#'+params);}
function parseUrl(){const params=new URLSearchParams(location.hash.slice(1));if(params.has('objects'))state.selected=[...new Set(params.get('objects').split(','))].filter(id=>state.catalog.some(o=>o.id===id&&o.status==='ready'));state.mode=params.get('view')==='3d'?'3d':'2d';state.textures=params.get('textures')!=='0';}
function render(){
 applyTheme();
 $('#app').innerHTML=`<nav class="toolbar" aria-label="Sizes">${btn('add','plus','id="add-object"')}${btn('three','cube',`id="three" aria-pressed="${state.mode==='3d'}"`)}${btn('textures','image',`id="textures" aria-pressed="${state.textures}"`)}${btn('encyclopedia','book','id="encyclopedia"')}${btn('details','ruler','id="open-details"')}${btn('filters','filters','id="filters"')}${btn('theme','sun','id="theme"')}${btn('language','globe','id="language"')}${btn('about','info','id="about"')}</nav>
 <main class="comparison"><div class="scene-scroll"><div id="stage" class="stage"><div class="scene-backdrop"></div><div id="vectors"></div><div id="labels"></div><a class="stage-credit" href="https://www.eso.org/public/images/eso0932a/" target="_blank" rel="noopener">ESO/S. Brunier · CC BY 4.0</a></div></div></main>
 <dialog id="modal"><div class="modal-head"><h2 id="modal-title"></h2>${btn('close','x','id="close-modal"')}</div><div id="modal-body"></div></dialog><div id="toast" role="status"></div>`;
 scene?.dispose();scene=null;
 $('#add-object').onclick=()=>openPicker();$('#encyclopedia').onclick=()=>openEncyclopedia();$('#open-details').onclick=openDetails;$('#filters').onclick=()=>openFilters();$('#theme').onclick=()=>openSettings('theme');$('#language').onclick=()=>openSettings('language');
 $('#about').onclick=e=>e.altKey?openInternal():openAbout();
 $('#three').onclick=()=>changeView(state.mode==='2d'?'3d':'2d');$('#three').classList.toggle('active',state.mode==='3d');
 $('#textures').classList.toggle('active',state.textures);$('#textures').onclick=()=>{state.textures=!state.textures;renderStage();$('#textures').setAttribute('aria-pressed',state.textures);$('#textures').classList.toggle('active',state.textures);updateUrl();};
 $('#close-modal').onclick=closeDialog;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeDialog();});
 $('#modal').addEventListener('close',()=>{modalScene?.dispose();modalScene=null;modalResize?.disconnect();modalResize=null;scene&&(scene.visible=true);});
 resizeObserver?.disconnect();resizeObserver=new ResizeObserver(()=>renderStage());resizeObserver.observe($('.scene-scroll'));
 renderStage();
}
async function renderStage(){
 const objects=selected();const scroll=$('.scene-scroll');if(!scroll)return;
 const height=Math.max(300,innerHeight);
 currentLayout=layout(objects,scroll.clientWidth,height);
 const stage=$('#stage');stage.style.width=currentLayout.totalWidth+'px';stage.style.height=height+'px';
 const categories=new Set(objects.map(o=>o.environment||o.category));stage.dataset.environment=categories.size===1?[...categories][0]:'neutral';
 const rendered=state.textures&&!sceneUnavailable||state.mode==='3d'&&!sceneUnavailable;
 $('#vectors').innerHTML=objects.map(o=>{const i=currentLayout.items.find(i=>i.id===o.id);if(!i||i.width<.6&&i.height<.6)return '';return `<img class="vector-object ${rendered?'hidden':''}" src="${asset(o,'silhouette')}" alt="${esc(name(o))}" style="left:${i.x-i.width/2}px;bottom:${currentLayout.baseline}px;width:${i.width}px;height:${i.height}px">`;}).join('');
 $('#labels').innerHTML=objects.map(o=>{const i=currentLayout.items.find(i=>i.id===o.id);const tiny=Math.max(i.width,i.height)<1;return `<div class="object-label object-control" style="left:${i.x}px;bottom:${currentLayout.baseline-66}px"><div class="object-controls-row"><button class="object-select" data-replace="${o.id}" title="${esc(t('replace'))}: ${esc(name(o))}"><strong>${esc(name(o))}</strong>${icon('chevron')}</button>${btn('remove','x',`data-remove="${o.id}"`)}</div><button class="object-measure" data-detail="${o.id}">${readable(extent(o))}${tiny?`<em>${t('tiny')}</em>`:''}</button>${tiny?'<i class="tiny-marker" aria-hidden="true"></i>':''}</div>`;}).join('');
 for(const b of document.querySelectorAll('[data-detail]'))b.onclick=()=>openEncyclopedia(b.dataset.detail);
 for(const b of document.querySelectorAll('[data-replace]'))b.onclick=()=>openPicker(b.dataset.replace);
 for(const b of document.querySelectorAll('[data-remove]'))b.onclick=()=>{state.selected=state.selected.filter(id=>id!==b.dataset.remove);changed();};
 if(rendered&&objects.length){
  if(!sceneModule)sceneModule=import('./scene.js');
  const {ComparisonScene}=await sceneModule;
  if(!$('#stage')||$('#stage')!==stage)return;
  if(!scene)scene=new ComparisonScene(stage,()=>{sceneUnavailable=true;scene?.dispose();scene=null;renderStage();});
  scene.update(objects,currentLayout,height,state.mode,state.textures);
 }else{scene?.dispose();scene=null;}
}
function changed(){updateUrl();renderStage();}
function changeView(mode){state.mode=mode;$('#three').classList.toggle('active',mode==='3d');$('#three').setAttribute('aria-pressed',mode==='3d');$('#three').title=mode==='3d'?t('flat'):t('three');updateUrl();renderStage();}
let modalScene=null,modalResize=null,previousFocus;
function showDialog(title,body,eyebrow='Sizes',wide=false){
 modalScene?.dispose();modalScene=null;modalResize?.disconnect();modalResize=null;
 const modal=$('#modal');previousFocus=document.activeElement;$('#modal-title').textContent=title;$('#modal-body').innerHTML=body;modal.classList.toggle('wide',wide);if(!modal.open)modal.showModal();scene&&(scene.visible=false);
}
function closeDialog(){$('#modal').close();previousFocus?.focus();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('shown');setTimeout(()=>$('#toast')?.classList.remove('shown'),2500);}
const groupNames={
 planets:{es:'Planetas',en:'Planets'},moons:{es:'Lunas',en:'Moons'},'dwarf-planets':{es:'Planetas enanos',en:'Dwarf planets'},stars:{es:'Estrellas',en:'Stars'},asteroids:{es:'Asteroides',en:'Asteroids'},'black-holes':{es:'Agujeros negros',en:'Black holes'},galaxies:{es:'Galaxias',en:'Galaxies'},cosmos:{es:'Cosmos',en:'Cosmos'},mammals:{es:'Mamíferos',en:'Mammals'},humans:{es:'Personas',en:'People'},whales:{es:'Ballenas',en:'Whales'},dogs:{es:'Perros',en:'Dogs'},fish:{es:'Peces',en:'Fish'},extinct:{es:'Extintos',en:'Extinct animals'},insects:{es:'Insectos',en:'Insects'},invertebrates:{es:'Invertebrados',en:'Invertebrates'},viruses:{es:'Virus',en:'Viruses'},bacteria:{es:'Bacterias',en:'Bacteria'},cells:{es:'Células',en:'Cells'},reference:{es:'Referencias',en:'References'},particles:{es:'Partículas',en:'Particles'},atoms:{es:'Átomos',en:'Atoms'},molecules:{es:'Moléculas',en:'Molecules'},technology:{es:'Tecnología',en:'Technology'},ships:{es:'Barcos',en:'Ships'},aircraft:{es:'Aviones',en:'Aircraft'},spacecraft:{es:'Naves espaciales',en:'Spacecraft'},skyscrapers:{es:'Rascacielos',en:'Skyscrapers'},towers:{es:'Torres',en:'Towers'},landmarks:{es:'Monumentos',en:'Landmarks'},countries:{es:'Países y territorios',en:'Countries and territories'},cities:{es:'Ciudades',en:'Cities'}
};
const familyName=f=>groupNames[f]?.[language()]||groupNames[f]?.en||f;
function filterObjects(){
 const query=norm(state.query);
 return state.catalog.filter(o=>
  (!state.onlyReady||o.status==='ready')&&(state.includeTheoretical||o.measurementStatus!=='theoretical')&&
  (state.category==='all'||o.category===state.category)&&(state.family==='all'||o.family===state.family||o.parent===state.family)&&
  (!state.featured||query||o.featured)&&(!query||norm([...Object.values(o.names),o.id,o.family,o.parent,...o.tags].join(' ')).includes(query))
 ).sort((a,b)=>state.sort==='name'?name(a).localeCompare(name(b),language()):state.sort==='largest'?(extent(b)||-1)-(extent(a)||-1):(extent(a)||Infinity)-(extent(b)||Infinity));
}
function openPicker(replace=null){
 state.replace=replace;state.query='';state.category='all';state.family='all';state.featured=true;
 showDialog(replace?t('replace'):t('add'),`<div class="search-field">${icon('search')}<input id="object-search" placeholder="${esc(t('search'))}" aria-label="${esc(t('search'))}" autocomplete="off"></div><div class="category-chips" id="category-chips"></div><div class="catalog-options"><button id="expand-catalog" class="text-button">${t('all')} ${icon('arrow')}</button><label>${t('sort')} <select id="catalog-sort"><option value="smallest">${t('smallest')}</option><option value="largest">${t('largest')}</option><option value="name">${t('name')}</option></select></label></div><div id="family-chips" class="family-chips"></div><div id="catalog-results" class="catalog-results"></div>`,t('catalog'),true);
 $('#object-search').oninput=e=>{state.query=e.target.value;renderCatalogResults();};
 $('#catalog-sort').value=state.sort;$('#catalog-sort').onchange=e=>{state.sort=e.target.value;renderCatalogResults();};
 $('#expand-catalog').onclick=()=>{state.featured=!state.featured;renderCatalogResults();};
 renderCategoryChips();renderCatalogResults();$('#object-search').focus();
}
function renderCategoryChips(){
 $('#category-chips').innerHTML=['all',...categoryList].map(c=>`<button data-category="${c}" class="chip ${state.category===c?'active':''}">${t(c==='all'?'all':categoryKey(c))}</button>`).join('');
 for(const b of $('#category-chips').querySelectorAll('button'))b.onclick=()=>{state.category=b.dataset.category;state.family='all';renderCategoryChips();renderCatalogResults();};
}
function renderCatalogResults(){
 const filtered=filterObjects();const families=[...new Set(state.catalog.filter(o=>state.category==='all'||o.category===state.category).map(o=>o.family))];
 $('#family-chips').innerHTML=state.category==='all'?'':families.map(f=>`<button class="chip ${state.family===f?'active':''}" data-family="${f}">${esc(familyName(f))}</button>`).join('')+(state.category==='space'?['earth','mars','jupiter','saturn','uranus','neptune','pluto'].map(id=>`<button class="chip ${state.family===id?'active':''}" data-family="${id}">${t('space')} · ${esc(name(state.catalog.find(o=>o.id===id)))}</button>`).join(''):'');
 for(const b of $('#family-chips').querySelectorAll('button'))b.onclick=()=>{state.family=state.family===b.dataset.family?'all':b.dataset.family;state.featured=false;renderCatalogResults();};
 $('#expand-catalog').innerHTML=`${t(state.featured?'all':'featured')} ${icon('arrow')}`;
 const results=$('#catalog-results');results.innerHTML=filtered.length?`<p class="results-count">${filtered.length} ${t('objects')}</p><div class="object-grid"></div><button class="text-button load-more hidden">+ ${t('all')}</button>`:`<p class="no-results">${t('noResults')}</p>`;
 if(!filtered.length)return;
 let shown=0;
 const append=()=>{
  const batch=filtered.slice(shown,shown+60);shown+=batch.length;
  $('.object-grid',results).insertAdjacentHTML('beforeend',batch.map(o=>{const chosen=state.selected.includes(o.id)&&state.replace!==o.id;const unavailable=o.status!=='ready'||chosen;
   return `<button class="object-choice ${unavailable?'unavailable':''}" data-choice="${o.id}" ${unavailable?'disabled':''}><span class="object-thumb"><img src="${asset(o,'silhouette')}" alt="" loading="lazy"></span><span><strong>${esc(name(o))}</strong><small>${esc(familyName(o.family))}</small><em>${o.status==='ready'?readable(extent(o)):t('pending')}${chosen?' · '+t('selected'):''}</em></span><span class="choice-plus">${chosen?'✓':icon('plus')}</span></button>`;
  }).join(''));
  $('.load-more',results).classList.toggle('hidden',shown>=filtered.length);
  for(const b of results.querySelectorAll('[data-choice]'))b.onclick=()=>choose(b.dataset.choice);
 };
 $('.load-more',results).onclick=append;append();
}
function choose(id){if(state.replace)state.selected=state.selected.map(old=>old===state.replace?id:old);else state.selected.push(id);closeDialog();changed();}
function openFilters(){
 showDialog(t('filters'),`<div class="settings-list"><label class="check-row"><span>${t('availableOnly')}</span><input type="checkbox" id="only-ready" ${state.onlyReady?'checked':''}></label><label class="check-row"><span>${t('theoretical')}</span><input type="checkbox" id="theoretical" ${state.includeTheoretical?'checked':''}></label><p class="muted">${t('catalog')}: ${state.catalog.length} · ${t('ready')}: ${state.catalog.filter(o=>o.status==='ready').length} · ${t('pending')}: ${state.catalog.filter(o=>o.status!=='ready').length}</p><button class="primary" id="filter-browse">${t('catalog')} ${icon('arrow')}</button></div>`);
 $('#only-ready').onchange=e=>{state.onlyReady=e.target.checked;};$('#theoretical').onchange=e=>{state.includeTheoretical=e.target.checked;};$('#filter-browse').onclick=()=>openPicker();
}
function openSettings(type){
 const options=type==='theme'?{auto:t('auto'),morning:t('morning'),afternoon:t('afternoon'),night:t('night')}:{auto:t('auto'),...languages};
 showDialog(t(type),`<div class="settings-list">${Object.entries(options).map(([key,label])=>`<button class="setting-choice ${state[type==='language'?'lang':'theme']===key?'active':''}" data-setting="${key}"><span>${esc(label)}</span><span>${state[type==='language'?'lang':'theme']===key?'✓':''}</span></button>`).join('')}</div>`);
 for(const b of document.querySelectorAll('[data-setting]'))b.onclick=()=>{state[type==='language'?'lang':'theme']=b.dataset.setting;savePrefs();if(type==='language'){setLanguage(state.lang);closeDialog();render();}else{applyTheme();openSettings(type);}};
}
const basisLabels={
 'equatorial-diameter':['Diámetro ecuatorial','Equatorial diameter'],'mean-diameter':['Diámetro medio','Mean diameter'],'principal-axes':['Ejes principales','Principal axes'], 'reference-height':['Altura de referencia','Reference height'],'representative-length':['Longitud representativa','Representative length'],'representative-height':['Altura representativa','Representative height'],'estimated-length':['Longitud estimada','Estimated length'],'representative-diameter':['Diámetro representativo','Representative diameter'],'architectural-height':['Altura arquitectónica','Architectural height'],'total-height':['Altura total','Total height'],'planned-height':['Altura proyectada','Planned height'],'overall-length':['Eslora total','Overall length'],'wingspan':['Envergadura','Wingspan'],'maximum-extent':['Extensión máxima','Maximum extent'],'reference-length':['Longitud de referencia','Reference length'],'equal-area-map-extent':['Extensión de proyección equivalente','Equal-area projected extent'],'equivalent-area-square':['Cuadrado de superficie equivalente','Equivalent-area square'],'schwarzschild-diameter':['Diámetro de Schwarzschild, modelo sin giro','Schwarzschild diameter, nonrotating model'],'comoving-diameter':['Diámetro comóvil observable','Observable comoving diameter'],'point-particle':['Partícula puntual sin tamaño medido','Point particle, no measured size'],'charge-diameter':['Dos veces el radio de carga','Twice the charge radius'],'twice-bohr-radius':['Dos veces el radio de Bohr','Twice the Bohr radius'],'covalent-diameter':['Dos veces el radio covalente','Twice the covalent radius'],'predicted-covalent-diameter':['Diámetro covalente teórico','Predicted covalent diameter'],'helix-diameter':['Diámetro de la hélice','Helix diameter'],'illustrative-length':['Longitud de un ejemplo, no nodo comercial','Example length, not a marketing node'],'representative-extent':['Extensión representativa','Representative extent'],'stellar-disc-diameter':['Diámetro aproximado del disco estelar','Approximate stellar disc diameter']
};
const basis=o=>basisLabels[o.basis]?.[language()==='es'?0:1]||o.basis;
const visualDescription=o=>t(({illustrative:'illustration','observed-texture':'observed','partial-map':'partial',cartographic:'cartographic',reconstructed:'three'})[o.visual.fidelity]||'illustration');
function openEncyclopedia(id){
 const objects=selected();const allOptions=[...objects,...state.catalog.filter(o=>!state.selected.includes(o.id))];
 const o=state.catalog.find(o=>o.id===id)||objects[0]||state.catalog.find(o=>o.id==='earth');
 const original=!!o.summary[language()];
 const summary=o.summary[language()]||o.summary.en||o.summary.es;
 showDialog(t('encyclopedia'),`<div class="encyclopedia-controls"><input id="encyclopedia-search" type="search" placeholder="${esc(t('search'))}" aria-label="${esc(t('search'))}"><select id="encyclopedia-select" aria-label="${t('encyclopedia')}">${allOptions.map(a=>`<option value="${a.id}" ${a.id===o.id?'selected':''}>${esc(name(a))}</option>`).join('')}</select></div><article class="entry"><div class="entry-heading"><div><p class="eyebrow">${esc(familyName(o.family))}</p><h3>${esc(name(o))}</h3></div><span class="badge">${t(o.status==='ready'?'ready':'pending')}</span></div><div id="entry-view" class="entry-view"><img src="${asset(o,'silhouette')}" alt="${esc(name(o))}"></div><div class="entry-view-controls"><span>${visualDescription(o)}</span>${o.status==='ready'?`<button class="text-button" id="entry-three">${icon('cube')}3D</button>`:''}</div>${!original?`<span class="original-label">${t('original')}</span>`:''}<p>${esc(summary)}</p><dl><dt>${t('definition')}</dt><dd>${esc(basis(o))}</dd><dt>${t('measurement')}</dt><dd>${esc(o.measurementStatus)}</dd><dt>${t('width')}</dt><dd>${readable(o.dimensions?.width)}</dd><dt>${t('height')}</dt><dd>${readable(o.dimensions?.height)}</dd><dt>${t('depth')}</dt><dd>${readable(o.dimensions?.depth)}</dd>${Object.entries(o.properties||{}).map(([k,v])=>`<dt>${t(k)}</dt><dd>${k==='area'?`${new Intl.NumberFormat(language(),{maximumFractionDigits:2}).format(v.value/1e6)} km²`:esc(v.value+' '+v.unit)}</dd>`).join('')}<dt>${t('source')}</dt><dd><a href="${esc(o.source)}" target="_blank" rel="noopener">${esc(new URL(o.source).hostname)} ↗</a> · ${esc(o.sourceRetrieved)}</dd></dl>${o.status==='ready'&&!state.selected.includes(o.id)?`<button class="primary" id="entry-add">${icon('plus')}${t('add')}</button>`:''}</article>`,t('selected'));
 $('#encyclopedia-select').onchange=e=>openEncyclopedia(e.target.value);
 $('#encyclopedia-search').oninput=e=>{const query=norm(e.target.value);for(const option of $('#encyclopedia-select').options)option.hidden=!norm(option.textContent).includes(query);const first=[...$('#encyclopedia-select').options].find(option=>!option.hidden);if(first)$('#encyclopedia-select').value=first.value;};
 $('#entry-add')?.addEventListener('click',()=>{state.replace=null;choose(o.id);});
 $('#entry-three')?.addEventListener('click',async()=>{
  const view=$('#entry-view');if(modalScene){modalScene.dispose();modalScene=null;modalResize?.disconnect();view.innerHTML=`<img src="${asset(o,'silhouette')}" alt="${esc(name(o))}">`;return;}
  const {ComparisonScene}=await import('./scene.js');view.innerHTML='';modalScene=new ComparisonScene(view,()=>{view.innerHTML=`<img src="${asset(o,'silhouette')}" alt="${esc(name(o))}">`;});
  const update=()=>modalScene?.update([o],layout([o],view.clientWidth,270),270,'3d',true);modalResize=new ResizeObserver(update);modalResize.observe(view);update();
 });
}
function openDetails(){
 const objects=selected();const properties=['area','density'].filter(key=>objects.length>1&&objects.every(o=>o.properties?.[key]&&o.category===objects[0].category));
 showDialog(t('details'),`<div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('definition')}</th><th>${t('width')}</th><th>${t('height')}</th>${properties.map(p=>`<th>${t(p)}</th>`).join('')}</tr></thead><tbody>${objects.map(o=>`<tr><th>${esc(name(o))}</th><td>${esc(basis(o))}</td><td>${readable(o.dimensions.width)}</td><td>${readable(o.dimensions.height)}</td>${properties.map(p=>`<td>${p==='area'?new Intl.NumberFormat(language(),{maximumFractionDigits:1}).format(o.properties[p].value/1e6)+' km²':esc(o.properties[p].value+' '+o.properties[p].unit)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">${t('notes')}: ${language()==='es'?'Cada objeto mantiene su definición de medida. Las razones de tamaño comparan la mayor dimensión declarada; no implican cocientes de volumen o de masa.':'Each object keeps its own measurement definition. Size ratios compare the largest declared dimension; they do not imply volume or mass ratios.'}</p>`,'Sizes',true);
}
function openAbout(){
 const spanish=language()==='es'||language()==='ca';
 showDialog(t('about'),`<div class="about-logo"><img src="./favicon.svg" alt="" width="64" height="64"><h3>sizes.</h3></div><p>${spanish?'Una forma de entender cómo encaja todo en el universo. Compara cuerpos celestes, seres vivos, edificios, territorios y escalas microscópicas sobre una misma medida.':'A way to understand how everything fits into the universe. Compare celestial bodies, living things, buildings, territories and microscopic scales using a shared measure.'}</p><p>${spanish?'Los objetos se colocan consecutivamente, sin reproducir distancias entre ellos. Las texturas, ilustraciones y modelos indican su procedencia y sus límites en la enciclopedia.':'Objects are placed consecutively, without reproducing distances between them. Textures, illustrations and models state their provenance and limitations in the encyclopedia.'}</p><p class="muted">${spanish?'Primera edición · catálogo ampliable · SQLite local · sin cuentas ni servicios de datos externos.':'First edition · expandable catalog · local SQLite · no accounts or external data services.'}</p><div class="about-links"><a href="https://alejandropico.github.io/Portfolio/" target="_blank" rel="noopener">Alejandro Pico · Portfolio ↗</a><a href="https://github.com/AlejandroPico/Sizes" target="_blank" rel="noopener">GitHub ↗</a></div>`);
}
function openInternal(){
 showDialog('Sizes · '+t('inventory'),`<div class="internal-tabs"><button class="chip active" id="inventory-tab">${t('inventory')}</button><button class="chip" id="prompt-tab">${t('superprompt')}</button></div><div id="internal-content"></div>`,'',true);
 $('#inventory-tab').onclick=renderInventory;$('#prompt-tab').onclick=renderPrompt;renderInventory();
}
function inventoryRows(objects){return objects.map(o=>({id:o.id,name:name(o),folder:o.folder,category:o.category,family:o.family,parent:o.parent||'',status:o.status,review_status:o.reviewStatus||'initial',environment:o.environment||'',width_m:o.dimensions?.width??'',height_m:o.dimensions?.height??'',depth_m:o.dimensions?.depth??'',basis:o.basis,measurement_status:o.measurementStatus,visual_fidelity:o.visual.fidelity,texture:o.visual.texture||'',model:o.visual.glb||o.visual.model||'',tags:o.tags.join(', '),source:o.source,source_retrieved:o.sourceRetrieved}));}
function renderInventory(){
 $('#inventory-tab').classList.add('active');$('#prompt-tab').classList.remove('active');
 $('#internal-content').innerHTML=`<p class="muted">${state.catalog.length} ${t('allEntries')} · ${state.catalog.filter(o=>o.status==='pending').length} ${t('pending')}</p><div class="inventory-tools"><input type="search" id="inventory-search" placeholder="${esc(t('search'))}" aria-label="${esc(t('search'))}"><select id="inventory-status" aria-label="${t('status')}"><option value="all">${t('allEntries')}</option><option value="ready">${t('ready')}</option><option value="pending">${t('pending')}</option></select></div><div class="export-buttons">${['xlsx','csv','json','txt'].map(f=>`<button class="chip" data-export="${f}">${icon('download')}${f.toUpperCase()}</button>`).join('')}<a class="chip" href="./catalog.sqlite" download="Sizes.sqlite">SQLite</a></div><div class="table-wrap inventory-table" id="inventory-table"></div>`;
 const filtered=()=>state.catalog.filter(o=>($('#inventory-status').value==='all'||o.status===$('#inventory-status').value)&&norm(JSON.stringify(o)).includes(norm($('#inventory-search').value)));
 const update=()=>{const objects=filtered();$('#inventory-table').innerHTML=`<table><thead><tr><th>ID</th><th>${t('name')}</th><th>${t('family')}</th><th>${t('status')}</th><th>${t('measurement')}</th><th>${t('representation')}</th><th>${t('source')}</th></tr></thead><tbody>${objects.map(o=>`<tr><td>${esc(o.id)}</td><td>${esc(name(o))}</td><td>${esc(o.family)}</td><td>${esc(o.status)}</td><td>${readable(extent(o))}<br>${esc(o.basis)}</td><td>${esc(o.visual.fidelity)}<br>${esc(o.visual.glb||o.visual.model||'2D')}</td><td><a href="${esc(o.source)}" target="_blank" rel="noopener">${esc(new URL(o.source).hostname)}</a></td></tr>`).join('')}</tbody></table>`;};
 $('#inventory-search').oninput=update;$('#inventory-status').onchange=update;update();
 for(const b of document.querySelectorAll('[data-export]'))b.onclick=async()=>{
  const rows=inventoryRows(filtered()),format=b.dataset.export;
  if(format==='xlsx'){const {exportXlsx}=await import('./export.js');download(exportXlsx(rows),'Sizes-inventory.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');return;}
  if(format==='json')download(JSON.stringify(filtered(),null,2),'Sizes-inventory.json','application/json');
  else if(format==='txt')download(rows.map(r=>Object.entries(r).map(([k,v])=>k+': '+v).join('\n')).join('\n\n'),'Sizes-inventory.txt','text/plain');
  else {const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';download('\ufeff'+[Object.keys(rows[0]||inventoryRows(state.catalog)[0]).map(quote).join(';'),...rows.map(r=>Object.values(r).map(quote).join(';'))].join('\r\n'),'Sizes-inventory.csv','text/csv');}
 };
}
async function renderPrompt(){
 $('#inventory-tab').classList.remove('active');$('#prompt-tab').classList.add('active');
 $('#internal-content').innerHTML=`<div class="prompt-toolbar"><a class="chip" href="./AGENTS.md" download="AGENTS.md">${icon('download')}AGENTS.md</a></div><pre class="prompt-content">${t('loading')}</pre>`;
 const response=await fetch(new URL('AGENTS.md',new URL(import.meta.env.BASE_URL,location.href)));const text=response.ok?await response.text():'AGENTS.md unavailable';if($('.prompt-content'))$('.prompt-content').textContent=text;
}
function download(content,filename,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
addEventListener('hashchange',()=>{parseUrl();changed();});
addEventListener('keydown',e=>{if(e.altKey&&e.key.toLowerCase()==='i'){e.preventDefault();openInternal();}else if(!$('#modal')?.open&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)&&e.key.toLowerCase()==='e')openEncyclopedia();});
setInterval(()=>{if(state.theme==='auto')applyTheme();},60000);
async function start(){try{state.catalog=await loadCatalog();parseUrl();render();updateUrl();}catch(error){$('#app').innerHTML=`<main class="load-error"><h1>Sizes</h1><p>${t('failed')}</p><button class="primary" id="retry">${t('retry')}</button></main>`;$('#retry').onclick=()=>location.reload();console.error(error);}}
start();
