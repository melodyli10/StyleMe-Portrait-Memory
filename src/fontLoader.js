// Load only the selected locale's fonts. Browser unicode ranges fetch needed glyphs.
const google=family=>'https://fonts.googleapis.com/css2?'+family+'&display=swap'
const sheets={
 brand:google('family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400'),
 en:google('family=Plus+Jakarta+Sans:wght@400;500;600'),
 zh:google('family=LXGW+WenKai&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@400;500'),
 ko:google('family=Noto+Serif+KR:wght@400;500'),
 pretendard:'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css',
}
export function loadLocaleFonts(locale){
 for(const key of ['brand',locale,...(locale==='ko'?['pretendard']:[])]){
  if(document.querySelector(`[data-font-sheet="${key}"]`))continue
  const link=document.createElement('link');link.rel='stylesheet';link.href=sheets[key];link.dataset.fontSheet=key;document.head.append(link)
 }
}
