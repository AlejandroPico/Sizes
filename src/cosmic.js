import * as THREE from 'three';
import {plasmaNoise} from './solar.js';
// Illustrative spatial structures. Effects outside a defined body do not change its measure.
export function createGalaxy(core,id){
 let seed=id==='andromeda'?4721:1234;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const positions=[],colors=[];
 for(let i=0;i<18000;i++){
  const r=Math.sqrt(random())*.49,arm=i%4*Math.PI/2,angle=arm+r*13.+(random()-.5)*(.25+r*.95),thickness=(random()-.5)*(.018+.09*Math.exp(-r*12));
  positions.push(Math.cos(angle)*r,Math.sin(angle)*r,thickness);const warmth=1.-Math.min(1,r*4.),c=new THREE.Color().setRGB(.5+warmth*.45,.63+warmth*.21,.93-warmth*.37);colors.push(c.r,c.g,c.b);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const material=new THREE.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`varying vec3 vColor;void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=2.;}`,fragmentShader:`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);float a=exp(-d*d*18.);gl_FragColor=vec4(vColor,a*.43);#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
 core.add(new THREE.Points(geometry,material));
 const disc=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;${plasmaNoise}
 void main(){vec2 p=vUv-.5;float r=length(p),a=atan(p.y,p.x);float arm=pow(.5+.5*cos(a*4.-r*50.),6.);float dust=fbm(vec3(p*37.,0));float alpha=(exp(-r*24.)*.85+arm*dust*.19)* (1.-smoothstep(.4,.5,r));vec3 c=mix(vec3(.28,.49,.85),vec3(1.,.82,.54),exp(-r*13.));gl_FragColor=vec4(c,alpha);
 #include <colorspace_fragment>
 }`});core.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),disc));
}
export function createBlackHole(core,root){
 const time={value:0};core.add(new THREE.Mesh(new THREE.SphereGeometry(.5,64,40),new THREE.MeshBasicMaterial({color:'#010204'})));
 const material=new THREE.ShaderMaterial({uniforms:{uTime:time},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:`varying vec3 vPoint;void main(){vPoint=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime;varying vec3 vPoint;${plasmaNoise}
 void main(){float r=length(vPoint.xy),a=atan(vPoint.y,vPoint.x);float flow=fbm(vec3(cos(a)*r*16.,sin(a)*r*16.,uTime*.15));float band=.4+.6*pow(.5+.5*sin(r*110.+flow*8.-uTime*.8),3.);float edge=smoothstep(.52,.58,r)*(1.-smoothstep(.85,1.08,r));float hot=exp(-(r-.56)*4.);vec3 c=mix(vec3(.85,.14,.008),vec3(1.,.8,.37),hot);gl_FragColor=vec4(c,edge*band*(.25+hot*.65));
 #include <colorspace_fragment>
 }`});
 const disc=new THREE.Mesh(new THREE.RingGeometry(.52,1.08,160),material);disc.rotation.x=.92;core.add(disc);
 const glow=new THREE.Mesh(new THREE.TorusGeometry(.51,.009,8,160),new THREE.MeshBasicMaterial({color:'#ffd799',transparent:true,opacity:.65}));root.add(glow);
 return {time};
}
export function createCosmicVolume(core){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:`varying vec3 vPoint;varying vec3 vNormal;varying vec3 vEye;void main(){vPoint=position;vNormal=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vEye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 vPoint;varying vec3 vNormal;varying vec3 vEye;${plasmaNoise}
 void main(){float field=fbm(vPoint*23.);float web=pow(1.-abs(field-.51)*2.,16.);float clusters=pow(fbm(vPoint*71.),8.);float facing=abs(dot(vNormal,vEye));vec3 c=mix(vec3(.03,.065,.13),vec3(.29,.46,.75),web);c+=clusters*vec3(2.,1.2,.4);gl_FragColor=vec4(c,(.4+web*.4)*pow(facing,.35));
 #include <colorspace_fragment>
 }`});core.add(new THREE.Mesh(new THREE.SphereGeometry(.5,64,40),material));
}
