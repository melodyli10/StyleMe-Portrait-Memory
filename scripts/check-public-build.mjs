import {readdir,readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(`${dir}/${e.name}`):`${dir}/${e.name}`))).flat()
const files=await walk('dist')
assert.ok(files.includes('dist/index.html'))
assert.ok(files.includes('dist/evaluation/index.html'),'Review navigation needs a built Lab entry')
for(const path of files){
 assert.ok(!/\/tests\//.test(path),`Development tests in build: ${path}`)
 assert.ok(!/\.(json|csv|jpe?g|png|webp)$/i.test(path)||/\/(?:styleme-badge|walkthrough-second|approved-demo|hero-couple-transparent|01-asian-woman|02-east-asian-man|03-blonde-woman|04-curly-haired-man|05-curly-haired-woman)-[\w-]+\.png$/.test(path),`Unexpected data/image file in build: ${path}`)
 if(path.endsWith('.js'))assert.ok(!(await readFile(path,'utf8')).includes('Synthetic mechanics test criteria'),'Test fixture in review bundle')
}
console.log(`Review build audit passed: ${files.length} files; Lab route included, only approved images, no datasets or result files.`)
