# Giao diện – Đợt C: 11 kiểu chơi còn lại, album nhãn dán, kệ đồ chơi (21/10/2026)

Sau Đợt C, cả 17 kiểu chơi (216 trò) đều có hoạt cảnh riêng.

## Đã thay đổi

### Hoạt cảnh cho 11 kiểu chơi còn lại (39 trò)

| Kiểu chơi | Số trò | Hoạt cảnh mới |
|---|---|---|
| Vị trí trên/dưới | 9 | Chọn đúng: hình cần tìm bay đến chỗ vật, một đường kẻ nối từ vật mốc tới chỗ đó. |
| Cây chữ cái | 8 | Chữ to sáng lên theo lời cô đọc. Quả táo đúng lăn vào giỏ dưới gốc cây, giỏ nảy lên. |
| Bong bóng | 6 | Bóng lơ lửng nhè nhẹ, mỗi quả một nhịp. Bóng đúng vỡ thành giọt nước, con vật bên trong rơi xuống cỏ, nảy một cái. |
| Vuốt mở hình | 4 | Mỗi mảng sương tan thành hạt bay lên. Mở hết thì con vật nhảy lên và cô gọi tên. |
| Hái quả | 3 | Quả rung trên cành rồi bay vào giỏ. Số trong giỏ nảy theo mỗi lần đếm. |
| Mê cung | 3 | Thỏ nhảy theo đường cong từng ô, để lại dấu chân. Tới đích thì Thỏ và bạn cùng nhảy, có tim bay lên. |
| Cân | 2 | Các vật rơi lần lượt xuống đĩa, rồi cân đung đưa và dừng ở bên nặng hơn. |
| Đoàn tàu | 1 | Mỗi món nhảy lên toa. Bánh xe có nan và quay khi tàu chạy. |
| Giao thông | 1 | Ảnh chụp xe được thay bằng xe 3D cùng phong cách với cả app, xe quay đầu đúng hướng chạy. Đèn chuyển màu êm hơn. Khi đèn đỏ, một bạn đi bộ qua vạch kẻ đường. |
| Nối số | 1 | Nối xong thì hình được tô màu, hình mẫu hiện lên và cử động. |
| Khớp bóng | 1 | Mảnh ghép bị “hút” vào bóng như nam châm. Bóng sai thì mảnh nhích về phía bóng rồi bật lại. |

### Album nhãn dán thay hộp quà ngẫu nhiên

- **Album:** 36 nhãn dán chia thành 6 trang: Nông trại, Ao cá, Phòng đồ chơi, Bầu trời, Hà Nội, Báu vật.
- **Biết trước sẽ nhận gì:** nút ở màn chúc mừng hiện sẵn hình nhãn dán, ví dụ “Nhận nhãn dán Ngựa một sừng”.
- **Cách chọn nhãn dán:** lấy ô trống đầu tiên trong trang cùng khung cảnh với trò vừa chơi. Trang đó đầy thì lấy ô trống đầu tiên của album. Đủ cả album thì lấy nhãn dán bé có ít nhất trong trang.
- **Khi nhận:** nhãn dán hiện to rồi bay vào đúng ô trên trang album. Các ô chưa có hiện dạng bóng mờ. Toàn bộ khoảng 1,5 giây; chạm vào màn là bỏ qua.
- **Bỏ thao tác cũ:** không còn bước chọn hộp và gõ 3 lần.
- **Dữ liệu cũ giữ nguyên:**
  - 10 món quà cũ đều có trong album;
  - số món bé đã nhận vẫn hiện đủ;
  - cách lưu không đổi.
- **Giọng cô Thủy:** chỉ dùng các câu đã thu âm.
  - Món cũ dùng câu cũ, ví dụ “Oa! Chúc mừng con! Con nhận được …”.
  - Món mới dùng “Cô khen con nhé!” và tên món. Tên món đã có sẵn bản thu âm.
  - Có test kiểm tra mọi câu đều có trong `audio/manifest.json`.

### Kho báu thành kệ đồ chơi (`src/components/ToyShelf.tsx`)

- Mỗi trang album là một kệ gỗ.
- Món đã có: chạm vào thì cử động theo kiểu riêng, cô đọc tên.
  - Gà con nhảy, diều đung đưa, đồng xu xoay, máy bay cất cánh, cua bò ngang…
- Món chưa có: hiện bóng mờ, chạm vào thì lắc nhẹ.
- Đầu trang đếm số nhãn dán bé đã có, ví dụ 3/36.

### Sửa lỗi

- **Trò “Bé nối số vẽ hình” không bấm được** (lỗi do Đợt A gây ra).
  - Nguyên nhân: hiệu ứng nhún khi chạm làm chấm số lệch chỗ ngay lúc bấm, nên trình duyệt không nhận cú bấm.
  - Cách sửa: hiệu ứng phản hồi giờ cộng thêm vào vị trí sẵn có của vật, không thay vị trí đó nữa.
  - Đã kiểm tra lại: chấm số và quả táo trên cây chữ cái không còn bị lệch.
  - Trên trình duyệt quá cũ (Safari trước bản 16), các vật vẫn nhún nhưng có thể lệch nhẹ trong 0,14 giây. Riêng trò vị trí trên/dưới được sửa theo cách khác, nên không bị.

## Kiểm tra

- `tsc` không lỗi. 51/51 test đạt; test mới kiểm tra album nhãn dán.
- Chơi thử từng hoạt cảnh của 11 kiểu chơi ở mức Đầy đủ, Nhẹ và Tắt, trên máy tính bảng và điện thoại:
  - mỗi lượt đều tính điểm đúng;
  - không có lỗi JavaScript;
  - ở mức Tắt không có gì chuyển động.
- Chơi hết một trò, nhận nhãn dán, rồi mở Kho báu: nhãn dán nằm đúng ô và được lưu; đồ chơi cử động khi chạm.
- Chụp đủ 17 kiểu chơi trên máy tính bảng và điện thoại. Bố cục không vỡ.
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước:
  - chơi hết “To hay nhỏ” ở mức Đầy đủ và Tắt;
  - kéo thả phân loại;
  - tải trước mã màn chơi và 19 câu giọng đọc;
  - cài đặt hiệu ứng;
  - hoạt cảnh Đợt B.
- Máy giả lập chậm 6 lần: tối đa 2 khung hình chậm (67–83 ms) mỗi lượt bấm.
- Khi bé không chạm, luồng chính bận dưới 1,5% thời gian. Riêng trò giao thông khoảng 3%, do xe đứng chờ rung nhẹ (có từ trước).
- Dung lượng: Đợt C thêm khoảng 4,3 KB (sau nén). Cả hệ chuyển động từ Đợt A tới Đợt C thêm khoảng 13 KB, trong ngân sách 20 KB.

## Triển khai và hoàn tác

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

Bản trước Đợt C của các file đã sửa nằm trong `backup-truoc-dot-c-20261021/`. Muốn hoàn tác thì chép các file đó về chỗ cũ, rồi xóa `src/stickers.ts` và `src/components/ToyShelf.tsx`.
