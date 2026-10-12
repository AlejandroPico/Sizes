import {language,name,t,categoryKey} from './i18n.js';
const order=['es','ca','en','fr','de','pt','it','zh','ja','hi'];
const words={
 planets:'Planetas|Planetes|Planets|Planètes|Planeten|Planetas|Pianeti|行星|惑星|ग्रह',
 moons:'Lunas|Llunes|Moons|Lunes|Monde|Luas|Lune|卫星|衛星|उपग्रह',
 'dwarf-planets':'Planetas enanos|Planetes nans|Dwarf planets|Planètes naines|Zwergplaneten|Planetas anões|Pianeti nani|矮行星|準惑星|बौने ग्रह',
 stars:'Estrellas|Estrelles|Stars|Étoiles|Sterne|Estrelas|Stelle|恒星|恒星|तारे',
 asteroids:'Asteroides|Asteroides|Asteroids|Astéroïdes|Asteroiden|Asteroides|Asteroidi|小行星|小惑星|क्षुद्रग्रह',
 'black-holes':'Agujeros negros|Forats negres|Black holes|Trous noirs|Schwarze Löcher|Buracos negros|Buchi neri|黑洞|ブラックホール|ब्लैक होल',
 galaxies:'Galaxias|Galàxies|Galaxies|Galaxies|Galaxien|Galáxias|Galassie|星系|銀河|आकाशगंगाएँ',
 cosmos:'Cosmos|Cosmos|Cosmos|Cosmos|Kosmos|Cosmos|Cosmo|宇宙|宇宙|ब्रह्मांड',
 animals:'Animales|Animals|Animals|Animaux|Tiere|Animais|Animali|动物|動物|जानवर',
 terrestrial:'Vida terrestre|Vida terrestre|Land animals|Vie terrestre|Landtiere|Vida terrestre|Vita terrestre|陆生动物|陸上動物|स्थलीय जीव',
 marine:'Vida marina|Vida marina|Marine life|Vie marine|Meeresleben|Vida marinha|Vita marina|海洋生物|海洋生物|समुद्री जीव',
 mammals:'Mamíferos|Mamífers|Mammals|Mammifères|Säugetiere|Mamíferos|Mammiferi|哺乳动物|哺乳類|स्तनधारी',
 humans:'Personas|Persones|People|Personnes|Menschen|Pessoas|Persone|人类|人|मनुष्य',
 whales:'Ballenas|Balenes|Whales|Baleines|Wale|Baleias|Balene|鲸|クジラ|व्हेल',
 dogs:'Perros|Gossos|Dogs|Chiens|Hunde|Cães|Cani|狗|犬|कुत्ते',
 cats:'Gatos|Gats|Cats|Chats|Katzen|Gatos|Gatti|猫|猫|बिल्लियाँ',
 sharks:'Tiburones|Taurons|Sharks|Requins|Haie|Tubarões|Squali|鲨鱼|サメ|शार्क',
 fish:'Peces|Peixos|Fish|Poissons|Fische|Peixes|Pesci|鱼|魚|मछलियाँ',
 extinct:'Animales extintos|Animals extints|Extinct animals|Animaux disparus|Ausgestorbene Tiere|Animais extintos|Animali estinti|灭绝动物|絶滅動物|विलुप्त जीव',
 dinosaurs:'Dinosaurios|Dinosaures|Dinosaurs|Dinosaures|Dinosaurier|Dinossauros|Dinosauri|恐龙|恐竜|डायनासोर',
 insects:'Insectos|Insectes|Insects|Insectes|Insekten|Insetos|Insetti|昆虫|昆虫|कीट',
 invertebrates:'Invertebrados|Invertebrats|Invertebrates|Invertébrés|Wirbellose|Invertebrados|Invertebrati|无脊椎动物|無脊椎動物|अकशेरुकी',
 microorganisms:'Microorganismos|Microorganismes|Microorganisms|Microorganismes|Mikroorganismen|Microrganismos|Microrganismi|微生物|微生物|सूक्ष्मजीव',
 viruses:'Virus|Virus|Viruses|Virus|Viren|Vírus|Virus|病毒|ウイルス|विषाणु',
 bacteria:'Bacterias|Bacteris|Bacteria|Bactéries|Bakterien|Bactérias|Batteri|细菌|細菌|जीवाणु',
 cells:'Células|Cèl·lules|Cells|Cellules|Zellen|Células|Cellule|细胞|細胞|कोशिकाएँ',
 reference:'Referencias de longitud|Referències de longitud|Length references|Références de longueur|Längenreferenzen|Referências de comprimento|Riferimenti di lunghezza|长度参考|長さの基準|लंबाई संदर्भ',
 particles:'Partículas|Partícules|Particles|Particules|Teilchen|Partículas|Particelle|粒子|粒子|कण',
 atoms:'Átomos|Àtoms|Atoms|Atomes|Atome|Átomos|Atomi|原子|原子|परमाणु',
 molecules:'Moléculas|Molècules|Molecules|Molécules|Moleküle|Moléculas|Molecole|分子|分子|अणु',
 technology:'Tecnología|Tecnologia|Technology|Technologie|Technologie|Tecnologia|Tecnologia|技术|技術|प्रौद्योगिकी',
 transport:'Transportes|Transports|Transport|Transports|Verkehrsmittel|Transportes|Trasporti|交通工具|乗り物|परिवहन',
 ships:'Barcos|Vaixells|Ships|Navires|Schiffe|Navios|Navi|船|船|जहाज़',
 aircraft:'Aviones|Avions|Aircraft|Avions|Flugzeuge|Aviões|Aerei|飞机|飛行機|विमान',
 spacecraft:'Vehículos espaciales|Vehicles espacials|Spacecraft|Véhicules spatiaux|Raumfahrzeuge|Veículos espaciais|Veicoli spaziali|航天器|宇宙船|अंतरिक्ष यान',
 skyscrapers:'Rascacielos|Gratacels|Skyscrapers|Gratte-ciel|Wolkenkratzer|Arranha-céus|Grattacieli|摩天大楼|超高層ビル|गगनचुंबी इमारतें',
 towers:'Torres|Torres|Towers|Tours|Türme|Torres|Torri|塔|塔|टावर',
 landmarks:'Monumentos|Monuments|Landmarks|Monuments|Wahrzeichen|Monumentos|Monumenti|地标|名所|स्मारक',
 countries:'Países y territorios|Països i territoris|Countries and territories|Pays et territoires|Länder und Gebiete|Países e territórios|Paesi e territori|国家和地区|国と地域|देश और क्षेत्र',
 cities:'Ciudades|Ciutats|Cities|Villes|Städte|Cidades|Città|城市|都市|शहर',
 other:'Otros|Altres|Other|Autres|Weitere|Outros|Altri|其他|その他|अन्य'
};
export const familyName=key=>words[key]?.split('|')[order.indexOf(language())]||t(categoryKey(key));
export const nodeTitle=node=>node.kind==='object'?name(node.object):node.suffix?`${familyName(node.labelKey)} · ${name(node.suffix)}`:familyName(node.labelKey);
export function buildTaxonomy(catalog){
 const byId=new Map(catalog.map(o=>[o.id,o]));
 const leaf=o=>({key:`object:${o.id}`,kind:'object',object:o,representative:o.id});
 const objects=predicate=>catalog.filter(predicate).sort((a,b)=>Number(b.featured)-Number(a.featured)||a.names.en.localeCompare(b.names.en)).map(leaf);
 const family=f=>objects(o=>o.family===f);
 const group=(key,labelKey,representative,children,suffix)=>({key,kind:'group',labelKey,representative:byId.has(representative)?representative:descendantObjects({children}).find(o=>o.status==='ready')?.id,children,suffix});
 const roots=[
  group('atoms','atoms','carbon',family('atoms')),
  group('molecules','molecules','water',family('molecules')),
  group('particles','particles','proton',family('particles')),
  group('microorganisms','microorganisms','ecoli',[
   group('viruses','viruses','sars-cov-2',family('viruses')),
   group('bacteria','bacteria','ecoli',family('bacteria')),
   group('cells','cells','red-blood-cell',family('cells'))
  ]),
  group('animals','animals','elephant',[
   group('terrestrial','terrestrial','elephant',[
    group('mammals','mammals','elephant',objects(o=>o.family==='mammals'&&o.id!=='cat')),
    group('dogs','dogs','dog-labrador',family('dogs')),
    group('cats','cats','cat',objects(o=>o.id==='cat')),
    group('insects','insects','bee',family('insects'))
   ]),
   group('marine','marine','blue-whale',[
    group('whales','whales','blue-whale',family('whales')),
    group('sharks','sharks','white-shark',objects(o=>o.family==='fish'||o.id==='megalodon')),
    group('invertebrates','invertebrates','giant-squid',family('invertebrates'))
   ]),
   group('extinct','extinct','trex',[
    group('dinosaurs','dinosaurs','trex',objects(o=>o.family==='extinct'&&o.id!=='megalodon')),
    ...objects(o=>o.id==='megalodon')
   ])
  ]),
  ...family('humans'),
  group('transport','transport','a380',[
   group('aircraft','aircraft','a380',family('aircraft')),
   group('ships','ships','icon-of-the-seas',family('ships')),
   group('spacecraft','spacecraft','iss',family('spacecraft'))
  ]),
  group('buildings','buildings','burj-khalifa',[
   group('skyscrapers','skyscrapers','burj-khalifa',family('skyscrapers')),
   group('towers','towers','eiffel',family('towers')),
   group('landmarks','landmarks','sagrada-familia',family('landmarks'))
  ]),
  group('countries','countries','country-724',family('countries')),
  group('cities','cities','barcelona',family('cities')),
  group('planets','planets','earth',family('planets')),
  group('moons','moons','moon',['earth','mars','jupiter','saturn','uranus','neptune','pluto'].map(parent=>group(`moons-${parent}`,'moons',({earth:'moon',mars:'phobos',jupiter:'ganymede',saturn:'titan',uranus:'titania',neptune:'triton',pluto:'charon'})[parent],objects(o=>o.family==='moons'&&o.parent===parent),byId.get(parent)))),
  group('dwarf-planets','dwarf-planets','pluto',family('dwarf-planets')),
  group('asteroids','asteroids','vesta',family('asteroids')),
  group('stars','stars','sun',family('stars')),
  group('black-holes','black-holes','sagittarius-a',family('black-holes')),
  group('galaxies','galaxies','milky-way',family('galaxies')),
  group('cosmos','cosmos','observable-universe',family('cosmos')),
  group('reference','reference','planck-length',objects(o=>o.family==='reference')),
  group('technology','technology','transistor',family('technology'))
 ];
 const covered=new Set(roots.flatMap(descendantObjects).map(o=>o.id));
 const remaining=catalog.filter(o=>!covered.has(o.id));if(remaining.length)roots.push(group('other','other',remaining.find(o=>o.status==='ready')?.id,remaining.map(leaf)));
 return roots.filter(node=>node.kind==='object'||node.children.length>0);
}
export function descendantObjects(node){return node.kind==='object'?[node.object]:(node.children||[]).flatMap(descendantObjects);}
export function findNode(nodes,key){for(const node of nodes){if(node.key===key)return node;const found=node.children&&findNode(node.children,key);if(found)return found;}return null;}
