/** Text allowed on a picture: only a game title for a cover (letters, numbers, simple punctuation). */
export function cleanTitle(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/["“”'‘’`<>{}\[\]\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)
}

/** Child-safe frame around every parent prompt for pictures and videos (34AI and Gemini). */
export function safePrompt(prompt, kind, { title = '' } = {}) {
  const t = kind === 'image' ? cleanTitle(title) : ''
  const text = t ? `không có chữ nào khác ngoài dòng tiêu đề "${t}" (viết đúng chính tả tiếng Việt, đủ dấu), không logo hay hình mờ` : 'không có chữ, logo hay hình mờ'
  return `${prompt.trim()}\n\nYêu cầu chung: nội dung cho trẻ mầm non 2–6 tuổi ở Việt Nam; an toàn, ấm áp, tươi sáng; không bạo lực, không đáng sợ; ${text}; chủ thể nằm trọn trong khung.${kind === 'video' ? ' Chuyển động nhẹ nhàng, không nhấp nháy, không cắt cảnh nhanh.' : ''}`
}
