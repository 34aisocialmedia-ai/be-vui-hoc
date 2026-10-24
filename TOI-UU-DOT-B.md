# Giao diện – Đợt B: khung cảnh và 6 kiểu chơi chính (21/10/2026)

## Đã thay đổi

### Khung cảnh theo chủ đề (`src/SceneBackground.tsx`)

- Năm khung cảnh vẽ vector: **nông trại, ao cá, phòng đồ chơi, bầu trời, Hà Nội** (Hồ Gươm, Tháp Rùa, cầu Thê Húc).
- Mỗi trò hiện đúng khung cảnh của nó theo trường `scene` đã có trong dữ liệu.
- Trước đây một quy tắc CSS ép mọi trò về cùng một nền xanh nhạt; quy tắc này đã được gỡ.
- Màu dịu để thẻ trả lời vẫn nổi bật nhất.
- Chỉ có mây và cá chuyển động, rất chậm: 26–95 giây mỗi vòng.
- Mây và cá nằm ở lớp riêng, chỉ dịch chuyển chứ không vẽ lại, nên trình duyệt nhờ card đồ họa xử lý.
  - Bản đầu tiên tôi viết khiến luồng xử lý chính bận khoảng 34% thời gian khi bé không chạm (đo trên máy giả lập chậm 6 lần).
  - Bản sửa giảm còn khoảng 0,3%: bận 15 ms trong 5 giây.
- Hình vẽ nền đứng yên khi nội dung cuộn.

### Hình to theo màn hình (`src/motion/stage.ts`)

- Hệ số phóng: 1 trên điện thoại, khoảng 1,6 trên máy tính bảng 820 × 1180, tối đa 1,7.
- Áp dụng cho các kiểu chơi ghép đôi, phân loại, lật thẻ, nhịp điệu và xếp chuyện.

### Hoạt cảnh riêng cho 6 kiểu chơi chính (177/216 trò)

| Kiểu chơi | Số trò | Hoạt cảnh mới |
|---|---|---|
| Chọn đáp án | 87 | Thẻ mới lật vào. Chọn đúng thì hình bay về phía bạn đồng hành. Câu đếm hoặc quy luật mà chọn sai thì các vật nảy lần lượt để bé đếm lại. |
| Nhịp điệu | 28 | Khi nghe nhịp mẫu, từng nốt trong dãy sáng lên theo thứ tự. Nút đang kêu thì lắc nhẹ và có nốt nhạc ♪ bay lên. |
| Ghép đôi | 19 | Ghép đúng thì một đường cong nối hai thẻ, rồi hai thẻ nghiêng về phía nhau. |
| Phân loại | 15 | Món đồ bay theo đường cong vào giỏ rồi nằm lại trong giỏ; giỏ hiện số món đã có. |
| Lật thẻ | 15 | Kệ trưng bày ở trên: tìm được cặp nào thì cặp đó bay lên kệ. Thẻ úp có họa tiết “thở” nhè nhẹ để mời bé chạm. |
| Xếp chuyện | 13 | Tranh bay từ thẻ vào ô số. Xếp xong thì cả câu chuyện sáng lần lượt từng ô như một đoạn phim ngắn. |

### Sửa lỗi

- Thẻ được gợi ý trước đây không nhấp nháy viền vàng, vì hoạt ảnh thẻ mới bật lên đè mất hiệu ứng gợi ý.
- Ở bản thử đầu tiên của Đợt B, lỗi này còn làm thẻ lật liên tục.
- Đã sửa và kiểm tra lại: thẻ đứng yên, viền vàng nhấp nháy đúng.

## Kiểm tra

- `tsc` không lỗi. 50/50 test đạt.
- Chụp đủ 17 kiểu chơi trên máy tính bảng và điện thoại. Không có lỗi JavaScript.
- Chơi thử từng hoạt cảnh ở mức Đầy đủ và mức Tắt:
  - ghép đôi có đường nối;
  - lật thẻ: cặp bay lên kệ;
  - xếp chuyện phát lại;
  - nhịp điệu sáng nốt và có ♪ bay lên;
  - phân loại: giỏ hiện số món.

  Ở mức Tắt, mọi thứ vẫn chơi và tính điểm đúng, chỉ không có chuyển động.
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước:
  - chơi hết trò phân loại;
  - tiếng "sai" kêu 1 lần;
  - màn chúc mừng;
  - cài đặt hiệu ứng của phụ huynh.
- Máy giả lập chậm 6 lần: số khung hình bị chậm giống Đợt A.
- Dung lượng: Đợt B thêm khoảng 5 KB (sau nén). Tính từ đầu đến hết Đợt B, hệ chuyển động thêm khoảng 9 KB, trong ngân sách 20 KB.

## Triển khai và hoàn tác

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

Bản trước Đợt B của các file đã sửa nằm trong `backup-truoc-dot-b-20261021/`. Muốn hoàn tác thì chép các file đó về chỗ cũ, rồi xóa `src/motion/stage.ts`.
