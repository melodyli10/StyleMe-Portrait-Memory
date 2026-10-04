import badge from './assets/brand/styleme-badge.png'
import { portraits, portraitImage } from './portraitAssets.js'
import { mountProduct } from './product.js'
// The shell moves existing editor nodes; it never recreates photo or profile state.
import { mountLanguage } from './translations.js'
import './site.css'
import './homeComposition.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/allura/latin-400.css'
import '@fontsource/caveat/latin-500.css'

const icons = {
 lock: '<rect x="6" y="10" width="12" height="11" rx="1"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
 heart: '<path d="M12 20 4 12C-1 5 7 1 12 7c5-6 13-2 8 5Z"/>',
 bolt: '<path d="m13 2-8 12h7l-1 8 8-13h-7Z"/>',
 photo: '<rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m2 17 6-6 5 5 4-4 5 5"/>',
 learn: '<path d="m1 8 11-6 11 6-11 6ZM5 11v7l7 4 7-4v-7M23 8v11"/><circle cx="23" cy="21" r="1"/>',
 sparkle: '<path d="m10 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM21 1l1 3 3 1-3 1-1 3-1-3-3-1 3-1"/>',
 globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
}
const icon = name => `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`
const portrait = (variant, extra='') => portraitImage(portraits.gallery[variant-1],extra)
const benefits = [['lock','Privacy-first','Photos stay on your device'],['heart','Your style, your way','Only confirmed settings are saved'],['bolt','Less repetitive editing','Start closer, every time']]
const steps = [['photo','Edit Your Photo','Upload a portrait and<br>adjust it to your preference.','studio'],['learn','Teach StyleMe','Confirm up to five photos<br>to build your personal style.','teach'],['sparkle','Apply Your Style','Upload a new portrait and<br>apply your remembered style.','studio']]

export function mountSiteShell(api) {
 const app=document.querySelector('#app'), editor=app.querySelector('main')
 app.querySelector('.masthead').remove()
 editor.id='studio';editor.classList.add('studio-view');editor.hidden=true
 editor.querySelector('.intro').innerHTML='<p class="eyebrow">YOUR PORTRAIT, YOUR PREFERENCE</p><h1>Edit Your Photo</h1><p>Simple controls. Your style, your way.</p>'
 const memory=editor.querySelector('.memory-controls');memory.id='my-style';memory.tabIndex=-1
 app.insertAdjacentHTML('afterbegin', `
 <header class="site-header">
  <a class="brand" href="#home" aria-label="StyleMe home"><img class="brand-badge" src="${badge}" alt="" width="44" height="44"><span>StyleMe</span></a>
  <nav aria-label="Main navigation">${[['home','Home'],['studio','Studio'],['my-style','My Style'],['how-it-works','How It Works'],['privacy','Privacy'],['about','About']].map(([id,label])=>`<a href="#${id}">${label}</a>`).join('')}<a href="/evaluation/">Evaluation</a></nav>
  <div class="header-actions"><label class="language-control">${icon('globe')}<select id="language" aria-label="Language"><option value="en">English</option><option value="zh">简体中文</option><option value="ko">한국어</option></select></label><a class="pill header-cta" href="#studio">Start Editing</a></div>
 </header>
 <main id="home" class="home-view">
  <section class="hero" aria-label="Your edits, remembered.">
   <div class="hero-art" aria-label="StyleMe campaign portraits">${portraitImage(portraits.couple,'hero-couple',true)}</div>
   <div class="hero-copy"><p class="hero-kicker">PORTRAIT EDITING, PERSONAL TO YOU</p><h1>Your edits,<br><em>remembered.</em></h1><p class="hero-description">Teach StyleMe your preferences.<br>Apply your personal style to your next portrait.</p><div class="hero-actions"><a class="pill" href="#studio">Start Editing <span aria-hidden="true">→</span></a><a class="pill blush" href="#teach">Teach My Style</a></div></div>
   <span translate="no" class="hand-note note-left" aria-hidden="true">Same you.<br>A smarter edit.</span>
   <a class="floating-card" href="#my-style"><p translate="no">One style.<br>More possibilities.</p><span class="campaign-miniatures">${[0,1,4].map(i=>portraitImage(portraits.gallery[i],'campaign-mini')).join('')}</span></a>
   <div class="benefits">${benefits.map(([i,t,d])=>`<div class="benefit"><span class="benefit-icon">${icon(i)}</span><div><strong>${t}</strong><small>${d}</small></div></div>`).join('')}</div>
  </section>
  <section id="home-how-summary" class="how-panel"><div class="how-intro"><h2>How StyleMe Works</h2><p>A simple 3-step journey to your personal<br>editing style.</p></div>${steps.map(([i,t,d,link],n)=>`<a class="how-step" href="#${link}"><span class="step-number">${n+1}</span><div>${icon(i)}<h3>${t}</h3><p>${d}</p></div>${n<2?'<span class="step-arrow" aria-hidden="true">›</span>':''}</a>`).join('')}</section>
  <section class="people"><div class="people-intro"><h2>Your beauty, remembered.</h2><p>Refine it your way. StyleMe remembers.</p></div><div class="portrait-gallery">${['My style<br>My way','Natural<br>Confident','Same you<br>Brighter you','Your edits<br>Remembered','Unique<br>Always you'].map((text,i)=>`<figure>${portrait(i+1)}<figcaption translate="no" aria-hidden="true">${text}</figcaption></figure>`).join('')}</div></section><p class="illustration-disclosure">StyleMe campaign visuals. Not customers, editing results or sample inputs.</p>
 </main>
 <section id="privacy" class="information-view" hidden><p class="eyebrow">YOUR PRIVACY MATTERS</p><h1>Your photos.<br><em>Always yours.</em></h1><p>Portrait processing stays in your browser. StyleMe saves only the confirmed style information needed for your remembered preferences.</p><div class="privacy-principles"><article><span class="principle-icon">${icon('lock')}</span><h2>Photos stay on your device</h2><p>Your uploaded portraits and edited pixels stay in this browser. We do not send them to an editing service or save them in your profile.</p></article><article><span class="principle-icon">${icon('heart')}</span><h2>Only confirmed settings are saved</h2><p>Local memory keeps confirmed strengths, compact geometry ratios and duplicate-check digests. Reset clears active edits; profile settings let you delete saved choices.</p></article><article><span class="principle-icon">${icon('sparkle')}</span><h2>You stay in control</h2><p>The built-in sample is for editing and export only. It cannot become a teaching example or an evaluation case.</p><a href="#my-style">Review my saved settings</a></article></div><div class="privacy-flow"><span>Your portrait</span><b aria-hidden="true">→</b><span>Local editing</span><b aria-hidden="true">→</b><span>Confirmed settings</span><b aria-hidden="true">→</b><span>Next portrait</span></div><details><summary>Network requests & local storage</summary><p>The face model downloads from Google. Web fonts load from Google Fonts and jsDelivr. These services receive normal connection information, but never your uploaded portrait pixels.</p><p>Clearing browser data removes your saved profile. There is no account or cloud backup.</p></details></section>
 <section id="about" class="information-view" hidden><p class="eyebrow">OUR STORY</p><h1>Editing shouldn't feel like<br><em>a never-ending repeat.</em></h1><p>You shouldn't have to make the same small adjustments over and over again. StyleMe remembers the preferences you confirm, so your next edit starts closer to you.</p><div class="story-cards"><article><p class="eyebrow">THE PROBLEM</p><h2>Same edits, over and over.</h2><p>A new portrait often means repeating familiar choices — adjusting eye size, refining face shape, checking the result, and doing it again on the next photo. Those small decisions take time and attention.</p></article><article><p class="eyebrow">OUR SOLUTION</p><h2>StyleMe remembers you.</h2><p>StyleMe saves the editing preferences you intentionally confirm and turns them into a personal starting point for future portraits.</p></article><article><p class="eyebrow">THE RESULT</p><h2>Less repetition. More you.</h2><p>Start closer to the look you already choose, while keeping control of every edit.</p></article></div><div class="mission-strip"><div><p class="eyebrow">OUR PROMISE</p><h2>Your beauty, remembered.</h2><p>Refine it your way. StyleMe remembers.</p></div>${portraitImage(portraits.gallery[0],'mission-portrait')}</div><details><summary>Current capabilities & limitations</summary><p>Fixed Preset and Smart Style use the same pixel-editing engine. Smart Style uses a geometry-based rule only when the setup examples support it. Better results have not been established through comparative evaluation.</p><p>Use a clear portrait with an unobstructed jaw. Homepage models are campaign visuals, not customers or editing results.</p></details></section>`)
 mountProduct(app,editor,memory,api)
 mountLanguage(app,document.getElementById('language'))
}
