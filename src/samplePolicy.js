import {sampleRecords} from './sampleCatalog.js'
const demoDigests=new Set(sampleRecords.map(s=>s.digest))
export const isSampleDigest=digest=>demoDigests.has(digest)
export function assertEvaluationNotSamples(digests){
 if(digests.some(isSampleDigest))throw new Error('Demo portraits cannot enter evaluation. Select your own held-out photos.')
}
