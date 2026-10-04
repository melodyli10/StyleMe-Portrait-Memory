import {defineConfig} from 'vite'
export default defineConfig({
 // Review build includes the Lab UI, never user-selected photos or local records.
 build:{rollupOptions:{input:{main:'index.html',evaluation:'evaluation/index.html'}}},
 plugins:[{name:'no-test-preview',configurePreviewServer(server){server.middlewares.use((req,res,next)=>{if(/^\/tests(\/|\?|$)/.test(req.url||'')){res.statusCode=404;res.end('Development tests are not included in the review build.')}else next()})}}],
})
