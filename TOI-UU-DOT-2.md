# Tối ưu đợt 2 – 21/10/2026

## Đã thay đổi

- **Chỉ tải mã màn chơi khi cần** (`src/App.tsx`): màn chơi và các kiểu chơi được tách thành file riêng (`Player-*.js`, 18 KB sau nén). Khoảng 1,2 giây sau khi trang chủ hiện, file này tự tải ngầm, nên lúc bé bấm vào trò vẫn mở ngay. JS của trang chủ giảm từ 102 KB xuống 86 KB (sau nén).
- **Tải trước giọng cô Thủy** (`src/audio.ts`, `src/speechPrefetch.ts`): khi mở một trò, app tải ngầm các câu ghi âm của lượt chơi đó, hai câu một lúc. Thứ tự tải: câu hỏi đầu tiên trước, rồi câu khen và câu động viên, rồi phần còn lại.
  - Trung bình 19 câu mỗi trò, khoảng 280 KB. Trò nhiều nhất có 40 câu, cũng là mức tối đa cho phép.
  - Không tải khi đã tắt âm thanh hoặc khi máy bật chế độ tiết kiệm dữ liệu.
  - Mỗi câu chỉ tải một lần. Sau đó chơi được cả khi mất mạng.
- **Kéo thả mượt hơn** (`src/Player.tsx`): trò phân loại vào giỏ và trò "Cho bạn ăn" chỉ di chuyển hình đang kéo, không vẽ lại cả màn chơi mỗi lần ngón tay nhích. Trên máy giả lập chậm 6 lần, thời gian xử lý khi kéo giảm từ khoảng 330 ms xuống 165 ms.
- **Sửa lỗi kéo ảnh** (`src/kid-ui.css`): khi món cần kéo là ảnh chụp và kéo bằng chuột, trình duyệt kéo chính tấm ảnh nên món đồ không di chuyển. Đã chặn việc này, đồng thời tắt menu bấm giữ trên iPhone/iPad.

## Kiểm tra

- `tsc` không có lỗi. `vite build` thành công.
- 50/50 test đạt. Có 2 test mới: tải trước giọng đọc, và mọi trò đều có câu ghi âm để tải trước.
- Chơi thử trò "Bé phân loại màu sắc" trên trình duyệt:
  - Kéo đúng giỏ được cộng điểm, chơi hết 5/5 tới màn chúc mừng.
  - Kéo sai giỏ thì giỏ rung báo sai, không cộng điểm, món đồ quay về chỗ cũ.
  - Chạm để chọn rồi chạm giỏ cũng được tính.
- Hiện không có trò nào dùng kiểu "Cho bạn ăn", nên phần này chỉ được kiểm tra qua build và test, chưa chơi thử.

## Triển khai

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

## Hoàn tác

Bản gốc của các file đã sửa nằm trong `backup-truoc-toi-uu-dot2-20261021/`. Nếu hoàn tác, xóa thêm hai file mới: `src/speechPrefetch.ts` và `tests/speech-prefetch.test.mjs`.
