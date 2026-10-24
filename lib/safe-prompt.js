/** Child-safe frame around every parent prompt for pictures and videos (34AI and Gemini). */
export function safePrompt(prompt, kind) {
  return `${prompt.trim()}\n\nYêu cầu chung: nội dung cho trẻ mầm non 2–6 tuổi ở Việt Nam; an toàn, ấm áp, tươi sáng; không bạo lực, không đáng sợ; không có chữ, logo hay hình mờ; chủ thể nằm trọn trong khung.${kind === 'video' ? ' Chuyển động nhẹ nhàng, không nhấp nháy, không cắt cảnh nhanh.' : ''}`
}
