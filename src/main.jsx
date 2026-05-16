import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.jsx'
import { createMsalConfig } from './auth/msalConfig.js'

async function bootstrap() {
  // Fetch tenant/client config from the backend at runtime so no rebuild is
  // needed when Entra settings change, and credentials stay out of the bundle.
  const { tenantId, clientId } = await fetch('/api/config').then(r => r.json())

  const msalInstance = new PublicClientApplication(createMsalConfig(tenantId, clientId))
  await msalInstance.initialize()

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  )
}

bootstrap()
