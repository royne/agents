import { useState } from 'react';
import Link from 'next/link';

interface CrudLayoutProps {
  title: string;
  items: Array<{ id: string; name: string }>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  hideAddButton?: boolean;
  children: React.ReactNode;
}

export default function CrudLayout({ title, items, onDelete, onEdit, hideAddButton, children }: CrudLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nuevo
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-700">
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button 
                    onClick={() => onEdit(item.id)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nuevo {title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}