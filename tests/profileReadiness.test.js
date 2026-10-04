import test from 'node:test'
import assert from 'node:assert/strict'
import {profileReadiness} from '../src/profileReadiness.js'
test('incomplete profiles never claim readiness',()=>{for(let n=0;n<5;n++){const s=profileReadiness(n);assert.equal(s.title,'Your style is taking shape.');assert.match(s.helper,/Keep teaching/);assert.ok(!s.title.includes('ready'))}})
test('five confirmed examples produce ready copy',()=>{assert.equal(profileReadiness(5).title,'Your style is saved and ready.');assert.equal(profileReadiness(5).helper,'Your confirmed preferences are ready to apply.')})
