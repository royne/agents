import DashboardLayout from '../../components/layout/DashboardLayout';
import CrudLayout from '../../components/layout/CrudLayout';
import { useState, useEffect } from 'react';
import { productDatabaseService } from '../../services/database/productService';
import type { Product } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  const { authData } = useAppContext();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!authData?.company_id) return;
    
    setLoading(true);
    const data = await productDatabaseService.getProducts(authData.company_id);
    setProducts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData?.company_id) return;

    try {
      setLoading(true);
      const productPayload = {
        name: '',
        description: '',
        provider_price: 0,
        ...currentProduct,
        company_id: authData.company_id
      };

      if (currentProduct.id) {
        await productDatabaseService.updateProduct(currentProduct.id, currentProduct);
      } else {
        await productDatabaseService.createProduct(productPayload, authData.company_id);
      }
      
      await fetchProducts();
      alert(currentProduct.id ? 'Producto actualizado' : 'Producto creado');
      setCurrentProduct({});
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await productDatabaseService.deleteProduct(id);
    await fetchProducts();
  };

  const handleEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    setCurrentProduct(product || {});
  };

  return (
    <DashboardLayout>
      <CrudLayout
        title="Productos"
        items={products}
        onDelete={handleDelete}
        onEdit={handleEdit}
        backLink="/dbmanager"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del producto"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentProduct.name || ''}
            onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Descripción del producto"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentProduct.description || ''}
            onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Precio del producto"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={currentProduct.provider_price || ''}
            onChange={(e) => setCurrentProduct({...currentProduct, provider_price: Number(e.target.value)})}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </CrudLayout>
    </DashboardLayout>
  );
}