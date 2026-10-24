# Nhập khóa 34AI và khóa Gemini ngay trong app – 23/10/2026

## Cách dùng

1. Bấm đúp `trien-khai-dev.cmd` như mọi lần. Lần đầu, script tự tạo kho lưu khóa trên Cloudflare (KV tên `be-vui-hoc-khoa-api`) và ghi `wrangler.toml` để gắn kho vào app.
2. Mở app → **Ba mẹ** → **Xưởng sáng tạo AI** → mục **🔑 Khóa API**. Dán khóa rồi bấm **Kiểm tra và lưu**:
   - **khóa 34AI**: lấy ở 34AI → Cài đặt → API key;
   - **khóa Gemini**: lấy ở aistudio.google.com → Get API key.
3. Khi đã có cả hai khóa, phía trên các mục có nút **Dùng AI của: 34AI | Gemini**. Nguồn được chọn áp dụng cho ảnh, video, giọng nói, tạo trò chơi và giọng đọc của trò trong thư viện.

**Xưởng không cần mã truy cập** (đã bỏ theo yêu cầu 23/10). Chỉ còn phép tính "Ba mẹ" chặn bé ở cửa khu phụ huynh.

## An toàn

**Khóa không nằm trên thiết bị**
- Khóa đi từ ô nhập thẳng lên máy chủ của app (Cloudflare Pages Functions) và chỉ lưu trong KV thuộc tài khoản Cloudflare của gia đình.
- Trình duyệt, localStorage và mã nguồn không giữ khóa. App chỉ hiện vài ký tự cuối, ví dụ `34ai_live_…7766`.

**Kiểm tra trước khi lưu**
- Máy chủ gọi thử 34AI hoặc Google. Khóa bị từ chối thì không lưu.
- Chỉ trang của chính app mới gọi được máy chủ (kiểm tra cùng nguồn).

**Cần biết khi không có mã truy cập**
- Ai mở được link app và qua được phép tính "Ba mẹ" thì cũng dùng được xưởng: tốn credit của khóa, và có thể thay hoặc xóa khóa.
- Nếu gửi link app cho người ngoài, nên đặt giới hạn chi tiêu trong 34AI và Google AI Studio.

**Cách cũ vẫn dùng được**
- Biến bí mật `AI34_API_KEY`, `GEMINI_API_KEY` trên Cloudflare vẫn chạy. Khóa nhập trong app được ưu tiên.
- `STUDIO_ACCESS_CODE` không còn tác dụng với xưởng.

## Gemini làm được gì (Interactions API)

| Mục | Model mặc định | Ghi chú |
|---|---|---|
| Tạo ảnh | `gemini-nano-banana-2.1` | Tối đa 6 ảnh tham chiếu. Khung 1:1, 16:9, 9:16, 4:3, 3:4. Độ phân giải 1K, 2K, 4K. Có ảnh ngay. |
| Tạo video | `gemini-omni-1.1-flash` | Tối đa 3 ảnh tham chiếu (1 ảnh thì làm khung hình đầu). Khung 16:9 hoặc 9:16, độ phân giải 720p hoặc 1080p. Chạy nền, app tự theo dõi. Rời trang rồi quay lại vẫn nhận được kết quả. |
| Giọng nói | `gemini-3.8-flash-tts` | 30 giọng có sẵn, có ghi phong cách đọc. Đọc được tiếng Việt. |
| Tạo trò chơi | `gemini-3.8-flash` | Dùng cùng giáo án và cùng bộ kiểm tra câu hỏi như 34AI. |

Có thể đổi model ở mục "Model Gemini (nâng cao)".

Veo 3.1 bản preview đã ngừng từ 22/10/2026, nên video dùng Gemini Omni.

## Sửa lỗi quan trọng

`public/_routes.json` trước đây chỉ cho `/api/studio/*` chạy qua máy chủ. Vì vậy các lệnh `/api/ai34/*` của lần tích hợp trước sẽ không tới được máy chủ khi đưa lên Cloudflare. Nay đã đổi thành `/api/*`.

## Tệp

**Mới**
- `lib/keystore.js`
- `lib/gemini.js`
- `lib/http.js`
- `lib/safe-prompt.js`
- `functions/api/keys/[[path]].js`
- `functions/api/gemini/[[path]].js`
- `scripts/chuan-bi-kho-khoa.mjs`
- `tests/keys.test.mjs`

**Sửa**
- `functions/api/ai34/[[path]].js`
- `src/studio/Studio.tsx`
- `src/studio/ai34.ts`
- `src/studio/media.tsx`
- `src/app.css`
- `public/_routes.json`
- `trien-khai-dev.cmd`: thêm bước kho khóa, dùng wrangler 4.
- `.gitignore`
- `.env.example`
- `cai-dat-34ai.cmd`: không còn hỏi mã truy cập, và không bắt buộc nữa.

**Tự sinh khi triển khai**
- `wrangler.toml`: chỉ có mã số kho KV, không có bí mật.

**Lưu ý:** khi có `wrangler.toml`, Cloudflare lấy tệp này làm cấu hình. Biến **bí mật** đặt trên Cloudflare vẫn giữ nguyên. Biến **thường** (không phải bí mật) đặt trên dashboard thì cần chép vào `wrangler.toml`. App hiện không dùng biến thường nào bắt buộc.

## Kiểm tra

**76/76 test đạt.** Các test mới kiểm tra:
- lưu khóa, khóa không lộ ra trình duyệt;
- xóa khóa;
- cách cũ dùng biến bí mật;
- máy chủ chưa có kho;
- ảnh, giọng, video, trò chơi qua Gemini;
- dạng yêu cầu gửi Google.

**Chạy thật trên Cloudflare Pages dev (workerd + KV cục bộ)**, màn máy tính và điện thoại:
1. Lưu khóa Gemini và khóa 34AI.
2. Chọn Gemini, tạo ảnh có ảnh bé, giọng nói, video.
3. Tải lại trang: khóa vẫn còn.
4. Không thấy khóa trong trang hay bộ nhớ trình duyệt.

Không có lỗi JavaScript.

**Chưa thử với 34AI và Google thật**, vì máy chủ thử không ra được internet. Phần tạo nội dung được giả lập.

## Hoàn tác

Bản cũ của các tệp đã sửa nằm trong `backup-truoc-khoa-api-20261023/`.

## Sửa lỗi khóa Gemini (23/10, 11h)

- **Lỗi:** mọi lệnh Gemini đều báo "Gemini đang gặp lỗi tạm thời".
  - Nguyên nhân: mã gọi Google dùng tùy chọn `redirect: 'error'`. Cloudflare không cho dùng tùy chọn này nên chặn lệnh trước khi tới Google.
  - Đã bỏ tùy chọn đó. Đã thêm test giả lập đúng quy tắc của Cloudflare để lỗi này không quay lại.
- **Kiểm tra khóa khi lưu**
  - Chỉ từ chối khi Google trả lời rõ "API key not valid".
  - Các trường hợp khác (khu vực, hạn mức, mạng) vẫn lưu khóa và hiện nguyên lời Google trả về.
- **Nút "Thử kết nối"** cạnh mỗi khóa: gửi một câu rất ngắn tới Gemini bằng khóa đã lưu, rồi hiện câu trả lời hoặc lời báo lỗi của Google.
- **Chỉ cần khóa Gemini là dùng được hết:** tạo ảnh, video, giọng nói, soạn trò chơi. App tự chọn Gemini khi chưa có khóa 34AI.

## Gemini bị chặn "User location is not supported" (23/10, 11h30)

- **Nguyên nhân:**
  - Khóa vẫn đúng. Cloudflare thường chạy app cho người dùng ở Việt Nam tại trạm Hồng Kông, mà Google không cho gọi Gemini API từ Hồng Kông.
  - 34AI dùng được cùng khóa vì máy chủ của 34AI đặt ở khu vực được hỗ trợ.
- **Sửa:** thêm **trạm chuyển tiếp Gemini** (thư mục `relay/`). Đây là một Cloudflare Worker nhỏ tên `be-vui-hoc-gemini`, đặt cố định gần vùng Google Cloud `us-central1` (Mỹ).
  - App gọi trạm qua service binding `GEMINI_RELAY`, trạm chuyển lệnh tới Google.
  - Trạm không có địa chỉ công khai, chỉ chuyển tới `generativelanguage.googleapis.com/v1beta/…` và không lưu gì.
- **Triển khai:** `trien-khai-dev.cmd` tự đưa trạm lên rồi gắn vào app (`wrangler.toml` được ghi lại mỗi lần chạy).
  - Nếu cửa sổ báo "Tram Gemini: Chua dua len duoc", chụp màn hình dòng đó lại.
  - Có thể tài khoản Cloudflare chưa được dùng tính năng đặt vùng (placement), khi đó cần cách khác.
- **Kiểm tra:** sau khi triển khai, nút "Thử kết nối" báo "… qua trạm Mỹ" là app đang đi qua trạm.

## Chỉ dùng 34AI (23/10, 11h40)

Theo yêu cầu, Xưởng chỉ còn **một ô khóa 34AI**:
- Bỏ ô khóa Gemini, bỏ nút chọn nguồn AI và mục model Gemini.
- Ảnh, video, giọng nói và soạn trò chơi đều chạy qua 34AI. Danh sách model của 34AI đã có sẵn các model Gemini: Nano Banana, Gemini TTS, Gemini chat.
- `trien-khai-dev.cmd` không còn đưa trạm chuyển tiếp Gemini lên. Thư mục `relay/` và các tệp Gemini phía máy chủ vẫn còn trong mã nhưng không được dùng.

## Khóa 34AI mặc định và khóa riêng từng thiết bị (23/10, 11h50)

**Khóa mặc định**
- Là khóa 34AI của chủ app, lưu ở biến bí mật `AI34_API_KEY` trên Cloudflare.
- Mọi thiết bị dùng khóa này, không cần nhập gì.
- Lần chạy `trien-khai-dev.cmd` tới, nếu Cloudflare chưa có khóa mặc định, cửa sổ sẽ hỏi: dán khóa 34AI một lần rồi bấm Enter.
- Muốn đổi khóa mặc định sau này: chạy `cai-dat-34ai.cmd`.

**Khóa riêng**
- Trong Xưởng → **Khóa API 34AI**, người dùng có thể dán khóa của mình. Khóa này chỉ áp dụng trên **thiết bị đó**: lưu trên máy chủ theo một mã thiết bị ngẫu nhiên, đã băm.
- Các thiết bị khác vẫn dùng khóa mặc định.
- Bấm "Dùng lại khóa mặc định" để bỏ khóa riêng.

**An toàn**
- Không ai thay hay xóa được khóa mặc định từ trong app.
- Trình duyệt không bao giờ nhận được khóa, chỉ thấy 4 ký tự cuối.

**Kiểm tra:** 80/80 test đạt. Đã chạy thử trên Cloudflare Pages dev:
- khóa mặc định hiện đúng;
- thiết bị A lưu khóa riêng, thiết bị B vẫn dùng khóa mặc định;
- thiết bị A bỏ khóa riêng thì quay về khóa mặc định.

## Lỗi "34AI báo: HTTP 400" (23/10, 12h)

- **Nguyên nhân:** khóa mặc định trên Cloudflare chỉ là một ký tự lạ (`\x16`). Lỗi xảy ra khi dán khóa bằng Ctrl+V vào ô nhập ẩn của wrangler trong cửa sổ đen: wrangler ghi lại phím Ctrl+V chứ không dán khóa.
- **Sửa:**
  - Có tệp mới `scripts/dat-khoa-34ai.mjs`. Tệp này hỏi khóa bằng một dòng nhập thường (dán được bằng Ctrl+V hoặc chuột phải), bỏ ký tự lạ, kiểm tra dạng `34ai_live_…`, rồi mới gửi cho Cloudflare.
  - `cai-dat-34ai.cmd` và bước hỏi khóa trong `trien-khai-dev.cmd` đều dùng tệp này.
  - Máy chủ tự bỏ dấu cách và ký tự lạ quanh khóa.
  - Nếu khóa mặc định sai dạng, Xưởng hiện cảnh báo đỏ và hướng dẫn chạy lại `cai-dat-34ai.cmd`.
