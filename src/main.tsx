import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css' // CRITICAL: This pulls in your Tailwind styles

// 1. Initialize the router from your blueprint
const router = getRouter()

// 2. Find the root element in your index.html
const rootElement = document.getElementById('root')!

// 3. Render the application
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}