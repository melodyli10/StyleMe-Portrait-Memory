// Education only: no image processing or persistence.
export const demoStages=['Portrait loaded','Adjust your look','Confirm preference','Your style is remembered','New portrait illustration','Apply My Style','Remembered strength applied']
export function demoState(step){
 const index=Math.max(0,Math.min(6,Math.trunc(Number(step)||0)))
 return {index,label:demoStages[index],strength:index===1||index===2||index===3||index===6?60:0,saved:index>=3,second:index>=4}
}
