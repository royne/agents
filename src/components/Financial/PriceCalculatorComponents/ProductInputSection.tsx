import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { PriceConfig } from '../../../hooks/usePriceCalculator';

interface ProductInputSectionProps {
  productName: string;
  setProductName: (name: string) => void;
  productCost: number;
  setProductCost: (cost: number) => void;
  showAdditionalCosts: boolean;
  setShowAdditionalCosts: (show: boolean) => void;
  configs: PriceConfig[];
  handleConfigChange: (index: number, value: number) => void;
}

const ProductInputSection = ({
  productName,
  setProductName,
  productCost,
  setProductCost,
  showAdditionalCosts,
  setShowAdditionalCosts,
  configs,
  handleConfigChange
}: ProductInputSectionProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Datos del Producto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Ingrese nombre del producto"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Costo del Proveedor
          </label>
          <input
            type="number"
            value={productCost || ''}
            onChange={(e) => setProductCost(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      
      {/* Panel desplegable para costos adicionales */}
      <div className="mt-4">
        <button 
          onClick={() => setShowAdditionalCosts(!showAdditionalCosts)}
          className="flex items-center w-full justify-between bg-gray-700 p-2 rounded text-left"
        >
          <span className="text-lg font-semibold">Costos Adicionales</span>
          {showAdditionalCosts ? 
            <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : 
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {showAdditionalCosts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3 p-3 bg-gray-700/50 rounded">
            {configs.map((config, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {config.name}
                </label>
                <input
                  type="number"
                  value={config.value || ''}
                  onChange={(e) => handleConfigChange(index, Number(e.target.value))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInputSection;
