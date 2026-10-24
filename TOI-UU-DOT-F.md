# Đợt F: bộ hình vẽ 3D riêng và màn chơi kiểu game (21/10/2026)

## 1. Bộ hình vẽ 3D của Bé Vui Học (`src/art/`)

**Số lượng:** 228 hình vẽ, cộng 10 hình mẫu, đủ cho mọi hình các trò đang dùng (250 loại). Không còn biểu tượng có sẵn trong màn chơi.

**Phong cách:** 3D mềm như phim hoạt hình. Khối tròn căng, ánh sáng chiếu từ trên trái, điểm sáng bóng, không có nét viền. Con vật và nhân vật có mắt to long lanh.

**Vẽ theo cách bé Việt Nam quen thuộc:**
- 🍚 bát cơm có đũa đặt ngang miệng bát;
- 🍜 bát phở;
- 🍱 khay cơm mầm non;
- 🛕 Chùa Một Cột;
- 🏛 Khuê Văn Các;
- 🌉 cầu Long Biên;
- 👗 áo dài;
- ⛑ mũ bảo hiểm xe máy;
- 🧑‍🌾 nông dân đội nón lá;
- 💂 chú bộ đội đội mũ cối;
- 🎭 chú Tễu múa rối nước.

**Hình đổi theo câu chữ của trò:**
- Màu: "Quả bóng đỏ" vẽ quả bóng đỏ, "Rổ xanh" vẽ cái rổ xanh. Với quả và lá, "xanh" là xanh lá.
- Con non: "Mèo con", "Cún con" vẽ nhỏ hơn, mắt to hơn mèo mẹ, chó mẹ.

**"Đôi mắt":** vẽ đủ hai mắt có mi và lông mày, không còn một con ngươi đơn lẻ.

**Ảnh chụp còn giữ:** chỉ ảnh thật các địa danh Hà Nội (Lăng Bác, Hồ Gươm…) và các tranh cảnh truyện. Ảnh chụp con vật và hoa quả đã thay bằng hình vẽ.

**Phần thưởng:** nhãn dán và kệ đồ chơi dùng hình vẽ mới khi đã có hình. Các món chưa có hình (ví dụ ngựa một sừng) giữ hình 3D cũ.

## 2. Màn chơi kiểu game: chỉ dùng thẻ khi cần

**Chọn đáp án (87 trò):**
- Không còn thẻ trắng. Đồ vật đứng thẳng trên khung cảnh, có vầng sáng mềm phía sau, bóng dưới chân, tên ghi trên nhãn tròn.
- App tự chọn cách xếp (hàng ngang hay hàng dọc) cho hình to nhất. Trên điện thoại, hai đáp án xếp trên dưới, mỗi hình khoảng 220 px.
- Đồ để đếm, so sánh, quy luật đứng to trên cảnh, không bị nhét trong bóng thoại. Nhóm đồ vật nằm trên tấm thảm mềm.
- Ô số còn thiếu là viên kẹo 3D.

**Phân loại:** cái giỏ vẽ thật, đúng màu. Đồ vật không có thẻ, bé kéo thẳng vào giỏ.

**Gõ nhịp:** miếng đệm thành nút trống tròn bóng. Nút nào đang kêu thì sáng lên và lún xuống.

**Vị trí và khớp bóng:**
- Bỏ khung trắng quanh bảng.
- Đồ vật đứng trên vầng sáng.
- Bóng in mờ trên cỏ.

**Giữ thẻ vì cần cho cách chơi:** lật thẻ, ghép đôi, xếp tranh truyện. Các thẻ này được làm mềm và bo tròn, có gờ màu như đồ chơi.

## 3. Chuyển động

- Đồ vật rơi nảy vào lần lượt khi câu hỏi mới hiện ra.
- Lúc chờ, đồ vật khẽ nhún, mỗi món lệch nhịp nhau.
- Chọn đúng: hình bật nhảy lên, vầng sáng xanh, nhãn tên chuyển xanh.
- Chọn sai: hình nghiêng, mờ đi.
- Gợi ý: vầng sáng vàng phập phồng quanh đáp án đúng.
- Ở mức hiệu ứng Nhẹ chỉ còn mờ dần. Ở mức Tắt thì đứng yên.

## Kiểm tra

- `tsc` không lỗi. 56/56 test đạt.
  - Đã sửa 2 test cũ vốn kiểm tra ảnh chụp, nay kiểm tra hình vẽ: đếm 4 quả là 4 hình riêng.
- Chụp đủ 17 cách chơi trên điện thoại và máy tính bảng. Khi màn hình dọc, mọi trò vừa khung.
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước:
  - chơi hết lượt;
  - kéo thả vào giỏ;
  - hoạt cảnh 17 cách chơi;
  - album;
  - kệ đồ chơi;
  - màn chúc mừng 3 thế giới;
  - chơi thử Đợt D.
- **Tốc độ:** đã thử trên máy giả lập chậm hơn 6 lần, mỗi câu chỉ 0–2 khung hình bị chậm.
- **Dung lượng:** bộ hình thêm khoảng 50 KB tải lần đầu (đã nén). Bù lại, không phải tải ảnh chụp con vật, hoa quả nữa.

## Hoàn tác

Bản trước của các file đã sửa nằm trong `backup-truoc-dot-f-20261021/`.
1. Chép các file đó về chỗ cũ.
2. Xóa thư mục `src/art/`.
