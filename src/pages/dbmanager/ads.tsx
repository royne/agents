import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { useState } from 'react';

export default function AdsPage() {
  const [products, setProducts] = useState([
    { id: '1', name: 'Ad Ejemplo' }
  ]);

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleEdit = (id: string) => {
    // Lógica de edición
  };

  return (
    <DashboardLayout>
      <CrudLayout
        title="ADS"
        items={products}
        onDelete={handleDelete}
        onEdit={handleEdit}
      >
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del anuncio"
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Guardar
          </button>
        </form>
      </CrudLayout>
    </DashboardLayout>
  );
}