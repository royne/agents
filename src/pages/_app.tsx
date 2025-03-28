import type { AppProps } from 'next/app'
import '../styles/globals.css'
import ChatInterface from '../components/ChatInterface'
import { ApiKeyModal } from '../components/ApiKeyModal'
import { LoginModal } from '../components/LoginModal'
import { useApiKey } from '../hooks/useApiKey'
import { useAuth } from '../hooks/useAuth'

export default function App({ Component, pageProps }: AppProps) {
  const { apiKey, isApiKeyModalOpen, saveApiKey } = useApiKey();
  const { authData, isLoginModalOpen, login } = useAuth();

  return (
    <div className="min-h-screen max-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto max-w-4xl px-4 pt-2">
        <h1 className="flex justify-center text-2xl font-bold mb-4">Multi Agent Chat</h1>
        {authData?.isAuthenticated ? (
          apiKey ? (
            <ChatInterface apiKey={apiKey} />
          ) : (
            <div className="text-center text-gray-400">
              Por favor, ingresa tu API Key para comenzar
            </div>
          )
        ) : (
          <div className="text-center text-gray-400">
            Por favor, inicia sesión para continuar
          </div>
        )}
        <span className="flex justify-center text-xs text-gray-400 mt-2">
          Desarrollado por <strong> RAC </strong>
        </span>
      </main>
      <LoginModal isOpen={isLoginModalOpen} onLogin={login} />
      {authData?.isAuthenticated && (
        <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={saveApiKey} />
      )}
    </div>
  )
}