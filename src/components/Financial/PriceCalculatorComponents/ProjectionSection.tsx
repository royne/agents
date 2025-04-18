import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';

// Registrar los componentes necesarios para el gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectionSectionProps {
  productName: string;
  productCost: number;
  sellingPrice: number;
  totalCost: number;
  profit: number;
  formatCurrency: (value: number) => string;
}

interface ProjectionDataType {
  labels: string[];
  revenue: number[];
  costs: number[];
  profit: number[];
  cumulativeProfit: number[];
}

interface ChartDataPoint {
  name: string;
  valor: number;
}

const ProjectionSection: React.FC<ProjectionSectionProps> = ({
  productName,
  productCost,
  sellingPrice,
  totalCost,
  profit,
  formatCurrency
}) => {
  const [showProjection, setShowProjection] = useState<boolean>(false);
  const [unitsPerMonth, setUnitsPerMonth] = useState<number>(10);
  const [projectionPeriod, setProjectionPeriod] = useState<number>(6);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(0);
  
  // Datos para la proyección
  const [projectionData, setProjectionData] = useState<ProjectionDataType>({
    labels: [],
    revenue: [],
    costs: [],
    profit: [],
    cumulativeProfit: []
  });

  // Calcular la proyección cuando cambien los parámetros
  useEffect(() => {
    if (!productCost || productCost <= 0 || !sellingPrice || !totalCost) {
      return;
    }

    const labels: string[] = [];
    const revenue: number[] = [];
    const costs: number[] = [];
    const profitArray: number[] = [];
    const cumulativeProfit: number[] = [];
    
    let currentUnits: number = unitsPerMonth;
    let totalProfit: number = 0;
    
    for (let i = 1; i <= projectionPeriod; i++) {
      // Calcular unidades con crecimiento mensual
      if (i > 1) {
        const growthFactor: number = 1 + (Number(monthlyGrowth) / 100);
        currentUnits = Math.round(currentUnits * growthFactor);
      }
      
      // Calcular ingresos, costos y ganancias para el mes
      const monthlyRevenue: number = currentUnits * sellingPrice;
      const monthlyCosts: number = currentUnits * totalCost;
      const monthlyProfit: number = currentUnits * profit;
      
      // Acumular ganancia total
      totalProfit += monthlyProfit;
      
      // Añadir datos al array
      labels.push(`Mes ${i}`);
      revenue.push(monthlyRevenue);
      costs.push(monthlyCosts);
      profitArray.push(monthlyProfit);
      cumulativeProfit.push(totalProfit);
    }
    
    setProjectionData({
      labels,
      revenue,
      costs,
      profit: profitArray,
      cumulativeProfit
    });
  }, [unitsPerMonth, projectionPeriod, monthlyGrowth, productCost, sellingPrice, totalCost, profit]);

  // Configuración del gráfico de línea
  const chartData: ChartData<'line'> = {
    labels: projectionData.labels,
    datasets: [
      {
        label: 'Ingresos',
        data: projectionData.revenue,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        borderWidth: 3,
      },
      {
        label: 'Costos',
        data: projectionData.costs,
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        borderWidth: 3,
      },
      {
        label: 'Ganancia',
        data: projectionData.profit,
        borderColor: 'rgb(5, 150, 105)',
        backgroundColor: 'rgba(5, 150, 105, 0.5)',
        borderWidth: 3,
      },
      {
        label: 'Ganancia Acumulada',
        data: projectionData.cumulativeProfit,
        borderColor: 'rgb(217, 119, 6)',
        backgroundColor: 'rgba(217, 119, 6, 0.5)',
        borderWidth: 3,
      },
    ],
  };

  // Detectar si estamos en modo oscuro
  const isDarkMode = document.documentElement.classList.contains('dark');

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    color: '#FFFFFF',
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#FFFFFF', // Blanco para modo oscuro
          font: {
            weight: 'bold',
            size: 13
          },
          padding: 15,
          boxWidth: 20
        }
      },
      title: {
        display: true,
        text: `Proyección de ventas - ${productName || 'Producto'}`,
        color: '#FFFFFF', // Blanco para modo oscuro
        font: {
          weight: 'bold',
          size: 18
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#FFFFFF', // Blanco para modo oscuro
        bodyColor: '#FFFFFF', // Blanco para modo oscuro
        borderColor: '#4B5563', // Borde gris
        borderWidth: 1,
        padding: 10,
        titleFont: {
          weight: 'bold',
          size: 14
        },
        bodyFont: {
          weight: 'bold',
          size: 13
        },
        boxPadding: 5
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#FFFFFF', // Blanco para modo oscuro
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // Líneas de cuadrícula grises con transparencia
        },
        title: {
          display: true,
          text: 'Periodo',
          color: '#FFFFFF',
          font: {
            weight: 'bold',
            size: 14
          },
          padding: {
            top: 10
          }
        },
        border: {
          color: '#4B5563'
        }
      },
      y: {
        ticks: {
          color: '#FFFFFF', // Blanco para modo oscuro
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // Líneas de cuadrícula grises con transparencia
        },
        title: {
          display: true,
          text: 'Valores ($)',
          color: '#FFFFFF',
          font: {
            weight: 'bold',
            size: 14
          },
          padding: {
            bottom: 10
          }
        },
        border: {
          color: '#4B5563'
        }
      }
    }
  };

  // Calcular el punto de equilibrio (unidades necesarias para cubrir costos)
  const breakEvenUnits: number = profit > 0 ? Math.ceil(totalCost / profit) : 0;
  
  // Calcular el ROI (Return on Investment) para la inversión inicial
  const initialInvestment: number = productCost * unitsPerMonth; // Costo de la primera compra
  const lastCumulativeProfit: number = projectionData.cumulativeProfit[projectionData.cumulativeProfit.length - 1] || 0;
  const roi: number = initialInvestment > 0 ? ((lastCumulativeProfit / initialInvestment) * 100) : 0;

  return (
    <div className="mt-6 bg-gray-900 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowProjection(!showProjection)}>
        <h3 className="text-lg font-semibold text-white">Proyección de Ventas</h3>
        <button className="text-blue-400 hover:text-blue-300">
          {showProjection ? '▲ Ocultar' : '▼ Mostrar'}
        </button>
      </div>
      
      {showProjection && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unidades por mes
              </label>
              <input
                type="number"
                value={unitsPerMonth}
                onChange={(e) => setUnitsPerMonth(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Periodo de proyección (meses)
              </label>
              <select
                value={projectionPeriod}
                onChange={(e) => setProjectionPeriod(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Crecimiento mensual (%)
              </label>
              <input
                type="number"
                value={monthlyGrowth}
                onChange={(e) => setMonthlyGrowth(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          {/* Gráfico de proyección */}
          <div className="mb-6">
            <Line options={chartOptions} data={chartData} height={80} />
          </div>
          
          {/* Tabla de resumen */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-4 border-b border-gray-600 text-left text-white">Mes</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Unidades</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Ingresos</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Costos</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Ganancia</th>
                  <th className="py-2 px-4 border-b border-gray-600 text-right text-white">Ganancia Acumulada</th>
                </tr>
              </thead>
              <tbody>
                {projectionData.labels.map((month, index) => {
                  // Calcular unidades para este mes
                  let monthlyUnits: number = unitsPerMonth;
                  if (index > 0) {
                    const growthFactor: number = 1 + (Number(monthlyGrowth) / 100);
                    monthlyUnits = Math.round(unitsPerMonth * Math.pow(growthFactor, index));
                  }
                  
                  return (
                    <tr key={month} className="hover:bg-gray-700">
                      <td className="py-2 px-4 border-b border-gray-700 text-white">{month}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{monthlyUnits}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.revenue[index])}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.costs[index])}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.profit[index])}</td>
                      <td className="py-2 px-4 border-b border-gray-700 text-right text-white">{formatCurrency(projectionData.cumulativeProfit[index])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Indicadores clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 border border-blue-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Punto de Equilibrio</h4>
              <p className="text-lg font-bold text-white">{breakEvenUnits} unidades</p>
              <p className="text-xs text-gray-300">Unidades necesarias para cubrir costos</p>
            </div>
            <div className="bg-gray-800 border border-green-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-green-300 mb-1">ROI Proyectado</h4>
              <p className="text-lg font-bold text-white">{roi.toFixed(2)}%</p>
              <p className="text-xs text-gray-300">Retorno sobre inversión inicial</p>
            </div>
            <div className="bg-gray-800 border border-purple-900 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-purple-300 mb-1">Ganancia Total</h4>
              <p className="text-lg font-bold text-white">
                {formatCurrency(projectionData.cumulativeProfit[projectionData.cumulativeProfit.length - 1] || 0)}
              </p>
              <p className="text-xs text-gray-300">En {projectionPeriod} meses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionSection;
