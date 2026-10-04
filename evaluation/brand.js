import '../src/v3.css'
import './v3-lab.css'

const dataset=document.getElementById('dataset')
dataset.addEventListener('change',()=>{document.getElementById('dataset-selection').textContent=dataset.files.length?`${dataset.files.length} files selected`:'No files selected'})
