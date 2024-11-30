import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'  // Wrap app with Router
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>  {/* Only one Router here */}
      <App />
    </Router>
  </StrictMode>,
)
