const BASE = 'https://generativelanguage.googleapis.com/v1beta'
const MAX_BODY = 6 * 1024 * 1024
const MIME = ['image/jpeg', 'image/png', 'image/webp']
const enc = new TextEncoder()
class StudioError extends Error { constructor(message, status=400) { super(message); this.status=status } }
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
export function configuration(env) {
 const connected=!!env.GEMINI_API_KEY && (env.STUDIO_ACCESS_CODE?.length??0)>=20
 const freeOnly=env.AI_FREE_ONLY!=='false'
 return {connected,freeOnly,imageEnabled:!freeOnly&&connected&&env.AI_GENERATION_ENABLED==='true',videoEnabled:!freeOnly&&connected&&env.AI_GENERATION_ENABLED==='true'&&env.AI_VIDEO_ENABLED==='true'}
}
async function authenticate(request,env) {
 const supplied=request.headers.get('X-Studio-Code')??''
 if(!supplied||supplied.length>200) throw new StudioError('Nhập mã truy cập xưởng do quản trị viên cung cấp.',401)
 const hashes=await Promise.all([supplied,env.STUDIO_ACCESS_CODE].map(s=>crypto.subtle.digest('SHA-256',enc.encode(s))))
 const a=new Uint8Array(hashes[0]),b=new Uint8Array(hashes[1]); let difference=0
 for(let i=0;i<a.length;i++)difference|=a[i]^b[i]
 if(difference)throw new StudioError('Mã truy cập xưởng chưa đúng.',401)
}
async function bodyOf(request) {
 if(!request.headers.get('Content-Type')?.includes('application/json'))throw new StudioError('Định dạng yêu cầu không hợp lệ.',415)
 const reader=request.body?.getReader(); if(!reader)throw new StudioError('Thiếu nội dung.')
 const chunks=[]; let length=0
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX_BODY){await reader.cancel();throw new StudioError('Ảnh quá lớn. Hãy chọn tối đa hai ảnh nhỏ hơn.',413)}chunks.push(value)}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new StudioError('Nội dung không hợp lệ.')}
}
export function validateCreation(body,video=false) {
 if(!body||typeof body!=='object'||typeof body.prompt!=='string'||body.prompt.trim().length<10||body.prompt.length>1800)throw new StudioError('Mô tả cần từ 10 đến 1.800 ký tự.')
 if(!['banner','fun','game','video'].includes(body.mode)|| (video&&body.mode!=='video') || (!video&&body.mode==='video'))throw new StudioError('Loại nội dung chưa đúng.')
 if(!['3d','storybook','photo'].includes(body.style))throw new StudioError('Chọn phong cách hình ảnh.')
 if(!['24-36','3-4','4-5','5-6'].includes(body.age))throw new StudioError('Chọn lứa tuổi.')
 if(!['1:1','16:9','9:16'].includes(body.ratio)||(video&&body.ratio==='1:1'))throw new StudioError('Tỉ lệ khung chưa đúng.')
 if(body.consent!==true||body.costAccepted!==true)throw new StudioError('Người lớn cần xác nhận quyền sử dụng ảnh và chi phí trước khi tạo.')
 const images=body.images??[]
 if(!Array.isArray(images)||images.length>(video?0:2))throw new StudioError(video?'Video hiện chỉ nhận mô tả, không nhận ảnh gia đình.':'Chọn tối đa hai ảnh tham chiếu.')
 for(const image of images){
  if(!image||!MIME.includes(image.mimeType)||typeof image.data!=='string'||image.data.length>2800000||!image.data.length||!/^[A-Za-z0-9+/]+={0,2}$/.test(image.data))throw new StudioError('Ảnh phải là JPEG, PNG hoặc WebP, tối đa 2 MB sau xử lý.')
  let bytes;try{bytes=atob(image.data.slice(0,32))}catch{throw new StudioError('Dữ liệu ảnh bị lỗi.')}
  if(!(image.mimeType==='image/jpeg'&&bytes.startsWith('\xff\xd8\xff')||image.mimeType==='image/png'&&bytes.startsWith('\x89PNG\r\n\x1a\n')||image.mimeType==='image/webp'&&bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP'))throw new StudioError('Nội dung tệp không khớp định dạng ảnh.')
 }
 return {...body,prompt:body.prompt.trim(),images}
}
export function creativePrompt(body) {
 const style={ '3d':'Polished 3D animated family film illustration, tactile materials, warm lighting, rounded forms.',storybook:'Gentle illustrated picture-book art, soft texture and clear silhouettes.',photo:'Bright natural photography, realistic objects and proportions.' }[body.style]
 return `Create one family-friendly visual for a Vietnamese preschool learning app, ages ${body.age}. ${style} Simple composition, uncluttered background, no lettering or logos. Keep the entire subject inside the frame with generous margins. ${body.mode==='game'?'Accurately illustrate the described educational activity; preserve the requested object counts and differences. Do not invent extra objects or answer text.':body.mode==='banner'?'Wide welcoming family banner; keep faces and main subjects away from edges.':''} ${body.images.length?'Use the provided family photos only as references for this requested wholesome scene.':''} ${body.mode==='video'?'A short calm animation of animals or objects, no human characters, no dialogue, no flashing or rapid cuts.':''}\nAdult creative brief: ${body.prompt}`
}
async function google(env,path,body) {
 let response
 try{response=await fetch(`${BASE}/${path}`,{method:body?'POST':'GET',headers:{'x-goog-api-key':env.GEMINI_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(110000)})}
 catch{throw new StudioError('Google chưa phản hồi. Kiểm tra thư viện trước khi tạo lại để tránh phát sinh thêm lượt.',504)}
 if(!response.ok){await response.body?.cancel();throw new StudioError(response.status===429?'Google đã hết hạn mức hoặc đang giới hạn lượt. Hãy thử lại sau.':response.status===401||response.status===403?'Google chưa cho phép yêu cầu. Quản trị viên cần kiểm tra API key, quyền model và thanh toán.':response.status===404?'Model chưa khả dụng. Quản trị viên cần cập nhật cấu hình model.':'Google không tạo được nội dung này. Hãy kiểm tra mô tả hoặc cấu hình.',response.status===429?429:502)}
 return response.json()
}
export function extractImage(result) {
 const blocks=[result.output_image,...(result.steps??[]).filter(s=>s.type==='model_output').flatMap(s=>s.content??[])].filter(Boolean)
 const image=blocks.find(b=>b.data&&MIME.includes(b.mime_type)&&(b.type==='image'||b===result.output_image))
 if(!image||image.data.length>16000000)throw new StudioError('Google chưa trả về ảnh dùng được. Nội dung có thể bị bộ lọc từ chối.',422)
 return {mimeType:image.mime_type,data:image.data}
}
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')
const decode = value => Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))
async function signingKey(env) {return crypto.subtle.importKey('raw',enc.encode(env.STUDIO_ACCESS_CODE),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function signJob(name,env) {
 if(!/^models\/[a-zA-Z0-9._-]+\/operations\/[a-zA-Z0-9._-]+$/.test(name))throw new StudioError('Google trả về mã tác vụ chưa hỗ trợ.',502)
 const payload=encode(enc.encode(JSON.stringify({name,expires:Date.now()+24*60*60*1000})))
 return `${payload}.${encode(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(env),enc.encode(payload))))}`
}
export async function verifyJob(token,env) {
 try{if(typeof token!=='string'||token.length>2000)throw 0;const [payload,signature,extra]=token.split('.');if(extra||!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),enc.encode(payload)))throw 0;const job=JSON.parse(new TextDecoder().decode(decode(payload)));if(job.expires<Date.now()||!/^models\/[a-zA-Z0-9._-]+\/operations\/[a-zA-Z0-9._-]+$/.test(job.name))throw 0;return job.name}
 catch{throw new StudioError('Mã video không hợp lệ hoặc đã quá 24 giờ.',400)}
}
async function videoResult(env,token) {
 const result=await google(env,await verifyJob(token,env))
 if(result.error)throw new StudioError('Google không hoàn thành video. Hãy đổi mô tả và kiểm tra quyền model.',422)
 if(!result.done)return null
 const uri=result.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
 if(!uri)throw new StudioError('Google không trả video; nội dung có thể bị bộ lọc từ chối.',422)
 return uri
}
export function allowedDownload(uri) {
 const url=new URL(uri)
 if(url.protocol!=='https:'||url.username||url.password||url.port||!['generativelanguage.googleapis.com','storage.googleapis.com'].includes(url.hostname)&&!url.hostname.endsWith('.googleusercontent.com'))throw new StudioError('Địa chỉ video không hợp lệ.',502)
 return url
}
async function downloadVideo(uri,env) {
 for(let i=0;i<4;i++){
  const url=allowedDownload(uri)
  const response=await fetch(url,{headers:url.hostname==='generativelanguage.googleapis.com'?{'x-goog-api-key':env.GEMINI_API_KEY}:{},redirect:'manual',signal:AbortSignal.timeout(60000)})
  if(response.status>=300&&response.status<400){const location=response.headers.get('Location');await response.body?.cancel();if(!location)break;uri=new URL(location,url).href;continue}
  if(!response.ok){await response.body?.cancel();break}
  if(Number(response.headers.get('Content-Length'))>32*1024*1024){await response.body?.cancel();throw new StudioError('Video quá lớn để lưu vào thư viện.',413)}
  return new Response(response.body,{headers:{'Content-Type':'video/mp4','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
 }
 throw new StudioError('Chưa tải được video. Hãy kiểm tra lại tác vụ.',502)
}
export async function onRequest({request,env}) {
 try{
  const url=new URL(request.url),action=url.pathname.split('/').pop(),config=configuration(env)
  if(action==='status'&&request.method==='GET')return json(config)
  if(request.method!=='POST')return json({error:'Phương thức không hỗ trợ.'},405)
  if(request.headers.get('Origin')!==url.origin)throw new StudioError('Yêu cầu phải xuất phát từ ứng dụng.',403)
  if(!config.connected)throw new StudioError('Xưởng chưa kết nối Google. Quản trị viên cần cấu hình API key và mã truy cập trên máy chủ.',503)
  await authenticate(request,env)
  if(action==='unlock')return json(config)
  const body=await bodyOf(request)
  if(action==='image'||action==='video'){
   if(!config.imageEnabled||action==='video'&&!config.videoEnabled)throw new StudioError('Quản trị viên chưa bật tạo nội dung có tính phí.',403)
   const input=validateCreation(body,action==='video'),prompt=creativePrompt(input)
   if(action==='image'){
    const result=await google(env,'interactions',{model:env.GEMINI_IMAGE_MODEL||'gemini-nano-banana-2.1',store:false,input:[{type:'text',text:prompt},...input.images.map(i=>({type:'image',mime_type:i.mimeType,data:i.data}))],response_format:{type:'image',mime_type:'image/png',aspect_ratio:input.ratio}})
    return json(extractImage(result))
   }
   const model=env.GEMINI_VIDEO_MODEL||'veo-3.1-fast-generate-preview'
   if(!/^[a-zA-Z0-9._-]+$/.test(model))throw new StudioError('Cấu hình video chưa đúng.',503)
   const result=await google(env,`models/${model}:predictLongRunning`,{instances:[{prompt}],parameters:{aspectRatio:input.ratio,durationSeconds:8,resolution:'720p',sampleCount:1}})
   return json({token:await signJob(result.name,env)},202)
  }
  if(action==='video-status'||action==='video-download'){
   const uri=await videoResult(env,body.token)
   if(action==='video-status')return json({done:!!uri})
   if(!uri)return json({error:'Video đang được tạo.'},409)
   return await downloadVideo(uri,env)
  }
  return json({error:'Không tìm thấy chức năng.'},404)
 }catch(error){return json({error:error instanceof StudioError?error.message:'Không xử lý được yêu cầu. Hãy thử lại sau.'},error instanceof StudioError?error.status:500)}
}
