import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { tokenRequest } from '../auth/msalConfig'

export function AuthGate({ children }) {
  const { instance } = useMsal()

  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="login-screen">
          <div className="login-card">
            <h1 className="login-title">Workshop Scanner</h1>
            <p className="login-subtitle">Sign in with your Microsoft account to continue.</p>
            <button
              className="btn btn-microsoft"
              onClick={() => instance.loginRedirect(tokenRequest)}
            >
              <MicrosoftLogo />
              Sign in with Microsoft
            </button>
          </div>
        </div>
      </UnauthenticatedTemplate>
    </>
  )
}

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}
