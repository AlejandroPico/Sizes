import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// An illustrative, time-compressed plasma rendering, not an observation or a simulation.
export const plasmaNoise=`
float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.41));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=noise3(p)*a;p=p*2.03+vec3(11.1,7.7,3.4);a*=.49;}return v;}
`;
const noise=plasmaNoise;
const vertex=`varying vec3 vPoint;varying vec3 vNormal;varying vec3 vEye;varying vec2 vUv;void main(){vPoint=position;vUv=uv;vec4 eye=modelViewMatrix*vec4(position,1.);vEye=normalize(-eye.xyz);vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*eye;}`;
export function createSolarBody(core,root,{detailed=true,style='sun'}={}){
 const time={value:0},materials=[];
 const palette={value:style==='red'?1:style==='blue'?2:0};
 const surface=new THREE.ShaderMaterial({uniforms:{uTime:time,uPalette:palette},vertexShader:vertex,fragmentShader:`
  uniform float uTime;uniform float uPalette;varying vec3 vPoint;varying vec3 vNormal;varying vec3 vEye;${noise}
  void main(){vec3 p=normalize(vPoint);float t=uTime*.025;
   vec3 warp=vec3(fbm(p*9.+t),fbm(p*9.+vec3(9,4,2)-t),fbm(p*9.+vec3(4,8,1)+t));
   float granule=noise3(p*(uPalette==1.?12.:135.)+warp*8.+vec3(t*2.,0,0));float fine=noise3(p*390.+warp*7.);
   float activity=fbm(p*24.+warp*2.-t);float cells=smoothstep(.23,.8,granule);
   float spots=smoothstep(.69,.8,fbm(p*5.+vec3(6,2,4)));float darkness=1.-spots*.9;
   float heat=(.12+cells*.43+fine*.12+activity*.4)*darkness;
   vec3 color=mix(vec3(.48,.035,.002),vec3(1.,.31,.012),smoothstep(.08,.56,heat));
   color=mix(color,vec3(1.,.78,.27),smoothstep(.55,.97,heat));
   if(uPalette==1.)color=mix(vec3(.42,.018,.002),vec3(1.,.3,.05),smoothstep(.15,.85,heat));
   if(uPalette==2.)color=mix(vec3(.38,.6,.91),vec3(.92,.98,1.),.45+heat*.5);
   float limb=pow(max(dot(vNormal,vEye),0.),.24);color*=.58+.42*limb;
   gl_FragColor=vec4(color,1.);
   #include <colorspace_fragment>
  }`});
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(.5,detailed?96:40,detailed?64:28),surface);core.add(sphere);materials.push(surface);
 if(detailed){
  const corona=new THREE.ShaderMaterial({uniforms:{uTime:time,uPalette:palette},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:vertex,fragmentShader:`
   uniform float uTime;uniform float uPalette;varying vec3 vPoint;${noise}
   void main(){vec2 p=vPoint.xy;float r=length(p),a=atan(p.y,p.x);float h=max(0.,r-.5);
    vec3 polar=vec3(cos(a)*13.,sin(a)*13.,h*5.-uTime*.035);
    float n=fbm(polar),stream=pow(fbm(polar*2.+vec3(0,0,h*19.-uTime*.06)),3.);
    float alpha=(.29*exp(-h*27.)+.16*exp(-h*11.)*n+.45*stream*exp(-h*8.))*smoothstep(.487,.512,r)*(1.-smoothstep(.67,.81,r));
    vec3 c=mix(vec3(1.,.23,.025),vec3(1.,.75,.3),n);
    if(uPalette==2.)c=vec3(.45,.7,1.);if(uPalette==1.)c=vec3(1.,.12,.015);
    gl_FragColor=vec4(c,alpha);
    #include <colorspace_fragment>
   }`});
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.65),corona);halo.position.z=-.02;root.add(halo);materials.push(corona);
  if(style!=='sun')return {time,materials};
  const geometries=[],plumes=[];
  // Irregular active regions, different heights and inclinations. No ring of repeated hoops.
  const regions=[[-1.06,.12,.11,.14],[-.35,.93,.075,.1],[.58,-.83,.09,.13]];
  regions.forEach(([bx,by,bz,rise],region)=>{
   const base=new THREE.Vector3(bx,by,bz).normalize(),tangent=new THREE.Vector3(-base.y,base.x,.16).normalize(),across=new THREE.Vector3().crossVectors(base,tangent).normalize();
   for(let strand=0;strand<9;strand++){
    const points=[],spread=(strand-4)*.0048;
    for(let j=0;j<=48;j++){const u=j/48,angle=(u-.5)*(.14+rise*.7),height=Math.pow(Math.sin(Math.PI*u),.7)*(rise+spread*1.8)*(1.+Math.sin(u*8.+region)*.16),twist=u*12.+strand*.8;
     const point=base.clone().addScaledVector(tangent,angle).normalize().multiplyScalar(.498+height);
     point.addScaledVector(across,spread+Math.sin(twist)*Math.sin(Math.PI*u)*.006).addScaledVector(tangent,Math.cos(twist)*Math.sin(Math.PI*u)*.003);points.push(point);
    }
    const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.0017+strand%3*.0005,5,false);
    if(strand===4)plumes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.018,14,false));
    geometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(region*.73+strand*.17),1));geometries.push(geometry);
   }
  });
  [[.9,.46,.13],[-.72,-.68,.14],[.32,.95,.18]].forEach(([bx,by,bz],region)=>{
   const base=new THREE.Vector3(bx,by,bz).normalize(),side=new THREE.Vector3(-by,bx,.1).normalize();
   for(let strand=0;strand<15;strand++){
    const points=[];
    for(let j=0;j<=48;j++){const u=j/48,spread=(strand-7)*.002;const point=base.clone().multiplyScalar(.498+u*(.12+strand*.003)).addScaledVector(side,Math.sin(u*3.7)*(.05+spread)+Math.sin(u*13.+strand)*.009*u);point.z+=Math.sin(u*8.+strand)*.014*u;points.push(point);}
    const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.0015+(strand%3)*.0005,5,false);geometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(region*1.13+strand*.21+8),1));geometries.push(geometry);
    if(strand===7)plumes.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.021,14,false));
   }
  });
  const filaments=new THREE.ShaderMaterial({uniforms:{uTime:time},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:`uniform float uTime;attribute float aSeed;varying float vSeed;${vertex.replace('void main(){','void main(){vSeed=aSeed;').replace('vec4 eye=modelViewMatrix*vec4(position,1.);','vec3 plasma=position+normalize(position)*smoothstep(.5,.62,length(position))*sin(uTime*.35+aSeed)*.013;vec4 eye=modelViewMatrix*vec4(plasma,1.);')}`,fragmentShader:`
   uniform float uTime;varying vec3 vPoint;varying vec2 vUv;varying float vSeed;${noise}
   void main(){float flow=fbm(vec3(vUv.x*24.-uTime*.7,vUv.y*6.,vSeed*7.));float pulse=.5+.5*sin(uTime*.32+vSeed*4.);float ends=pow(sin(vUv.x*3.14159),.3);float alpha=(.045+flow*.24)*(.4+pulse*.6)*ends;
    vec3 color=mix(vec3(1.,.085,.008),vec3(1.,.62,.17),smoothstep(.2,.8,flow));gl_FragColor=vec4(color,alpha);
    #include <colorspace_fragment>
   }`});
  core.add(new THREE.Mesh(mergeGeometries(geometries),filaments));geometries.forEach(g=>g.dispose());materials.push(filaments);
  const plasma=new THREE.ShaderMaterial({uniforms:{uTime:time},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,vertexShader:`uniform float uTime;${noise}${vertex.replace('vec4 eye=modelViewMatrix*vec4(position,1.);','vec3 plume=position+normal*(fbm(position*65.+vec3(0,uTime*.11,0))-.5)*.024;vec4 eye=modelViewMatrix*vec4(plume,1.);')}`,fragmentShader:`uniform float uTime;varying vec3 vPoint;varying vec3 vNormal;varying vec3 vEye;varying vec2 vUv;${noise}
   void main(){float turbulent=fbm(vPoint*95.+vec3(0,-uTime*.45,uTime*.1));float density=smoothstep(.25,.7,turbulent);float soft=pow(abs(dot(vNormal,vEye)),.6);float ends=pow(sin(vUv.x*3.14159),.5);float alpha=density*soft*ends*.65;
    vec3 c=mix(vec3(.95,.08,.001),vec3(1.,.47,.045),density);gl_FragColor=vec4(c,alpha);
    #include <colorspace_fragment>
   }`});core.add(new THREE.Mesh(mergeGeometries(plumes),plasma));plumes.forEach(g=>g.dispose());materials.push(plasma);
 }
 return {time,materials};
}
