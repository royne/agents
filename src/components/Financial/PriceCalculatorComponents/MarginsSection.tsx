import { ProfitMargin } from '../../../hooks/usePriceCalculator';

interface MarginsSectionProps {
  margins: number[];
  selectedMargin: number;
  customMargin: number;
  useCustomMargin: boolean;
  profitMargins: ProfitMargin[];
  handleMarginSelect: (margin: number) => void;
  handleCustomMarginChange: (value: number) => void;
  formatCurrency: (value: number) => string;
}

const MarginsSection = ({
  margins,
  selectedMargin,
  customMargin,
  useCustomMargin,
  profitMargins,
  handleMarginSelect,
  handleCustomMarginChange,
  formatCurrency
}: MarginsSectionProps) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Márgenes de Rentabilidad</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {margins.map(margin => (
          <button
            key={margin}
            onClick={() => handleMarginSelect(margin)}
            className={`px-3 py-1 rounded-full text-sm ${
              !useCustomMargin && selectedMargin === margin
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {margin}%
          </button>
        ))}
        
        <div className="flex items-center gap-2 ml-2">
          <input
            type="number"
            value={customMargin || ''}
            onChange={(e) => handleCustomMarginChange(Number(e.target.value))}
            className="w-16 p-1 rounded bg-gray-700 text-white text-sm"
            placeholder="Otro"
            min="0"
            max="100"
            step="1"
          />
          <span className="text-gray-400">%</span>
        </div>
      </div>
      
      {profitMargins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profitMargins.map((margin) => (
            <div 
              key={margin.percentage}
              className={`p-3 rounded ${
                (useCustomMargin && margin.percentage === customMargin) ||
                (!useCustomMargin && margin.percentage === selectedMargin)
                  ? 'bg-blue-900/30 border border-blue-500'
                  : 'bg-gray-700'
              }`}
              onClick={() => {
                if (margin.percentage === customMargin) {
                  handleCustomMarginChange(margin.percentage);
                } else {
                  handleMarginSelect(margin.percentage);
                }
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-300">Margen</span>
                <span className="text-blue-400 font-bold">{margin.percentage}%</span>
              </div>
              <div className="text-lg font-bold mb-1">
                {formatCurrency(margin.sellingPrice)}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Ganancia</span>
                <span className="text-green-400">{formatCurrency(margin.profit)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-700 p-4 rounded text-center text-gray-300">
          Ingresa el costo del proveedor para ver los cálculos de márgenes
        </div>
      )}
    </div>
  );
};

export default MarginsSection;
