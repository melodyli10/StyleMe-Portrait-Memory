import {sampleRecords} from './sampleCatalog.js'
const assets=import.meta.glob('./assets/samples/*.{png,jpg}',{eager:true,query:'?url',import:'default'})
export const samples=sampleRecords.map(s=>({...s,src:assets[`./assets/samples/${s.file}`]}))
