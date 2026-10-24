import { useEffect, useState } from 'react'
import { prepareSessionGame } from './agePolicy'
import { prefetchSpeech } from './audio'
import { spokenLines } from './speechPrefetch'
import { Session } from './player/Session'
import type { PlayerProps } from './player/types'
import { ChooseEngine } from './player/ChooseEngine'
import { MatchEngine } from './player/MatchEngine'
import { SortEngine } from './player/SortEngine'
import { BubbleEngine } from './player/BubbleEngine'
import { FeedEngine } from './player/FeedEngine'
import { PuzzleEngine } from './player/PuzzleEngine'
import { AdventureEngine } from './components/AdventureEngines'
import { RhythmEngine, SpatialEngine, StoryOrderEngine } from './components/CreativeEngines'
import { XylophoneEngine } from './components/XylophoneEngine'
import { MemoryEngine } from './components/MemoryEngine'
import { TrafficEngine } from './components/TrafficEngine'
import { ConnectDotsEngine } from './components/ConnectDotsEngine'
import { AlphabetTreeEngine } from './components/AlphabetTreeEngine'
import { NumberTrainEngine } from './components/NumberTrainEngine'
import { BalanceScaleEngine } from './components/BalanceScaleEngine'

export type { PlayerProps }

/**
 * Game screen. The session (scoring, feedback, rewards) lives in ./player/Session;
 * each built-in play style lives in its own file under ./player or ./components.
 */
export function Player(input: PlayerProps) {
  // Freeze the task set for this mounted session, including when onFinish updates saved plays.
  const [game] = useState(() => prepareSessionGame(input.game, input.visit ?? 0))
  const props = { ...input, game }
  // Fetch this session's recordings in the background so Cô Thủy answers the first tap at once.
  useEffect(() => { if (input.settings.sound) void prefetchSpeech(spokenLines(game)) }, [game, input.settings.sound])
  return (
    <Session {...props}>
      {(api) =>
        ['REVEAL', 'COLLECT', 'PATH'].includes(props.game.engine) ? <AdventureEngine game={props.game} sound={api.sound} paused={api.paused} finished={api.finished} onAnswer={api.answer}/>
        : props.game.engine === 'ORDER' ? <StoryOrderEngine game={props.game} sound={api.sound} paused={api.paused} finished={api.finished} onAnswer={api.answer} />
        : props.game.engine === 'RHYTHM' ? <RhythmEngine game={props.game} sound={api.sound} paused={api.paused} finished={api.finished} onAnswer={api.answer} />
        : props.game.engine === 'SPATIAL' ? <SpatialEngine game={props.game} sound={api.sound} paused={api.paused} finished={api.finished} onAnswer={api.answer} />
        : props.game.engine === 'G02' ? <MatchEngine game={props.game} api={api} />
        : props.game.engine === 'G03' ? <SortEngine game={props.game} api={api} />
        : props.game.engine === 'BUBBLE' ? <BubbleEngine game={props.game} api={api} />
        : props.game.engine === 'FEED' ? <FeedEngine game={props.game} api={api} />
        : props.game.engine === 'PUZZLE' ? <PuzzleEngine game={props.game} api={api} />
        : props.game.engine === 'MUSIC' ? (
            <XylophoneEngine
              game={props.game}
              sound={props.settings.sound}
              onComplete={() => api.answer('music-complete', true)}
            />
          )
        : props.game.engine === 'MEMORY' ? (
            <MemoryEngine
              game={props.game}
              sound={props.settings.sound}
              onPairMatched={(name) => api.answer(`pair-${name}`, true)}
              onMismatch={(name) => api.answer(`pair-${name}`, false)}
            />
          )
        : props.game.engine === 'TRAFFIC' ? (
            <TrafficEngine
              game={props.game}
              sound={props.settings.sound}
              onCarPassed={(c) => api.answer(`car-${c}`, true)}
            />
          )
        : props.game.engine === 'DOTS' ? (
            <ConnectDotsEngine
              game={props.game}
              sound={props.settings.sound}
              onShapeCompleted={(name) => api.answer(`shape-${name}`, true)}
            />
          )
        : props.game.engine === 'ALPHABET' ? (
            <AlphabetTreeEngine
              game={props.game}
              sound={props.settings.sound}
              onAnswer={(qid, ok) => api.answer(qid, ok)}
            />
          )
        : props.game.engine === 'NUMBER_TRAIN' ? (
            <NumberTrainEngine
              game={props.game}
              sound={props.settings.sound}
              onCargoLoaded={(c) => api.answer(`cargo-${c}`, true)}
            />
          )
        : props.game.engine === 'SCALE' ? (
            <BalanceScaleEngine
              game={props.game}
              sound={props.settings.sound}
              onAnswer={(qid, ok) => api.answer(qid, ok)}
            />
          )
        : <ChooseEngine game={props.game} api={api} />}
    </Session>
  )
}
