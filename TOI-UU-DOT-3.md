# Tối ưu đợt 3 – 21/10/2026

Đợt này chỉ sắp xếp lại mã nguồn và thư mục. Giao diện và cách chơi giữ nguyên.

## Đã thay đổi trong code

- **Tách `src/Player.tsx`**: từ 1.053 dòng còn 100 dòng. File này chỉ còn làm việc chọn đúng kiểu chơi cho trò. Phần còn lại nằm trong thư mục `src/player/`:

  | File | Nội dung |
  |---|---|
  | `Session.tsx` | Luật chung cho mọi trò: chấm điểm, khen/động viên, tạm dừng, quà, hỏi khi thoát |
  | `ChooseEngine.tsx` | Chọn đáp án |
  | `MatchEngine.tsx` | Ghép đôi |
  | `SortEngine.tsx` | Kéo vào giỏ |
  | `BubbleEngine.tsx` | Bóng bay |
  | `FeedEngine.tsx` | Cho bạn ăn |
  | `PuzzleEngine.tsx` | Khớp bóng |
  | `useDragOffset.ts` | Di chuyển hình khi kéo |
  | `types.ts` | Kiểu dữ liệu dùng chung |

  Các kiểu chơi khác (mê cung, đoàn tàu, cân, chữ cái…) vẫn ở `src/components/`.
- **Gộp 9 file CSS thành `src/app.css`**: giữ đúng thứ tự áp dụng cũ, mỗi phần có tiêu đề ghi tên file gốc. Đã bỏ:
  - 401 khai báo luôn bị một khai báo phía sau ghi đè;
  - 95 selector dùng class không còn xuất hiện ở đâu trong mã nguồn (giao diện cũ như `voice-pill`, `agecard-3d`, `gamecard-3d`, `toast`…).

  CSS sau build giảm từ 118 KB còn 101 KB (sau nén: 25,7 KB còn 22,3 KB).
- Bỏ một biến và một import không dùng.

## Kiểm chứng giao diện không đổi

- So bản Đợt 2 với bản Đợt 3 trên 29 màn hình, mỗi màn chụp ở hai cỡ (điện thoại 390 px, máy tính 1280 px), tổng 58 lần chụp. Các màn gồm:
  - trang chủ;
  - thư viện của 4 nhóm tuổi;
  - bộ lọc "Thử cách chơi mới";
  - kho báu, cổng người lớn, trang người lớn, xưởng AI;
  - một trò của mỗi kiểu trong 17 kiểu chơi;
  - hộp thoại thoát.
- Trên mỗi màn, tôi so mọi thuộc tính CSS thực tế của từng phần tử, và so ảnh chụp từng điểm ảnh.
- Kết quả: giống nhau. Chỗ lệch duy nhất là hình đang chuyển động (ảnh nền trang chủ, khói tàu, xe ô tô) bị chụp ở những khoảnh khắc khác nhau.
- `tsc` không lỗi. 50/50 test đạt. Chơi thử hết trò phân loại; tiếng "sai" kêu 1 lần.

## Việc bạn cần chạy trên máy: `don-dep-dot3.ps1`

Script này **chỉ di chuyển, không xóa** file nào. Nên chạy thử trước để xem danh sách:

```
cd "C:\app student\app"
powershell -ExecutionPolicy Bypass -File .\don-dep-dot3.ps1 -ThuTruoc
powershell -ExecutionPolicy Bypass -File .\don-dep-dot3.ps1
```

Script sẽ:

1. Chuyển 50 ảnh PNG/JPG gốc sang `C:\app student\_luu-tru\anh-goc\`. Game đã dùng bản `.webp`, và bỏ ảnh gốc ra thì bản đưa lên mạng nhẹ hơn khoảng 27 MB. Ảnh nào chưa có bản `.webp` thì được giữ lại.
2. Chuyển 9 file CSS cũ vào `backup-truoc-toi-uu-dot3-20261021\src\`.
3. Chuyển 8 script đời đầu ở thư mục gốc vào `scripts\cu\`. Vẫn chạy được từ thư mục `app` như trước.
4. Chuyển những thứ không còn dùng sang `C:\app student\_luu-tru\`:
   - `source-before-ux-review.zip`;
   - file nén mô hình Vosk (bản đã giải nén vẫn ở `review\vosk-models`);
   - giọng đọc cũ `review\legacy-audio`;
   - hai thư mục bản phát hành cũ `release-co-thuy-20261013*`.
5. Tạo kho Git và lưu bản đầu tiên. Nếu máy chưa có Git, cài từ git-scm.com rồi chạy lại script.

**Giữ nguyên, không di chuyển:** các bản thu thô và mô hình nhận dạng giọng cô Thủy trong `review\`, khoảng 260 MB. Các script tạo giọng vẫn cần những file này. `.gitignore` đã loại chúng khỏi Git để kho Git chỉ khoảng 30 MB.

Sau khi dùng Git, mỗi lần sửa xong chỉ cần chạy:

```
git add -A
git commit -m "mô tả thay đổi"
```

Không cần chép cả thư mục ra bản sao nữa.

## Hoàn tác

- Code: bản gốc của `src/Player.tsx`, `src/main.tsx`, `src/components/ConnectDotsEngine.tsx` và `.gitignore` nằm trong `backup-truoc-toi-uu-dot3-20261021\`. Script sẽ chuyển thêm 9 file CSS cũ vào đó. Muốn quay lại thì chép các file đó về chỗ cũ, rồi xóa `src/app.css` và thư mục `src/player/`.
- Thư mục: mọi thứ script đã chuyển đều nằm nguyên trong `_luu-tru\` hoặc `backup-truoc-toi-uu-dot3-20261021\`.
