import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequest,configuration,validateCreation,extractImage,signJob,verifyJob,allowedDownload } from '../functions/api/studio/[[path]].js'
import { copyBrief } from '../src/studio/client.ts'
const env={GEMINI_API_KEY:'test-key-not-real',STUDIO_ACCESS_CODE:'test-only-long-secret-access-code',AI_FREE_ONLY:'false',AI_GENERATION_ENABLED:'true',AI_VIDEO_ENABLED:'true'}
const input={mode:'game',prompt:'Three apples beside an empty basket.',style:'3d',ratio:'1:1',age:'3-4',consent:true,costAccepted:true,images:[]}
const request=(path,body=input,code=env.STUDIO_ACCESS_CODE,origin='https://example.test')=>new Request(`https://example.test/api/studio/${path}`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Studio-Code':code},body:JSON.stringify(body)})
test('free Studio handoff retains age, style, aspect ratio and the selected game',()=>{
 const text=copyBrief('Ba quả táo','3d','1:1','24-36','Hái táo')
 for(const value of ['2–3','3D','1:1','Hái táo','Ba quả táo'])assert.ok(text.includes(value))
})
test('studio defaults to free-only and blocks paid generation even with enable flags',async()=>{
 const config=configuration({...env,AI_FREE_ONLY:undefined})
 assert.equal(config.freeOnly,true);assert.equal(config.imageEnabled,false);assert.equal(config.videoEnabled,false)
 let calls=0;const original=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw new Error('must not call Google')}
 try{for(const path of ['image','video']){const result=await onRequest({request:request(path),env:{...env,AI_FREE_ONLY:'true'}});assert.equal(result.status,403)}assert.equal(calls,0)}finally{globalThis.fetch=original}
})
test('studio does not expose credentials and rejects cross-origin, invalid access and missing setup',async()=>{
 const status=await onRequest({request:new Request('https://example.test/api/studio/status'),env})
 assert.equal(status.headers.get('cache-control'),'no-store')
 assert.ok(!(await status.text()).includes(env.GEMINI_API_KEY))
 assert.equal((await onRequest({request:request('image',input,'wrong'),env})).status,401)
 assert.equal((await onRequest({request:request('image',input,env.STUDIO_ACCESS_CODE,'https://outside.test'),env})).status,403)
 assert.equal((await onRequest({request:request('image'),env:{}})).status,503)
})
test('studio validates consent, body size, photo formats and excludes uploaded photos from video',async()=>{
 assert.throws(()=>validateCreation({...input,consent:false}))
 assert.throws(()=>validateCreation({...input,costAccepted:false}))
 assert.throws(()=>validateCreation({...input,images:[{mimeType:'image/svg+xml',data:'YWJj'}]}))
 assert.throws(()=>validateCreation({...input,images:[{mimeType:'image/png',data:'YWJj'}]}))
 assert.throws(()=>validateCreation({...input,mode:'video',ratio:'16:9',images:[{}]},true))
 const response=await onRequest({request:request('image',{...input,prompt:'x'.repeat(6*1024*1024)}),env})
 assert.equal(response.status,413)
})
test('image adapter uses private stateless Google input and extracts only image output',async()=>{
 const original=globalThis.fetch;let sent
 globalThis.fetch=async(url,options)=>{sent={url,options,body:JSON.parse(options.body)};return Response.json({steps:[{type:'model_output',content:[{type:'image',mime_type:'image/png',data:'iVBORw0KGgo='}]}]})}
 try{const result=await onRequest({request:request('image'),env});assert.equal(result.status,200);assert.equal((await result.json()).mimeType,'image/png');assert.equal(sent.body.store,false);assert.equal(sent.options.headers['x-goog-api-key'],env.GEMINI_API_KEY);assert.equal(sent.body.response_format.aspect_ratio,'1:1');assert.equal(sent.body.input[0].type,'text')}
 finally{globalThis.fetch=original}
 assert.throws(()=>extractImage({steps:[{type:'model_output',content:[{type:'text',text:'refusal'}]}]}))
})
test('Google quota and permission failures return actionable messages without leaking raw provider responses',async()=>{
 const original=globalThis.fetch
 try{for(const status of [403,429]){globalThis.fetch=async()=>new Response(`secret=${env.GEMINI_API_KEY}`,{status});const result=await onRequest({request:request('image'),env});assert.equal(result.status,status===429?429:502);assert.ok(!(await result.text()).includes(env.GEMINI_API_KEY))}}finally{globalThis.fetch=original}
})
test('video job signatures cannot be tampered with or used against another access secret',async()=>{
 const name='models/veo-3.1-fast-generate-preview/operations/test123',token=await signJob(name,env)
 assert.equal(await verifyJob(token,env),name)
 await assert.rejects(verifyJob(token+'x',env))
 await assert.rejects(verifyJob(token,{...env,STUDIO_ACCESS_CODE:'different-code'}))
 await assert.rejects(signJob('https://attacker.test/secret',env))
 for(const uri of ['http://storage.googleapis.com/a','https://attacker.test/a','https://generativelanguage.googleapis.com.attacker.test/a','https://user:pass@storage.googleapis.com/a'])assert.throws(()=>allowedDownload(uri))
 assert.equal(allowedDownload('https://storage.googleapis.com/video.mp4').hostname,'storage.googleapis.com')
})
test('video status supports pending and ready jobs without exposing download URLs',async()=>{
 const token=await signJob('models/veo-3.1-fast-generate-preview/operations/test123',env),original=globalThis.fetch
 try{globalThis.fetch=async()=>Response.json({done:false});assert.deepEqual(await(await onRequest({request:request('video-status',{token}),env})).json(),{done:false});globalThis.fetch=async()=>Response.json({done:true,response:{generateVideoResponse:{generatedSamples:[{video:{uri:'https://storage.googleapis.com/private.mp4'}}]}}});assert.deepEqual(await(await onRequest({request:request('video-status',{token}),env})).json(),{done:true})}finally{globalThis.fetch=original}
})
