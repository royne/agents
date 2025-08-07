import React, { useMemo } from 'react';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import { CampaignDailyRecord } from '../../../types/campaign-control';
import { FaCalendarAlt, FaChartLine, FaBoxOpen, FaMoneyBillWave } from 'react-icons/fa';

interface DailyHistoryTableProps {
  dailyRecords: CampaignDailyRecord[];
}

const DailyHistoryTable: React.FC<DailyHistoryTableProps> = ({ dailyRecords }) => {
  // Función para formatear números con exactamente 2 decimales
  const formatNumberWith2Decimals = (value: number): string => {
    return value.toFixed(2);
  };
  
  // Función para formatear fechas correctamente
  const formatDateCorrectly = (dateString: string): string => {
    // Extraer directamente los componentes de la fecha sin crear un objeto Date
    // para evitar ajustes de zona horaria
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  // Ordenar registros por fecha (más reciente primero)
  const sortedRecords = [...dailyRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Calcular totales para los contadores
  const totals = useMemo(() => {
    return dailyRecords.reduce((acc, record) => {
      return {
        totalSpend: acc.totalSpend + (record.spend || 0),
        totalSales: acc.totalSales + (record.sales || record.revenue || 0),
        totalUnits: acc.totalUnits + (record.units_sold || record.units || 0)
      };
    }, { totalSpend: 0, totalSales: 0, totalUnits: 0 });
  }, [dailyRecords]);

  // Calcular el CPA (Costo Por Adquisición) para un registro
  const calculateCPA = (record: CampaignDailyRecord): number => {
    const unitsSold = record.units_sold || record.units || 0;
    if (unitsSold === 0 || record.spend === 0) {
      return 0;
    }
    return record.spend / unitsSold;
  };

  // Calcular el ROI (Retorno de Inversión) para un registro
  const calculateROI = (record: CampaignDailyRecord): number => {
    const sales = record.sales || record.revenue || 0;
    if (record.spend === 0) {
      return 0;
    }
    // Retornar como número decimal en lugar de porcentaje
    return (sales - record.spend) / record.spend;
  };

  // Obtener el color de estado según el estado de la campaña
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      case 'ended':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FaCalendarAlt className="mr-2 text-primary-color" />
          Registro Histórico por Día
        </h3>
        
        {/* Contadores de totales */}
        <div className="flex space-x-4">
          <div className="bg-gray-750 px-4 py-2 rounded-lg flex items-center">
            <FaMoneyBillWave className="mr-2 text-red-500" />
            <div>
              <div className="text-xs text-gray-400">Total Gastos</div>
              <div className="text-sm font-bold">{formatCurrency(totals.totalSpend)}</div>
            </div>
          </div>
          
          <div className="bg-gray-750 px-4 py-2 rounded-lg flex items-center">
            <FaMoneyBillWave className="mr-2 text-green-500" />
            <div>
              <div className="text-xs text-gray-400">Total Ventas</div>
              <div className="text-sm font-bold">{formatCurrency(totals.totalSales)}</div>
            </div>
          </div>
          
          <div className="bg-gray-750 px-4 py-2 rounded-lg flex items-center">
            <FaBoxOpen className="mr-2 text-blue-500" />
            <div>
              <div className="text-xs text-gray-400">Total Unidades</div>
              <div className="text-sm font-bold">{formatNumber(totals.totalUnits)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-750 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Presupuesto</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Gasto</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Unidades</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ventas</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">CPA</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {formatDateCorrectly(record.date)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-flex items-center ${getStatusColor(record.status)}`}>
                      <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: 'currentColor' }}></span>
                      {record.status === 'active' ? 'Activa' : 
                       record.status === 'paused' ? 'Pausada' : 
                       record.status === 'ended' ? 'Finalizada' : 'Desconocido'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">{formatCurrency(record.budget)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">{formatCurrency(record.spend)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">{formatNumber(record.units_sold || record.units || 0)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">{formatCurrency(record.sales || record.revenue || 0)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">{formatCurrency(calculateCPA(record))}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-white">
                    {formatNumberWith2Decimals(calculateROI(record))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-400">
                  No hay registros históricos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyHistoryTable;
