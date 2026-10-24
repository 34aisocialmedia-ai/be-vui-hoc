import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MediaProvider } from './studio/media'
import './app.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MediaProvider><App /></MediaProvider>
  </React.StrictMode>,
)
