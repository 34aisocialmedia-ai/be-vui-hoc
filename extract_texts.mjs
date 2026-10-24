import fs from 'fs'

async function run() {
  const gamesMod = await import('./src/data/games.ts')
  const storeMod = await import('./src/store.ts')
  const games = gamesMod.GAMES
  const rewards = storeMod.REWARDS

  const texts = new Set()

  const common = [
    'Con giỏi quá!',
    'Con hãy thử lại nhé!',
    'Con đã hoàn thành trò chơi rồi! Giỏi quá đi!',
    'Bé ơi cố lên nhé!',
    'Con thông minh quá!',
    'Bé làm rất tốt!',
    'Cùng chơi thật vui nào!',
    'Đã đến giờ nghỉ ngơi rồi! Con hãy đứng dậy vươn vai và uống nước nhé!',
    'Chúc mừng con! Hãy chọn một phần quà nhé!',
    'Gõ thêm 2 lần nữa để mở quà nào!',
    'Một lần nữa thôi!',
    'Món quà này đang bị khóa, bé hãy chơi thắng để mở nhé!',
    'Chào bé yêu! Cùng chơi nào!',
    'Con hãy ghép đôi nhé!',
    'Con hãy bỏ vào đúng giỏ nhé!',
    'Bé hãy ghép đôi nhé!',
    'Bỏ vào đúng giỏ',
    'Chạm vào giỏ đúng nào!',
    'Kéo vào giỏ',
  ]
  common.forEach((t) => texts.add(t))

  rewards.forEach((r) => {
    texts.add(r.name)
    texts.add(`Oa! Chúc mừng con! Con nhận được ${r.name}!`)
    texts.add(`Chúc mừng con! Con nhận được ${r.name}!`)
  })

  games.forEach((g) => {
    if (g.prompt) texts.add(g.prompt)
    if (g.questions) {
      g.questions.forEach((q) => {
        if (q.text) texts.add(q.text)
        if (q.options) {
          q.options.forEach((o) => {
            const s = o.say !== undefined ? o.say : o.label
            if (s && s.trim()) texts.add(s.trim())
          })
        }
      })
    }
    if (g.rounds) {
      g.rounds.forEach((rnd) => {
        rnd.forEach((p) => {
          if (p.left?.label) texts.add(p.left.label)
          if (p.right?.label) texts.add(p.right.label)
        })
      })
    }
    if (g.items) {
      g.items.forEach((it) => {
        if (it.label) texts.add(it.label)
      })
    }
    if (g.baskets) {
      g.baskets.forEach((b) => {
        if (b.label) texts.add(b.label)
      })
    }
  })

  const list = Array.from(texts).filter(Boolean)
  console.log('Total unique spoken texts:', list.length)
  fs.writeFileSync('spoken_texts.json', JSON.stringify(list, null, 2), 'utf-8')
}

run().catch(console.error)
