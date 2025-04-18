import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal = ({ isOpen, onSave }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-component p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-theme-primary">Ingresa tu API Key de Groq</h2>
        <p className="text-theme-secondary mb-4">
          Para usar esta aplicación, necesitas proporcionar tu API Key de Groq. 
          La clave se guardará en tu navegador y solo será usada para hacer peticiones a la API de Groq.
        </p>
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
