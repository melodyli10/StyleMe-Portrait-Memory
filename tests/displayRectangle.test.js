import test from 'node:test'
import assert from 'node:assert/strict'
import {fitDisplayRectangle,comparisonPercent} from '../src/displayRectangle.js'
for(const [w,h] of [[500,750],[600,1800],[1600,900],[1200,1200],[3000,500]])test(`shared rectangle contains ${w}x${h} without changing aspect ratio`,()=>{
 for(const [sw,sh]of [[850,520],[320,420]]){const r=fitDisplayRectangle(w,h,sw,sh);assert.ok(r.width<=sw+1e-9&&r.height<=sh+1e-9);assert.ok(Math.abs(r.width/r.height-w/h)<1e-10);assert.equal(r.left,(sw-r.width)/2);assert.equal(r.top,(sh-r.height)/2)}
})
test('comparison mapping follows the display rectangle and clamps outside pointer positions',()=>{assert.equal(comparisonPercent(300,100,400),50);assert.equal(comparisonPercent(50,100,400),0);assert.equal(comparisonPercent(600,100,400),100)})

test('small source is never enlarged',()=>{const r=fitDisplayRectangle(120,80,900,600);assert.equal(r.scale,1);assert.equal(r.width,120);assert.equal(r.height,80)})
