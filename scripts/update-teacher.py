from pathlib import Path
import re
root = Path(__file__).resolve().parents[1] / 'src'

def edit(name, replacements):
    path = root / name
    text = path.read_text(encoding='utf-8')
    for old, new in replacements:
        if old not in text: raise ValueError('Missing expected source in ' + name + ': ' + old[:80])
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')

edit('store.ts', [
    ("export type VoiceGender = 'female' | 'male'\n\n", ''),
    ("  /** 'female': Cô giáo Mai (25t, truyền cảm) · 'male': Thầy giáo Nam (25t, vui tươi) */\n  voiceGender: VoiceGender\n", ''),
    (", voiceGender: 'female'", ''),
    ("      voiceGender: settings.voiceGender === 'male' ? 'male' : 'female',\n", ''),
])
path = root / 'App.tsx'
text = path.read_text(encoding='utf-8')
text = text.replace("setVoiceGender, setSoundEnabled, type VoiceGender", "setSoundEnabled")
text = text.replace("import { Icon3D }", "import { TEACHER_INTRO } from './teacherVoice'\nimport { Icon3D }")
text, count = re.subn(r"  const currentVoice: VoiceGender.*?(?=  const changeAge)", "  useLayoutEffect(() => { setSoundEnabled(save.settings.sound) }, [save.settings.sound])\n\n", text, flags=re.S)
assert count == 1
text = text.replace("          onToggleVoice={(g) => switchVoice(g, false)}\n", '')
start = text.index('            {/* Khối chọn giọng đọc giáo viên Nam / Nữ */}')
end = text.index('            <label style={{ marginTop:', start)
text = text[:start] + '''            <div className="voice-setting-box">
              <div className="voice-setting-title">🎙️ Giọng cô giáo</div>
              <div className="voice-card selected">
                <div className="voice-card-name">👩 Cô Thủy</div>
                <p className="voice-card-desc">Giọng nữ rõ ràng, ấm áp và vui tươi. Cô Thủy đồng hành cùng con khi học và chơi.</p>
                <button className="btn-test-voice" onClick={() => save.settings.sound && speak(TEACHER_INTRO)}>🔊 Nghe cô Thủy</button>
              </div>
            </div>

''' + text[end:]
path.write_text(text, encoding='utf-8')

edit('components/HomeWebsite.tsx', [
    ("import { GAME_TILE_NAMES } from '../gameCovers'", "import { GAME_TILE_NAMES } from '../gameCovers'\nimport { TEACHER_INTRO } from '../teacherVoice'"),
    ('aria-label="Nghe bạn Thỏ chào bé"', 'aria-label="Nghe cô Thủy chào con"'),
    ("speak('Chào bé yêu! Mình là bạn Thỏ. Bé thích chơi với chữ cái, đoàn tàu hay các bạn thú nào?')", 'speak(TEACHER_INTRO)'),
])

path = root / 'Player.tsx'
text = path.read_text(encoding='utf-8')
text = text.replace("import { LearningPicture } from './components/LearningPicture'", "import { LearningPicture } from './components/LearningPicture'\nimport { CORRECT_FEEDBACK, RETRY_FEEDBACK, FINISH_FEEDBACK } from './teacherVoice'")
text = text.replace("  onToggleVoice?: (gender: 'female' | 'male') => void\n", '').replace('  onToggleVoice,\n', '')
text = text.replace("  const [exitPrompt, setExitPrompt] = useState(false)", "  const [exitPrompt, setExitPrompt] = useState(false)\n  const retryCount = useRef(0)")
text = text.replace("speak('Con giỏi quá!'), task.delay(2000)", "speak(CORRECT_FEEDBACK[(score.current.points - 1) % CORRECT_FEEDBACK.length]), task.delay(2800)")
text = text.replace("speak('Con hãy thử lại nhé!'), task.delay(2000)", "speak(RETRY_FEEDBACK[retryCount.current++ % RETRY_FEEDBACK.length]), task.delay(2800)")
text = text.replace("speak('Con đã hoàn thành trò chơi rồi! Giỏi quá đi!')", 'speak(FINISH_FEEDBACK)')
start = text.index('        <button\n          className={`voice-pill')
end = text.index('        <button className="iconbtn sound-toggle"', start)
text = text[:start] + '        <span className="voice-pill female active" role="img" aria-label="Cô Thủy đồng hành cùng con">👩</span>\n' + text[end:]
path.write_text(text, encoding='utf-8')
