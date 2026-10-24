# Rà soát kế hoạch và tối ưu game ngày 12/10/2026

**Cập nhật ngày 13/10:** thư viện đã được mở rộng đủ **216 trò**, 24 nhóm và 2.160 nhiệm vụ. Xem [báo cáo mới](CURRICULUM-216.md). Các số liệu 51 trò và sáu trò mới bên dưới là ghi nhận của đợt trước.

## Tài liệu đã đối chiếu

- `C:/app student/k.docx`: sơ đồ thư viện theo bốn nhóm tuổi, các lĩnh vực, câu hỏi/đáp án có giọng đọc và cơ chế thưởng.
- `C:/app student/mẫu giáo.doc`: mục tiêu cho 3–4, 4–5, 5–6 tuổi, chia thành các cột theo tuổi. Nhóm 5–6 có nhận dạng chữ tiếng Việt MT79, số và thứ tự MT40, đếm MT36, sắp xếp MT42/43.
- `C:/app student/nhà trẻ.doc`: mục tiêu 24–36 tháng, ưu tiên nhận biết đồ vật, màu, kích thước, cơ thể và cảm xúc. Các bài nhận biết phù hợp được giữ; ba trò bị khoanh đã bỏ theo yêu cầu của người dùng.
- `C:/app student/Phuong_an_he_thong_App_tro_choi_mam_non.pdf`: phương án 216 trò, 24 nhóm nội dung, bốn nhóm tuổi và 12 dạng tương tác. Trang 12 quy định hình/tiếng khớp nhau, đúng +1, sai 0, không cộng trùng và âm thanh tạo sẵn. Trang 17–18 ưu tiên hoàn thiện luồng chơi mẫu trước khi mở rộng toàn bộ thư viện.

Hai tệp `.doc` thực chất là Word HTML mã hóa UTF-16. Đã đọc bảng và nội dung, không coi đây là tệp nhị phân Word bị hỏng. Văn bản PDF được trích theo trang và trang quy tắc giọng đọc/chấm điểm đã được xem trực quan.

## Đợt tối ưu hiện tại

| Nội dung | Thay đổi trong game |
| --- | --- |
| Bốn nhóm tuổi | Thêm nhóm 5–6 tuổi; lưu lựa chọn để lần mở sau giữ đúng nhóm |
| Mục tiêu 5–6 tuổi | Sáu trò, mỗi trò 10 nhiệm vụ: E/Ê, U/Ư, ghép số/lượng đến 10, lật thẻ số, tìm số còn thiếu, quy luật trái cây |
| Trò được yêu cầu xóa | Bỏ cho Khỉ ăn quả, tặng quà Cụ Rùa và cho Gấu ăn khỏi dữ liệu và ảnh danh mục |
| Ngày trong tuần | Đáp án hiện chữ số 2–7 lớn, nhãn và giọng đọc vẫn là thứ tương ứng |
| Chữ Ơ/lượt cuối | Vị trí chữ ổn định qua các lượt, hiện chữ mục tiêu lớn, chọn sai rung nhẹ; hoàn thành được ghi nhận trước bước nhận quà |
| Khóa thao tác | Giữ chống cộng trùng; phản hồi không đợi âm thanh quá lâu nếu tải/phát tiếng gặp sự cố |
| Điện thoại | Bốn thẻ tuổi xếp hai hàng; ảnh số và các nhóm hình giữ đúng nội dung |
| Bộ âm thanh | Chuẩn bị tên Cô Thủy và chỉ giữ lựa chọn giọng nữ trong giao diện; việc sinh bộ giọng mới trên 34AI tạm dừng theo yêu cầu ngày 12/10 |

## Phần cần tiếp tục theo kế hoạch

Thư viện hiện có 51 trò sau khi bỏ 3 và bổ sung 6. Đây là đợt hoàn thiện lõi chơi và nhóm tuổi, chưa phải toàn bộ thư viện 216 trò. Cần tiếp tục biên tập các nhóm vận động, kể chuyện theo tranh, hình khối, tách/gộp, khoa học và kỹ năng xã hội cho 5–6 tuổi; bổ sung công cụ giáo viên duyệt học liệu trước khi nhân rộng.

AI Studio, tài khoản lớp/trường, đồng bộ máy chủ, quy trình duyệt và bảng thống kê chi tiết vẫn là các hạng mục tiếp theo trong phương án. Các trò tương tác trên màn hình hỗ trợ hoạt động học, không thay thế các mục tiêu vận động và giao tiếp thực tế trong hai kế hoạch giáo dục.

## Kiểm chứng

- 23 kiểm tra tự động đạt: dữ liệu hợp lệ, đủ nhiệm vụ, đúng số lượng/quy luật, ảnh đúng ngày, bỏ các ID được yêu cầu xóa, lựa chọn 5–6 được lưu.
- TypeScript không có lỗi.
- Bản build được kiểm tra trực tiếp: O → Ô → Ơ hoàn thành 3/3 nhiệm vụ; mở quà sau hoàn thành và đóng quà vẫn quay về kết quả, không cộng thêm điểm.
- Ngày trong tuần hiện các số đúng trên màn hình điện thoại; bốn thẻ tuổi xếp hai hàng, không tràn ngang ở chiều rộng CSS 389px (xấp xỉ 390px).
- Bài tìm số: sai không cộng điểm, chọn lại đúng được +1; bài quy luật: chọn đúng quả được +1 và đổi sang chuỗi mới.
- `npm run build` thành công; bản game được cập nhật lên dự án Cloudflare Pages `be-vui-hoc-test`.
- Deployment: `https://18c60369.be-vui-hoc-test.pages.dev/`. Đã mở địa chỉ cố định `https://be-vui-hoc-test.pages.dev/`, tải lại để nhận bản PWA mới và xác nhận có sáu trò 5–6 tuổi, không có ảnh lỗi.
- Ảnh đối chiếu: [nhóm 5–6 trên Cloudflare](age-5-6-cloudflare.png), [thẻ ngày trên điện thoại](week-numbers-mobile.png), [bốn nhóm tuổi trên điện thoại](age-5-6-mobile.png).

## Giọng đọc đang chờ

Người dùng đã tạo và lưu mẫu Cô Thủy trên 34AI. Đã chuẩn bị phong cách cô giáo trẻ, rõ ràng và có ngắt nghỉ; không khẳng định bộ âm thanh cũ đã được thay bằng mẫu này. Bộ giọng mới cần được tạo, tải về, gắn theo từng câu và kiểm tra phát âm sau khi dịch vụ hoạt động ổn định. Không tiếp tục sinh giọng trong đợt hoàn thiện game theo chỉ đạo mới nhất.
