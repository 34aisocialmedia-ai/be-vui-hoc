import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MediaProvider } from './studio/media'
import './app.css'
import { registerSW } from 'virtual:pwa-register'

// Look for a new version every minute and whenever the app comes back to the screen, so a new deploy
// reaches open tabs and installed apps by itself (the page reloads once the new version is ready).
// Not while a parent is in the studio: a reload would lose their photos or stop a game being made.
const busy = () => (window as unknown as { __bvhBusy?: boolean }).__bvhBusy === true
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const check = () => { if (!document.hidden && !busy() && navigator.onLine) void registration.update().catch(() => {}) }
    setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MediaProvider><App /></MediaProvider>
  </React.StrictMode>,
)
