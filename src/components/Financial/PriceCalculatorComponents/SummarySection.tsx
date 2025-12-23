import { PriceConfig, ProfitMargin } from '../../../hooks/usePriceCalculator';

interface SummarySectionProps {
  productCost: number;
  configs: PriceConfig[];
  totalCost: number;
  profitMargins: ProfitMargin[];
  selectedMargin: number;
  customMargin: number;
  useCustomMargin: boolean;
  calculatedValues: {
    realCPA: number;
    totalFreight: number;
    breakeven: number;
  };
  formatCurrency: (value: number) => string;
}

const SummarySection = ({
  productCost,
  configs,
  totalCost,
  profitMargins,
  selectedMargin,
  customMargin,
  useCustomMargin,
  calculatedValues,
  formatCurrency
}: SummarySectionProps) => {
  return (
    <div className="soft-card p-6 lg:col-span-1">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        Resumen Global
      </h2>

      {productCost > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-gray-400 text-sm">Costo del Proveedor</span>
            <span className="font-semibold text-white">{formatCurrency(productCost)}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-gray-400 text-sm">Flete Estimado (Total)</span>
            <span className="font-semibold text-white">{formatCurrency(calculatedValues.totalFreight)}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-gray-400 text-sm">CPA Real</span>
            <span className="font-semibold text-white">{formatCurrency(calculatedValues.realCPA)}</span>
          </div>

          {configs.map((config, index) => {
            if (config.name !== 'Flete' && config.name !== 'CPA base' && config.name !== 'Inefectividad' && config.value > 0) {
              return (
                <div key={index} className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-gray-400 text-sm">{config.name}</span>
                  <span className="font-semibold text-white">{formatCurrency(config.value)}</span>
                </div>
              );
            }
            return null;
          })}

          <div className="flex justify-between items-center py-4 px-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-gray-300 font-bold">Inversión Total</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalCost)}</span>
          </div>

          {profitMargins.find(margin =>
            margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
          ) && (
              <div className="mt-8 space-y-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300/80 text-sm font-medium">Margen Estratégico</span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {useCustomMargin ? customMargin : selectedMargin}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Beneficio Neto</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(
                      profitMargins.find(margin =>
                        margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                      )!.profit
                    )}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-300 font-semibold mb-1">Precio Objetivo</span>
                    <span className="text-2xl font-black text-blue-400 tracking-tight">
                      {formatCurrency(
                        profitMargins.find(margin =>
                          margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                        )!.sellingPrice
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-end opacity-90">
                    <span className="text-gray-400 text-xs font-medium mb-1">Precio en Landing</span>
                    <span className="text-lg font-bold text-emerald-500/90">
                      {formatCurrency(
                        profitMargins.find(margin =>
                          margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                        )!.landingPrice
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/5">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-tighter">Punto de Equilibrio (Breakeven)</span>
                  <span className="text-sm font-bold text-rose-400/90">
                    {formatCurrency(calculatedValues.breakeven)}
                  </span>
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="bg-white/5 border border-dashed border-white/10 p-10 rounded-2xl text-center text-gray-500">
          <p className="text-sm">Completa los datos del producto para generar el análisis financiero detallado</p>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
