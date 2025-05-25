import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { mountStagewiseToolbar } from './stagewise-toolbar'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)

if (process.env.NODE_ENV === 'development') {
	mountStagewiseToolbar()
}
