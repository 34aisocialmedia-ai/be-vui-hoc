import type { MatchSide } from '../types'

/** Reviewed picture vocabulary. Photos and 3D assets are bundled for offline use. */
const cards = (rows: [string, string][]): MatchSide[] => rows.map(([emoji, label]) => ({ emoji, label }))
export const PICTURES: Record<string, MatchSide[]> = {
  pets: cards([['🐱', 'mèo'], ['🐶', 'chó'], ['🐰', 'thỏ'], ['🐔', 'gà'], ['🦆', 'vịt']]),
  farm: cards([['🐮', 'bò'], ['🐔', 'gà'], ['🦆', 'vịt'], ['🐑', 'cừu'], ['🐴', 'ngựa']]),
  forest: cards([['🐘', 'voi'], ['🦒', 'hươu cao cổ'], ['🐒', 'khỉ'], ['🦁', 'sư tử'], ['🐯', 'hổ']]),
  sea: cards([['🐬', 'cá heo'], ['🐙', 'bạch tuộc'], ['🦐', 'tôm'], ['🦀', 'cua'], ['🐳', 'cá voi']]),
  insects: cards([['🦋', 'bướm'], ['🐝', 'ong'], ['🐞', 'bọ rùa'], ['🐜', 'kiến'], ['🐛', 'sâu']]),
  fruit: cards([['🍎', 'táo'], ['🍌', 'chuối'], ['🍓', 'dâu'], ['🍉', 'dưa hấu'], ['🍊', 'cam']]),
  vegetables: cards([['🥕', 'cà rốt'], ['🥬', 'rau xanh'], ['🥦', 'súp lơ'], ['🌽', 'ngô'], ['🥔', 'khoai tây']]),
  meals: cards([['🍚', 'cơm'], ['🥚', 'trứng'], ['🐟', 'cá'], ['🥛', 'sữa'], ['🥩', 'thịt']]),
  transport: cards([['🚗', 'ô tô'], ['🚌', 'xe buýt'], ['🚲', 'xe đạp'], ['🚂', 'tàu hỏa'], ['✈️', 'máy bay'], ['🚢', 'tàu thủy']]),
  rescue: cards([['🚑', 'xe cứu thương'], ['🚒', 'xe cứu hỏa'], ['🚓', 'xe cảnh sát'], ['🚌', 'xe buýt']]),
  clothes: cards([['👕', 'áo'], ['👖', 'quần'], ['👟', 'giày'], ['🧢', 'mũ'], ['🧦', 'tất']]),
  toys: cards([['🧸', 'gấu bông'], ['⚽', 'bóng'], ['🪁', 'diều'], ['🪀', 'con quay'], ['🎈', 'bóng bay']]),
  school: cards([['📚', 'sách'], ['✏️', 'bút chì'], ['🎒', 'ba lô'], ['🖍️', 'bút sáp'], ['📏', 'thước']]),
  kitchen: cards([['🥄', 'thìa'], ['🍽️', 'đĩa'], ['🥣', 'bát'], ['🥛', 'cốc sữa'], ['🍳', 'chảo']]),
  body: cards([['👁️', 'mắt'], ['👂', 'tai'], ['👃', 'mũi'], ['👄', 'miệng'], ['✋', 'tay'], ['🦶', 'chân']]),
  emotion: cards([['😀', 'vui'], ['😢', 'buồn'], ['😠', 'tức giận'], ['😮', 'ngạc nhiên'], ['😨', 'sợ']]),
  weather: cards([['☀️', 'nắng'], ['🌧️', 'mưa'], ['☁️', 'mây'], ['🌈', 'cầu vồng'], ['🌬️', 'gió']]),
  garden: cards([['🌳', 'cây'], ['🌸', 'hoa'], ['🍃', 'lá'], ['🌱', 'mầm cây'], ['🍄', 'nấm']]),
  colors: cards([['🔴', 'đỏ'], ['🟡', 'vàng'], ['🔵', 'xanh dương'], ['🟢', 'xanh lá']]),
  shapes: cards([['●', 'tròn'], ['■', 'vuông'], ['▲', 'tam giác'], ['▰', 'chữ nhật']]),
  solids: cards([['solid:sphere', 'khối cầu'], ['solid:cube', 'khối vuông'], ['solid:cylinder', 'khối trụ'], ['solid:cuboid', 'khối chữ nhật']]),
  instruments: cards([['🥁', 'trống'], ['🎸', 'đàn ghi ta'], ['🎹', 'đàn phím'], ['🎺', 'kèn'], ['🎻', 'đàn vĩ cầm']]),
  natureSounds: cards([['🌧️', 'mưa'], ['🌬️', 'gió'], ['🐦', 'chim'], ['🌊', 'sóng'], ['🐝', 'ong']]),
  jobs: cards([['🧑‍⚕️', 'bác sĩ'], ['👩‍🏫', 'cô giáo'], ['🧑‍🌾', 'nông dân'], ['🧑‍🍳', 'đầu bếp'], ['🧑‍🚒', 'lính cứu hỏa']]),
  safety: [
    { emoji: '🙋', label: 'gọi người lớn', photo: '/assets/covers/ask-help.webp' },
    { emoji: '🚰', label: 'rửa tay' }, { emoji: '🪥', label: 'đánh răng' },
    { emoji: '⛑️', label: 'đội mũ bảo hiểm' }, { emoji: '🚸', label: 'đi cùng người lớn' },
  ],
  manners: [
    { emoji: '👋', label: 'chào cô', photo: '/assets/covers/greetings.webp' },
    { emoji: '🤝', label: 'chơi cùng bạn', photo: '/assets/covers/help-friend.webp' },
    { emoji: '🙏', label: 'xin lỗi', photo: '/assets/covers/apology.webp' },
    { emoji: '🌱', label: 'chăm sóc cây', photo: '/assets/covers/environment.webp' },
  ],
  hanoi: [
    { emoji: '🐢', label: 'Hồ Gươm', photo: '/assets/photos/hanoi_hoguom.webp' },
    { emoji: '🛕', label: 'Chùa Một Cột', photo: '/assets/photos/hanoi_chuamotcot.webp' },
    { emoji: '📚', label: 'Văn Miếu', photo: '/assets/photos/hanoi_vanmieu.webp' },
    { emoji: '🏛️', label: 'Lăng Bác', photo: '/assets/photos/hanoi_langbac.webp' },
  ],
}

/** Different associations teach a relationship, rather than identical picture matching. */
export const RELATIONS: Record<string, [MatchSide, MatchSide][]> = {
  food: [
    ['🐰', 'thỏ', '🥕', 'cà rốt'], ['🐮', 'bò', '🌿', 'cỏ'], ['🐱', 'mèo', '🐟', 'cá'],
    ['🐒', 'khỉ', '🍌', 'chuối'], ['🐻', 'gấu', '🍯', 'mật ong'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  jobs: [
    ['🧑‍⚕️', 'bác sĩ', '🩺', 'ống nghe'], ['👩‍🏫', 'cô giáo', '📚', 'sách'],
    ['🧑‍🌾', 'nông dân', '🌾', 'lúa'], ['🧑‍🍳', 'đầu bếp', '🍳', 'chảo'], ['🧑‍🚒', 'lính cứu hỏa', '🚒', 'xe cứu hỏa'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  senses: [
    ['👁️', 'mắt', '🌈', 'nhìn cầu vồng'], ['👂', 'tai', '🎵', 'nghe nhạc'],
    ['👃', 'mũi', '🌸', 'ngửi hoa'], ['✋', 'tay', '⚽', 'cầm bóng'], ['🦶', 'chân', '👟', 'đi giày'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  weather: [
    ['🌧️', 'trời mưa', '☂️', 'ô'], ['☀️', 'trời nắng', '🧢', 'mũ'],
    ['❄️', 'trời lạnh', '🧥', 'áo khoác'], ['🌙', 'buổi tối', '🛏️', 'giường ngủ'], ['🌱', 'cây khô', '💧', 'nước'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  shapes: [
    ['●', 'hình tròn', '⚽', 'bóng'], ['■', 'hình vuông', '🟩', 'miếng ghép vuông'],
    ['▲', 'tam giác', '🔺', 'miếng ghép tam giác'], ['▰', 'chữ nhật', '📚', 'bìa sách'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  homes: [
    ['🐦', 'chim', '🪺', 'tổ'], ['🐰', 'thỏ', '🌿', 'bãi cỏ'], ['🐟', 'cá', '🌊', 'nước'],
    ['🐮', 'bò', '🌾', 'trang trại'], ['🐒', 'khỉ', '🌳', 'rừng'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
}

/** Ten distinct picture events per collection. Arrows teach before/after without reading. */
export const STORIES: Record<string, MatchSide[][]> = {
  hygiene: [
    ['🚰', 'làm ướt tay', '🧼', 'xoa xà phòng', '🧻', 'lau tay'],
    ['🪥', 'lấy bàn chải', '🦷', 'chải răng', '💧', 'súc miệng'],
    ['🧸', 'chơi xong', '🧺', 'cất đồ', '🚰', 'rửa tay'],
    ['🌧️', 'đi mưa về', '👕', 'thay áo khô', '🧺', 'cất áo ướt'],
    ['🍎', 'chọn táo', '🚰', 'rửa sạch', '🍽️', 'ăn táo'],
    ['🌱', 'chăm cây', '🚰', 'rửa tay', '🧻', 'lau khô'],
    ['👟', 'đi chơi về', '🧺', 'cất giày', '🧼', 'rửa tay'],
    ['🥣', 'ăn xong', '🍽️', 'cất bát', '🚰', 'rửa tay'],
    ['☀️', 'thức dậy', '🪥', 'đánh răng', '👕', 'mặc áo'],
    ['🌙', 'đến giờ ngủ', '🪥', 'đánh răng', '🛏️', 'lên giường'],
  ].map(row => Array.from({ length: row.length / 2 }, (_, i) => ({ emoji: row[i * 2], label: row[i * 2 + 1] }))),
  garden: [
    ['🌱', 'mầm cây', '🌳', 'cây lớn'], ['🌸', 'hoa', '🍎', 'quả'], ['☁️', 'mây', '🌧️', 'mưa'],
    ['🥚', 'trứng', '🐥', 'gà con'], ['🐛', 'sâu', '🦋', 'bướm'], ['🌱', 'mầm', '🌻', 'hoa hướng dương'],
    ['🌧️', 'mưa', '🌈', 'cầu vồng'], ['🍃', 'lá xanh', '🍂', 'lá vàng'], ['🐣', 'gà nở', '🐔', 'gà lớn'],
    ['🌰', 'hạt', '🌱', 'mầm mọc'],
  ].map(([a, al, b, bl]) => [{ emoji: a, label: al }, { emoji: b, label: bl }]),
  daily: [
    ['🛏️', 'thức dậy', '🪥', 'đánh răng', '🍚', 'ăn sáng'],
    ['🧸', 'chơi đồ chơi', '🧺', 'cất đồ', '🛏️', 'nghỉ ngơi'],
    ['🚰', 'rửa tay', '🍽️', 'ăn cơm', '🪥', 'đánh răng'],
    ['👕', 'mặc áo', '👟', 'đi giày', '🎒', 'đến lớp'],
    ['📚', 'chọn sách', '👀', 'xem sách', '🧺', 'cất sách'],
    ['🍎', 'chọn táo', '🚰', 'rửa táo', '🍽️', 'ăn táo'],
    ['☁️', 'mây đen', '🌧️', 'mưa xuống', '☂️', 'che ô'],
    ['🖍️', 'chọn bút', '🎨', 'vẽ tranh', '🖼️', 'treo tranh'],
    ['🌱', 'trồng mầm', '💧', 'tưới nước', '🌳', 'cây lớn'],
    ['🪁', 'chuẩn bị diều', '🌬️', 'gió thổi', '☁️', 'diều lên trời'],
  ].map(row => Array.from({ length: row.length / 2 }, (_, i) => ({ emoji: row[i * 2], label: row[i * 2 + 1] }))),
  journey: [
    ['🎒', 'chuẩn bị', '🚌', 'lên xe', '🏫', 'đến trường'],
    ['🧺', 'chọn giỏ', '🍎', 'hái táo', '🏠', 'mang về nhà'],
    ['🎫', 'mua vé', '🚂', 'lên tàu', '🏞️', 'đến nơi'],
    ['🌱', 'gieo hạt', '💧', 'tưới nước', '🌻', 'hoa nở'],
    ['🥚', 'trứng', '🐣', 'nở', '🐔', 'gà lớn'],
    ['🐛', 'sâu', '🟤', 'kén', '🦋', 'bướm'],
    ['🌄', 'sáng', '☀️', 'trưa', '🌙', 'tối'],
    ['🌸', 'hoa', '🍏', 'quả non', '🍎', 'quả chín'],
    ['🌧️', 'mưa', '🌱', 'mầm mọc', '🌳', 'cây lớn'],
    ['💌', 'viết thư', '📮', 'gửi thư', '🏠', 'thư đến nhà'],
  ].map(row => Array.from({ length: row.length / 2 }, (_, i) => ({ emoji: row[i * 2], label: row[i * 2 + 1] }))),
}

export const RIDDLES: Record<string, [string, string][]> = {
  animals: [['Ai có vòi dài?', '🐘'], ['Ai có cổ dài?', '🦒'], ['Ai kêu meo meo?', '🐱'], ['Ai kêu gâu gâu?', '🐶'], ['Ai có bờm quanh đầu?', '🦁'], ['Ai có cánh và biết gáy?', '🐔'], ['Ai có tai dài?', '🐰'], ['Ai thích chuyền cành?', '🐒'], ['Ai có mai cứng?', '🐢'], ['Ai có nhiều tua?', '🐙']],
  objects: [['Gì che mưa cho bé?', '☂️'], ['Gì giúp bé đọc truyện?', '📚'], ['Gì để đá trên sân?', '⚽'], ['Gì bé đeo đến lớp?', '🎒'], ['Gì bé dùng để vẽ?', '🖍️'], ['Gì bé đi ở chân?', '👟'], ['Gì bé đội lên đầu?', '🧢'], ['Gì giúp bé chải răng?', '🪥'], ['Gì dùng xúc cơm?', '🥄'], ['Gì báo giờ thức dậy?', '⏰']],
  nature: [['Gì sáng trên trời ban ngày?', '☀️'], ['Gì xuất hiện khi mưa tạnh và có nắng?', '🌈'], ['Gì có nhiều cánh và mùi thơm?', '🌸'], ['Gì có thân, cành và lá?', '🌳'], ['Gì giúp cây không bị khô?', '💧'], ['Gì sáng trên trời ban đêm?', '🌙'], ['Gì mang nước từ trời xuống?', '🌧️'], ['Gì bay từ hoa này sang hoa khác?', '🦋'], ['Gì có thể làm diều bay?', '🌬️'], ['Gì lớn lên từ hạt?', '🌱']],
}

/** Each row has explicit alternatives representing the requested action. */
const LIFE_RAW: Record<string, string[][]> = {
  seasonal: [
    ['Trời mưa, con chọn gì để che?', '☂️', 'ô', '🪁', 'diều'],
    ['Trời nắng, con đội gì?', '🧢', 'mũ', '🧤', 'găng tay'],
    ['Trời lạnh, con cần mặc gì?', '🧥', 'áo khoác', '🩳', 'quần ngắn'],
    ['Giày ướt, con cần làm gì?', '👟', 'đổi giày khô', '💦', 'đi giày ướt'],
    ['Nắng nóng, con cần uống gì?', '💧', 'nước sạch', '🥤', 'nước ngọt'],
    ['Đi xe máy, con đội mũ gì?', '⛑️', 'mũ bảo hiểm', '🧢', 'mũ vải'],
    ['Đi bộ, con nên mang gì ở chân?', '👟', 'giày vừa chân', '🧦', 'chỉ đi tất'],
    ['Bé ra nắng nên chơi ở đâu?', '🌳', 'bóng cây cùng người lớn', '☀️', 'ngoài nắng gắt'],
    ['Có gió mạnh, con nhờ ai giúp?', '🙋', 'người lớn', '🌳', 'tự leo cây'],
    ['Đêm đến, con nên làm gì?', '🛏️', 'ngủ đúng giờ', '🎮', 'chơi mãi'],
  ],
  hygiene: [
    ['Trước khi ăn, con làm gì?', '🚰', 'rửa tay', '⚽', 'chơi bóng'],
    ['Sau khi ăn, con làm gì cho răng sạch?', '🪥', 'đánh răng', '🍬', 'ăn kẹo'],
    ['Đi vệ sinh xong, con làm gì?', '🚰', 'rửa tay', '🧸', 'cầm đồ chơi ngay'],
    ['Tay bẩn, con cần gì?', '🧼', 'xà phòng', '🍭', 'kẹo'],
    ['Ra nắng, con đội gì?', '🧢', 'mũ', '🧦', 'tất'],
    ['Khát nước, con chọn gì?', '💧', 'nước sạch', '🥤', 'nước ngọt'],
    ['Răng cần được làm sạch bằng gì?', '🪥', 'bàn chải', '🖍️', 'bút sáp'],
    ['Bé cần mặc gì khi trời lạnh?', '🧥', 'áo khoác', '🩳', 'quần ngắn'],
    ['Bé rửa tay bằng gì?', '🧼', 'xà phòng', '🧸', 'gấu bông'],
    ['Ăn xong, con cất bát ở đâu?', '🍽️', 'khay đựng bát', '🛏️', 'giường'],
  ],
  safety: [
    ['Bị lạc, con tìm ai giúp?', '👮', 'cô công an', '🚶', 'đi theo người lạ'],
    ['Thấy lửa, con báo cho ai?', '🙋', 'người lớn', '🧯', 'tự dập lửa'],
    ['Qua đường, con đi cùng ai?', '👩‍🏫', 'người lớn', '🏃', 'tự chạy qua'],
    ['Đi xe máy, con đội gì?', '⛑️', 'mũ bảo hiểm', '🧢', 'mũ vải'],
    ['Gần ao, con cần đi với ai?', '👩‍🏫', 'người lớn', '🏊', 'tự xuống nước'],
    ['Người lạ đưa kẹo, con làm gì?', '🙅', 'từ chối và báo người lớn', '🍬', 'nhận và đi theo'],
    ['Con thấy bạn bị đau, con gọi ai?', '👩‍🏫', 'cô giáo', '🏃', 'bỏ đi chơi'],
    ['Bếp đang nóng, con làm gì?', '🙅', 'tránh xa', '✋', 'chạm vào'],
    ['Kéo sắc cần ai giúp sử dụng?', '🙋', 'người lớn', '🏃', 'vừa chạy vừa cầm'],
    ['Con muốn ra khỏi lớp, con hỏi ai?', '👩‍🏫', 'cô giáo', '🚪', 'tự mở cửa đi'],
  ],
  friends: [
    ['Gặp cô, con làm gì?', '👋', 'chào cô', '🙈', 'quay đi'],
    ['Bạn tặng quà, con nói gì?', '🙏', 'cảm ơn', '😠', 'giận bạn'],
    ['Làm bạn buồn, con nói gì?', '🙏', 'xin lỗi', '😆', 'cười bạn'],
    ['Bạn ngã, con làm gì?', '🤗', 'giúp bạn', '🏃', 'bỏ đi'],
    ['Cùng muốn một đồ chơi, con làm gì?', '🤝', 'thay phiên', '😠', 'giành đồ'],
    ['Bạn mới đến, con làm gì?', '👋', 'rủ bạn chơi', '🙅', 'từ chối bạn'],
    ['Bạn buồn, con làm gì?', '🤗', 'an ủi', '😆', 'trêu bạn'],
    ['Chơi xong, con làm gì?', '🧺', 'cất đồ chơi', '🏃', 'bỏ chạy'],
    ['Cô đang nói, con làm gì?', '👂', 'lắng nghe', '📢', 'hét lên'],
    ['Con muốn phát biểu, con làm gì?', '🙋', 'giơ tay', '📢', 'nói chen'],
  ],
  environment: [
    ['Vỏ bánh bỏ ở đâu?', '🗑️', 'thùng rác', '🌳', 'gốc cây'],
    ['Cây khô cần gì?', '💧', 'nước', '🔥', 'lửa'],
    ['Ra khỏi phòng, con làm gì?', '💡', 'tắt đèn', '🔆', 'để sáng mãi'],
    ['Rửa tay xong, con làm gì?', '🚰', 'khóa vòi', '💦', 'để nước chảy'],
    ['Thấy hoa đẹp, con làm gì?', '👀', 'ngắm hoa', '✂️', 'cắt hoa'],
    ['Con đi công viên, rác bỏ ở đâu?', '🗑️', 'thùng rác', '🌊', 'hồ nước'],
    ['Con giúp cây bằng cách nào?', '🌱', 'trồng cây', '🦶', 'giẫm cây'],
    ['Chai nhựa dùng xong cần vào đâu?', '♻️', 'thùng tái chế', '🌿', 'bãi cỏ'],
    ['Đi chơi xong, con cất đồ vào đâu?', '🧺', 'giỏ', '🌳', 'gốc cây'],
    ['Cành cây xanh cần được làm gì?', '🤗', 'bảo vệ', '✂️', 'bẻ cành'],
  ],
}

// Decode the compact authored rows once; retaining explicit wording makes review easy.
export const LIFE_ROWS: Record<string, [string, MatchSide, MatchSide][]> = Object.fromEntries(
  Object.entries(LIFE_RAW).map(([key, rows]) => [key, rows.map(([text, a, al, b, bl]) => [text, { emoji: a, label: al }, { emoji: b, label: bl }])]),
)
