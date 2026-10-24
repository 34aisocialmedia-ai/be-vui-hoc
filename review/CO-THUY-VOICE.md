# Giọng Cô Thủy — phương án miễn phí

Google AI Studio, Gemini 3.8 Flash TTS, giọng nữ có sẵn **Zuri** (mô tả trong giao diện: “Natural and clear”, âm vực trung). Style đã nhập: cô giáo mầm non Việt Nam khoảng 25 tuổi, âm sắc ấm sáng, phát âm rõ dấu, nhịp nói dịu và có ngữ điệu vui. Câu mẫu được tạo thành công tại AI Studio ngày 13/10/2026: `co-thuy-zuri-sample.wav`.

Voice Design tạo ID giọng lưu riêng yêu cầu API key thuộc gói trả phí. Dự án `Default Gemini Project` hiện có key **Free tier**; giao diện Rate Limit cho Gemini 3.8 Flash TTS báo 3 lượt/phút, 10 lượt/ngày qua API. Vì người dùng yêu cầu không trả phí, dùng Zuri + style để giữ cùng một âm sắc trong toàn bộ câu của Cô Thủy.

`co-thuy-corpus.json` ghi 1.446 câu khác nhau hiện có thể được phát trong ứng dụng 216 trò. `co-thuy-batches.json` chia thành 13 lượt tạo, mỗi lượt là một đoạn dài có hai `<long pause>` giữa các câu. Mẫu tám câu `co-thuy-batch-double-pause.wav` cho bảy khoảng lặng dài rõ ràng (khoảng 1,9–3,8 giây), đủ để tách đoạn; mẫu một khoảng nghỉ có khoảng lặng sát nhịp ngắt câu nên không được dùng.

Ngày 13/10/2026 đã tạo đủ 13 lô chính và một lô sửa ba câu bằng giao diện AI Studio ở chế độ **No API key selected**. Mỗi lô được nhận dạng thời gian bằng Vosk tiếng Việt chạy ngoại tuyến, đối chiếu với danh sách câu, chỉnh mốc tách nơi câu bị nối hoặc TTS lặp và mã hóa MP3 24 kHz. Kho phát đã được kích hoạt với đúng 1.446 tệp và manifest cùng số mục. App chỉ đọc từ `public/audio/co-thuy`; không còn Web Speech API hoặc lựa chọn giọng nam trong mã phát. Khi tải một tệp lỗi, trò chơi vẫn tiếp tục phần hình ảnh.

Kiểm tra tự động xác nhận đủ tệp, độ dài hợp lệ và bài kiểm thử ứng dụng. Hai kho cũ nằm trong `review/legacy-audio` để có thể phục hồi; bản dựng và triển khai chỉ chứa `audio/co-thuy`. Nhận dạng Vosk chưa thay thế được kiểm nghe toàn bộ 1.446 câu; nên nghe thử thêm trên điện thoại, đặc biệt các chữ cái đứng riêng như “Ơ”, trước khi xem đây là bản thu âm cuối cùng.

Nguồn kỹ thuật: [Google TTS guide](https://ai.google.dev/gemini-api/docs/speech-generation), [Voice Design](https://ai.google.dev/gemini-api/docs/voice-design), [pricing](https://ai.google.dev/gemini-api/docs/pricing).
