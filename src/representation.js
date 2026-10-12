export const hasProcedural3d=o=>['stars','galaxies','black-holes','cosmos'].includes(o.family)||['atom','dna','virus','bacterium','sperm'].includes(o.visual.kind)||['water','red-blood-cell'].includes(o.id)||o.category==='space'&&['sphere','ellipsoid'].includes(o.visual.kind);
export function usesImage(o,quality='3d'){return quality!=='vector'&&!!o.visual.image&&(quality!=='3d'||!o.visual.glb&&!hasProcedural3d(o));}
export function displayDimensions(o,quality='3d'){
 const d=o.dimensions,b=o.visual.imageBounds;
 if(!b||!usesImage(o,quality))return {width:d.width,height:d.height};
 const ratio=b.width/b.height,anchor=o.visual.imageScaleBasis||(o.visual.schematicWidth?'height':null);
 return anchor==='height'?{width:d.height*ratio,height:d.height}:anchor==='width'?{width:d.width,height:d.width/ratio}:{width:d.width,height:d.height};
}
