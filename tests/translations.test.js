import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dictionary,translateText,loadLanguage,LANGUAGES,LANGUAGE_KEY} from '../src/translations.js'

test('every dictionary entry has all three supported translations',()=>{
 for(const [english,row] of Object.entries(dictionary))for(const locale of LANGUAGES)assert.ok(row[locale]?.trim(),`${english}: ${locale}`)
})
test('approved names are presented without changing internal mode values',()=>{
 assert.equal(translateText('StyleMe Adaptive'),'Smart Style')
 assert.equal(translateText('StyleMe Adaptive','zh'),'智能记忆风格')
 assert.equal(translateText('Fixed Preset','zh'),'固定预设')
 assert.equal(translateText('StyleMe','zh'),'StyleMe')
 assert.equal(translateText('adaptive','zh'),'adaptive')
})
test('locale loading is allowlisted and tolerates missing or blocked storage',()=>{
 assert.equal(loadLanguage({getItem:()=>null}),'en')
 assert.equal(loadLanguage({getItem:()=>'<script>'}),'en')
 assert.equal(loadLanguage({getItem:()=>{throw new Error('blocked')}}),'en')
 for(const locale of LANGUAGES)assert.equal(loadLanguage({getItem:key=>key===LANGUAGE_KEY?locale:null}),locale)
})
test('important changing status retains its actual measurements',()=>{
 for(const locale of LANGUAGES.slice(1)){
  const text=translateText('One face detected · 478 landmarks. Original photo unchanged.',locale)
  assert.ok(text.includes('478'));assert.ok(!text.includes('One face detected'))
  const status=translateText('Saved/profile eye 70, face 0. Applied eye 60, face 0.',locale)
  for(const number of ['70','60','0'])assert.ok(status.includes(number))
  assert.ok(!status.includes('Applied eye'))
 }
})
test('all upload errors and warp geometry rejections have translations',()=>{
 for(const file of ['imageUpload.js','eyeWarp.js','faceWarp.js']){
  const source=readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8')
  const messages=[...source.matchAll(/(?:skip\(|fail\(|new (?:Error|RangeError)\()'([^']+)'/g)].map(m=>m[1]).filter(m=>m!=='Empty image'&&!m.includes('output buffer')&&m!=='Image sizes must match.')
  for(const message of messages)for(const locale of LANGUAGES.slice(1))assert.notEqual(translateText(message,locale),message,`${file}: ${message}`)
 }
})
test('language translation does not alter technical identifiers or user filenames',()=>{
 for(const locale of LANGUAGES)assert.equal(translateText('portrait-1320.png · 1320 × 1320 px',locale),'portrait-1320.png · 1320 × 1320 px')
})

test('final locales exclude Hindi without modifying profile storage',()=>{assert.deepEqual(LANGUAGES,['en','zh','ko']);assert.equal(loadLanguage({getItem:()=> 'hi'}),'en');for(const row of Object.values(dictionary))assert.equal(row.hi,undefined)})
