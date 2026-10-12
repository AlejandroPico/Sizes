import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { asset } from './catalog.js';

export class ComparisonScene {
 constructor(container,onFailure){
  this.container=container;this.groups=new Map();this.generation=0;this.active=true;this.mode='2d';this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){onFailure(e);return;}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.canvas=this.renderer.domElement;this.canvas.className='scene-canvas';this.canvas.setAttribute('aria-hidden','true');container.prepend(this.canvas);
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(0,1,0,-1,.1,10000);this.camera.position.z=2000;
  this.scene.add(new THREE.AmbientLight(0xffffff,1.7));const light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(-800,700,1400);this.scene.add(light);
  this.loader=new THREE.TextureLoader();this.gltf=new GLTFLoader();this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
  this.onDown=e=>{
   if(this.mode!=='3d')return;
   const rect=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   this.raycaster.setFromCamera(this.pointer,this.camera);
   const hit=this.raycaster.intersectObjects([...this.groups.values()].map(g=>g.core),true)[0];
   if(!hit)return;let node=hit.object;while(node&&!node.userData.objectId)node=node.parent;
   const group=this.groups.get(node?.userData.objectId);if(!group)return;
   this.drag={group,x:e.clientX,y:e.clientY};this.canvas.setPointerCapture(e.pointerId);
  };
  this.onMove=e=>{if(!this.drag)return;const {group,x,y}=this.drag;group.core.rotation.y+=(e.clientX-x)*.008;group.core.rotation.x+=(e.clientY-y)*.008;this.drag.x=e.clientX;this.drag.y=e.clientY;group.userRotated=true;};
  this.onUp=()=>{this.drag=null;};
  this.canvas.addEventListener('pointerdown',this.onDown);this.canvas.addEventListener('pointermove',this.onMove);this.canvas.addEventListener('pointerup',this.onUp);this.canvas.addEventListener('pointercancel',this.onUp);
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.active=false;onFailure(Error('WebGL context lost'));});
  this.last=0;this.time=0;this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
 }
 disposeObject(g){g.root.traverse(n=>{n.geometry?.dispose(); if(n.material){for(const m of Array.isArray(n.material)?n.material:[n.material]){m.map?.dispose();m.alphaMap?.dispose();m.dispose();}}});this.scene.remove(g.root);}
 async make(o,mode,textures,generation){
  const root=new THREE.Group(),core=new THREE.Group();root.add(core);core.userData.objectId=o.id;
  const material=new THREE.MeshStandardMaterial({color:o.color,roughness:.88,metalness:0});
  const group={root,core,o,current:null,target:null,material};
  this.scene.add(root);this.groups.set(o.id,group);
  if(o.category==='space'&&['sphere','ellipsoid'].includes(o.visual.kind)||o.category==='quantum'&&o.visual.kind==='sphere'||o.category==='micro'&&o.visual.kind==='sphere'){
   const geo=new THREE.SphereGeometry(.5,48,32);
   const mesh=new THREE.Mesh(geo,material);core.add(mesh);
   if(o.id==='sun'){material.emissive=new THREE.Color('#ef7020');material.emissiveIntensity=.8;group.sun=true;}
   if(textures&&o.visual.texture){const tex=await this.loader.loadAsync(asset(o,'texture')).catch(()=>null);if(generation!==this.generation){tex?.dispose();return;}if(tex){tex.colorSpace=THREE.SRGBColorSpace;material.map=tex;material.color.set('#fff');material.needsUpdate=true;}}
   if(textures&&o.visual.clouds){const map=await this.loader.loadAsync(asset(o,'clouds')).catch(()=>null);if(generation!==this.generation){map?.dispose();return;}if(map){const clouds=new THREE.Mesh(geo.clone(),new THREE.MeshStandardMaterial({map,transparent:true,opacity:.65,depthWrite:false}));clouds.scale.setScalar(1.006);core.add(clouds);group.clouds=clouds;}}
   if(o.visual.rings){
    const inner=o.visual.rings.innerDiameter/o.dimensions.width/2,outer=o.visual.rings.outerDiameter/o.dimensions.width/2;
    const rings=new THREE.Mesh(new THREE.RingGeometry(inner,outer,100),new THREE.MeshBasicMaterial({color:'#d4ba8b',side:THREE.DoubleSide,transparent:true,opacity:.55}));
    rings.rotation.x=-Math.PI*.38;rings.rotation.z=-.15;core.add(rings);
   }
   if(group.sun&&textures){const halo=new THREE.Mesh(new THREE.SphereGeometry(.508,32,24),new THREE.MeshBasicMaterial({color:'#ffac4c',transparent:true,opacity:.14,side:THREE.BackSide}));core.add(halo);group.halo=halo;
    for(let i=0;i<9;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(.032+.005*(i%3),.002,6,20,Math.PI*1.65),new THREE.MeshBasicMaterial({color:'#ff9b3e',transparent:true,opacity:.6}));const a=i/9*Math.PI*2;arc.position.set(Math.sin(a)*.49,Math.cos(a)*.49,0);arc.rotation.z=-a;core.add(arc);}
   }
  }else if(mode==='3d'&&o.category==='buildings'){
   for(let i=0;i<5;i++){const level=new THREE.Mesh(new THREE.BoxGeometry(1-i*.15,.2,1-i*.15),material);level.position.y=-.4+i*.2;core.add(level);}
  }else if(mode==='3d'&&['elephant','whale','shark','dog','cat','giraffe','dinosaur','human','squid'].includes(o.visual.kind)){
   // Volumetric teaching models. These are explicitly described as illustrations.
   const part=(x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.5,24,16),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);core.add(m);};
   if(o.visual.kind==='human'){part(0,.4,0,.25,.2,.6);part(0,.08,0,.5,.48,.7);part(-.14,-.3,0,.2,.4,.5);part(.14,-.3,0,.2,.4,.5);part(-.34,.02,0,.16,.45,.4);part(.34,.02,0,.16,.45,.4);}
   else{part(-.08,0,0,.8,.65,.9);part(.32,.1,0,.32,.36,.62);
    if(['whale','shark','squid'].includes(o.visual.kind)){part(-.42,-.01,0,.18,.55,.12);part(.05,-.34,.15,.3,.3,.12);}
    else{for(const x of [-.3,.23])for(const z of [-.25,.25])part(x,-.33,z,.13,.34,.15);if(o.visual.kind==='elephant'){part(.45,-.22,0,.1,.55,.2);part(.25,.2,.32,.4,.6,.1);}if(o.visual.kind==='giraffe')part(.24,.3,0,.15,.65,.25);}
   }
  }else{
   const map=await this.loader.loadAsync(asset(o,'silhouette')).catch(()=>null);
   if(generation!==this.generation){map?.dispose();return;}
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map,transparent:true,side:THREE.DoubleSide,depthWrite:false}));core.add(mesh);group.flat=true;
  }
  if(mode==='3d'&&o.visual.glb){
   const gltf=await this.gltf.loadAsync(asset(o,'glb')).catch(()=>null);
   if(generation!==this.generation){if(gltf)gltf.scene.traverse(n=>{n.geometry?.dispose();n.material?.dispose?.();});return;}
   if(gltf){for(const n of [...core.children]){core.remove(n);n.geometry?.dispose();if(n.material!==material)n.material?.dispose?.();}
    if(!textures)gltf.scene.traverse(n=>{if(n.isMesh){const materials=Array.isArray(n.material)?n.material:[n.material];for(const m of materials){m.map?.dispose();m.dispose();}n.material=material;}});
    const model=gltf.scene;model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    model.position.sub(center);const normalized=new THREE.Group();normalized.add(model);normalized.scale.set(1/(size.x||1),1/(size.y||1),1/(size.z||1));core.add(normalized);group.flat=false;
   }
  }
  return group;
 }
 update(objects,layout,height,mode,textures){
  if(!this.renderer)return;
  const signature=objects.map(o=>o.id).join(',')+mode+textures;
  this.mode=mode;this.height=height;this.width=layout.totalWidth;this.baseline=layout.baseline||75;
  // One continuous shared orthographic frame: projected meters use the same scale.
  this.renderer.setSize(layout.totalWidth,height);this.camera.left=0;this.camera.right=layout.totalWidth;this.camera.top=height;this.camera.bottom=0;this.camera.updateProjectionMatrix();
  if(signature!==this.signature){
   const oldTargets=new Map([...this.groups].map(([id,g])=>[id,g.current]));
   this.signature=signature;this.generation++;const gen=this.generation;
   for(const g of this.groups.values())this.disposeObject(g);this.groups.clear();
   for(const o of objects){const item=layout.items.find(i=>i.id===o.id);if(item.width<.6&&item.height<.6)continue;
    this.make(o,mode,textures,gen);const g=this.groups.get(o.id);g.current=oldTargets.get(o.id)||{x:item.x,width:item.width,height:item.height};g.target=item;
   }
  }
  for(const [id,g] of this.groups){g.target=layout.items.find(i=>i.id===id);}
 }
 tick(now){
  if(!this.active||!this.renderer)return;
  const dt=Math.min((now-this.last)/1000||0,.05);this.last=now;
  if(!document.hidden&&this.visible!==false){
   this.time+=dt;
   for(const g of this.groups.values()){
    if(!g.target)continue;const a=this.reduced?1:1-Math.exp(-dt*9);
    for(const k of ['x','width','height'])g.current[k]+=(g.target[k]-g.current[k])*a;
    const {x,width,height}=g.current;
    g.root.position.set(x,this.baseline+height/2,0);g.root.scale.set(width,height,g.flat?1:(g.o.dimensions.depth||Math.min(g.o.dimensions.width,g.o.dimensions.height)*.5)*width/g.o.dimensions.width);
    if(this.mode==='3d'&&!this.reduced&&!g.userRotated&&!g.flat)g.core.rotation.y+=dt*.09;
    if(g.clouds&&this.mode==='3d'&&!this.reduced)g.clouds.rotation.y+=dt*.012;
    if(g.halo&&!this.reduced)g.halo.material.opacity=.1+.04*Math.sin(this.time*1.2);
   }
   this.renderer.render(this.scene,this.camera);
  }
  this.frame=requestAnimationFrame(this.tick);
 }
 dispose(){this.active=false;cancelAnimationFrame(this.frame);for(const g of this.groups.values())this.disposeObject(g);this.groups.clear();this.renderer?.dispose();this.canvas?.remove();}
}
