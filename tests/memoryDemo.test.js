import test from 'node:test'
import assert from 'node:assert/strict'
import {demoState} from '../src/memoryDemoState.js'
import {sampleRecords} from '../src/sampleCatalog.js'
import {readdirSync} from 'node:fs'
test('illustrated memory resets the new portrait and applies only at final stage',()=>{
 assert.equal(demoState(0).strength,0)
 assert.equal(demoState(2).saved,false)
 assert.equal(demoState(3).saved,true)
 assert.equal(demoState(4).strength,0)
 assert.equal(demoState(5).strength,0)
 assert.equal(demoState(6).strength,60)
 assert.deepEqual(demoState(0),demoState(-3))
})
test('five campaign assets are separate from the single Studio demo catalog',()=>{
 assert.equal(readdirSync(new URL('../src/assets/campaign/',import.meta.url)).filter(n=>n.endsWith('.png')).length,5)
 assert.equal(sampleRecords.length,1)
 assert.equal(sampleRecords[0].id,'approved-demo')
})
