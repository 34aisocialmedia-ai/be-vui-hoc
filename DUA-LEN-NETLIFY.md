# Đưa Bé Vui Học lên Netlify – 23/10/2026

Từ nay dùng **Netlify** thay cho Cloudflare Pages.

**Netlify chạy được gì**
- Netlify chạy cả trang web lẫn máy chủ nhỏ của Xưởng sáng tạo (Netlify Functions, ở Mỹ: US East, Ohio).
- Nhờ vậy không còn lỗi bị chặn theo khu vực như khi Cloudflare chạy ở trạm Hồng Kông.

**Ai dùng được Xưởng**
- Mọi người dùng app đều dùng được Xưởng bằng **khóa 34AI mặc định** của chủ app.
- Ai muốn dùng tài khoản 34AI riêng thì dán khóa trong Xưởng. Khóa riêng chỉ áp dụng cho thiết bị đó.

**Nội dung lưu ở đâu**
- Ảnh, video, giọng nói và trò chơi người dùng tạo vẫn lưu trên từng thiết bị của họ, như trước.

## Đưa lên (bấm đúp `trien-khai-netlify.cmd`)

Lần đầu, script làm lần lượt:
1. Cài thư viện, rồi chạy test.
2. Mở trình duyệt để **đăng nhập Netlify**, nếu chưa đăng nhập.
3. **Tạo trang Netlify mới**: chọn nhóm (team), đặt tên trang, ví dụ `be-vui-hoc`. Link app sẽ là `https://<tên>.netlify.app`.
4. Hỏi **khóa 34AI mặc định**: dán vào (Ctrl+V hoặc chuột phải đều được) rồi Enter. Khóa được lưu thành biến bí mật `AI34_API_KEY` của trang Netlify.
5. Build và đưa lên. Link nằm ở dòng *Production URL*.

Những lần sau chỉ cần bấm đúp lại; script không hỏi lại các bước đã xong.

**Đổi khóa mặc định:** bấm đúp `cai-dat-34ai-netlify.cmd`. Hoặc vào trang Netlify → *Project configuration → Environment variables* → `AI34_API_KEY`, rồi đưa lên lại.

## Bên trong

**Tệp mới**
- `netlify.toml`
- `netlify/functions/ai34.mjs` (đường dẫn `/api/ai34/*`)
- `netlify/functions/keys.mjs` (đường dẫn `/api/keys/*`)
- `lib/netlify-env.js`: khóa riêng của thiết bị lưu trong **Netlify Blobs** thay cho Cloudflare KV.
- `scripts/chuan-bi-netlify.mjs`
- `scripts/dat-khoa-34ai.mjs`
- `trien-khai-netlify.cmd`
- `cai-dat-34ai-netlify.cmd`

**Phần dùng lại**
- Logic 34AI không đổi (`lib/ai34.js`, `functions/api/ai34`, `functions/api/keys`). Hai Netlify Function chỉ là lớp nối.
- Thêm thư viện `@netlify/blobs` vào `package.json`.

**Giới hạn của Netlify**
- Mỗi lệnh máy chủ chạy tối đa 60 giây. Các lệnh 34AI đều ngắn, vì app tự theo dõi tác vụ.
- Tệp kết quả tải qua máy chủ tối đa khoảng 20 MB một tệp. Ảnh và giọng nói không sao. Video dài, độ phân giải cao có thể vượt mức này.

**Đã kiểm tra**
- 81/81 test đạt.
- Hai Netlify Function chạy với Netlify Blobs giả lập, gồm khóa mặc định, khóa riêng của thiết bị và chặn yêu cầu từ trang khác.
- Đã đóng gói thử bằng đúng bộ đóng gói của Netlify (zip-it-and-ship-it): cả hai hàm nhận đúng đường dẫn.

`trien-khai-dev.cmd` (Cloudflare) vẫn còn nhưng không cần dùng nữa.
