/*
 * Ready-made prompts for parents. {be} is replaced with the child's name (or "bé").
 * `refs` says which reference photos the prompt expects: 'child' (a photo of the child), 'family', or none.
 * `use` suggests where the result fits in the app.
 */
export interface Template { id: string; icon: string; title: string; text: string; refs?: 'child' | 'family'; use?: string; group: string; instruction?: string; ratio?: string }

const KEEP_FACE = 'Nhân vật chính là em bé trong ảnh tham chiếu: giữ đúng khuôn mặt, kiểu tóc và nét đáng yêu của bé, vẽ lại theo phong cách hoạt hình 3D như phim hoạt hình, ánh sáng ấm, màu tươi.'

export const IMAGE_TEMPLATES: Template[] = [
  { id: 'i-apple', group: 'Bé vào trò chơi', icon: '🍎', title: 'Bé hái táo trong vườn', refs: 'child', use: 'Bìa trò hái quả, đếm số', ratio: '1:1', text: `${KEEP_FACE} {be} đứng trong vườn cây xanh, tay hái một quả táo đỏ, bên cạnh là chiếc giỏ mây có đúng 3 quả táo. Trời nắng nhẹ, bầu trời xanh.` },
  { id: 'i-doctor', group: 'Bé vào trò chơi', icon: '🧑‍⚕️', title: 'Bé làm bác sĩ nhí', refs: 'child', use: 'Bìa trò nghề nghiệp', ratio: '1:1', text: `${KEEP_FACE} {be} mặc áo blouse trắng nhỏ xinh, đeo ống nghe, đang khám cho một chú gấu bông trên giường bệnh đồ chơi. Phòng khám sáng sủa, thân thiện.` },
  { id: 'i-pilot', group: 'Bé vào trò chơi', icon: '✈️', title: 'Bé là phi công', refs: 'child', use: 'Bìa trò phương tiện', ratio: '1:1', text: `${KEEP_FACE} {be} đội mũ phi công, ngồi trong một chiếc máy bay đồ chơi màu xanh bay giữa những đám mây trắng, mỉm cười vẫy tay.` },
  { id: 'i-teeth', group: 'Bé vào trò chơi', icon: '🪥', title: 'Bé đánh răng buổi sáng', refs: 'child', use: 'Bìa trò kỹ năng sống', ratio: '1:1', text: `${KEEP_FACE} {be} đứng trước bồn rửa mặt, cầm bàn chải đánh răng màu xanh, miệng cười để lộ hàm răng trắng sạch, nhiều bong bóng xà phòng nhỏ bay quanh.` },
  { id: 'i-hanoi', group: 'Bé vào trò chơi', icon: '🐢', title: 'Bé dạo Hồ Gươm', refs: 'child', use: 'Bìa trò Bé yêu Hà Nội', ratio: '16:9', text: `${KEEP_FACE} {be} đứng bên Hồ Gươm, phía sau là cầu Thê Húc màu đỏ và Tháp Rùa giữa hồ, hàng cây xanh, buổi sáng trong lành.` },
  { id: 'i-music', group: 'Bé vào trò chơi', icon: '🥁', title: 'Bé chơi nhạc cùng Gấu Bắp', refs: 'child', use: 'Bìa trò âm nhạc', ratio: '1:1', text: `${KEEP_FACE} {be} gõ chiếc trống nhỏ màu đỏ, bên cạnh là chú gấu nâu dễ thương đang thổi kèn, các nốt nhạc nhiều màu bay lên.` },
  { id: 'i-cross', group: 'Bé vào trò chơi', icon: '🚸', title: 'Bé qua đường cùng mẹ', refs: 'family', use: 'Bìa trò an toàn giao thông', ratio: '16:9', text: 'Vẽ lại người trong ảnh tham chiếu theo phong cách hoạt hình 3D. Mẹ nắm tay bé đi trên vạch kẻ đường dành cho người đi bộ, đèn giao thông bật xanh, ô tô dừng lại chờ. Không khí an toàn, vui vẻ.' },
  { id: 'i-banner', group: 'Banner và nhãn dán', icon: '🏡', title: 'Banner gia đình', refs: 'family', use: 'Banner trang chủ', ratio: '16:9', text: 'Vẽ lại cả nhà trong ảnh tham chiếu theo phong cách hoạt hình 3D ấm áp: cả nhà đứng giữa đồi cỏ xanh có cầu vồng, cùng các bạn thú thỏ, gấu, khỉ, rùa. Để khoảng trống phía trên bên trái cho lời chào.' },
  { id: 'i-sticker', group: 'Banner và nhãn dán', icon: '⭐', title: 'Nhãn dán chân dung bé', refs: 'child', use: 'Ảnh trong trò của nhà mình', ratio: '1:1', text: `${KEEP_FACE} Chân dung {be} cười tươi kiểu nhãn dán tròn, viền trắng dày, nền một màu pastel.` },
  { id: 'i-cover', group: 'Hình cho trò chơi', icon: '🧺', title: 'Bìa trò phân loại', use: 'Bìa trò chơi', ratio: '1:1', text: 'Hai chiếc giỏ mây, một giỏ đựng các loại quả, một giỏ đựng các loại rau, đặt trên bãi cỏ, phong cách 3D hoạt hình, nền đơn giản.' },
  { id: 'i-animal', group: 'Hình cho trò chơi', icon: '🐱', title: 'Thẻ hình con vật', use: 'Ảnh đáp án trong trò của nhà mình', ratio: '1:1', text: 'Một chú mèo con màu cam đứng toàn thân ở giữa khung hình, phong cách 3D hoạt hình dễ thương, nền trắng trơn.' },
]

export const VIDEO_TEMPLATES: Template[] = [
  { id: 'v-wave', group: 'Bé là nhân vật', icon: '👋', title: 'Bé vẫy tay chào', refs: 'child', use: 'Banner trang chủ', ratio: '16:9', text: `${KEEP_FACE} {be} đứng trên đồi cỏ, mỉm cười rồi vẫy tay chào thật vui, vài bông hoa khẽ đung đưa. Máy quay đứng yên.` },
  { id: 'v-dance', group: 'Bé là nhân vật', icon: '🎵', title: 'Bé nhảy cùng Gấu Bắp', refs: 'child', use: 'Màn chúc mừng, banner', ratio: '16:9', text: `${KEEP_FACE} {be} và một chú gấu nâu dễ thương cùng nhún nhảy theo nhạc trong căn phòng đồ chơi, các nốt nhạc nhiều màu bay lên. Chuyển động nhẹ nhàng.` },
  { id: 'v-garden', group: 'Bé là nhân vật', icon: '🌻', title: 'Bé tưới cây, hoa nở', refs: 'child', use: 'Trò khám phá thiên nhiên', ratio: '16:9', text: `${KEEP_FACE} {be} cầm bình tưới nhỏ tưới nước cho chậu cây; mầm cây từ từ lớn lên và nở một bông hoa hướng dương. Máy quay đứng yên.` },
  { id: 'v-balloon', group: 'Bé là nhân vật', icon: '🎈', title: 'Bé bay qua cầu vồng', refs: 'child', use: 'Banner trang chủ', ratio: '16:9', text: `${KEEP_FACE} {be} ngồi trong khinh khí cầu nhiều màu, bay chầm chậm qua cầu vồng và những đám mây trắng, vẫy tay xuống dưới.` },
  { id: 'v-win', group: 'Bé là nhân vật', icon: '🏆', title: 'Bé reo mừng chiến thắng', refs: 'child', use: 'Phần thưởng sau trò chơi', ratio: '9:16', text: `${KEEP_FACE} {be} giơ hai tay reo mừng, những ngôi sao vàng và kim tuyến rơi xuống nhẹ nhàng, nền tím ấm áp.` },
  { id: 'v-seed', group: 'Khám phá khoa học', icon: '🌱', title: 'Hạt mầm lớn thành cây', use: 'Trò khám phá', ratio: '16:9', text: 'Hạt đậu nằm trong đất nứt vỏ, nhú mầm xanh, ra lá và lớn dần thành cây nhỏ; phong cách 3D hoạt hình, ánh nắng dịu, máy quay đứng yên.' },
  { id: 'v-chick', group: 'Khám phá khoa học', icon: '🐣', title: 'Gà con nở', use: 'Trò con vật', ratio: '16:9', text: 'Một quả trứng trong ổ rơm từ từ nứt ra, chú gà con màu vàng chui ra, lắc đầu rồi kêu chiếp chiếp; phong cách 3D hoạt hình dễ thương.' },
  { id: 'v-rain', group: 'Khám phá khoa học', icon: '🌧️', title: 'Mưa và cầu vồng', use: 'Trò thời tiết', ratio: '16:9', text: 'Đám mây xám có khuôn mặt hiền lành nhỏ những giọt mưa xuống vườn hoa, sau đó mặt trời ló ra và cầu vồng hiện lên; phong cách 3D hoạt hình.' },
]

const TEACHER = 'Giọng cô giáo mầm non miền Bắc, ấm áp, vui tươi, đọc chậm và rõ cho trẻ 2–6 tuổi.'
export const VOICE_TEMPLATES: Template[] = [
  { id: 'a-hello', group: 'Lời của cô', icon: '👋', title: 'Lời chào có tên bé', use: 'Lời chào trang chủ', instruction: TEACHER, text: 'Chào {be}! Cô rất vui được gặp con. Hôm nay mình cùng chơi thật vui nhé!' },
  { id: 'a-praise', group: 'Lời của cô', icon: '⭐', title: 'Lời khen', use: 'Lời chào trang chủ', instruction: TEACHER + ' Giọng hào hứng.', text: '{be} giỏi quá! Con làm đúng rồi. Cô thưởng cho con một ngôi sao nhé!' },
  { id: 'a-teeth', group: 'Lời nhắc', icon: '🪥', title: 'Nhắc đánh răng', instruction: TEACHER, text: '{be} ơi, đến giờ đánh răng rồi! Mình chải răng thật sạch, trên dưới, trong ngoài nhé.' },
  { id: 'a-rest', group: 'Lời nhắc', icon: '👀', title: 'Nhắc nghỉ mắt', instruction: TEACHER + ' Nhẹ nhàng.', text: '{be} chơi giỏi lắm! Bây giờ mình nghỉ mắt một chút, đứng dậy vươn vai và uống nước nhé.' },
  { id: 'a-night', group: 'Lời nhắc', icon: '🌙', title: 'Chúc ngủ ngon', instruction: 'Giọng mẹ thì thầm, dịu dàng, rất chậm.', text: 'Chúc {be} ngủ ngon. Mai mình lại cùng nhau chơi và học thật vui nhé.' },
  { id: 'a-rhyme', group: 'Đồng dao', icon: '🎶', title: 'Đồng dao Dung dăng dung dẻ', instruction: TEACHER + ' Đọc theo nhịp đồng dao vui.', text: 'Dung dăng dung dẻ, dắt trẻ đi chơi. Đến ngõ nhà trời, lạy cậu lạy mợ. Cho cháu về quê, cho dê đi học. Cho cóc ở nhà, cho gà bới bếp. Ngồi xệp xuống đây!' },
]

export const GAME_TEMPLATES: Template[] = [
  { id: 'g-family', group: 'Về bé và gia đình', icon: '👨‍👩‍👧', title: 'Bé nhận ra người thân', refs: 'family', text: 'Trò "Ai đây nhỉ?": dùng ảnh gia đình để bé chỉ đúng người thân khi cô hỏi "Đâu là mẹ?", "Đâu là bố?", "Đâu là {be}?". Thêm vài câu về đồ dùng cả nhà hay dùng.' },
  { id: 'g-breakfast', group: 'Về bé và gia đình', icon: '🍚', title: 'Bữa sáng của bé', text: '{be} hay ăn sáng với cơm, phở, trứng và uống sữa. Làm trò chọn món ăn tốt cho sức khỏe, phân biệt với kẹo, nước ngọt.' },
  { id: 'g-toys', group: 'Về bé và gia đình', icon: '🧸', title: 'Đồ chơi bé yêu', text: '{be} thích gấu bông, quả bóng, con diều và ô tô đồ chơi. Làm trò nhận biết và gọi tên đồ chơi, hỏi cả màu sắc.' },
  { id: 'g-zoo', group: 'Bài học quanh bé', icon: '🦁', title: 'Đi chơi sở thú', text: 'Cuối tuần cả nhà đưa {be} đi sở thú. Làm trò nhận biết con vật: voi, hổ, sư tử, hươu cao cổ, khỉ và tiếng kêu của chúng.' },
  { id: 'g-safe', group: 'Bài học quanh bé', icon: '🔥', title: 'An toàn trong nhà', text: 'Dạy {be} nhận ra đồ vật nguy hiểm trong nhà như bếp lửa, con dao, phích nước nóng, và những việc nên làm như rửa tay, cất đồ chơi.' },
  { id: 'g-school', group: 'Bài học quanh bé', icon: '🎒', title: 'Chuẩn bị đi học', text: '{be} sắp vào lớp mẫu giáo. Làm trò chọn đồ dùng cần mang đến lớp: ba lô, bút chì, bút sáp, quyển sách, chai nước.' },
  { id: 'g-jobs', group: 'Bài học quanh bé', icon: '👩‍🏫', title: 'Bố mẹ làm nghề gì?', text: 'Làm trò về nghề nghiệp: cô giáo, bác sĩ, đầu bếp, lính cứu hỏa, nông dân, phi công; hỏi "Ai nấu ăn ngon?", "Ai chữa bệnh?".' },
  { id: 'g-weather', group: 'Bài học quanh bé', icon: '🌈', title: 'Thời tiết hôm nay', text: 'Làm trò nhận biết thời tiết: nắng, mưa, mây, gió, cầu vồng; và chọn đồ dùng phù hợp như ô khi trời mưa, mũ khi trời nắng.' },
  { id: 'g-feel', group: 'Bài học quanh bé', icon: '😊', title: 'Cảm xúc của bé', text: 'Làm trò nhận biết cảm xúc vui, buồn, sợ hãi, tức giận, ngạc nhiên qua tình huống hằng ngày của {be}, ví dụ "Bạn được quà thì thấy thế nào?".' },
]

export const fill = (text: string, child: string) => text.split('{be}').join(child.trim() || 'bé')
