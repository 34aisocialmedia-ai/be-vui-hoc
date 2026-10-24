# Giao diện – Đợt A: nền móng cho cả 216 trò (21/10/2026)

Thực hiện theo phương án "Hoạt cảnh Bé Vui Học". Mọi trò đều nhận được các thay đổi dưới đây qua phần luật chung `src/player/Session.tsx`.

## Đã thay đổi

- **Màn chơi toàn màn hình.** Thanh trên cùng, vùng chơi co giãn lấp hết chỗ trống, bạn đồng hành ở dưới cùng. Nếu nội dung dài hơn màn hình, vùng chơi tự cuộn bên trong.
- **Trò chọn đáp án (87 trò): hình to theo chỗ trống.** Khoảng 100 px trên điện thoại, tới 220 px trên máy tính bảng. Tỉ lệ to/nhỏ trong câu hỏi được giữ nguyên.
- **Phông Nunito chạy thật.** Phông nằm trong `public/fonts/`, gồm bộ chữ Latin và tiếng Việt, giấy phép OFL. Phông được tải sẵn nên vẫn hiển thị đúng khi mất mạng.
- **Bộ chuyển động dùng chung** (`src/motion/motion.ts`):
  - mọi chỗ chạm đều nhún;
  - trả lời đúng: thẻ nảy, hạt lấp lánh, ngôi sao bay vào thanh tiến độ;
  - trả lời sai: thẻ lắc nhẹ.
- **Thanh tiến độ bằng sao.** Mỗi nhiệm vụ là một ô sao; ngôi sao bay vào ô rồi đáp xuống.
- **Gợi ý theo tuổi** (trò chọn đáp án): đáp án đúng viền vàng nhè nhẹ sau một số lần sai.

  | Nhóm tuổi | Gợi ý sau |
  |---|---|
  | 2–3 | 1 lần sai |
  | 3–4 và 4–5 | 2 lần sai |
  | 5–6 | 3 lần sai |

  Quy định nằm ở trường `hintAfter` trong `src/agePolicy.ts`.
- **Chuyển câu:** thẻ mới bật lên lần lượt ở các trò chọn đáp án, bong bóng và ghép đôi.
- **Bạn đồng hành** (`src/motion/Companion.tsx`):
  - 2–3 tuổi luôn là bạn Thỏ;
  - từ 3 tuổi theo khung cảnh của trò: nông trại là Gấu Bắp, bầu trời và phòng đồ chơi là Khỉ Con, Hà Nội và ao là Rùa Vàng;
  - các bạn dùng sprite vẽ sẵn: reo khi đúng, nghiêng đầu khi sai, ngủ gật kèm "z z" sau 10 giây bé không chạm.
- **Màn chúc mừng mới:** sao rơi vào hũ từng ngôi một (tối đa khoảng 2,1 giây với 10 sao), bạn đồng hành to và reo, chữ số lớn. Chạm vào màn là hiện ngay kết quả. Phần nhận quà giữ như cũ, sẽ đổi ở Đợt C.
- **Cài đặt cho phụ huynh – "Hiệu ứng chuyển động":**
  - Đầy đủ;
  - Nhẹ: chỉ mờ dần và đổi màu;
  - Tắt.

  Mặc định theo cài đặt "giảm chuyển động" của máy. Dữ liệu đã lưu từ trước vẫn đọc được bình thường.

## Kiểm tra

- `tsc` không lỗi. 50/50 test đạt; test lưu dữ liệu có thêm kiểm tra cho mục hiệu ứng.
- Chụp đủ 17 kiểu chơi trên máy tính bảng 820 × 1180 và điện thoại 390 × 844. Không có lỗi JavaScript.
- Chơi hết một lượt "To hay nhỏ" ở mức Đầy đủ và mức Tắt. Gợi ý, sao bay và hũ sao đều đúng.
- Chạy lại các bài kiểm tra cũ, kết quả vẫn như trước:
  - phân loại: thả đúng, thả sai và chạm đều đúng;
  - tiếng "sai" kêu 1 lần;
  - mã màn chơi và 19 câu giọng đọc vẫn được tải trước.
- Đổi cài đặt hiệu ứng trên trang phụ huynh thì có tác dụng ngay. Máy bật "giảm chuyển động" thì mặc định là mức Nhẹ.
- Giả lập máy chậm 6 lần: số khung hình bị chậm giống mức Nhẹ (thỉnh thoảng 1 khung khoảng 50 ms khi chuyển câu). Hoạt cảnh mới không làm game giật thêm.
- Dung lượng thêm: khoảng 4 KB mã (sau nén) và 87 KB phông chữ, được tải sẵn một lần.

## Còn lại cho Đợt B

- Phóng to nội dung theo màn hình cho các kiểu chơi khác (ghép đôi, phân loại, lật thẻ, nhịp điệu, xếp chuyện). Hiện các trò này đã nằm giữa màn hình nhưng hình chưa to lên.
- Khung cảnh SVG theo chủ đề và hoạt cảnh riêng cho 6 kiểu chơi chính.

## Triển khai và hoàn tác

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

Bản trước Đợt A của các file đã sửa nằm trong `backup-truoc-dot-a-20261021/`. Muốn hoàn tác thì chép các file đó về chỗ cũ, rồi xóa thư mục `src/motion/` và `public/fonts/`.
