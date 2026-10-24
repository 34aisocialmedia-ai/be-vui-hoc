# Tích hợp 34AI vào Xưởng sáng tạo (khu phụ huynh) – 23/10/2026

## Cài đặt một lần

1. Bấm đúp `cai-dat-34ai.cmd`. Lần lượt dán:
   - **API key 34AI** (bắt đầu bằng `34ai_live_`);
   - **mã truy cập xưởng** (tự đặt, ít nhất 20 ký tự).

   Khóa được gửi thẳng lên Cloudflare Pages (`be-vui-hoc-test`). Khóa không được lưu vào tệp nào trên máy.
2. Bấm đúp `trien-khai-dev.cmd` để đưa bản mới lên.
3. Mở app → **Ba mẹ** → **Xưởng sáng tạo AI · 34AI** → nhập mã truy cập xưởng.

Khi chạy thử trên máy: chép `.env.example` thành `.dev.vars` rồi điền khóa vào (cả hai tệp đã được git bỏ qua). Muốn tạm tắt mọi lệnh tạo: đặt `AI34_ENABLED=false`.

## Phụ huynh làm được gì

**Tạo ảnh**
- Tải ảnh bé hoặc ảnh gia đình (tối đa số ảnh model cho phép), hoặc lấy ảnh có sẵn trong thư viện.
- Chọn mẫu: bé hái táo, bé làm bác sĩ, bé là phi công, bé đánh răng, bé dạo Hồ Gươm, bé chơi nhạc, bé qua đường cùng mẹ, banner gia đình, nhãn dán chân dung bé, bìa trò phân loại, thẻ hình con vật.
- Chọn model, khung hình và chất lượng. App chỉ hiện những lựa chọn mà model đó có.
- Dùng kết quả: **banner trang chủ**, **bìa của bất kỳ trò nào**, hoặc làm **ảnh đáp án** trong trò chơi của nhà mình.

**Tạo video**
- Cũng tải ảnh bé như trên. Mẫu: bé vẫy tay chào, bé nhảy cùng Gấu Bắp, bé tưới cây hoa nở, bé bay qua cầu vồng, bé reo mừng chiến thắng, hạt mầm lớn thành cây, gà con nở, mưa và cầu vồng.
- Chọn độ dài, khung hình, cách dùng ảnh (khung hình đầu, ghép nhân vật…) và chế độ Pro (khi model có).
- Dùng kết quả: **banner video** trên trang chủ.

**Giọng nói**
- Mẫu lời: lời chào có tên bé, lời khen, nhắc đánh răng, nhắc nghỉ mắt, chúc ngủ ngon, đồng dao "Dung dăng dung dẻ".
- Chọn model giọng và 1 trong 30 giọng đọc, ghi phong cách đọc. Bấm "Xem chi phí dự kiến" để biết số credit trước khi tạo.
- Dùng kết quả: **lời chào trang chủ**. Bé bấm nút loa trên banner sẽ nghe lời chào có tên mình.

**Tạo trò chơi từ ý tưởng**
- Phụ huynh viết ý tưởng (có 9 mẫu: bé nhận ra người thân, bữa sáng, đồ chơi bé yêu, đi sở thú, an toàn trong nhà, chuẩn bị đi học, nghề nghiệp, thời tiết, cảm xúc), rồi chọn lứa tuổi.
- Có thể chọn ảnh gia đình trong thư viện và ghi tên ("Mẹ", "Bé Na"). Chỉ tên được gửi đi, ảnh vẫn nằm trên máy.
- AI (model chat của 34AI) soạn trò "chọn hình đúng" theo giáo án mầm non:
  - số câu và số lựa chọn theo tuổi;
  - chỉ dùng 238 hình 3D có sẵn của app hoặc ảnh gia đình;
  - mỗi câu đúng một đáp án;
  - máy chủ kiểm tra lại và bỏ câu sai trước khi trả về.
- Xem trước từng câu, rồi bấm "Chơi thử ngay" hoặc "Lưu và đưa ra trang chủ". Trò hiện ở mục **Trò chơi của nhà mình**.
- Trong thư viện có nút "Tạo giọng đọc cho các câu". Bấm vào thì cô đọc câu hỏi bằng giọng AI. Chưa tạo thì app phát tiếng "ting".

**Thư viện của gia đình**
- Lưu trên thiết bị, tối đa 60 nội dung hoặc 200 MB. Lọc theo ảnh, video, giọng nói, trò chơi.
- Với mỗi nội dung có thể: đổi nơi dùng, thôi dùng, tải xuống hoặc xóa. Xóa một trò thì xóa luôn giọng đọc của trò đó.

## Làm đúng đặc tả 34AI

**Khóa API**
- Khóa chỉ nằm trên máy chủ (Cloudflare Pages Functions, `functions/api/ai34/[[path]].js` và `lib/ai34.js`).
- Trình duyệt chỉ gọi `/api/ai34/*`, có kiểm tra cùng nguồn và mã truy cập xưởng.
- Nhật ký chỉ ghi `request_id` và mã lỗi, không ghi khóa.

**Model**
- `GET /v1/models` được lưu tạm 5 phút.
- Chỉ gửi `ratio`, `duration`, `resolution`, `quality`, `input_mode`, `generation_mode` khi model khai báo trong capabilities.
- Model có `media_type` audio chỉ dùng `/v1/audio/generations`.

**Ảnh tham chiếu**
- Ảnh được thu nhỏ và bỏ thông tin vị trí ngay trên máy.
- Máy chủ kiểm tra định dạng thật của tệp, sau đó làm đủ ba bước: presign, PUT với đúng `headers` được trả về, rồi complete.
- Chỉ truyền `key` của ảnh, không truyền URL hay base64.

**Chống tạo trùng**
- Mỗi lệnh tạo có một `Idempotency-Key` riêng.
- Khi gửi lại sau lỗi 429 hoặc 5xx, app dùng lại đúng khóa cũ nên không tạo trùng và không bị trừ credit hai lần.
- Khi gặp `price_changed`, app gửi lại một lần bằng khóa mới.

**Theo dõi tác vụ**
- Kiểm tra lần đầu sau 3 giây, mỗi lần sau chờ lâu gấp 1,5, tối đa 15 giây một lần.
- Giới hạn tổng: ảnh và giọng 5 phút, video 20 phút.
- Hiện `public_state.label` ("Đang gửi", "Đang tạo"…).
- Mã tác vụ được lưu trên máy. Rời trang rồi quay lại, app tự nhận tiếp kết quả.

**Kết quả**
- Tệp được tải qua máy chủ. Mỗi lần tải, máy chủ đọc lại tác vụ để lấy link ký mới, nên link hết hạn không gây lỗi.
- Tệp lưu vào thư viện trên thiết bị. Trình duyệt không thấy link ký.

**Lỗi**
- Xử lý theo `error.code`, mỗi mã có một thông báo tiếng Việt dễ hiểu.
- 402 không tự thử lại. 429 chờ theo `Retry-After`. 5xx thử lại có giãn cách.

**Nội dung an toàn**
- Máy chủ luôn thêm yêu cầu "cho trẻ mầm non, an toàn, không chữ, không logo" vào mô tả.
- Bắt buộc người lớn đánh dấu đồng ý dùng ảnh và đồng ý trừ credit trước mỗi lần tạo.

## Khác đặc tả

- **Theo dõi tác vụ chạy ở trình duyệt, không chạy ở máy chủ.** Cloudflare Pages không có tiến trình chạy nền hay cơ sở dữ liệu. Vì vậy trình duyệt tự hỏi trạng thái theo đúng lịch trên. Mỗi lần hỏi là một yêu cầu ngắn tới máy chủ, không giữ kết nối chờ.
- **Mã tác vụ và kết quả lưu trên máy của gia đình** (localStorage và IndexedDB), không lưu trong cơ sở dữ liệu máy chủ.
- Nếu sau này cần lưu tập trung, có thể thêm Cloudflare D1/R2 và một Worker theo dõi tác vụ.

## Tệp mới / sửa

**Mới**
- `lib/ai34.js`
- `lib/family-game.js`
- `lib/pictures.js`
- `functions/api/ai34/[[path]].js`
- `src/studio/ai34.ts`
- `src/studio/templates.ts`
- `src/studio/familyGames.ts`
- `tests/ai34.test.mjs`
- `.env.example`
- `cai-dat-34ai.cmd`

**Sửa**
- `src/studio/Studio.tsx`: giao diện mới.
- `src/studio/media.tsx`: thư viện nhận video, giọng nói, trò chơi.
- `src/audio.ts`: đọc giọng của trò gia đình.
- `src/App.tsx`
- `src/components/HomeWebsite.tsx`: banner ảnh/video, lời chào, trò của nhà mình.
- `src/components/LearningPicture.tsx`: hiện ảnh gia đình trong trò chơi.
- `src/app.css`

Xưởng Google cũ (`functions/api/studio`) vẫn còn nhưng giao diện không dùng nữa.

## Kiểm tra

**70/70 test đạt.** Trong đó có 14 test 34AI chạy với HTTP giả lập, không gọi 34AI thật:
- tạo thành công;
- dùng lại Idempotency-Key khi thử lại;
- 402;
- 429 có Retry-After;
- tác vụ `failed`;
- hết thời gian theo dõi;
- kiểm tra tham số theo capabilities;
- tải ảnh tham chiếu;
- yêu cầu mã truy cập và cùng nguồn;
- đọc trò chơi do AI viết.

**Chơi thử trên trình duyệt** (máy chủ 34AI giả lập), màn máy tính và điện thoại:
1. Mở xưởng.
2. Tải ảnh bé, tạo ảnh, theo dõi tiến độ, lưu làm banner.
3. Tạo lời chào, xem chi phí, lưu làm lời chào trang chủ.
4. Tạo trò chơi từ ý tưởng, lưu ra trang chủ.
5. Về trang chủ: thấy banner mới và mục "Trò chơi của nhà mình"; chơi trò đó với hình 3D.

Không có lỗi JavaScript.

**Chưa thử với 34AI thật** vì chưa có khóa. Lần đầu dùng khóa thật, nên tạo thử 1 ảnh để xem tên model và capabilities thực tế.

## Hoàn tác

Bản cũ của các tệp đã sửa nằm trong `backup-truoc-34ai-20261023/`.
