import React from 'react';
import { FaRegChartBar } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

interface MetricsChartProps {
  period?: string;
  onPeriodChange?: (period: string) => void;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ 
  period = '3', 
  onPeriodChange = () => {} 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaRegChartBar className="mr-2 text-primary-color" />
          Tendencia y Análisis
        </div>
        <div>
          <select 
            className="bg-gray-700 border border-gray-600 rounded p-1 text-sm"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            <option value="3">3 días</option>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
            <option value="30">30 días</option>
          </select>
        </div>
      </h2>
      
      <div className="bg-gray-750 rounded-lg p-4 mb-4">
        {/* Selector de métricas */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="bg-primary-color px-3 py-1 rounded text-xs font-medium">
            CPA
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
            ROAS
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
            Conversiones
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
            Gastos
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs">
            Ingresos
          </button>
        </div>
        
        {/* Gráfico simulado */}
        <div className="h-auto min-h-[180px] max-h-[200px] w-full bg-gray-700 rounded-lg p-3 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Eje Y */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400 py-2">
              <div>$500</div>
              <div>$400</div>
              <div>$300</div>
              <div>$200</div>
              <div>$100</div>
              <div>$0</div>
            </div>
            
            {/* Contenido del gráfico */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {/* Líneas horizontales de referencia */}
              <div className="h-full w-full flex flex-col justify-between">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-t border-gray-600 w-full h-0"></div>
                ))}
              </div>
              
              {/* Barras simuladas */}
              <div className="absolute inset-0 flex items-end justify-around">
                <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '40%' }}>
                  <div className="text-center text-xs mt-2 text-blue-300">$200</div>
                </div>
                <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '60%' }}>
                  <div className="text-center text-xs mt-2 text-blue-300">$300</div>
                </div>
                <div className="w-[15%] bg-gradient-to-t from-blue-500/80 to-blue-500/20 rounded-t-sm" style={{ height: '50%' }}>
                  <div className="text-center text-xs mt-2 text-blue-300">$250</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Leyenda del eje X */}
        <div className="flex justify-around mt-2 text-xs text-gray-400">
          <div>{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
          <div>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>
      </div>
      
      {/* Estadísticas de resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">CPA Promedio</div>
          <div className="text-lg font-bold">{formatCurrency(250)}</div>
          <div className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↓</span> 5% vs periodo anterior
          </div>
        </div>
        
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">ROAS Promedio</div>
          <div className="text-lg font-bold text-green-500">2.4x</div>
          <div className="text-xs text-green-500 flex items-center">
            <span className="mr-1">↑</span> 12% vs periodo anterior
          </div>
        </div>
        
        <div className="bg-gray-750 p-3 rounded-lg">
          <div className="text-xs text-gray-400">Conversiones</div>
          <div className="text-lg font-bold text-blue-500">24</div>
          <div className="text-xs text-red-500 flex items-center">
            <span className="mr-1">↓</span> 3% vs periodo anterior
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;
