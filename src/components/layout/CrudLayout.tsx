import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '../common/PageHeader';

interface CrudLayoutProps {
  title: React.ReactNode;
  items: Array<{ id: string; name: string }>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  hideAddButton?: boolean;
  children: React.ReactNode;
  additionalAttr?: Array<{ option: string; value: string }>;
  backLink?: string;
  showHeader?: boolean;
}

type ItemAttr = { [key: string]: string };
const itemAttr = (item: ItemAttr, attr: string) => item[attr] || '-';

export default function CrudLayout({ title, items, onDelete, onEdit, hideAddButton, additionalAttr, children, backLink, showHeader = true }: CrudLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      {showHeader && (
        <PageHeader
          title={title}
          description="Gestiona la información de forma eficiente."
          backLink={backLink}
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-color hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo
            </button>
          }
        />
      )}

      <div className="bg-theme-component rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-theme-component-hover">
            <tr>
              <th className="px-6 py-3 text-left text-theme-primary">Nombre</th>
              {additionalAttr && additionalAttr.map((attr) => (
                <th key={attr.option} className="px-6 py-3 text-left text-theme-primary">{attr.option}</th>
              ))}
              <th className="px-6 py-3 text-right text-theme-primary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-theme-color">
                <td className="px-6 py-4 text-theme-primary">{item.name}</td>
                {additionalAttr && additionalAttr.map((attr) => (
                  <td key={attr.value} className="px-6 py-4 text-theme-primary">
                    {itemAttr(item, attr.value)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right space-x-4">
                  <button 
                    onClick={() => onEdit(item.id)}
                    className="text-primary-color hover:opacity-80"
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
          <div className="bg-theme-component p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-theme-primary">Nuevo {title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-theme-tertiary hover:text-theme-secondary"
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