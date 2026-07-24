import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { applyTheme, getSavedTheme } from '@/lib/theme'
import './index.css'

applyTheme(getSavedTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


