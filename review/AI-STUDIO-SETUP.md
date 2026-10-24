# Xưởng sáng tạo — 19/10/2026

## Sử dụng

Vào **Cài đặt dành cho phụ huynh → Xưởng sáng tạo AI**.

- Chuẩn bị mô tả cho banner, ảnh vui nhộn, bìa trò chơi hoặc hoạt cảnh.
- Chọn lứa tuổi, trò chơi, phong cách và khung hình.
- Trong chế độ chỉ miễn phí: sao chép mô tả, tự kiểm tra quyền sử dụng tại AI Studio, tạo ở đó nếu tài khoản được phép, rồi dùng **Hoặc dùng ảnh đã có** để nhập kết quả.
- Xem trước → Lưu vào thư viện → chọn nơi sử dụng → Dùng ảnh đã duyệt.
- Có thể khôi phục hình mặc định, tải ảnh/video xuống và xóa nội dung khỏi thư viện.

Thư viện IndexedDB chỉ áp dụng cho trình duyệt/thiết bị hiện tại. Không tự đăng ảnh bé lên website công khai. Một ảnh có một vị trí sử dụng; ảnh bìa không thay đổi đáp án hoặc luật chơi. Xóa dữ liệu trình duyệt sẽ mất thư viện nên tải xuống các ảnh cần giữ.

## Trạng thái Google và chi phí

Đã xác minh API key do chủ app cung cấp truy cập được danh sách model Google. Không gọi tạo ảnh hoặc video có tính phí.

Theo tài liệu chính thức kiểm tra ngày 19/10/2026, các API tạo ảnh Nano Banana và Veo không có Free Tier. Có key và nhìn thấy model trong danh sách không chứng minh tài khoản được tạo ảnh/video miễn phí.

- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/veo
- https://ai.google.dev/gemini-api/docs/interactions-overview

Cloudflare production có các secret GEMINI_API_KEY, STUDIO_ACCESS_CODE và AI_FREE_ONLY=true. Mã truy cập xưởng được lưu riêng tại thư mục `.codex/private` của chủ máy, không đưa vào source hoặc dist. Key đã được chia sẻ trong chat nên chủ tài khoản cần xoay key và cập nhật secret.

Mặc định và bản phát hành hiện tại **khóa mọi yêu cầu tạo ảnh/video tính phí ở máy chủ**, kể cả khi giao diện bị chỉnh sửa. Không tự fallback sang model khác, không tự nâng cấp billing, không tự retry yêu cầu tạo ảnh.

## Kiến trúc

- UI xưởng được lazy-load, nằm sau cửa phụ huynh.
- API `/api/studio/*` chạy qua Cloudflare Pages Functions; không nhúng Google key vào JavaScript phía trình duyệt.
- POST có kiểm tra Origin và mã truy cập quản trị. Mã chỉ giữ trong RAM của phiên xưởng.
- Ảnh đầu vào tối đa hai JPEG/PNG/WebP; trình duyệt thu nhỏ cạnh dài tới 1280px và mã hóa lại để bỏ EXIF. Máy chủ kiểm tra loại ảnh, chữ ký tệp và giới hạn payload 6 MB.
- Gemini Interactions tạo ảnh với `store:false`; ảnh gửi chỉ khi người lớn xác nhận và bấm tạo. Google vẫn có chính sách xử lý dữ liệu riêng; không tuyên bố Google không lưu dữ liệu.
- Veo nhận mô tả, chưa nhận ảnh trẻ em. Tác vụ có mã ký HMAC, hết hạn sau 24 giờ; kiểm tra lại tác vụ không tạo thêm video. Bỏ theo dõi không hủy công việc tại Google.
- Video tải qua proxy kiểm tra host; không chuyển API key tới host chuyển hướng khác.
- Thư viện giới hạn 20 nội dung / 60 MB, video tối đa 32 MB; có tải xuống khi lưu không thành công.

## Cấu hình tương lai — chỉ khi chủ app đồng ý trả phí

Không thực hiện các thay đổi sau theo yêu cầu hiện tại. Để triển khai trả phí sau này: xác nhận ngân sách, hạn mức và quyền model, rồi quản trị viên đặt AI_FREE_ONLY=false và AI_GENERATION_ENABLED=true; AI_VIDEO_ENABLED=true nếu cho phép video. Model mặc định là gemini-nano-banana-2.1 và veo-3.1-fast-generate-preview; có thể thay qua GEMINI_IMAGE_MODEL / GEMINI_VIDEO_MODEL. Cần redeploy sau khi đổi secrets.

## Kiểm thử

- 47 kiểm tra tự động đạt: 39 kiểm tra game hiện có + 8 kiểm tra API/xưởng, gồm khóa miễn phí, xác thực, Origin, payload, consent, lỗi Google, tác vụ video và chống đổi địa chỉ tải.
- Gọi Google tạo nội dung được mô phỏng trong kiểm tra; chưa kiểm thử đầu ra thật vì yêu cầu không trả phí.
- Build TypeScript/Vite đạt; API worker biên dịch được.
- Worker runtime cục bộ trên máy Windows bị lỗi native; dùng `node scripts/preview-studio.mjs` để kiểm thử giao diện với cùng handler thật và không có credential. Không cài thêm runtime hệ thống.
- Browser đã thử nhập ảnh mẫu, lưu IndexedDB, áp dụng banner, mở lại trang và áp dụng bìa đúng game.

## Chạy lại

```powershell
npm test
npm run build
node scripts/preview-studio.mjs
```

Phát hành bằng `npx wrangler pages deploy dist --project-name be-vui-hoc-test --branch main`. `_routes.json` giới hạn Functions ở `/api/studio/*`.

- Production API status đã xác minh: connected=true, freeOnly=true, imageEnabled=false, videoEnabled=false. POST tạo ảnh với mã truy cập hợp lệ bị chặn HTTP 403 trước khi gọi Google.
- UI production đã kiểm tra ở 320 và 390 CSS px, không tràn ngang, video bị vô hiệu hóa và console không có lỗi/cảnh báo.
- Đã kiểm tra sao chép mô tả trên production: giữ lứa tuổi, phong cách, tỉ lệ khung hình và yêu cầu đúng số lượng.
- Đã kiểm tra nút khôi phục hình mặc định trên thư viện thử nghiệm; ảnh vẫn giữ trong thư viện và bỏ gán thành công.
- Bản phát hành đã xác minh: https://c7446fd4.be-vui-hoc-test.pages.dev — tên miền chính https://be-vui-hoc-test.pages.dev/.
- Ảnh chụp giao diện: review/ai-studio-release.jpg.
