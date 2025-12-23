import DashboardLayout from '../components/layout/DashboardLayout';
import { useApiKey } from '../hooks/useApiKey';
import { useAppContext } from '../contexts/AppContext';
import Link from 'next/link';
import { FaMagic, FaUser, FaEdit } from 'react-icons/fa';
import ThemeSettings from '../components/settings/ThemeSettings';
import UserProfile from '../components/profile/UserProfile';
import PageHeader from '../components/common/PageHeader';

export default function Settings() {
  const { apiKey, saveApiKey, clearApiKey, openaiApiKey, saveOpenaiApiKey, clearOpenaiApiKey, googleAiKey, saveGoogleAiKey, clearGoogleAiKey } = useApiKey();
  const { isAdmin } = useAppContext();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Configuración"
          description="Administra tus API Keys, perfil de usuario y preferencias del sistema."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta Groq */}
          <div className="soft-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-theme-primary">API Key de Groq</h2>
              {apiKey && (
                <button
                  onClick={clearApiKey}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!apiKey ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('apiKey') as string;
                saveApiKey(key);
              }}>
                <div className="space-y-5">
                  <input
                    type="password"
                    name="apiKey"
                    placeholder="Ingresa tu API Key de Groq"
                    className="w-full p-4 rounded-xl bg-theme-component-hover text-theme-primary border border-white/5 focus:border-primary-color focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary-color hover:opacity-90 text-black font-bold py-3 px-4 rounded-xl btn-modern"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="font-mono text-theme-secondary">
                    {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiKey)}
                    className="text-theme-tertiary hover:text-primary-color ml-2 z-10 transition-colors"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-theme-component/90 backdrop-blur-sm hidden group-hover:flex items-center justify-center rounded-xl transition-all">
                  <span className="text-sm font-medium text-primary-color">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta OpenAI */}
          <div className="soft-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-theme-primary">API Key de OpenAI</h2>
              {openaiApiKey && (
                <button
                  onClick={clearOpenaiApiKey}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!openaiApiKey ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('openaiApiKey') as string;
                saveOpenaiApiKey(key);
              }}>
                <div className="space-y-5">
                  <input
                    type="password"
                    name="openaiApiKey"
                    placeholder="Ingresa tu API Key de OpenAI"
                    className="w-full p-4 rounded-xl bg-theme-component-hover text-theme-primary border border-white/5 focus:border-primary-color focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary-color hover:opacity-90 text-black font-bold py-3 px-4 rounded-xl btn-modern"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="font-mono text-theme-secondary">
                    {openaiApiKey.slice(0, 8)}...{openaiApiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(openaiApiKey)}
                    className="text-theme-tertiary hover:text-primary-color ml-2 z-10 transition-colors"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-theme-component/90 backdrop-blur-sm hidden group-hover:flex items-center justify-center rounded-xl transition-all">
                  <span className="text-sm font-medium text-primary-color">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta Google AI */}
          <div className="soft-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-theme-primary">Google AI Key (Gemini)</h2>
              {googleAiKey && (
                <button
                  onClick={clearGoogleAiKey}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!googleAiKey ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('googleAiKey') as string;
                saveGoogleAiKey(key);
              }}>
                <div className="space-y-5">
                  <input
                    type="password"
                    name="googleAiKey"
                    placeholder="Ingresa tu API Key de Google Studio"
                    className="w-full p-4 rounded-xl bg-theme-component-hover text-theme-primary border border-white/5 focus:border-primary-color focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary-color hover:opacity-90 text-black font-bold py-3 px-4 rounded-xl btn-modern"
                  >
                    Guardar API Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="font-mono text-theme-secondary">
                    {googleAiKey.slice(0, 8)}...{googleAiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(googleAiKey)}
                    className="text-theme-tertiary hover:text-primary-color ml-2 z-10 transition-colors"
                    title="Copiar al portapapeles"
                  >
                    📋
                  </button>
                </div>
                <div className="absolute inset-0 bg-theme-component/90 backdrop-blur-sm hidden group-hover:flex items-center justify-center rounded-xl transition-all">
                  <span className="text-sm font-medium text-primary-color">
                    Haz clic en el icono para copiar
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de personalización */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Personalización</h2>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <ThemeSettings />
        </div>

        {/* Sección de perfil de usuario */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Perfil de Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="w-full">
            <UserProfile showEditButton={false} />
          </div>
          <div className="soft-card p-8 transition-colors w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-theme-primary">Gestionar mi perfil</h2>
              <div className="p-2 bg-primary-color/10 rounded-lg">
                <FaUser className="text-primary-color" />
              </div>
            </div>
            <p className="text-sm text-theme-tertiary mb-6 leading-relaxed">Actualiza tu información personal y preferencias de cuenta para una experiencia personalizada.</p>
            <Link href="/profile">
              <div className="bg-primary-color hover:opacity-90 text-black font-bold py-3 px-6 rounded-xl text-center cursor-pointer btn-modern flex items-center justify-center shadow-lg shadow-primary-color/20">
                <FaEdit className="mr-2" /> Editar Perfil
              </div>
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
