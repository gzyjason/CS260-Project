import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // 1. Import the Router here
import './index.css'
import App from './App.jsx'
import AppProvider from './context/AppProvider.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* 2. Wrap everything in the Router */}
        <Router>
            <AppProvider>
                <App />
            </AppProvider>
        </Router>
    </StrictMode>,
)