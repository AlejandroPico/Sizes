import {asset} from './catalog.js';
const cache=new Map();
let engine;
const familyImages={dogs:'dog-labrador',cats:'cat',whales:'blue-whale',fish:'white-shark',insects:'bee',extinct:'trex'};
// These family illustrations identify a concept; they are not observed object images.
const familyDrawings={
 'black-holes':'<defs><radialGradient id="halo"><stop offset=".45" stop-color="#090f16"/><stop offset=".56" stop-color="#fff0c7"/><stop offset=".65" stop-color="#f2a340"/><stop offset="1" stop-color="#df8128" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="27" fill="url(#halo)"/><ellipse cx="32" cy="34" rx="30" ry="8" fill="none" stroke="#efb865" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="#090f16"/>',
 galaxies:'<defs><radialGradient id="core"><stop stop-color="#fff7d8"/><stop offset=".3" stop-color="#ddc9ed"/><stop offset="1" stop-color="#809ccf" stop-opacity="0"/></radialGradient></defs><ellipse cx="32" cy="32" rx="30" ry="22" fill="url(#core)"/><g fill="none" stroke="#bbd5e8" stroke-linecap="round"><path d="M32 32C12 6 4 39 23 48C44 59 67 23 46 11C36 5 18 12 21 23" stroke-width="3"/><path d="M32 32C52 58 60 25 41 16C20 5-3 41 18 53C28 59 46 52 43 41" stroke-width="2"/></g><ellipse cx="32" cy="32" rx="8" ry="5" fill="#fff3ca"/>',
 cosmos:'<defs><radialGradient id="nebula"><stop stop-color="#776b9d"/><stop offset="1" stop-color="#172d45"/></radialGradient></defs><circle cx="32" cy="32" r="29" fill="url(#nebula)"/><g fill="#d8eaff"><circle cx="15" cy="24" r="1.5"/><circle cx="45" cy="15" r="1.5"/><circle cx="41" cy="43" r="2"/><circle cx="20" cy="47" r="1"/><circle cx="27" cy="16" r="1"/><circle cx="53" cy="33" r="1"/><path d="M32 23l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>',
 cities:'<path fill="#9bbec5" d="M3 57V34h12v23h3V23h13v34h3V11h12v46h3V29h12v28z"/><g fill="#314c5c"><path d="M7 39h4v4H7zm0 8h4v4H7zm15-19h5v5h-5zm0 10h5v5h-5zm0 10h5v5h-5zm16-30h4v5h-4zm0 10h4v5h-4zm0 10h4v5h-4zm0 10h4v5h-4zm15-12h4v5h-4zm0 10h4v5h-4z"/></g>',
 technology:'<g stroke="#b2bfcc" stroke-width="3"><path d="M20 4v12m12-12v12M44 4v12M20 48v12m12-12v12m12-12v12M4 20h12M4 32h12M4 44h12m32-24h12M48 32h12M48 44h12"/></g><path fill="#657da0" stroke="#aec5d8" stroke-width="2" d="M16 16h32v32H16z"/><path fill="#243c51" d="M23 23h18v18H23z"/>',
 asteroids:'<defs><radialGradient id="rock"><stop stop-color="#b3a99d"/><stop offset="1" stop-color="#5b5b60"/></radialGradient></defs><path fill="url(#rock)" d="M8 19L22 5l23 4 15 18-5 23-21 11L13 51 3 34z"/><g fill="#535356" opacity=".6"><ellipse cx="23" cy="23" rx="6" ry="5"/><ellipse cx="42" cy="37" rx="8" ry="6"/><circle cx="24" cy="47" r="3"/><circle cx="46" cy="18" r="3"/></g>'
};
const drawingSource=family=>familyDrawings[family]?`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${familyDrawings[family]}</svg>`)}`:null;
export function thumbnailSource(o,catalog){
 const family=catalog.find(a=>a.id===familyImages[o.family]);
 return o.visual.image?asset(o,'image'):family?.visual.image?asset(family,'image'):!o.visual.texture&&drawingSource(o.family)||asset(o,'silhouette');
}
async function astronomyThumbnail(o){
 if(!engine){const THREE=await import('three');const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setSize(128,128);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.67,.67,.67,-.67,.1,10);camera.position.z=3;scene.add(new THREE.AmbientLight(0xffffff,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-2,3,4);scene.add(light);engine={THREE,renderer,scene,camera,loader:new THREE.TextureLoader()};}
 const {THREE,renderer,scene,camera,loader}=engine;const geometry=new THREE.SphereGeometry(.5,32,24),material=new THREE.MeshStandardMaterial({color:o.color,roughness:1});
 const texture=await loader.loadAsync(asset(o,'texture'));texture.colorSpace=THREE.SRGBColorSpace;material.map=texture;material.color.set('#fff');if(o.id==='sun'){material.emissive.set('#dc7229');material.emissiveIntensity=.55;}const body=new THREE.Mesh(geometry,material);scene.add(body);renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');scene.remove(body);texture.dispose();material.dispose();geometry.dispose();return url;
}
let sequence=Promise.resolve();
export async function fillThumbnails(root,catalog){
 const images=[...root.querySelectorAll('[data-thumbnail]')];
 for(const img of images){const o=catalog.find(a=>a.id===img.dataset.thumbnail);if(!o||!o.visual.texture||o.visual.image||o.category!=='space')continue;
  if(!cache.has(o.id)){const task=sequence.then(()=>astronomyThumbnail(o));sequence=task.catch(()=>{});cache.set(o.id,task.catch(()=>asset(o,'silhouette')));}
  cache.get(o.id).then(url=>{if(img.isConnected)img.src=url;});
 }
}
