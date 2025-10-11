import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  provider: 'groq' | 'openai';
  onSave: (apiKey: string) => void;
  onClose?: () => void;
}

export const ApiKeyModal = ({ isOpen, provider, onSave, onClose }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setApiKey('');
    }
  };

  const title = provider === 'groq' ? 'Ingresa tu API Key de Groq' : 'Ingresa tu API Key de OpenAI';
  const description = provider === 'groq'
    ? 'Para usar el chat, necesitas tu API Key de Groq. La clave se guardará asociada a tu perfil (tabla profiles) y se usará solo para tus solicitudes.'
    : 'Para usar RAG, necesitas tu API Key de OpenAI (embeddings). La clave se guardará asociada a tu perfil (tabla profiles) y se usará solo para tus solicitudes.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-component p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-theme-primary">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary">✕</button>
          )}
        </div>
        <p className="text-theme-secondary mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API Key"
              className="w-full p-2 rounded bg-theme-component-hover text-theme-primary border border-theme-color focus:border-primary-color focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-color hover:opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline btn-primary"
          >
            Guardar API Key
          </button>
        </form>
      </div>
    </div>
  );
};
