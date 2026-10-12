import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { asset } from './catalog.js';
import {createSolarBody} from './solar.js';
import {createGalaxy,createBlackHole,createCosmicVolume} from './cosmic.js';
import {hasProcedural3d} from './representation.js';

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
   if(this.mode!=='3d'||e.pointerType==='touch')return;
   const rect=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   this.raycaster.setFromCamera(this.pointer,this.camera);
   const hit=this.raycaster.intersectObjects([...this.groups.values()].map(g=>g.core),true)[0];
   if(!hit)return;let node=hit.object;while(node&&!node.userData.objectId)node=node.parent;
   const group=this.groups.get(node?.userData.objectId);if(!group||group.flat)return;
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
  const normalize=()=>{core.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(core),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const normalized=new THREE.Group();for(const child of [...core.children])normalized.add(child);normalized.position.sub(center);const wrapper=new THREE.Group();wrapper.add(normalized);wrapper.scale.set(1/(size.x||1),1/(size.y||1),1/(size.z||1));core.add(wrapper);};
  const bond=(a,b,color,radius=.018)=>{const direction=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,direction.length(),10),new THREE.MeshStandardMaterial({color,roughness:.65}));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());core.add(mesh);};
  const procedural=mode==='3d'&&!o.visual.glb&&hasProcedural3d(o);
  if(o.family==='stars'){
   group.solar=createSolarBody(core,root,{detailed:mode==='3d',style:o.visual.stellarStyle||'sun'});
  }else if(o.family==='galaxies'){
   createGalaxy(core,o.id);group.depthRatio=1;
  }else if(o.family==='black-holes'){
   group.solar=createBlackHole(core,root);group.depthRatio=1;
  }else if(o.family==='cosmos'){
   createCosmicVolume(core);
  }else if(o.visual.image&&!procedural){
   let map=await this.loader.loadAsync(asset(o,'image')).catch(()=>null);const imageLoaded=!!map;if(!map)map=await this.loader.loadAsync(asset(o,'silhouette')).catch(()=>null);if(generation!==this.generation){map?.dispose();return;}
   if(map){map.colorSpace=THREE.SRGBColorSpace;const b=imageLoaded&&o.visual.imageBounds;if(b){map.repeat.set(b.width/b.imageWidth,b.height/b.imageHeight);map.offset.set(b.x/b.imageWidth,1-(b.y+b.height)/b.imageHeight);}}
   core.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map,transparent:true,side:THREE.DoubleSide,depthWrite:false})));group.flat=true;
  }else if(o.id==='red-blood-cell'){
   const profile=[new THREE.Vector2(0,.03),new THREE.Vector2(.15,.055),new THREE.Vector2(.34,.13),new THREE.Vector2(.46,.08),new THREE.Vector2(.5,0),new THREE.Vector2(.46,-.08),new THREE.Vector2(.34,-.13),new THREE.Vector2(.15,-.055),new THREE.Vector2(0,-.03)];
   const cell=new THREE.Mesh(new THREE.LatheGeometry(profile,64),new THREE.MeshPhysicalMaterial({color:'#a92d2e',roughness:.35,clearcoat:.3}));cell.rotation.x=Math.PI/2;core.add(cell);group.depthRatio=1;
  }else if(o.visual.kind==='sperm'){
   const cellMaterial=new THREE.MeshPhysicalMaterial({color:'#d5e4e2',roughness:.3,clearcoat:.4});
   const head=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),cellMaterial);head.scale.set(.045,.27,.22);head.position.x=-.455;core.add(head);
   const points=[];for(let i=0;i<=64;i++){const u=i/64;points.push(new THREE.Vector3(-.41+u*.91,Math.sin(u*9.)*u*.3,Math.sin(u*6.)*.03*u));}
   core.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.009,8,false),cellMaterial));group.depthRatio=.15;
  }else if(o.visual.kind==='atom'){
   core.add(new THREE.Mesh(new THREE.SphereGeometry(.5,32,24),new THREE.MeshBasicMaterial({color:'#93c8ec',transparent:true,opacity:.1,depthWrite:false})));
   core.add(new THREE.Mesh(new THREE.SphereGeometry(.09,20,16),new THREE.MeshStandardMaterial({color:'#f0a17b',roughness:.5})));
   for(let n=0;n<3;n++){const curve=new THREE.EllipseCurve(0,0,.46,.23,0,2*Math.PI,false,0);const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(curve.getPoints(96)),new THREE.LineBasicMaterial({color:'#a8dce9',transparent:true,opacity:.8}));ring.rotation.z=n*Math.PI/3;core.add(ring);const electron=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),new THREE.MeshBasicMaterial({color:'#c5eaff'}));electron.position.set(Math.cos(n*2.1)*.43,Math.sin(n*2.1)*.2,0);core.add(electron);}
  }else if(o.visual.kind==='dna'){
   const points=[[],[]];for(let n=0;n<=160;n++){const y=n/160-.5,angle=n/160*Math.PI*4;for(let strand=0;strand<2;strand++)points[strand].push(new THREE.Vector3(Math.cos(angle+strand*Math.PI)*.46,y,Math.sin(angle+strand*Math.PI)*.46));}
   for(let strand=0;strand<2;strand++)core.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points[strand]),160,.025,8,false),new THREE.MeshStandardMaterial({color:strand?'#e7bb81':'#85c5df',roughness:.55})));
   for(let n=0;n<20;n++){const y=(n+.5)/20-.5,angle=(n+.5)/20*Math.PI*4;const a=new THREE.Vector3(Math.cos(angle)*.46,y,Math.sin(angle)*.46),b=new THREE.Vector3(-a.x,y,-a.z);bond(a,b,n%2?'#bbcacc':'#cc9faf',.012);}normalize();
  }else if(o.id==='water'){
   const oxygen=new THREE.Mesh(new THREE.SphereGeometry(.25,28,20),new THREE.MeshStandardMaterial({color:'#d9746f',roughness:.35}));oxygen.position.set(-.08,0,0);core.add(oxygen);const halfAngle=52.25*Math.PI/180;for(const sign of [-1,1]){const p=new THREE.Vector3(-.08+.5*Math.cos(halfAngle),sign*.5*Math.sin(halfAngle),0);const hydrogen=new THREE.Mesh(new THREE.SphereGeometry(.15,20,16),new THREE.MeshStandardMaterial({color:'#e4e9e8',roughness:.35}));hydrogen.position.copy(p);core.add(hydrogen);bond(oxygen.position,p,'#bec4c4',.045);}normalize();
  }else if(o.visual.kind==='virus'){
   core.add(new THREE.Mesh(new THREE.SphereGeometry(.39,32,24),new THREE.MeshStandardMaterial({color:'#a6b3ae',roughness:.9})));for(let i=0;i<55;i++){const y=1-2*(i+.5)/55,a=i*2.39996,r=Math.sqrt(1-y*y),p=new THREE.Vector3(r*Math.cos(a),y,r*Math.sin(a));bond(p.clone().multiplyScalar(.37),p.clone().multiplyScalar(.47),'#c38984',.013);const tip=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:'#cf9089'}));tip.position.copy(p).multiplyScalar(.47);core.add(tip);}
  }else if(o.visual.kind==='bacterium'){
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.6,10,24),new THREE.MeshPhysicalMaterial({color:'#9bcaa7',roughness:.45,clearcoat:.2}));body.rotation.z=Math.PI/2;core.add(body);
   normalize();
  }else if(o.category==='space'&&['sphere','ellipsoid'].includes(o.visual.kind)||o.category==='quantum'&&o.visual.kind==='sphere'||o.category==='micro'&&o.visual.kind==='sphere'){
   const geo=new THREE.SphereGeometry(.5,this.segments||48,Math.round((this.segments||48)*.66));
   const mesh=new THREE.Mesh(geo,material);core.add(mesh);
   if(textures&&o.visual.texture){const tex=await this.loader.loadAsync(asset(o,(mode==='2d'||this.viewportWidth<600)&&o.visual.textureLow?'textureLow':'texture')).catch(()=>null);if(generation!==this.generation){tex?.dispose();return;}if(tex){tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());material.map=tex;material.color.set('#fff');material.needsUpdate=true;}}
   if(textures&&o.visual.clouds){const map=await this.loader.loadAsync(asset(o,'clouds')).catch(()=>null);if(generation!==this.generation){map?.dispose();return;}if(map){const clouds=new THREE.Mesh(geo.clone(),new THREE.MeshStandardMaterial({map,transparent:true,opacity:.65,depthWrite:false}));clouds.scale.setScalar(1.006);core.add(clouds);group.clouds=clouds;}}
   if(o.visual.rings){
    const inner=o.visual.rings.innerDiameter/o.dimensions.width/2,outer=o.visual.rings.outerDiameter/o.dimensions.width/2;
    const geometry=new THREE.RingGeometry(inner,outer,160),uv=geometry.attributes.uv,position=geometry.attributes.position;
    for(let i=0;i<position.count;i++)uv.setXY(i,(Math.hypot(position.getX(i),position.getY(i))-inner)/(outer-inner),.5);
    const ringMaterial=new THREE.MeshBasicMaterial({color:o.visual.ringTexture?'#fff':'#d4ba8b',side:THREE.DoubleSide,transparent:true,opacity:o.visual.ringTexture ? .95 : .55,depthWrite:false});
    if(o.visual.ringTexture){const map=await this.loader.loadAsync(asset(o,'ringTexture')).catch(()=>null);if(generation!==this.generation){map?.dispose();return;}if(map){map.colorSpace=THREE.SRGBColorSpace;ringMaterial.map=map;ringMaterial.needsUpdate=true;}}
    const rings=new THREE.Mesh(geometry,ringMaterial);
    rings.rotation.x=-Math.PI*.38;rings.rotation.z=-.15;core.add(rings);
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
    model.position.sub(center);const normalized=new THREE.Group();normalized.add(model);if(o.visual.preserveModelAspect)normalized.scale.setScalar(1/Math.max(size.x,size.y,size.z));else normalized.scale.set(1/(size.x||1),1/(size.y||1),1/(size.z||1));core.add(normalized);group.flat=false;
   }
  }
  return group;
 }
 update(objects,layout,height,mode,textures,options={}){
  if(!this.renderer)return;
  const signature=objects.map(o=>o.id).join(',')+mode+textures+(options.segments||48)+(options.viewportWidth<600?'mobile':'wide');
  this.segments=options.segments||48;this.renderer.setPixelRatio(Math.min(devicePixelRatio,options.pixelRatio||1.75));
  this.mode=mode;this.height=layout.totalHeight||height;this.width=layout.totalWidth;this.baseline=layout.baseline||75;this.vertical=!!layout.vertical;
  // One continuous shared orthographic frame: projected meters use the same scale.
  this.viewportWidth=options.viewportWidth||layout.totalWidth;this.viewportHeight=options.viewportHeight||height;this.setViewport(options.scrollX||0,options.scrollY||0);
  if(signature!==this.signature){
   const oldTargets=new Map([...this.groups].map(([id,g])=>[id,g.current]));
   const orientations=new Map([...this.groups].map(([id,g])=>[id,{rotation:g.core.rotation.clone(),userRotated:g.userRotated}]));
   this.signature=signature;this.generation++;const gen=this.generation;
   for(const g of this.groups.values())this.disposeObject(g);this.groups.clear();
   for(const o of objects){const item=layout.items.find(i=>i.id===o.id);if(item.width<.6&&item.height<.6)continue;
    this.make(o,mode,textures,gen);const g=this.groups.get(o.id);g.current=oldTargets.get(o.id)||{x:item.x,centerY:item.centerY||0,width:item.width,height:item.height};g.target=item;const orientation=orientations.get(o.id);if(orientation){g.core.rotation.copy(orientation.rotation);g.userRotated=orientation.userRotated;}
   }
  }
  for(const [id,g] of this.groups){g.target=layout.items.find(i=>i.id===id);}
 }
 setViewport(x=0,y=0){
  if(!this.renderer)return;
  if(this.canvas.clientWidth!==this.viewportWidth||this.canvas.clientHeight!==this.viewportHeight)this.renderer.setSize(this.viewportWidth,this.viewportHeight);
  this.canvas.style.transform=`translate(${x}px,${y}px)`;
  this.camera.left=x;this.camera.right=x+this.viewportWidth;this.camera.top=this.height-y;this.camera.bottom=this.height-y-this.viewportHeight;this.camera.updateProjectionMatrix();
 }
 tick(now){
  if(!this.active||!this.renderer)return;
  const dt=Math.min((now-this.last)/1000||0,.05);this.last=now;
  if(!document.hidden&&this.visible!==false){
   this.time+=dt;
   for(const g of this.groups.values()){
    if(!g.target)continue;const a=this.reduced?1:1-Math.exp(-dt*9);
    for(const k of ['x','width','height'])g.current[k]+=(g.target[k]-g.current[k])*a;
    g.current.centerY+=((g.target.centerY||0)-g.current.centerY)*a;
    const {x,width,height}=g.current;
    g.root.position.set(x,this.vertical?this.height-g.current.centerY:this.baseline+height/2,0);if(g.o.visual.preserveModelAspect&&!g.flat)g.root.scale.setScalar(Math.max(width,height));else g.root.scale.set(width,height,g.flat?1:g.depthRatio?width*g.depthRatio:(g.o.dimensions.depth||Math.min(g.o.dimensions.width,g.o.dimensions.height)*.5)*width/g.o.dimensions.width);
    if(this.mode==='3d'&&!this.reduced&&!g.userRotated&&!g.flat)g.core.rotation.y+=dt*.09;
    if(g.clouds&&this.mode==='3d'&&!this.reduced)g.clouds.rotation.y+=dt*.012;
    if(g.solar)g.solar.time.value=this.reduced?0:this.time;
   }
   this.renderer.render(this.scene,this.camera);
  }
  this.frame=requestAnimationFrame(this.tick);
 }
 copyOrientation(other,id){const a=other?.groups.get(id),b=this.groups.get(id);if(a&&b){b.core.rotation.copy(a.core.rotation);b.userRotated=a.userRotated;this.time=other.time;}}
 dispose(){this.active=false;this.generation++;cancelAnimationFrame(this.frame);for(const g of this.groups.values())this.disposeObject(g);this.groups.clear();this.renderer?.dispose();this.canvas?.remove();}
}
