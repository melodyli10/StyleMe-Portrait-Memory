// Home campaign assets from the supplied final reference pack; never Studio inputs.
import couple from './assets/home-approved-final/hero-couple-transparent.png'
import woman from './assets/home-approved-final/01-asian-woman.png'
import man from './assets/home-approved-final/02-east-asian-man.png'
import blonde from './assets/home-approved-final/03-blonde-woman.png'
import southAsian from './assets/home-approved-final/04-curly-haired-man.png'
import curly from './assets/home-approved-final/05-curly-haired-woman.png'
export const portraits={couple:{src:couple,width:1448,height:1086},gallery:[woman,man,blonde,southAsian,curly].map(src=>({src,width:1122,height:1402}))}
export function portraitImage(asset,className='',eager=false){
 return `<img class="approved-portrait ${className}" src="${asset.src}" width="${asset.width}" height="${asset.height}" alt="StyleMe campaign portrait" loading="${eager?'eager':'lazy'}" decoding="async">`
}
