// Local preview of the actual Pages handler, with no Google credentials or paid calls.
import http from 'node:http'
import { readFile,stat } from 'node:fs/promises'
import path from 'node:path'
import { onRequest } from '../functions/api/studio/[[path]].js'
const root=path.resolve('dist'),port=4175
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://127.0.0.1:${port}`)
  if(url.pathname.startsWith('/api/studio/')){
   const chunks=[];let size=0
   for await(const chunk of req){size+=chunk.length;if(size>6*1024*1024){res.writeHead(413);res.end();return}chunks.push(chunk)}
   const response=await onRequest({request:new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),env:{AI_FREE_ONLY:'true'}})
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return
  }
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname))
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  if(!(await stat(file).catch(()=>null))?.isFile())file=path.join(root,'index.html')
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file))
 }catch{res.writeHead(500);res.end('Preview failed')}
}).listen(port,'127.0.0.1',()=>console.log(`Studio preview: http://127.0.0.1:${port} (free-only, no credentials)`))
