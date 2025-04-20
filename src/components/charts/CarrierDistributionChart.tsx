import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CarrierDistributionChartProps {
  carrierDistribution: Record<string, number>;
  carrierShippingCosts?: Record<string, number>;
  carrierReturnCosts?: Record<string, number>;
}

/**
 * Componente para visualizar la distribución de órdenes por transportadora
 * Muestra un gráfico de barras con el número de órdenes, costos de flete y costos de devolución
 */
const CarrierDistributionChart: React.FC<CarrierDistributionChartProps> = ({
  carrierDistribution,
  carrierShippingCosts = {},
  carrierReturnCosts = {}
}) => {
  // Preparar los datos para el gráfico
  const carriers = Object.keys(carrierDistribution);
  
  // Ordenar las transportadoras por número de órdenes (descendente)
  carriers.sort((a, b) => carrierDistribution[b] - carrierDistribution[a]);
  
  // Limitar a las 10 principales transportadoras para mejor visualización
  const topCarriers = carriers.slice(0, 10);
  
  const data = {
    labels: topCarriers,
    datasets: [
      {
        label: 'Número de Órdenes',
        data: topCarriers.map(carrier => carrierDistribution[carrier]),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Costo de Flete (COP)',
        data: topCarriers.map(carrier => carrierShippingCosts[carrier] || 0),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Costo de Devoluciones (COP)',
        data: topCarriers.map(carrier => carrierReturnCosts[carrier] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Número de Órdenes'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Valor (COP)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Distribución de Órdenes por Transportadora',
        font: {
          size: 16
        }
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y;
              } else {
                label += new Intl.NumberFormat('es-CO', { 
                  style: 'currency', 
                  currency: 'COP',
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
              }
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default CarrierDistributionChart;
