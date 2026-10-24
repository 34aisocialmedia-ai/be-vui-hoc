# Bé Vui Học

Trò chơi học tập cho trẻ mầm non (React 18 + Vite, PWA), kèm Xưởng sáng tạo AI dùng 34AI cho phụ huynh.

- Chạy thử: `npm install` rồi `npm run dev`.
- Kiểm tra: `node --import ./tests/register.mjs --test --experimental-test-isolation=none tests/*.test.mjs`
- Đưa lên: Netlify tự build mỗi lần có thay đổi trên nhánh `main` (xem `netlify.toml`, `DUA-LEN-NETLIFY.md`).
- Khóa 34AI mặc định: biến môi trường `AI34_API_KEY` trên Netlify (không ghi khóa vào mã nguồn).
