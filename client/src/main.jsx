import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import LenisProvider from './components/ui/LenisProvider'
import VeilTransition from './components/ui/VeilTransition'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <LenisProvider>
          <AuthProvider>
            <FavoritesProvider>
              <VeilTransition>
                <App />
              </VeilTransition>
            </FavoritesProvider>
          </AuthProvider>
        </LenisProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
