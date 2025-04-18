import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/layout/DashboardLayout';
import RAGChatInterface from '../components/RAGChatInterface';
import { useAppContext } from '../contexts/AppContext';

export default function Chat() {
  const router = useRouter();
  const { isAdmin, authData } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado y es administrador
    if (authData !== null) {
      if (!authData.isAuthenticated) {
        router.push('/auth/login');
      } else if (!isAdmin()) {
        // Si no es administrador, redirigir a la página principal
        router.push('/');
      } else {
        setLoading(false);
      }
    }
  }, [authData, isAdmin, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p className="font-bold">Área restringida</p>
          <p>Esta sección solo está disponible</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='w-full md:w-3/4 mx-auto'>
        <div className="mb-2 bg-blue-100 border-l-4 border-blue-500 text-blue-700 py-2 px-3 rounded text-sm dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200">
          <span className="font-bold">Chat con RAG:</span> Proporciona respuestas basadas en conocimiento almacenado
        </div>
        <RAGChatInterface/>
      </div>
    </DashboardLayout>
  );
}
