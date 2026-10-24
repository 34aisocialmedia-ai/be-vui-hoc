import { ALL_STICKERS, STICKER_PAGES, stickerHello, type Sticker } from '../stickers'
import { playPop, playStarDing, speak, stopSpeech } from '../audio'
import { nudge, toyMove } from '../motion/motion'
import { Icon3D } from './Icon3D'

/**
 * Treasure screen: every sticker in the album stands on a wooden shelf, one shelf per world.
 * Toys the child has won move in their own way when touched (the chick hops, the kite sways);
 * the ones still to win show as soft shadows, so the child can see what each world holds.
 */
export function ToyShelf({ collection, sound }: { collection: Record<string, number>; sound: boolean }) {
  const owned = ALL_STICKERS.filter(sticker => (collection[sticker.emoji] ?? 0) > 0).length

  function touch(sticker: Sticker, figure: Element | null) {
    stopSpeech()
    if (!collection[sticker.emoji]) {
      playPop()
      void nudge(figure)
      if (sound) void speak('Món quà này đang bị khóa, bé hãy chơi thắng để mở nhé!')
      return
    }
    playStarDing()
    void toyMove(figure, sticker.move)
    if (sound) void speak(stickerHello(sticker))
  }

  return <>
    <h1 className="h rainbow-title">Kho báu</h1>
    <p className="shelf-total" aria-label={`Bé đã có ${owned} trên ${ALL_STICKERS.length} nhãn dán`}>
      <Icon3D emoji="⭐" size={30} /> <b>{owned}</b>/{ALL_STICKERS.length}
    </p>
    <div className="toy-shelves">
      {STICKER_PAGES.map(page => <section key={page.id} className={`toy-shelf shelf-${page.id}`} aria-label={page.title}>
        <h2>{page.title}</h2>
        <div className="shelf-row">
          {page.stickers.map(sticker => {
            const count = collection[sticker.emoji] ?? 0
            return <button key={sticker.emoji} type="button" className={`toy ${count ? '' : 'locked'}`}
              aria-label={count ? `${sticker.name}, ${count} lần` : `${sticker.name}, chưa có`}
              onClick={e => touch(sticker, e.currentTarget.firstElementChild)}>
              <span className="toy-figure"><Icon3D emoji={sticker.emoji} size={64} /></span>
              {count > 1 && <b className="toy-count">×{count}</b>}
            </button>
          })}
        </div>
      </section>)}
    </div>
  </>
}
