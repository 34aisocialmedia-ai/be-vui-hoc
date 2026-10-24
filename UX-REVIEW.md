# Rà soát UX và logic game — 07/10/2026

## Kết quả

- Trang chủ ưu tiên hình: khu vườn 3D, thẻ trò chơi lớn, tên ngắn, lọc lứa tuổi và chủ đề. Lưu lứa tuổi đã chọn.
- Gấu Bắp, Khỉ Con, Rùa Vàng dùng sprite tạo riêng, có chớp mắt, chờ ăn, nhai và vui mừng. Chuyển động tạm dừng khi nghỉ và tôn trọng chế độ giảm chuyển động.
- Cho ăn bằng chạm hoặc kéo. Có khóa thao tác khi xử lý, thức ăn bay tới nhân vật và phản hồi cảm xúc.
- Ảnh con vật, trái cây và xe có sẵn được dùng trong bài nhận biết, bong bóng, trí nhớ, xếp tàu và các bài phù hợp. Thức ăn dùng atlas AI có phong cách chân thực; đây không phải ảnh chụp thực phẩm thật.
- Trí nhớ dùng hai ảnh cùng con vật, dễ hiểu khi bé chưa đọc. Bài ghép mẹ con giữ riêng; không tự dùng ảnh con trưởng thành cho nhãn con non. Không tự thay ảnh xe xanh bằng ảnh xe có màu khác.
- Âm thanh có một điều khiển chung; dừng đọc giải phóng thao tác đang chờ. Chuỗi lời đọc không bị dừng sau câu đầu. Chuyển giọng hủy giọng cũ và lưu lựa chọn.
- Điểm chỉ tính một lần mỗi nhiệm vụ, mã nhiệm vụ phân biệt các vòng. Nối số hoàn thành ở điểm cuối. Trí nhớ, đoàn tàu và giao thông chờ ghi điểm trước khi chuyển vòng.
- Chặn thao tác trùng, hủy bộ hẹn giờ khi rời game. Xác nhận rời lượt đang chơi. Giới hạn thời gian tính thời gian chơi ở foreground.
- Sửa nút lồng nhau, thêm tên truy cập, trạng thái khóa, tiêu điểm bàn phím và giao diện điện thoại.
- Lưu dữ liệu có kiểm tra định dạng, giữ tiến độ hợp lệ của bản cũ. Không phụ thuộc Google TTS bên ngoài.

## Kiểm tra

- npm test: 14/14 kiểm tra đạt; dữ liệu game, điểm, vòng, nối số, dữ liệu lưu, nút thẻ và hủy/chuyển lời đọc.
- npm run build: TypeScript, Vite và PWA.
- Kiểm tra trực tiếp trên trình duyệt: trang chủ, màn 390×844 không tràn ngang; cho Gấu Bắp ăn bằng chạm và kéo, điểm tăng một lần; đoàn tàu, giao thông, nối số và trí nhớ tới phần thưởng.
- Các game tình huống, một số đồ vật và biểu tượng chức năng vẫn dùng tài nguyên 3D/biểu tượng hiện có. Chưa thay toàn bộ nội dung bằng hoạt cảnh riêng.

## Tài nguyên tạo bằng image_gen.imagegen

Lưu tại public/assets/images/. Không dùng tác phẩm hay nhân vật Pixar có bản quyền làm tài nguyên; nhân vật riêng lấy cảm hứng phim hoạt hình 3D.

### play-garden-3d.png

Prompt:

Use case: stylized-concept. Asset type: hero scene for a Vietnamese preschool game app. Primary request: a joyful, friendly 3D animated film world in a Pixar-inspired style for children ages 2–5 who cannot read. Scene: lush mint green rolling garden, rounded apple tree on the left, cute small colorful toy steam train winding through the middle ground, pastel xylophone and a few round flowers nearby, pale turquoise sky and fluffy clouds. Subjects: an original friendly white bunny with peach inner ears, big expressive warm brown eyes, soft fluffy fur and little teal overalls waving hello, a smiling little yellow chick and orange fox friend. Composition: wide landscape 3:2, characters on the right half, generous calm light sky space on the upper left for separately rendered UI, no objects cropped, child eye level. Materials: soft clay-like rounded toys, cinematic 3D, detailed fluffy fur, smooth forms, soft global illumination, warm sunlight, gentle ambient shadows. Cheerful and uncluttered, a small number of large readable shapes. No text, no letters, no numbers, no logos, no watermark, no interface buttons.

### bear-animation-3d.png

Prompt:

Use case: stylized-concept. Asset type: animation sprite atlas for a preschool feeding game. Primary request: an ORIGINAL adorable full-body brown teddy bear cub character in a Pixar-inspired polished cinematic 3D style, seated, large expressive warm eyes, soft fluffy golden brown fur, cream muzzle, small rounded ears, wearing a mint green bib, child-friendly. Create a PERFECT UNIFORM 4-column by 2-row sprite sheet, eight equal square cells, on a fully transparent background. Every bear centered in its cell at exactly the same scale with feet at exactly the same baseline and all arms and ears safely inside its cell with margin. Row 1 left to right: (1) idle seated smiling with both paws in lap; (2) same idle pose with eyes gently blinking closed; (3) hungry leaning forward mouth open excitedly and paws ready; (4) hungry open mouth waving a paw. Row 2 left to right: (5) chewing with cheeks puffed, mouth closed; (6) chewing delightedly with eyes gently shut; (7) celebrating with both paws raised and wide happy smile; (8) celebrating same position waving paws slightly apart. No food, no scenery, no text, no symbols, no logos, no panel borders. Soft warm studio lighting, tactile fur, rounded forms. Exactly eight poses of the identical same bear character, no missing or extra characters. Transparent cells, no cast shadow crossing cell boundaries.

### friends-animation-3d.png

Prompt:

Use case: stylized-concept. Asset type: animation sprite atlas for a preschool game. Create an EXACT uniform 4 column by 4 row sprite sheet on a fully transparent background, 16 equal square cells, all characters centered at the same scale with all parts safely within their cell. High-end Pixar-inspired cinematic 3D, warm soft studio light, large expressive friendly eyes, plush toy proportions, original characters, no text or borders. Rows 1 and 2: identical adorable brown monkey with cream face, curly tail and small mint bib, seated full body. Row 1 poses left to right: idle smiling, idle gentle blink, hungry mouth open excitedly, hungry leaning forward paws ready. Row 2 poses: chewing mouth closed cheeks puffed, chewing eyes closed smiling, happy both arms raised, happy waving arms. Rows 3 and 4: identical adorable friendly green turtle with golden shell, expressive warm brown eyes and small mint bib, standing on four feet, head facing front. Row 3 poses: idle smiling, idle gentle blink, hungry mouth open, hungry neck extended slightly. Row 4 poses: chewing cheeks puffed, chewing eyes closed, happy head raised and front feet raised, happy waving one front foot. Maintain exact character identity within each 8-pose sequence. Transparent background, no props, no food, no shadows crossing between cells, no UI, no icons.

### music-playroom-3d.png

Prompt:

Use case: stylized-concept. Asset type: preschool music game illustrated thumbnail and scene. A beautiful original cinematic Pixar-inspired 3D illustration of a rainbow wooden toy xylophone with eight wide glossy colored bars, two rounded wooden mallets resting beside it, on a soft mint green playroom rug. A cute original white bunny toddler with fluffy fur, large warm brown eyes and teal overalls sitting nearby ready to play, a rounded little sunny window in soft focus behind. The xylophone fills most of the center foreground, full instrument visible, visually recognizable to a child age 2–5. Warm gentle daylight, tactile wood, soft textile materials, rounded safe shapes, polished animated film rendering. Landscape composition 3:2. No text, no numbers, no logos, no UI, no emojis, no watermarks.

### food-realistic-atlas.png

Prompt:

Create a premium preschool game food sprite atlas, transparent background, exactly 4 equal columns by 2 equal rows, all eight cells evenly spaced and centered with generous clear padding, no overlapping, no text, no letters, no symbols, no borders. Photorealistic appetizing food photography with soft friendly studio lighting and slightly rounded tactile presentation, NOT emoji or flat icons. Row 1 left to right: 1 a small white plate with cooked sliced beef, 2 a small white plate with a cooked fish fillet with recognizable fish shape and lemon, 3 a boiled egg cut in half showing yellow yolk, 4 a clear small glass of white milk. Row 2 left to right: 5 fresh green bok choy leaves, 6 a whole orange carrot with green leaves, 7 a whole orange fruit with one half cut showing juicy flesh, 8 a peeled yellow banana. Isolated realistic foods, top three-quarter camera view consistent across all objects, no hands, no characters, no utensils. Crisp clean cutout edges on fully transparent canvas. Output wide 2:1 image, each cell square.

