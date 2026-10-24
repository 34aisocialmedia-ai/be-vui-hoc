# Tối ưu đợt 1 – 21/10/2026

## Đã thay đổi

- **Ảnh:** thêm 50 file `.webp` cạnh ảnh gốc trong `public/assets/` (images, objects, covers, photos). Tổng dung lượng từ 26,8 MB giảm còn 4,1 MB. Ảnh PNG/JPG gốc vẫn giữ nguyên.
- **Code:** mọi đường dẫn ảnh trong `src/` đã chuyển sang `.webp`. Test `tests/images.test.mjs` sẽ báo lỗi nếu có chỗ nào dùng lại PNG/JPG.
- **Tải sẵn khi mở web lần đầu** (`vite.config.ts`): chỉ còn phần khung app, khoảng 0,5 MB thay vì 28,8 MB. Ảnh được lưu lại khi bé xem lần đầu (bộ nhớ `app-pictures-v1`).
- **Thư mục build:** file JS/CSS do Vite tạo nằm trong `/static/` (trước đây là `/assets/`), để tách khỏi ảnh.
- **Cache** (`public/_headers`):
  - `/static/*` lưu 1 năm.
  - Ảnh `/assets/*` lưu 7 ngày.
  - Giọng đọc `/audio/co-thuy/*` lưu 1 ngày.
- **Sửa lỗi:** trò "Cho bạn ăn" và trò ghép bóng không còn phát tiếng "sai" hai lần.

## Kiểm tra

- `tsc` không có lỗi. `vite build` thành công.
- 48/48 test đạt.
- Đã xem trang chủ trên màn hình điện thoại và máy tính, và chơi thử trò khớp bóng.

## Triển khai

```
cd "C:\app student\app"
npm test
npm run build
npx wrangler pages deploy dist --project-name be-vui-hoc-test
```

## Hoàn tác

Bản gốc của 17 file code đã sửa nằm trong `backup-truoc-toi-uu-20261021/`, cùng cấu trúc thư mục. Chép đè các file đó về chỗ cũ là quay lại như trước.

## Lưu ý về sau

- Khi thay một ảnh, hãy xuất lại file `.webp`. Có thể dùng `python scripts/towebp.py public/assets <thư-mục-ra>` hoặc công cụ chuyển đổi bất kỳ.
- Khi thu âm lại câu của cô Thủy mà vẫn giữ tên file cũ, hãy đổi tên bộ nhớ `app-co-thuy-audio-v1` thành `-v2` trong `vite.config.ts`. Nếu không, máy đã lưu bản cũ sẽ tiếp tục phát giọng cũ.
