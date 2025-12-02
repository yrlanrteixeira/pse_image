import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/features/theme'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { Toaster } from '@/components/ui/toaster'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <App />
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
