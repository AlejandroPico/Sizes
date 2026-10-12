// One-time migration. Future edits belong in objetos/<canonical-name>/meta.json.
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { feature } from 'topojson-client';
import { geoAzimuthalEqualArea, geoCentroid, geoPath, geoArea } from 'd3-geo';

const root = resolve('objetos');
const nasa = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
const jpl = 'https://ssd.jpl.nasa.gov/sats/phys_par/';
const sources = {
  space: nasa,
  life: 'https://www.fisheries.noaa.gov/species/blue-whale',
  micro: 'https://www.ncbi.nlm.nih.gov/books/NBK26880/',
  quantum: 'https://physics.nist.gov/cuu/Constants/',
  buildings: 'https://www.skyscrapercenter.com/',
  objects: 'https://www.royalcaribbeanpresscenter.com/fact_sheets/Icon_of_the_Seas_Fact_Sheet.pdf',
  geography: 'https://www.naturalearthdata.com/about/terms-of-use/'
};
const palettes = { space:'#aabcc9', life:'#d4c4a1', micro:'#92d7bf', quantum:'#bcabed', buildings:'#c5d1d6', objects:'#c9d8e0', geography:'#91c7b6' };
const descriptions = {
  life:['Ejemplo adulto representativo. El tamaño cambia entre individuos, sexos y poblaciones. La silueta es una ilustración, no una fotografía ni una reconstrucción anatómica.', 'A representative adult example. Size varies between individuals, sexes and populations. The silhouette is an illustration, not a photograph or anatomical reconstruction.'],
  micro:['Escala representativa de una estructura biológica. La forma y las dimensiones pueden variar; el dibujo es esquemático.', 'Representative scale of a biological structure. Shape and dimensions may vary; the drawing is schematic.'],
  quantum:['Escala de referencia definida por el modelo indicado; no representa una bola sólida fotografiada.', 'Reference scale defined by the stated model; it does not represent a photographed solid ball.'],
  buildings:['La comparación usa altura arquitectónica; la anchura de la ilustración es esquemática y no se utiliza como medida publicada.', 'The comparison uses architectural height; illustration width is schematic and is not used as a published measurement.'],
  objects:['Dimensiones del objeto o de un ejemplo de referencia. El dibujo es una representación ilustrativa.', 'Dimensions of the object or a reference example. The drawing is an illustrative representation.']
};
function svg(shape, color) {
  const shapes = {
    sphere:'<circle cx="50" cy="50" r="48"/>',
    human:'<circle cx="50" cy="8" r="7"/><path d="M41 19h18l9 29-6 3-8-23 2 31 6 38h-8l-5-32-4 32h-8l5-38 2-31-8 23-6-3z"/>',
    elephant:'<path d="M9 45Q14 21 43 26L69 29Q83 25 89 40L95 43 96 78Q90 87 86 76L85 53 78 47 74 76 66 77 66 60 35 60 33 77 23 77 20 55 14 55 9 68 5 66z"/><path d="M68 35Q51 26 53 47Q57 64 69 53Z" fill="#222" opacity=".25"/><path d="M81 54l9 9-3-12" fill="#eee"/>',
    whale:'<path d="M4 49Q12 31 35 37L70 49 90 43 98 31 99 51 94 57 98 67 86 62 70 56 52 62 40 74 37 64Q13 65 4 49Z"/>',
    shark:'<path d="M3 54Q18 35 40 45L49 24 59 44 83 53 98 33 95 54 99 72 84 60 53 61 42 76 43 63Q17 65 3 54Z"/>',
    giraffe:'<path d="M14 49l41-1 13-34 6-4 2-7 3 1 1 7 12 5-1 7-12-1-8 41-4 34h-6l-1-34-23-1-3 34h-6l-3-33-5-4-7 15-4-2z"/>',
    dog:'<path d="M5 44l14 6 42-7 7-18 12-4 4 7 13 4-3 9-12 2-9 23-1 24h-8l-3-26-33-1-8 26h-8l5-33-15-7z"/>',
    cat:'<path d="M13 54Q1 35 8 25L12 27Q8 42 22 44L64 44 69 29 72 19 81 29 90 20 94 42 89 56 74 64 74 87h-8l-4-23-29 1-9 22h-8l4-24z"/>',
    ant:'<ellipse cx="22" cy="50" rx="18" ry="12"/><ellipse cx="51" cy="49" rx="10" ry="9"/><ellipse cx="74" cy="47" rx="13" ry="11"/><path d="M42 49L27 25M48 51L45 76M56 50L69 79M60 44L68 22M80 39L91 24M81 48L96 43" fill="none" stroke="currentColor" stroke-width="3"/>',
    bee:'<ellipse cx="48" cy="52" rx="32" ry="18"/><ellipse cx="40" cy="26" rx="18" ry="17" opacity=".4"/><ellipse cx="64" cy="26" rx="17" ry="15" opacity=".4"/><path d="M40 36v31m17-31v32" stroke="#222" stroke-width="8"/><circle cx="84" cy="50" r="10"/>',
    squid:'<path d="M3 48L33 22 54 43 96 35 64 49 99 53 60 56 93 72 49 62 30 75z"/>',
    dinosaur:'<path d="M2 70L36 57 55 39 68 24 94 25 99 38 82 43 69 58 82 89 72 94 58 68 47 69 45 91 33 91 37 65 2 74z"/>',
    bacterium:'<rect x="10" y="30" width="78" height="39" rx="20"/><path d="M85 50q20 10 5 30" fill="none" stroke="currentColor" stroke-width="2"/>',
    sperm:'<ellipse cx="14" cy="50" rx="12" ry="8"/><path d="M25 50Q40 25 55 50T97 50" fill="none" stroke="currentColor" stroke-width="2"/>',
    virus:'<circle cx="50" cy="50" r="30"/><path d="M50 5v15m0 60v15M5 50h15m60 0h15M18 18l12 12m40 40 12 12M18 82l12-12m40-40 12-12" stroke="currentColor" stroke-width="4"/>',
    ship:'<path d="M2 60h96L86 77H18zM14 39h63l14 19H9zM26 24h38v14H26z"/><path d="M18 44h62m-65 7h72" stroke="#222" stroke-width="2"/>',
    caravel:'<path d="M5 75h90L80 92H18zM47 12v63" stroke="currentColor" stroke-width="3"/><path d="M44 18L13 65h31zM51 21v42h33z"/>',
    tower:'<path d="M45 2h10v20h8v28h8v30h10v18H19V80h10V50h8V22h8z"/>',
    eiffel:'<path d="M49 2h2l9 50 9 25 17 21H66L55 78H45L34 98H14l17-21 9-25z"/><path d="M33 74h34M40 52h20" stroke="#ddd" stroke-width="2"/>',
    field:'<rect x="2" y="18" width="96" height="64" rx="1"/><path d="M50 18v64M2 36h14v28H2m96-28H84v28h14" fill="none" stroke="#eee"/><circle cx="50" cy="50" r="12" fill="none" stroke="#eee"/>',
    plane:'<path d="M3 49L41 43 58 5 66 4 58 43 89 47 95 30 99 30 97 50 99 70 95 70 89 53 58 57 66 96 58 95 41 57 3 51z"/>',
    square:'<rect x="2" y="2" width="96" height="96"/>',
    molecule:'<circle cx="30" cy="55" r="23"/><circle cx="65" cy="35" r="17"/><circle cx="75" cy="73" r="18"/><path d="M40 50l20-12m-17 23 20 8" stroke="currentColor" stroke-width="12"/>',
    line:'<path d="M3 50h94M3 38v24m94-24v24" fill="none" stroke="currentColor" stroke-width="3"/>',
    galaxy:'<ellipse cx="50" cy="50" rx="47" ry="20"/><ellipse cx="50" cy="50" rx="22" ry="14" fill="#fff" opacity=".4"/>'
  };
  const bounds={sphere:'2 2 96 96',human:'30 1 39 96',elephant:'5 25 92 62',whale:'4 31 95 43',shark:'3 24 96 52',giraffe:'5 3 87 94',dog:'3 21 94 69',cat:'6 19 88 68',ant:'4 22 94 59',bee:'16 9 78 62',squid:'3 22 96 53',dinosaur:'2 24 97 70',bacterium:'10 30 90 51',sperm:'2 25 96 50',virus:'3 3 94 94',ship:'2 24 96 53',caravel:'5 10 90 82',tower:'19 2 62 96',eiffel:'14 2 72 96',field:'2 18 96 64',plane:'3 4 96 92',square:'2 2 96 96',molecule:'7 18 86 73',line:'2 37 96 26',galaxy:'3 30 94 40'};
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds[shape]||bounds.sphere}" preserveAspectRatio="none" style="color:${color}" fill="${color}">${shapes[shape] || shapes.sphere}</svg>`;
}
async function save(o, assets={}) {
  const folder = o.canonicalName || (o.id==='sagittarius-a'?'Sagittarius A-star':o.names.en);
  o.folder = folder;
  const dir = resolve(root,folder);
  await mkdir(dir,{recursive:true});
  o.tags ||= [o.category,o.family]; o.color ||= palettes[o.category];
  o.environment ||= o.category==='space'?'space':['whales','fish','invertebrates','ships'].includes(o.family)?'ocean':o.category==='life'?'savanna':o.category==='micro'?'micro':o.category==='quantum'?'quantum':o.category==='geography'?'geography':o.category==='buildings'?'buildings':'neutral';
  o.reviewStatus ||= 'initial';
  o.summary ||= Object.fromEntries(['es','en'].map((l,i)=>[l,descriptions[o.category]?.[i] || '']));
  o.status ||= o.dimensions ? 'ready' : 'pending';
  o.measurementStatus ||= 'representative';
  o.source ||= sources[o.category]; o.sourceRetrieved = '2026-10-12';
  o.visual = { kind:o.shape || 'sphere', fidelity:'illustrative', silhouette:'silhouette.svg', model:'model.json', ...o.visual };
  await writeFile(resolve(dir,'silhouette.svg'),svg(o.visual.kind,o.color));
  await writeFile(resolve(dir,'model.json'),JSON.stringify({type:o.visual.kind,dimensions:o.dimensions,representation:'procedural illustration, not a measured surface'},null,2));
  for(const [dest,from] of Object.entries(assets)) await copyFile(from,resolve(dir,dest));
  await writeFile(resolve(dir,'meta.json'),JSON.stringify(o,null,2)+'\n');
}
const planetRows = [
 ['mercury','Mercurio','Mercury',4879,5429,'mercury-enhanced.jpg'],['venus','Venus','Venus',12104,5243,'venus.jpg'],
 ['earth','Tierra','Earth',12756,5514,'earth-day.jpg'],['mars','Marte','Mars',6792,3934,'mars.jpg'],
 ['jupiter','Júpiter','Jupiter',142984,1326,'jupiter.jpg'],['saturn','Saturno','Saturn',120536,687,'saturn.jpg'],
 ['uranus','Urano','Uranus',51118,1270,null],['neptune','Neptuno','Neptune',49528,1638,'neptune.jpg'],['pluto','Plutón','Pluto',2376,1850,null]
];
for(const [id,es,en,d,density,tex] of planetRows){
 const assets={}; if(tex) assets['texture'+(tex.endsWith('png')?'.png':'.jpg')]=resolve('../Universal/public/textures',tex);
 if(id==='earth') assets['clouds.png']=resolve('../Universal/public/textures/earth-clouds.png');
 if(['uranus','pluto'].includes(id)) assets['model.glb']=resolve('../Universal/public/models',`${id}.glb`);
 await save({id,names:{es,en,ca:{earth:'Terra',mars:'Mart',jupiter:'Júpiter',saturn:'Saturn',uranus:'Urà',neptune:'Neptú',pluto:'Plutó',mercury:'Mercuri',venus:'Venus'}[id]},category:'space',family:id==='pluto'?'dwarf-planets':'planets',featured:true,dimensions:{width:d*1000,height:d*1000,depth:d*1000},basis:'equatorial-diameter',measurementStatus:'measured',properties:{density:{value:density,unit:'kg/m³'}},color:{earth:'#75b9dc',mars:'#d48969',jupiter:'#d7b89b',saturn:'#e0cb9f',uranus:'#8bd2d8',neptune:'#5785d6',venus:'#d9b17e'}[id],summary:{es:`${es}${id==='earth'?', nuestro planeta, el tercero del Sistema Solar':''}. Se compara su diámetro ecuatorial. La superficie corresponde a observaciones cuando hay textura; no se inventa detalle en zonas sin cartografía.`,en:`${en}${id==='earth'?', our home, the third planet in the Solar System':''}. The comparison uses equatorial diameter. Observed surface assets are used where available; unmapped detail is not invented.`},visual:{texture:tex?'texture.jpg':null,clouds:id==='earth'?'clouds.png':null,glb:['uranus','pluto'].includes(id)?'model.glb':null,fidelity:tex?'observed-texture':id==='pluto'?'partial-map':'illustrative',rings:id==='saturn'?{outerDiameter:273560000,innerDiameter:149316000}:null}},assets);
}
await save({id:'sun',names:{es:'Sol',en:'Sun',ca:'Sol'},category:'space',family:'stars',featured:true,dimensions:{width:1.39268e9,height:1.39268e9,depth:1.39268e9},basis:'mean-diameter',measurementStatus:'measured',color:'#ffb16c',summary:{es:'La estrella del Sistema Solar. La textura procede de observaciones solares. La corona y las protuberancias animadas son una ilustración; no muestran actividad solar en directo.',en:'The star of the Solar System. Texture derived from solar observations. The animated corona and prominences are illustrative, not live solar activity.'},visual:{texture:'texture.jpg',fidelity:'observed-texture'}},{'texture.jpg':resolve('../Universal/public/textures/sun-surface.jpg')});
const moons=JSON.parse(await readFile('../Universal/src/moon-catalog.json','utf8'));
const aliases={moon:['Luna','Moon'],phobos:['Fobos','Phobos'],deimos:['Deimos','Deimos'],ganymede:['Ganímedes','Ganymede'],callisto:['Calisto','Callisto'],io:['Ío','Io'],titan:['Titán','Titan'],enceladus:['Encélado','Enceladus'],triton:['Tritón','Triton']};
for(const m of moons){
 const [es,en]=aliases[m.id] || [m.name,m.name];
 const tex=m.id==='moon'?'moon-color.jpg':`${m.id}.jpg`;
 const hasTex=existsSync(resolve('../Universal/public/textures',tex));
 const assets={}; if(hasTex) assets['texture.jpg']=resolve('../Universal/public/textures',tex);
 const measured=m.axesKm && Math.max(...m.axesKm)/Math.min(...m.axesKm)>1.1;
 if(['phobos','deimos','charon','hyperion','miranda','ariel','umbriel','titania','oberon'].includes(m.id)){
 const glb=m.id==='hyperion'?'hyperion-nasa.glb':`${m.id}.glb`; if(existsSync(resolve('../Universal/public/models',glb))) assets['model.glb']=resolve('../Universal/public/models',glb);
 }
 const d=m.radiusKm*2000;
 await save({id:m.id,names:{es,en},category:'space',family:'moons',parent:m.parent,featured:['moon','phobos','io','europa','ganymede','callisto','titan','enceladus','triton'].includes(m.id),dimensions:m.radiusUnknown?null:{width:measured?m.axesKm[0]*2000:d,height:measured?m.axesKm[1]*2000:d,depth:measured?m.axesKm[2]*2000:d},basis:measured?'principal-axes':'mean-diameter',measurementStatus:m.radiusUnknown?'unknown':'estimated',source:jpl,provenance:{importedFrom:'AlejandroPico/Universal/src/moon-catalog.json',originalSource:m.source,naif:m.naif},properties:{parent:{value:m.parent,unit:''}},summary:{es:`Satélite natural de ${m.parent}. ${m.radiusUnknown?'El catálogo de origen no proporciona una medida utilizable: queda pendiente y no se dibuja a una escala inventada.':'Dimensiones del catálogo JPL importado de Universal. Una figura sin mapa es una aproximación, no una superficie observada.'}`,en:`Natural satellite of ${m.parent}. ${m.radiusUnknown?'The source catalog has no usable dimension: pending, with no invented comparison scale.':'Dimensions from the JPL catalog imported from Universal. An unmapped shape is an approximation, not an observed surface.'}`},visual:{texture:hasTex?'texture.jpg':null,glb:assets['model.glb']?'model.glb':null,kind:measured?'ellipsoid':'sphere',fidelity:hasTex?'observed-texture':assets['model.glb']?'reconstructed':'illustrative'}} ,assets);
}
const rows=[
 ['ceres','Ceres','Ceres','space','dwarf-planets',939400,939400,'sphere','mean-diameter'],
 ['eris','Eris','Eris','space','dwarf-planets',2326000,2326000,'sphere','mean-diameter'],
 ['makemake','Makemake','Makemake','space','dwarf-planets',1430000,1430000,'sphere','mean-diameter'],
 ['haumea','Haumea','Haumea','space','dwarf-planets',2322000,1704000,'sphere','principal-axes'],
 ['vesta','Vesta','Vesta','space','asteroids',525400,525400,'sphere','mean-diameter'],
 ['bennu','Bennu','Bennu','space','asteroids',490,490,'sphere','mean-diameter'],
 ['eros','Eros','Eros','space','asteroids',34400,11200,'sphere','principal-axes'],
 ['sirius','Sirio A','Sirius A','space','stars',2.38e9,2.38e9,'sphere','mean-diameter'],
 ['betelgeuse','Betelgeuse','Betelgeuse','space','stars',1.06e12,1.06e12,'sphere','mean-diameter'],
 ['sagittarius-a','Sagitario A*','Sagittarius A*','space','black-holes',2.36e10,2.36e10,'sphere','schwarzschild-diameter'],
 ['milky-way','Vía Láctea','Milky Way','space','galaxies',9.4607e20,9.4607e20,'galaxy','stellar-disc-diameter'],
 ['andromeda','Andrómeda','Andromeda','space','galaxies',2.08e21,2.08e21,'galaxy','stellar-disc-diameter'],
 ['observable-universe','Universo observable','Observable universe','space','cosmos',8.8e26,8.8e26,'sphere','comoving-diameter'],
 ['planck-length','Longitud de Planck','Planck length','quantum','reference',1.616255e-35,1.616255e-35,'line','reference-length'],
 ['electron','Electrón','Electron','quantum','particles',null,null,'sphere','point-particle'],
 ['classical-electron-radius','Radio clásico del electrón','Classical electron radius','quantum','reference',2.8179403262e-15,2.8179403262e-15,'line','reference-length'],
 ['proton','Protón','Proton','quantum','particles',1.68e-15,1.68e-15,'sphere','charge-diameter'],
 ['hydrogen','Átomo de hidrógeno','Hydrogen atom','quantum','atoms',1.058354421e-10,1.058354421e-10,'sphere','twice-bohr-radius'],
 ['carbon','Átomo de carbono','Carbon atom','quantum','atoms',1.52e-10,1.52e-10,'sphere','covalent-diameter'],
 ['oganesson','Átomo de oganesón','Oganesson atom','quantum','atoms',3.14e-10,3.14e-10,'sphere','predicted-covalent-diameter'],
 ['water','Molécula de agua','Water molecule','quantum','molecules',2.75e-10,2.75e-10,'molecule','representative-extent'],
 ['dna','Doble hélice de ADN','DNA double helix','quantum','molecules',2e-9,2e-9,'molecule','helix-diameter'],
 ['transistor','Transistor de referencia (20 nm)','Reference transistor (20 nm)','quantum','technology',2e-8,2e-8,'square','illustrative-length'],
 ['sars-cov-2','SARS-CoV-2','SARS-CoV-2','micro','viruses',1e-7,1e-7,'virus','representative-diameter'],
 ['influenza','Virus de la gripe','Influenza virus','micro','viruses',1e-7,1e-7,'virus','representative-diameter'],
 ['ecoli','Escherichia coli','Escherichia coli','micro','bacteria',2e-6,5e-7,'bacterium','representative-length'],
 ['red-blood-cell','Glóbulo rojo humano','Human red blood cell','micro','cells',7.5e-6,7.5e-6,'sphere','representative-diameter'],
 ['ovum','Óvulo humano','Human ovum','micro','cells',1.2e-4,1.2e-4,'sphere','representative-diameter'],
 ['sperm','Espermatozoide humano','Human sperm cell','micro','cells',5.5e-5,8e-6,'sperm','representative-length'],
 ['human','Persona (1,75 m)','Person (1.75 m)','life','humans',.48,1.75,'human','reference-height'],
 ['elephant','Elefante africano','African elephant','life','mammals',6.5,3.3,'elephant','representative-length'],
 ['blue-whale','Ballena azul','Blue whale','life','whales',30,6,'whale','representative-length'],
 ['humpback','Ballena jorobada','Humpback whale','life','whales',16,4,'whale','representative-length'],
 ['sperm-whale','Cachalote','Sperm whale','life','whales',18,4,'whale','representative-length'],
 ['white-shark','Tiburón blanco','Great white shark','life','fish',6,1.8,'shark','representative-length'],
 ['megalodon','Megalodón','Megalodon','life','extinct',16,4,'shark','estimated-length'],
 ['giraffe','Jirafa','Giraffe','life','mammals',3.5,5.5,'giraffe','representative-height'],
 ['dog-labrador','Labrador retriever','Labrador retriever','life','dogs',.95,.6,'dog','representative-length'],
 ['dog-chihuahua','Chihuahua','Chihuahua','life','dogs',.3,.2,'dog','representative-length'],
 ['cat','Gato doméstico','Domestic cat','life','mammals',.46,.25,'cat','representative-length'],
 ['boar','Jabalí','Wild boar','life','mammals',1.5,.85,'dog','representative-length'],
 ['antelope','Antílope impala','Impala','life','mammals',1.5,.9,'dog','representative-length'],
 ['ant','Hormiga (ejemplo de 5 mm)','Ant (5 mm example)','life','insects',.005,.002,'ant','reference-length'],
 ['bee','Abeja de la miel','Honey bee','life','insects',.015,.006,'bee','representative-length'],
 ['giant-squid','Calamar gigante','Giant squid','life','invertebrates',12,2,'squid','estimated-length'],
 ['squid','Calamar común','Common squid','life','invertebrates',.5,.1,'squid','representative-length'],
 ['trex','Tyrannosaurus rex','Tyrannosaurus rex','life','extinct',12,4,'dinosaur','estimated-length'],
 ['icon-of-the-seas','Icon of the Seas','Icon of the Seas','objects','ships',365,65,'ship','overall-length'],
 ['santa-maria','Santa María (reconstrucción)','Santa María (reconstruction)','objects','ships',25,15,'caravel','estimated-length'],
 ['titanic','Titanic','Titanic','objects','ships',269.1,53.3,'ship','overall-length'],
 ['football-field','Campo de fútbol (105 × 68 m)','Football pitch (105 × 68 m)','objects','reference',105,68,'field','reference-length'],
 ['a380','Airbus A380','Airbus A380','objects','aircraft',79.75,72.72,'plane','wingspan'],
 ['iss','Estación Espacial Internacional','International Space Station','objects','spacecraft',109,73,'field','maximum-extent'],
 ['burj-khalifa','Burj Khalifa','Burj Khalifa','buildings','skyscrapers',180,828,'tower','architectural-height'],
 ['eiffel','Torre Eiffel','Eiffel Tower','buildings','towers',125,330,'eiffel','total-height'],
 ['empire-state','Empire State Building','Empire State Building','buildings','skyscrapers',80,381,'tower','architectural-height'],
 ['sagrada-familia','Sagrada Familia (altura proyectada)','Sagrada Familia (planned height)','buildings','landmarks',60,172.5,'tower','planned-height'],
 ['tokyo-skytree','Tokyo Skytree','Tokyo Skytree','buildings','towers',70,634,'tower','total-height'],
 ['shanghai-tower','Shanghai Tower','Shanghai Tower','buildings','skyscrapers',130,632,'tower','architectural-height']
];
for(const [id,es,en,category,family,width,height,shape,basis] of rows){
 const o={id,names:{es,en},category,family,featured:true,dimensions:width===null?null:{width,height,depth:category==='space'&&shape==='sphere'?Math.min(width,height):null},shape,basis,color:palettes[category]};
 if(category==='space') o.measurementStatus='estimated';
 if(['planck-length','classical-electron-radius','hydrogen'].includes(id)) o.measurementStatus='model-defined';
 if(id==='oganesson') o.measurementStatus='theoretical';
 if(id==='electron'){o.measurementStatus='unknown';o.summary={es:'El electrón se modela como partícula puntual. No tiene un diámetro medido que podamos dibujar. El radio clásico del electrón es una escala de una fórmula, no el radio físico del electrón.',en:'The electron is modeled as a point particle. There is no measured diameter to draw. The classical electron radius is a formula-derived scale, not the physical electron radius.'};}
 if(id==='megalodon') o.source='https://profiles.si.edu/display/sro_156943';
 if(category==='life'&&!['blue-whale','humpback','sperm-whale','white-shark'].includes(id)) o.source='https://www.nationalzoo.si.edu/animals';
 if(id==='eiffel') o.source='https://www.toureiffel.paris/en/the-monument/key-figures';
 if(category==='buildings') o.visual={schematicWidth:true};
 if(category==='space') o.summary={es:'Escala astronómica aproximada. El valor depende de la definición del borde y del modelo de medida indicado en esta ficha.',en:'Approximate astronomical scale. The value depends on the boundary definition and the measurement model stated in this entry.'};
 if(id==='observable-universe') o.summary={es:'Diámetro comóvil aproximado de la región observable, unos 93 mil millones de años luz. No mide el universo completo. El fondo cósmico de microondas es luz de una época temprana, no una esfera sólida.',en:'Approximate comoving diameter of the observable region, about 93 billion light-years. This is not the size of the entire universe. The cosmic microwave background is early light, not a solid sphere.'};
 if(['ceres','vesta','bennu','eros'].includes(id)){o.source='https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html';}
 await save(o);
}
// Geographical shapes: common spherical area and local equal-area projection.
const topology=JSON.parse(await readFile('node_modules/world-atlas/countries-110m.json','utf8'));
const countries=feature(topology,topology.objects.countries).features;
for(const f of countries){
 const countryName=({'Bosnia and Herz.':'Bosnia and Herzegovina','Central African Rep.':'Central African Republic','Dominican Rep.':'Dominican Republic','Falkland Is.':'Falkland Islands','Solomon Is.':'Solomon Islands'})[f.properties.name]||f.properties.name;
 const center=geoCentroid(f);
 const proj=geoAzimuthalEqualArea().rotate([-center[0],-center[1]]).scale(6371008.8).translate([0,0]).precision(1000);
 const path=geoPath(proj); const [[x0,y0],[x1,y1]]=path.bounds(f);
 const w=x1-x0,h=y1-y0; if(!(w>0&&h>0)) continue;
 const p=geoAzimuthalEqualArea().rotate([-center[0],-center[1]]).scale(6371008.8/w*100).translate([-x0/w*100,-y0/w*100]).precision(.03);
 const id=`country-${f.id || countryName.toLowerCase().replace(/\W+/g,'-')}`;
 const dir=resolve(root,countryName); await mkdir(dir,{recursive:true});
 await save({id,canonicalName:countryName,names:{en:countryName,es:({Spain:'España',France:'Francia',Germany:'Alemania',China:'China',India:'India',Italy:'Italia',Japan:'Japón',Portugal:'Portugal',Brazil:'Brasil','United States of America':'Estados Unidos','United Kingdom':'Reino Unido',Russia:'Rusia',Thailand:'Tailandia'})[countryName] || countryName},category:'geography',family:'countries',featured:['Spain','France','Germany','China','India','Japan','United States of America','Russia','Brazil'].includes(countryName),dimensions:{width:w,height:h,depth:null},basis:'equal-area-map-extent',measurementStatus:'derived',source:'https://github.com/topojson/world-atlas',properties:{area:{value:geoArea(f)*6371008.8**2,unit:'m²'}},summary:{es:'Contorno cartográfico Natural Earth de baja resolución. Proyección azimutal equivalente centrada en el territorio: conserva superficies, pero las longitudes y el contorno proyectados se distorsionan. No representa distancias geodésicas exactas. La superficie incluye los polígonos del conjunto de datos, no una cifra administrativa oficial.',en:'Low-resolution Natural Earth boundary. Locally centered azimuthal equal-area projection preserves areas but distorts projected lengths and outlines. It does not show exact geodesic distances. Area is derived from dataset polygons, not official administrative statistics.'},visual:{kind:'map',fidelity:'cartographic',model:null}});
 await writeFile(resolve(dir,'silhouette.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${h/w*100}" fill="#91c7b6"><path d="${geoPath(p)(f)}"/></svg>`);
 await writeFile(resolve(dir,'boundary.geojson'),JSON.stringify(f));
}
// Cities explicitly use equivalent area; no invented city boundary or population.
for(const [id,es,en,area,source] of [
 ['madrid','Madrid','Madrid',604.3,'https://www.madrid.es/'],['barcelona','Barcelona','Barcelona',101.4,'https://www.barcelona.cat/'],
 ['tokyo','Tokio (prefectura)','Tokyo (prefecture)',2194,'https://www.metro.tokyo.lg.jp/'],['bangkok','Bangkok (municipio)','Bangkok (municipality)',1568.7,'https://www.bangkok.go.th/'],
 ['new-york','Nueva York (superficie terrestre)','New York City (land area)',778.2,'https://www.census.gov/quickfacts/newyorkcitynewyork'],['berlin','Berlín','Berlin',891.1,'https://www.berlin.de/']
]) await save({id,names:{es,en},category:'geography',family:'cities',featured:true,dimensions:{width:Math.sqrt(area*1e6),height:Math.sqrt(area*1e6),depth:null},basis:'equivalent-area-square',shape:'square',source,measurementStatus:'estimated',properties:{area:{value:area*1e6,unit:'m²'}},summary:{es:'Cuadrado de superficie equivalente, no contorno real de la ciudad. La definición territorial aparece en el nombre. No se infieren población ni altura media de edificios; hacen falta fuentes y fechas compatibles para añadir esos datos.',en:'Equivalent-area square, not the actual city outline. The territorial definition is included in the name. Population and average building height are not inferred; compatible sources and dates are needed to add them.'}});
await mkdir('data',{recursive:true});
await writeFile('data/import-provenance.json',JSON.stringify({date:'2026-10-12',moons:moons.length,source:jpl,importedFrom:'AlejandroPico/Universal',countries:countries.length,countryDataset:'world-atlas 2.0.2 / Natural Earth 1:110m',notes:'Unknown moon radii kept null. No placeholder radii imported as measured sizes.'},null,2));
console.log(`Seeded planets, ${moons.length} moon entries, ${countries.length} geographical shapes and cross-scale examples.`);
