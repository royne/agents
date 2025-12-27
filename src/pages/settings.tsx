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
          description="Administra tu perfil de usuario y preferencias del sistema. Las API Keys son gestionadas globalmente por el sistema."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Las API keys ya no se configuran aquí - Centralizadas en .env */}
          <div className="soft-card p-8 md:col-span-2 bg-primary-color/5 border border-primary-color/20">
            <h2 className="text-xl font-bold text-theme-primary mb-2 flex items-center gap-2">
              <FaMagic className="text-primary-color" /> Servicios Activos
            </h2>
            <p className="text-theme-secondary text-sm">
              El sistema ha sido configurado para utilizar credenciales centralizadas. No necesitas proporcionar tus propias llaves de Groq, OpenAI o Google AI. Todas las funcionalidades están disponibles automáticamente.
            </p>
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
