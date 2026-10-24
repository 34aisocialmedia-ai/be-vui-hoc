# Đợt E: đưa thiết kế ba thế giới vào toàn bộ app (21/10/2026)

Đợt này áp các khung thiết kế trên trang "Bé Vui Học – Hướng đột phá" vào app thật:
- màn chơi (A2, B2, C2);
- màn chúc mừng (A3, B3, C3);
- bìa trò chơi;
- trang chủ.

Mọi hình mới đều vẽ bằng code (SVG), không phải tải thêm ảnh.

## 1. Màn chơi mang màu của thế giới

Mỗi trò thuộc một thế giới (Đảo, Nhà bạn, Phim). Điều này đúng cả khi bé mở trò từ "Tất cả trò chơi".

**Bạn đồng hành hỏi câu hỏi.**
- Thẻ câu hỏi của cả 17 cách chơi giờ là bóng thoại, có bạn đồng hành đứng ngay bên trái (`src/player/Host.tsx`).
- Bạn nhún lên khi bé đúng, nghiêng đầu khi bé sai, ngủ gật khi bé không chạm.
- Bạn cử động theo giọng cô Thủy trong lúc cô đọc câu hỏi, có vạch sóng âm nhỏ. `audio.ts` báo lúc giọng bắt đầu và lúc dừng.
- Hàng bạn đồng hành dưới đáy màn hình được bỏ, nên trên điện thoại có thêm chỗ cho trò chơi.
- Trò cho bạn ăn đã có con vật riêng nên giữ như cũ.

**Đảo:** nền trời xanh. Thẻ đáp án to, viền dày, mỗi thẻ một màu (xanh, hồng, tím, cam), có gờ bên dưới như nút đồ chơi.

**Nhà bạn:** nền ấm. Khung cảnh viền trắng như ô cửa. Thẻ đáp án màu cam và tím. Người hỏi là bạn bé đã chọn trong nhà.

**Phim:** nền kem, viền xanh đậm như truyện tranh. Khung cảnh là màn chiếu. Thanh tiến độ là dải phim, mỗi câu một ô.

Tiêu đề dùng chữ Baloo 2, chữ tròn và đậm. Chữ nằm sẵn trong `public/fonts`, nên chơi được khi mất mạng.

## 2. Màn chúc mừng riêng cho từng thế giới

**Đảo (A3)**
- Nền cam, có tia nắng xoay.
- Dòng "Trạm 1 xong!" và 3 ngôi sao.
- Bạn reo, cạnh đó là thẻ nhãn dán: chạm vào để dán vào album.
- Bản đồ nhỏ: trạm đã xong (dấu tích), trạm vừa mở (sáng, nhấp nháy), trạm còn khóa.
- Nút "Trạm tiếp theo" mở thẳng trạm sau. Bên dưới có "Chơi lại" và "Về đảo".

**Nhà bạn (B3)**
- Nền tím, dòng "Gấu Bắp vui quá! Cảm ơn bé đã chơi cùng!".
- Bạn đội vương miện. Thẻ "Quà mới cho phòng" kèm kệ 6 ô của trang album.
- Nút "Đặt vào phòng" dán nhãn.
- Sau khi dán, có thẻ "(Bạn) muốn chơi…" mở trò tiếp theo.

**Phim (C3)**
- Nền xanh đêm. Cảnh cuối nằm trong khung màn chiếu.
- Dòng "Hết tập 1!" và 3 ngôi sao.
- Thẻ "Tập 2 vừa mở" mở thẳng tập sau, bắt đầu từ khung truyện.
- Bên dưới có "Xem lại tập 1" và "Về các tập phim".

Trò mở từ thư viện dùng màn chúc mừng của thế giới trò đó thuộc về. Nút quay về ghi "Chọn trò khác".

**Khi quay về màn thế giới:**
- Màn chúc mừng đã khen rồi, nên không hiện thêm hộp chúc mừng thứ hai.
- Trạm hoặc tập vừa mở bật lên, kèm một nhãn nhỏ rồi mờ đi.

Ở mức hiệu ứng Nhẹ hoặc Tắt, các chuyển động này đứng yên.

## 3. Bìa trò chơi

**Cảnh nền vẽ SVG** (`src/components/CoverStage.tsx`):
- trò thuộc Đảo: đảo nhỏ giữa biển, có cây dừa;
- trò thuộc Nhà bạn: căn phòng có cửa sổ, kệ đồ chơi, tấm thảm;
- trò thuộc Phim: màn chiếu có rèm đỏ và đèn sân khấu.

Màu cảnh đổi theo chủ đề (toán, hình, âm nhạc, truyện…), nên các bìa đứng cạnh nhau không giống nhau.

**Mỗi bìa có:**
- nhãn thế giới (Đảo / Nhà bạn / Phim);
- nhãn cách chơi có hình nhỏ: Chạm chọn, Ghép đôi, Phân loại, Lật thẻ, Xếp truyện, Gõ nhịp, Hái chữ, Tìm đường, Cân…;
- nút chơi mang màu của thế giới.

**Bỏ các ký hiệu khó hiểu dưới bìa** ("?", "→", "1 2 3", "♪"…), vì nhãn cách chơi đã nói thay. Chỉ giữ chữ khi có ích: "Số nào còn thiếu?", "Hình nào tiếp theo?", "Gộp lại được mấy?".

**Sửa lỗi chữ "A" thừa:** trước đây mọi bìa "Vườn chữ…" đều có thêm chữ A, kể cả "Vườn chữ B C D Đ". Đã bỏ.

**Chuyển động:** bìa hiện lần lượt. Rê hoặc chạm vào bìa thì hình khẽ nhún, mây trôi.

## 4. Trang chủ

**Banner chào** (`src/components/HomeArt.tsx`):
- Đồi xanh, cầu vồng, mây trôi, bóng bay.
- Bốn bạn Thỏ, Gấu Bắp, Khỉ Con, Rùa Vàng lần lượt nhún nhảy.
- Dòng "Chào bé! Hôm nay chơi ở đâu?". Nút loa phát lời chào đã thu âm của cô Thủy.

**Ba cửa vẽ cảnh có chuyển động:**
- Đảo: sóng chạy, nắng xoay, cây dừa đung đưa, thuyền nhấp nhô.
- Nhà bạn: đèn đung đưa, mây qua cửa sổ, tim bay lên.
- Phim: rèm lay, đèn sân khấu nhấp nháy, sao lấp lánh.

## Kiểm tra

- `tsc` không lỗi. 56/56 test đạt. Test mới kiểm tra: trò nào cũng có nhãn cách chơi và thuộc một thế giới.
- Chơi trọn trong trình duyệt, trên điện thoại 390×844, 360×640 và máy tính bảng 820×1180, ở mức hiệu ứng Đầy đủ và Tắt:
  - **Đảo:** trạm 1 → "Trạm 1 xong!" → dán nhãn → "Trạm tiếp theo" mở đúng trạm 2.
  - **Phim:** tập 1 → "Hết tập 1!" → thẻ "Tập 2 vừa mở" mở khung truyện tập 2.
  - **Nhà bạn:** trò của bạn → "Đặt vào phòng" → thẻ trò tiếp theo → "Về nhà bạn".
  - Album, dữ liệu lưu và hành trình đều đúng. Không có lỗi JavaScript.
- Chụp đủ 17 cách chơi trên điện thoại: cách chơi nào cũng có bạn hỏi trong bóng thoại. Khi màn hình dọc, mọi trò vừa khung.
- Bạn đồng hành cử động khi giọng cô Thủy phát (đã thử với bản thu thật).
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước: chơi hết lượt, kéo thả, hoạt cảnh 17 cách chơi, album, kệ đồ chơi, chơi thử Đợt D, cài đặt hiệu ứng.

## Còn lại

- Hình đồ vật trong màn chơi (quả táo, con mèo…) vẫn là hình 3D có sẵn. Các hình này đã đúng nội dung từng câu, nên không vẽ lại.
- Điện thoại xoay ngang (844×390): nhiều trò phải thu nhỏ hết mức và vẫn cần cuộn một chút, như trước đây.

## Hoàn tác

Bản trước của các file đã sửa nằm trong `backup-truoc-dot-e-20261021/`.
1. Chép các file đó về chỗ cũ.
2. Xóa các file mới:
   - `src/player/Host.tsx`
   - `src/components/CoverStage.tsx`
   - `src/components/HomeArt.tsx`
   - `public/fonts/baloo-2-*`
