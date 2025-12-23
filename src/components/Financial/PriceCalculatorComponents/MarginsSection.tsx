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
    <div className="soft-card p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </span>
        Márgenes de Rentabilidad
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {margins.map(margin => (
          <button
            key={margin}
            onClick={() => handleMarginSelect(margin)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!useCustomMargin && selectedMargin === margin
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
          >
            {margin}%
          </button>
        ))}

        <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <input
            type="number"
            value={customMargin || ''}
            onChange={(e) => handleCustomMarginChange(Number(e.target.value))}
            className="w-12 bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-600"
            placeholder="Personalizado"
            min="0"
            max="100"
            step="1"
          />
          <span className="text-gray-500 text-sm font-medium">%</span>
        </div>
      </div>

      {profitMargins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profitMargins.map((margin) => {
            const isActive = (useCustomMargin && margin.percentage === customMargin) ||
              (!useCustomMargin && margin.percentage === selectedMargin);
            return (
              <div
                key={margin.percentage}
                className={`group p-5 rounded-2xl cursor-pointer transition-all duration-300 ${isActive
                    ? 'bg-blue-500/10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                onClick={() => {
                  if (margin.percentage === customMargin) {
                    handleCustomMarginChange(margin.percentage);
                  } else {
                    handleMarginSelect(margin.percentage);
                  }
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-400 transition-colors">Margen</span>
                  <span className={`text-sm font-bold ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>{margin.percentage}%</span>
                </div>
                <div className="text-2xl font-bold mb-4 text-white">
                  {formatCurrency(margin.sellingPrice)}
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ganancia</span>
                  <span className="text-emerald-400 font-semibold">{formatCurrency(margin.profit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 border border-dashed border-white/10 p-8 rounded-2xl text-center text-gray-500">
          <p>Ingresa el costo del proveedor para visualizar los escenarios de rentabilidad</p>
        </div>
      )}
    </div>
  );
};

export default MarginsSection;
