import React from 'react';
import { formatCurrency, formatNumber, formatDate } from '../../../utils/formatters';
import { CampaignDailyRecord } from '../../../types/campaign-control';

interface DailyHistoryTableProps {
  dailyRecords: CampaignDailyRecord[];
}

const DailyHistoryTable: React.FC<DailyHistoryTableProps> = ({ dailyRecords }) => {
  // Función para formatear números con exactamente 2 decimales
  const formatNumberWith2Decimals = (value: number): string => {
    return value.toFixed(2);
  };
  // Ordenar registros por fecha (más reciente primero)
  const sortedRecords = [...dailyRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-color" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        Registro Histórico por Día
      </h3>

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
                    {formatDate(record.date)}
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
