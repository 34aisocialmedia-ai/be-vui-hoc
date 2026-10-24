# Ba cửa chơi: Đảo phiêu lưu, Nhà bạn thân, Phim của bé (21/10/2026)

Dựng theo trang thiết kế "Bé Vui Học – Hướng đột phá". Người dùng chọn dùng cả 3 hướng, mỗi trò gán vào một hướng.

## Trang chủ

Trang chủ có 3 cửa lớn, nằm dưới hàng chọn tuổi:

| Cửa | Dòng phụ hiện trên cửa |
|---|---|
| **Đảo phiêu lưu** | Số trạm đã đi hôm nay |
| **Nhà của (bạn)** | Số trò chơi cùng bạn |
| **Phim của bé** | Tập tiếp theo |

Bên dưới vẫn có "Tất cả trò chơi" như cũ, để chọn bất kỳ trò nào.

## Gán 216 trò vào 3 hướng (`src/modes.ts`)

Mỗi trò thuộc đúng một hướng:

| Hướng | Những trò được gán | Số trò |
|---|---|---|
| Đảo phiêu lưu | Toán, hình, khám phá, nhận biết, chữ cái | 105 |
| Nhà bạn thân | Âm nhạc, cảm xúc, chăm sóc bản thân, an toàn | 68 |
| Phim của bé | Truyện, ngôn ngữ, mọi trò xếp chuyện, giao thông | 43 |

Theo nhóm tuổi (đảo / nhà bạn / phim):

| Nhóm tuổi | Đảo | Nhà bạn | Phim |
|---|---|---|---|
| 2–3 tuổi | 18 | 17 | 10 |
| 3–4 tuổi | 26 | 17 | 11 |
| 4–5 tuổi | 26 | 17 | 11 |
| 5–6 tuổi | 35 | 17 | 11 |

Muốn chuyển một trò sang hướng khác thì sửa hàm `modeOf` trong `src/modes.ts`.

## Từng hướng (`src/components/Modes.tsx`)

**Đảo phiêu lưu**
- Mỗi ngày có 3 trạm. App ưu tiên trò bé ít chơi nhất, nên đổi trạm theo ngày.
- Trạm đã xong có dấu tích và sao, trạm hiện tại to và sáng, có bạn đứng cạnh. Trạm sau còn khóa; chạm vào thì trạm lắc nhẹ.
- Chơi xong một trạm và quay về: hiện "Trạm 1 xong! Trạm mới vừa mở".
- Đi hết 3 trạm: có nút "Đi thêm 3 trạm" với các trò khác.

**Nhà bạn thân**
- Bạn đồng hành đứng to giữa phòng. Bóng thoại "(Bạn) muốn chơi …" mở trò chính, hai bong bóng tròn là hai trò khác.
- App ưu tiên trò bé ít chơi nhất.
- Kệ trên tường bày nhãn dán bé đã có.
- Nút "Đổi bạn" đổi giữa Thỏ, Gấu Bắp, Khỉ Con, Rùa Vàng; lựa chọn được lưu lại. Nút "Kệ đồ chơi" mở Kho báu.
- Chơi xong và quay về: bạn reo, kèm câu "(Bạn) vui quá! Cảm ơn bé đã chơi cùng".

**Phim của bé**
- Trang danh sách có thẻ lớn cho tập tiếp theo và một dải số tập. Tập đã xem màu xanh, tập tiếp theo màu cam, các tập sau còn khóa.
- Mỗi tập mở bằng khung truyện: bạn dẫn chuyện nói câu mở đầu của trò, rồi bấm "Bắt đầu".
- Hết tập: hiện "Hết tập 1! Tập 2 vừa mở".

Trong cả 3 hướng, nút trên màn chúc mừng ghi đúng chỗ sẽ quay về: "Về đảo", "Về nhà bạn" hoặc "Về các tập phim".

## Dữ liệu lưu

Dữ liệu lưu có thêm hai mục:
- `journey`: hành trình hôm nay;
- `friend`: bạn đã chọn.

Dữ liệu lưu từ trước vẫn đọc được bình thường. Tập phim đã xem được tính từ số lần chơi đã có, không cần thêm dữ liệu.

## Còn thiếu

- **Giọng đọc.** Các câu mới như "Gấu muốn chơi…" hay "Trạm 1 xong!" hiện bằng chữ, chưa có giọng cô Thủy, vì chưa được thu âm. Riêng câu mở đầu mỗi tập phim là câu đã có sẵn của trò.
- **Màn chơi.** Màn chơi bên trong vẫn là màn hiện tại (có hoạt cảnh của Đợt A–C), chưa vẽ lại theo các khung A2/B2/C2 trên trang thiết kế.

## Kiểm tra

- `tsc` không lỗi. 54/54 test đạt; 2 test mới kiểm tra:
  - mỗi trò thuộc đúng một hướng và mỗi hướng có ít nhất 8 trò cho mỗi tuổi;
  - cách chọn trạm, điều ước, tập phim;
  - đọc dữ liệu lưu.
- Chơi thử trên trình duyệt, ở mức hiệu ứng Đầy đủ và Tắt:
  - **Đảo:** chơi hết trạm 1 → quay về → thấy "Trạm 1 xong!"; trạm 1 có dấu tích, trạm 2 mở; cửa đảo ở trang chủ hiện 1/3.
  - **Phim:** xem hết tập 1 → "Hết tập 1! Tập 2 vừa mở".
  - **Nhà bạn:** mở điều ước rồi thoát ra, quay về đúng nhà bạn; nút "Đổi bạn" lưu được.
  - Không có lỗi JavaScript.
- Chụp trang chủ và 3 hướng trên điện thoại 360 × 640, 390 × 844 và máy tính bảng 820 × 1180.
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước:
  - chơi hết lượt;
  - kéo thả;
  - tải trước giọng đọc;
  - cài đặt hiệu ứng;
  - chơi thử Đợt D;
  - 17 kiểu chơi vừa khung điện thoại.
- Dung lượng thêm: khoảng 4,7 KB mã và 2,4 KB CSS (sau nén).

## Hoàn tác

Bản trước của các file đã sửa nằm trong `backup-truoc-ba-huong-20261021/`. Chép các file đó về chỗ cũ, rồi xóa `src/modes.ts` và `src/components/Modes.tsx`.
