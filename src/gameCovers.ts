import type { Game } from './types'
import type { MatchSide } from './types'
import { GAMES } from './data/games'

interface CoverPicture extends MatchSide { scale?: number; x?: number; y?: number }

export type CoverSpec =
  | { kind: 'image'; src: string; label: string; contain?: boolean; letters?: string[] }
  | { kind: 'photos'; photos: string[]; label: string; layout: 'bubble' | 'sound' | 'memory' | 'gallery' | 'landmarks' }
  | { kind: 'pet'; pet: 'bear' | 'monkey' | 'turtle'; objects: string[]; label: string }
  | { kind: 'colors'; colors: string[]; layout: 'bubbles' | 'sort'; label: string }
  | { kind: 'size'; emoji: string; label: string }
  | { kind: 'count'; emoji: string; count: number; bubble?: boolean; label: string }
  | { kind: 'compare'; emoji: string; left: number; right: number; scale?: boolean; label: string }
  | { kind: 'shapes'; label: string }
  | { kind: 'pattern'; colors: string[]; label: string }
  | { kind: 'calendar'; label: string }
  | { kind: 'number-match'; values: number[]; emojis: string[]; label: string }
  | { kind: 'number-memory'; values: number[]; label: string }
  | { kind: 'sequence'; values: (number | null)[]; label: string }
  | { kind: 'object-pattern'; objects: string[]; label: string }
  | { kind: 'food'; foods: string[]; label: string }
  | { kind: 'dots'; label: string }
  | { kind: 'lesson'; mode: string; pictures: CoverPicture[]; target?: MatchSide; reference?: MatchSide; level: number; cue: string; label: string }

const scene = (name: string, label: string): CoverSpec => ({ kind: 'image', src: '/assets/covers/' + name + '.webp', label })
const photos = (names: string[], layout: 'bubble' | 'sound' | 'memory' | 'gallery' | 'landmarks', label: string): CoverSpec => ({
  kind: 'photos', photos: names.map(name => '/assets/photos/' + name + '.webp'), layout, label,
})

/** Reviewed per game ID. No engine-wide animals or unrelated generic fallback. */
export const GAME_COVERS: Record<string, CoverSpec> = {
  'a1-thu': photos(['cat_real', 'dog_real'], 'bubble', 'Mèo và chó trong bong bóng'),
  'a1-mau': { kind: 'colors', colors: ['#ed6866', '#ffcf60', '#649ee9'], layout: 'bubbles', label: 'Bong bóng đỏ, vàng và xanh' },
  'a1-to': { kind: 'size', emoji: '🍎', label: 'Một quả táo to và một quả táo nhỏ' },
  'a1-cothe': scene('body', 'Bé chỉ vào tai để tìm hiểu cơ thể'),
  'a1-kemvat': photos(['chicken_real', 'duck_verified_real'], 'sound', 'Nghe tiếng kêu của gà và vịt'),
  'a1-dovat': scene('objects', 'Gấu bông, quả bóng và cái thìa'),
  'a1-camxuc': scene('emotions-young', 'Khuôn mặt vui, buồn và sợ hãi'),
  'a1-chao': scene('greetings', 'Bé vẫy tay chào cô giáo'),
  'a1-antoan': scene('safety-stove', 'Người lớn hướng dẫn bé tránh bếp nóng'),
  'a1-ghepdoi': scene('mother-baby', 'Ghép vịt mẹ với vịt con'),
  'a1-phanloai-mau': { kind: 'colors', colors: ['#ef6660', '#619de2'], layout: 'sort', label: 'Phân loại đồ vật vào rổ đỏ và rổ xanh' },
  'a1-memory': photos(['cat_real', 'cat_real', 'dog_real', 'dog_real'], 'memory', 'Hai cặp thẻ mèo và chó giống nhau'),

  'b1-dem5': { kind: 'count', emoji: '🍎', count: 3, bubble: true, label: 'Đếm ba quả táo và chọn số trong bong bóng' },
  'b1-sosanh': { kind: 'compare', emoji: '🍎', left: 2, right: 4, label: 'So sánh nhóm hai và bốn quả táo' },
  'b1-hinh': { kind: 'shapes', label: 'Hình tròn, hình vuông và hình tam giác' },
  'b1-nguyhiem': scene('safety-iron', 'Nhận biết bàn là nóng và giữ khoảng cách'),
  'b1-nghe': scene('doctor', 'Bác sĩ khám cho bé'),
  'b1-khaiquat': photos(['cat_real', 'banana_real', 'car_real'], 'gallery', 'Phân biệt con vật, hoa quả và phương tiện'),
  'b1-camxuc': scene('emotions-older', 'Nhận biết cảm xúc buồn và được bạn an ủi'),
  'b1-loihay': scene('apology', 'Bé xin lỗi bạn khi làm đổ nước'),
  'b1-nhaccu': { kind: 'image', src: '/assets/images/music-playroom-3d.webp', label: 'Bạn Thỏ gõ đàn chuông sắc màu' },
  'b1-traffic': { kind: 'photos', photos: ['/assets/photos/car_real.webp'], layout: 'gallery', label: 'Ô tô và đèn giao thông' },
  'b1-hanoi': photos(['hanoi_hoguom', 'hanoi_chuamotcot'], 'landmarks', 'Hồ Gươm và Chùa Một Cột'),
  'b1-ghepdoi-so': { kind: 'number-match', values: [1, 2, 3], emojis: ['🍎', '🐥', '⭐'], label: 'Ghép số 1, 2, 3 với nhóm đồ vật tương ứng' },
  'b1-phanloai-rac': scene('recycling-sort', 'Phân loại vỏ chuối và chai nhựa vào hai thùng'),
  'b1-chucai-o': { kind: 'image', src: '/assets/images/alphabet_tree.webp', contain: true, letters: ['O', 'Ô', 'Ơ'], label: 'Cây chữ cái O, Ô, Ơ' },
  'b1-tau-so': { kind: 'image', src: '/assets/images/train_locomotive.webp', contain: true, label: 'Đoàn tàu chở hoa quả' },
  'b1-can-thangbang': { kind: 'compare', emoji: '🍎', left: 4, right: 2, scale: true, label: 'Cân so sánh bốn và hai quả táo' },

  'c1-dem10': { kind: 'count', emoji: '🍓', count: 6, label: 'Đếm sáu quả dâu và chọn số 6' },
  'c1-sosanh': { kind: 'compare', emoji: '🍓', left: 7, right: 9, label: 'So sánh bảy và chín quả dâu' },
  'c1-quyluat': { kind: 'pattern', colors: ['#ee6662', '#629de3', '#ee6662', '#629de3', '#ee6662'], label: 'Chuỗi đỏ, xanh xen kẽ, tìm màu tiếp theo' },
  'c1-thu': { kind: 'calendar', label: 'Lịch các ngày từ thứ hai đến chủ nhật' },
  'c1-nhomchat': { kind: 'food', foods: ['🥩', '🥚', '🥬', '🥛'], label: 'Thực phẩm tốt cho bé: thịt, trứng, rau và sữa' },
  'c1-khancap': scene('ask-help', 'Bé hỏi cô công an để được giúp đỡ'),
  'c1-nghe': scene('doctor-tools', 'Bác sĩ và dụng cụ ống nghe'),
  'c1-ungxu': scene('help-friend', 'Bé giúp bạn đứng dậy'),
  'c1-moitruong': scene('environment', 'Bỏ rác vào thùng và chăm sóc cây'),
  'c1-hanoi': photos(['hanoi_vanmieu', 'hanoi_langbac'], 'landmarks', 'Văn Miếu và Lăng Bác'),
  'c1-khaiquat': photos(['elephant_real', 'strawberry_real', 'bus_real'], 'gallery', 'Các nhóm con vật, trái cây và phương tiện'),
  'c1-ghepdoi-nghe': scene('jobs-match', 'Ghép bác sĩ với ống nghe và lính cứu hỏa với xe cứu hỏa'),
  'c1-phanloai-dongvat': scene('animal-habitats', 'Cá heo dưới nước và voi trên cạn'),
  'c1-dots': { kind: 'dots', label: 'Nối các điểm có số để tạo hình tam giác' },
  'c1-khopbong': scene('animal-shadow', 'Ghép voi và sư tử với bóng của chúng'),
  'c1-chucai-a': { kind: 'image', src: '/assets/images/alphabet_tree.webp', contain: true, letters: ['A', 'Ă', 'Â'], label: 'Cây chữ cái A, Ă, Â' },
  'c1-can-thangbang': { kind: 'compare', emoji: '🍓', left: 4, right: 2, scale: true, label: 'Cân so sánh bốn và hai quả dâu' },
  'd1-chucai-e': { kind: 'image', src: '/assets/images/alphabet_tree.webp', contain: true, letters: ['E', 'Ê'], label: 'Cây chữ cái E và Ê' },
  'd1-chucai-u': { kind: 'image', src: '/assets/images/alphabet_tree.webp', contain: true, letters: ['U', 'Ư'], label: 'Cây chữ cái U và Ư' },
  'd1-ghepdoi-so': { kind: 'number-match', values: [4, 5], emojis: ['🍓', '🍎'], label: 'Ghép số 4 và 5 với bốn quả dâu và năm quả táo' },
  'd1-memory-so': { kind: 'number-memory', values: [1, 3, 1, 3], label: 'Lật thẻ tìm hai cặp số 1 và 3' },
  'd1-so-thutu': { kind: 'sequence', values: [1, null, 3], label: 'Tìm số còn thiếu trong dãy 1, ô trống, 3' },
  'd1-quyluat-qua': { kind: 'object-pattern', objects: ['🍎', '🍓', '🍌', '🍎', '🍓'], label: 'Tìm quả tiếp theo trong quy luật táo, dâu, chuối' },
}

export const GAME_TILE_NAMES: Record<string, string> = {
  'a1-ghepdoi': 'Ghép mẹ và con', 'a1-memory': 'Lật thẻ bạn thú',
  'b1-dem5': 'Đếm bong bóng', 'b1-ghepdoi-so': 'Ghép số và lượng',
  'b1-chucai-o': 'Hái chữ O Ô Ơ', 'c1-chucai-a': 'Hái chữ A Ă Â',
  'c1-khopbong': 'Khớp bóng muông thú', 'c1-ghepdoi-nghe': 'Ghép nghề và dụng cụ',
  'b1-can-thangbang': 'Cân nhiều, ít', 'c1-can-thangbang': 'Cân số lượng',
  'd1-chucai-e': 'Hái chữ E Ê', 'd1-chucai-u': 'Hái chữ U Ư',
  'd1-ghepdoi-so': 'Ghép số đến 10', 'd1-memory-so': 'Lật thẻ số',
  'd1-so-thutu': 'Tìm số còn thiếu', 'd1-quyluat-qua': 'Quy luật trái cây',
}

// New previews come from actual tasks. The cue and level describe the specific activity.
for (const game of GAMES.filter(g => g.id.startsWith('plan-'))) {
  const q = game.questions[0]
  const pair = game.rounds?.[0]?.[0]
  const option = q?.options.find(o => o.correct)
  let pictures: MatchSide[] = (game.pads && q?.notes ? q.notes.map(n => game.pads![n]) : undefined) ?? q?.steps ?? q?.pattern?.map(emoji => ({ emoji, label: '' }))
    ?? q?.groups?.flat().slice(0, 5).map(emoji => ({ emoji, label: '' }))
    ?? (q?.sequence ? q.sequence.map(n => ({ emoji: n === null ? '?' : String(n), label: '' })) : undefined)
    ?? (pair ? [pair.left, pair.right] : game.items?.slice(0, 3)) ?? q?.options.slice(0, 3) ?? []
  if (game.engine === 'ALPHABET') pictures = q.options.map(o => ({ emoji: o.label, label: o.label }))
  if (game.engine === 'SPATIAL') pictures = q.options
  GAME_COVERS[game.id] = { kind: 'lesson', mode: game.engine, pictures,
    target: option && game.engine !== 'ALPHABET' ? { emoji: option.emoji, label: option.label, photo: option.photo } : undefined,
    reference: q?.reference,
    level: ['24-36', '3-4', '4-5', '5-6'].indexOf(game.age) + 1,
    // Words only where they help; the tile's action chip already says how to play.
    cue: game.engine === 'REVEAL' ? 'Vuốt mở hình' : game.engine === 'PATH' ? 'Tìm đường' : game.engine === 'COLLECT' ? 'Gom đủ vào giỏ' : q?.pattern ? 'Hình nào tiếp theo?' : q?.sequence ? 'Số nào còn thiếu?' : q?.groups ? 'Gộp lại được mấy?' : '', label: `${game.title}: ${q?.text ?? game.prompt ?? ''}` }
  GAME_TILE_NAMES[game.id] = game.title
}

export function coverFor(game: Game): CoverSpec {
  const cover = GAME_COVERS[game.id]
  if (!cover) throw new Error('Chưa có hình minh họa cho trò chơi: ' + game.id)
  return cover
}

