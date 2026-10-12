import {displayDimensions} from './representation.js';
export const extent=o=>o?.dimensions?Math.max(o.dimensions.width,o.dimensions.height,o.dimensions.depth||0):null;
export const displayWidth=(o,quality='3d')=>displayDimensions(o,quality).width;
const visualSpan=(o,quality)=>(o.visual.rings?.outerDiameter||displayDimensions(o,quality).width)*(o.visual.effectExtent||1);
export function layout(objects,width,height,{vertical=false,quality='3d'}={}){
 const comparable=objects.filter(o=>extent(o)>0);
 if(!comparable.length) return vertical?{items:[],pixelsPerMeter:0,totalWidth:width,totalHeight:height,vertical:true,baseline:0}:{items:[],pixelsPerMeter:0,totalWidth:width};
 if(vertical){
  const maxWidth=Math.max(...comparable.map(o=>visualSpan(o,quality))),maxHeight=Math.max(...comparable.map(o=>displayDimensions(o,quality).height*(o.visual.effectExtent||1)));
  const pixelsPerMeter=Math.min(Math.max(120,width-48)/maxWidth,Math.max(160,height-170)/maxHeight);
  let top=68;
  const items=comparable.map(o=>{const d=displayDimensions(o,quality),w=d.width*pixelsPerMeter,h=d.height*pixelsPerMeter,visualHeight=h*(o.visual.effectExtent||1),slot=Math.max(145,visualHeight+105),centerY=top+visualHeight/2;const item={id:o.id,x:width/2,centerY,labelY:top+visualHeight+8,width:w,height:h,slot:width-32,visualWidth:visualSpan(o,quality)*pixelsPerMeter};top+=slot;return item;});
  return {items,pixelsPerMeter,totalWidth:width,totalHeight:Math.max(height,top+36),vertical:true,baseline:0};
 }
 const maxHeight=Math.max(...comparable.map(o=>displayDimensions(o,quality).height*(o.visual.effectExtent||1)));
 const maxWidth=Math.max(...comparable.map(o=>visualSpan(o,quality)));
 const room=Math.max(120,height-180);
 let pixelsPerMeter=Math.min(room/maxHeight,Math.max(220,width*.65)/maxWidth);
 const required=p=>60+objects.reduce((sum,o)=>sum+Math.max(110,visualSpan(o,quality)*p+32),0);
 if(objects.length<=3&&objects.length*110+60<=width){let low=0,high=room/maxHeight;for(let n=0;n<50;n++){const mid=(low+high)/2;if(required(mid)<=width)low=mid;else high=mid;}pixelsPerMeter=low;}
 let x=30;
 const items=objects.map(o=>{
  const d=displayDimensions(o,quality),w=d.width*pixelsPerMeter, h=d.height*pixelsPerMeter;
  const visualWidth=visualSpan(o,quality)*pixelsPerMeter;
  const slot=Math.max(110,visualWidth+32);
  const item={id:o.id,x:x+slot/2,width:w,height:h,slot,visualWidth}; x+=slot; return item;
 });
 const totalWidth=Math.max(width,x+30);
 if(x+30<width){const offset=(width-x-30)/2; items.forEach(i=>i.x+=offset);}
 const baseline=Math.max(90,(height-Math.max(...comparable.map(o=>displayDimensions(o,quality).height))*pixelsPerMeter)/2);
 return {items,pixelsPerMeter,totalWidth,baseline};
}
export function formatLength(m,locale='es'){
 if(m===null||m===undefined||!Number.isFinite(m)) return '—';
 if(m===0) return '0 m';
 const units=[[9.4607304725808e15,'ly'],[1e12,'Tm'],[1e9,'Gm'],[1e3,'km'],[1,'m'],[1e-2,'cm'],[1e-3,'mm'],[1e-6,'µm'],[1e-9,'nm'],[1e-12,'pm'],[1e-15,'fm']];
 const unit=units.find(([value])=>m>=value)||[1,'m'];
 if(m<1e-15) return `${m.toExponential(3).replace('e',' × 10^')} m`;
 return `${new Intl.NumberFormat(locale,{maximumSignificantDigits:5}).format(m/unit[0])} ${unit[1]}`;
}
export function formatRatio(a,b,locale='es'){
 const value=a/b;
 return value>1e7?value.toExponential(2).replace('e+',' × 10^'):new Intl.NumberFormat(locale,{maximumSignificantDigits:4}).format(value);
}
export function autoTheme(date=new Date()){
 const hour=date.getHours()+date.getMinutes()/60;
 const month=date.getMonth();
 // Date-aware seasonal daylight estimate without asking for location permission.
 const summer=Math.cos((month-5)*Math.PI/6);
 const dawn=7-summer, dusk=18+summer*2;
 return hour>=dawn&&hour<dusk-2?'morning':hour>=dusk-2&&hour<dusk+1?'afternoon':'night';
}
