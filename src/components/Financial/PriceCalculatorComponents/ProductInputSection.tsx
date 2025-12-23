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
    <div className="soft-card p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </span>
        Datos del Producto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
            placeholder="Ej: Auriculares Premium X1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Costo del Proveedor
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={productCost || ''}
              onChange={(e) => setProductCost(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Panel desplegable para costos adicionales */}
      <div className="mt-6">
        <button
          onClick={() => setShowAdditionalCosts(!showAdditionalCosts)}
          className={`btn-modern flex items-center w-full justify-between px-4 py-3 rounded-xl transition-all ${showAdditionalCosts ? 'bg-white/10' : 'bg-white/5'}`}
        >
          <span className="font-semibold text-gray-200">Costos Adicionales</span>
          {showAdditionalCosts ?
            <ChevronUpIcon className="h-5 w-5 text-blue-400" /> :
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          }
        </button>

        {showAdditionalCosts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            {configs.map((config, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-500">
                  {config.name}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">$</span>
                  <input
                    type="number"
                    value={config.value || ''}
                    onChange={(e) => handleConfigChange(index, Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInputSection;
