export interface StudioConfig { connected:boolean; freeOnly:boolean; imageEnabled:boolean; videoEnabled:boolean }
export async function studioRequest(action:string,code:string,body:unknown={},signal?:AbortSignal) {
 const response=await fetch(`/api/studio/${action}`,{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Code':code},body:JSON.stringify(body),signal,cache:'no-store'})
 if(!response.ok){let message='Không kết nối được xưởng. Hãy kiểm tra mạng.';try{message=(await response.json()).error||message}catch{}throw new Error(message)}
 return response
}
export const MODES = {banner:'Banner gia đình',fun:'Ảnh vui nhộn',game:'Hình cho trò chơi',video:'Hoạt cảnh video'} as const
export type Mode=keyof typeof MODES
export const EXAMPLES:Record<Mode,string>={
 banner:'Gia đình cùng khám phá khu vườn cổ tích, thỏ trắng và hoa hướng dương, khung cảnh ấm áp, không có chữ.',
 fun:'Bé và bố mẹ trở thành những nhà thám hiểm trong một thế giới đồ chơi khổng lồ, vui tươi và gần gũi.',
 game:'Minh họa trò hái đúng ba quả táo: ba quả táo đỏ tách biệt bên cạnh một chiếc giỏ mây rỗng, không có chữ.',
 video:'Một chú thỏ trắng tưới hoa hướng dương. Hoa từ từ nở, thỏ vẫy tay. Máy quay đứng yên, chuyển động nhẹ nhàng.'
}
export function copyBrief(prompt:string,style:string,ratio:string,age:string,gameTitle='') {
 const look=style==='3d'?'Hoạt hình 3D ấm áp, chất liệu mềm mại':style==='photo'?'Ảnh tự nhiên, ánh sáng rõ':'Tranh truyện dịu nhẹ'
 return `Tạo hình cho bé ${age==='24-36'?'2–3':age} tuổi. Phong cách: ${look}. Khung hình ${ratio}. ${gameTitle?`Minh họa đúng trò chơi: ${gameTitle}. `:''}Bố cục thoáng, chủ thể nằm trọn trong khung, không thêm chữ hoặc logo. Giữ đúng số lượng đồ vật trong mô tả.\n\n${prompt}`
}
