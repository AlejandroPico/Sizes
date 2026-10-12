export const extent=o=>o?.dimensions?Math.max(o.dimensions.width,o.dimensions.height,o.dimensions.depth||0):null;
export function layout(objects,width,height){
 const comparable=objects.filter(o=>extent(o)>0);
 if(!comparable.length) return {items:[],pixelsPerMeter:0,totalWidth:width};
 const maxHeight=Math.max(...comparable.map(o=>o.dimensions.height));
 const maxWidth=Math.max(...comparable.map(o=>o.dimensions.width*(o.visual.rings?o.visual.rings.outerDiameter/o.dimensions.width:1)));
 const room=Math.max(120,height-180);
 let pixelsPerMeter=Math.min(room/maxHeight,Math.max(220,width*.65)/maxWidth);
 const required=p=>60+objects.reduce((sum,o)=>sum+Math.max(110,o.dimensions.width*p*(o.visual.rings?o.visual.rings.outerDiameter/o.dimensions.width:1)+32),0);
 if(objects.length*110+60<=width){let low=0,high=room/maxHeight;for(let n=0;n<50;n++){const mid=(low+high)/2;if(required(mid)<=width)low=mid;else high=mid;}pixelsPerMeter=low;}
 let x=30;
 const items=objects.map(o=>{
  const w=o.dimensions.width*pixelsPerMeter, h=o.dimensions.height*pixelsPerMeter;
  const visualWidth=o.visual.rings?o.visual.rings.outerDiameter*pixelsPerMeter:w;
  const slot=Math.max(110,visualWidth+32);
  const item={id:o.id,x:x+slot/2,width:w,height:h,slot,visualWidth}; x+=slot; return item;
 });
 const totalWidth=Math.max(width,x+30);
 if(x+30<width){const offset=(width-x-30)/2; items.forEach(i=>i.x+=offset);}
 const baseline=Math.max(90,(height-maxHeight*pixelsPerMeter)/2);
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
