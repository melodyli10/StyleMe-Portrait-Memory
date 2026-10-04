import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {sampleRecords} from '../src/sampleCatalog.js'
import {isSampleDigest,assertEvaluationNotSamples} from '../src/samplePolicy.js'
test('exactly one approved demo is bundled and its digest matches the guard',()=>{
 assert.equal(sampleRecords.length,1)
 const sample=sampleRecords[0]
 const bytes=readFileSync(new URL('../src/assets/samples/'+sample.file,import.meta.url))
 assert.equal(createHash('sha256').update(bytes).digest('hex'),sample.digest)
 assert.equal(isSampleDigest(sample.digest),true)
})
test('demo is rejected from held-out evaluation while ordinary digests remain allowed',()=>{
 assert.throws(()=>assertEvaluationNotSamples(['user-photo',sampleRecords[0].digest]),/Demo portraits/)
 assert.doesNotThrow(()=>assertEvaluationNotSamples(['other-photo']))
 assert.equal(isSampleDigest(undefined),false)
})
