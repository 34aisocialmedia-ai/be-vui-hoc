# Đợt D: chơi thử với bé (21/10/2026)

Đợt D trong phương án là cho 5–8 bé mỗi nhóm tuổi tự chơi, không có người lớn giúp. Việc cho bé chơi do phụ huynh hoặc cô giáo làm. Đợt này thêm vào app phần ghi số liệu cho buổi chơi thử, kèm trang tổng hợp kết quả và tài liệu kế hoạch.

## Đã thay đổi

### Chế độ ghi chơi thử trong app

Tệp liên quan:
- `src/playtest.ts`: ghi và tính số liệu.
- `src/components/PlaytestPanel.tsx`: mục cài đặt trong trang phụ huynh.
- `src/player/Session.tsx`: chỗ gắn phần ghi vào màn chơi.

Cách bật: vào trang phụ huynh → mục **“Chơi thử với bé (Đợt D)”** → bật ghi → nhập mã bé (ví dụ B01, không nhập tên) → chọn nhóm tuổi. Mặc định chế độ này tắt; khi tắt, app không ghi gì.

Mỗi lượt chơi ghi lại bốn chỉ số của phương án:

| Chỉ số | Cách ghi |
|---|---|
| Thời gian tới lần chạm đầu | Tính từ lúc mở trò. |
| Chạm không phản hồi | Ghi kèm vùng bị chạm: bạn đồng hành, sân chơi, thẻ câu hỏi, nút đang khóa, thanh trên cùng. Chạm lúc game đang khen hoặc nhắc được đếm riêng. |
| Kết quả lượt chơi | Chơi hết, bỏ giữa chừng (bé bấm thoát), hoặc đóng app (app tắt hay tải lại khi đang chơi). |
| Số nhiệm vụ đã làm | Số nhiệm vụ làm xong so với tổng, kèm số câu đúng/sai và số lần bạn đồng hành ngủ gật. |

Ngay trong mục này, phụ huynh xem được tóm tắt nhanh:
- số lượt, số bé;
- tỉ lệ chơi hết và bỏ dở;
- trung vị thời gian tới lần chạm đầu;
- số lần chạm không phản hồi mỗi lượt.

Mục này có thêm hai nút:
- **Tải kết quả (CSV):** tạo file mở được bằng Excel, hiển thị đúng tiếng Việt.
- **Xóa dữ liệu chơi thử:** hỏi lại trước khi xóa.

Về quyền riêng tư:
- Dữ liệu chỉ lưu trên máy và được giữ riêng, không lẫn với tiến độ chơi của bé.
- Không gửi đi đâu.
- Giữ tối đa 800 lượt.

### Trang tổng hợp kết quả (đã phát hành trên Claude)

- Thả các file CSV của nhiều máy vào trang; lượt trùng chỉ tính một lần.
- Trang so kết quả với ngưỡng đạt, theo:
  - nhóm tuổi;
  - kiểu chơi;
  - vùng chạm không phản hồi;
  - trò bị bỏ dở;
  - từng bé.
- Ngưỡng là đề xuất và sửa được ngay trên trang:
  - chơi hết từ 80%;
  - tới lần chạm đầu không quá 5 giây;
  - chạm không phản hồi không quá 2 lần mỗi lượt;
  - mỗi nhóm tuổi từ 5 bé.

### Tài liệu “Kế hoạch chơi thử Bé Vui Học – Đợt D” (trên Claude)

Gồm các phần:
- chuẩn bị và giấy đồng ý của phụ huynh;
- cách đặt mã bé;
- kịch bản cho người lớn, kèm những câu nên nói và không nên nói;
- phiếu quan sát để in;
- cách đọc kết quả và hướng sửa cho từng loại vấn đề;
- lịch khoảng 3 tuần.

## Kiểm tra

- `tsc` không lỗi. 52/52 test đạt; test mới kiểm tra phần tóm tắt và file CSV.
- Chạy thử trên trình duyệt, cả máy tính bảng và điện thoại:
  - một lượt chơi hết được ghi đúng: lần chạm vào bạn đồng hành và thẻ câu hỏi được tính là không phản hồi;
  - lượt bé bấm thoát được ghi “bỏ giữa chừng”, lượt tải lại trang được ghi “đóng app”;
  - tải được file CSV, nút xóa có tác dụng;
  - khi tắt chế độ thì không ghi lượt nào;
  - không có lỗi JavaScript.
- Trang tổng hợp đọc đúng file CSV từ app: con số khớp với tóm tắt trong app.
- Chạy lại các bài kiểm tra cũ (chơi hết lượt, kéo thả, hoạt cảnh Đợt C), kết quả vẫn như trước.
- Dung lượng: Đợt D thêm khoảng 3 KB (sau nén).

## Triển khai và hoàn tác

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

Bản trước Đợt D của các file đã sửa nằm trong `backup-truoc-dot-d-20261021/`. Muốn hoàn tác thì chép các file đó về chỗ cũ, rồi xóa `src/playtest.ts` và `src/components/PlaytestPanel.tsx`.
