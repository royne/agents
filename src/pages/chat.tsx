import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RAGChatInterface from '../components/RAGChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function Chat() {
  const [loading] = useState(false);

  return (
    <ProtectedRoute adminOnly={true} moduleKey={'chat'}>
      <DashboardLayout>
        <div className='w-full md:w-3/4 mx-auto'>
          <div className="mb-2 bg-blue-100 border-l-4 border-blue-500 text-blue-700 py-2 px-3 rounded text-sm dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200">
            <span className="font-bold">Chat con RAG:</span> Proporciona respuestas basadas en conocimiento almacenado
          </div>
          {!loading && <RAGChatInterface/>}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
