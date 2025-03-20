import type { AppProps } from 'next/app'
import '../styles/globals.css'
import ChatInterface from '../components/ChatInterface'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto max-w-4xl p-4">
        <h1 className="flex justify-center text-2xl font-bold mb-4">ROYKAR AGENTS</h1>
        <ChatInterface />
        <span className="flex justify-center text-xs text-gray-400 mt-4">Desarrollado por <strong> Roykar </strong></span>
      </main>
    </div>
  )
}