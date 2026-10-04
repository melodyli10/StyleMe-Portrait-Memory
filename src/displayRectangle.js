// Shared display-space geometry. Source pixels and export dimensions never change.
export function fitDisplayRectangle(sourceWidth,sourceHeight,availableWidth,availableHeight){
 if(![sourceWidth,sourceHeight,availableWidth,availableHeight].every(n=>Number.isFinite(n)&&n>0))return {width:0,height:0,left:0,top:0,scale:0}
 const scale=Math.min(1,availableWidth/sourceWidth,availableHeight/sourceHeight)
 const width=sourceWidth*scale,height=sourceHeight*scale
 return {width,height,left:(availableWidth-width)/2,top:(availableHeight-height)/2,scale}
}
export function comparisonPercent(clientX,left,width){return width>0?Math.max(0,Math.min(100,(clientX-left)/width*100)):50}
