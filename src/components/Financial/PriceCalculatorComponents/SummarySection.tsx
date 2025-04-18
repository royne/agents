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
    <div className="bg-gray-800 p-4 rounded-lg lg:col-span-1">
      <h2 className="text-xl font-bold mb-4">Resumen</h2>
      
      {productCost > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <span className="text-gray-300">Costo del Proveedor</span>
            <span className="font-medium">{formatCurrency(productCost)}</span>
          </div>
          
          {/* Mostrar flete total calculado en lugar del valor base */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <span className="text-gray-300">Flete Total (con inefectividad)</span>
            <span className="font-medium">{formatCurrency(calculatedValues.totalFreight)}</span>
          </div>
          
          {/* Mostrar CPA real calculado en lugar del CPA base */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <span className="text-gray-300">CPA Real</span>
            <span className="font-medium">{formatCurrency(calculatedValues.realCPA)}</span>
          </div>
          
          {/* Mostrar otros costos si existen */}
          {configs.map((config, index) => {
            if (config.name !== 'Flete' && config.name !== 'CPA base' && config.name !== 'Inefectividad' && config.value > 0) {
              return (
                <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <span className="text-gray-300">{config.name}</span>
                  <span className="font-medium">{formatCurrency(config.value)}</span>
                </div>
              );
            }
            return null;
          })}
          
          <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700">
            <span className="text-gray-300 font-medium">Costo Total</span>
            <span className="font-bold">{formatCurrency(totalCost)}</span>
          </div>
          
          {/* Precio de venta con el margen seleccionado */}
          {profitMargins.find(margin => 
            margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
          ) && (
            <>
              <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700">
                <span className="text-gray-300">Margen Seleccionado</span>
                <span className="text-blue-400 font-bold">
                  {useCustomMargin ? customMargin : selectedMargin}%
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700">
                <span className="text-gray-300">Ganancia</span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(
                    profitMargins.find(margin => 
                      margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                    )!.profit
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700">
                <span className="text-gray-300 font-semibold">Precio de Venta</span>
                <span className="text-xl font-bold text-blue-400">
                  {formatCurrency(
                    profitMargins.find(margin => 
                      margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                    )!.sellingPrice
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700">
                <span className="text-gray-300 font-semibold">Precio de Venta en Landing</span>
                <span className="text-xl font-bold text-green-400">
                  {formatCurrency(
                    profitMargins.find(margin => 
                      margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
                    )!.landingPrice
                  )}
                </span>
              </div>
              
              {/* Agregar breakeven */}
              <div className="flex justify-between items-center pt-2 pb-2 border-b border-gray-700 mt-4">
                <span className="text-gray-300 font-semibold">Breakeven</span>
                <span className={`text-sm font-bold text-red-400`}>
                  {formatCurrency(calculatedValues.breakeven)}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-gray-700 p-4 rounded text-center text-gray-300">
          Ingresa el costo del proveedor para ver el resumen
        </div>
      )}
    </div>
  );
};

export default SummarySection;
