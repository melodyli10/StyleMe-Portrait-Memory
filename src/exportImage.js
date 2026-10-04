export function pngBlob(canvas) {
 return new Promise((resolve,reject)=>{
  if(!canvas.width||!canvas.height)return reject(new Error('No image to export.'))
  try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed.')),'image/png')}catch{reject(new Error('PNG export failed.'))}
 })
}
export function downloadBlob(blob,name){
 const url=URL.createObjectURL(blob),link=document.createElement('a')
 link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
