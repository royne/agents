import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface RegionDistributionChartProps {
  regionDistribution: Record<string, number>;
}

/**
 * Componente para visualizar la distribución de órdenes por región (departamento)
 * Muestra un gráfico de dona con las diferentes regiones
 */
const RegionDistributionChart: React.FC<RegionDistributionChartProps> = ({
  regionDistribution
}) => {
  // Preparar los datos para el gráfico
  const regions = Object.keys(regionDistribution);
  
  // Ordenar las regiones por número de órdenes (descendente)
  regions.sort((a, b) => regionDistribution[b] - regionDistribution[a]);
  
  // Limitar a las 10 principales regiones para mejor visualización
  const topRegions = regions.slice(0, 10);
  const otherRegions = regions.slice(10);
  
  // Si hay más de 10 regiones, agrupar el resto como "Otros"
  let chartData = topRegions.map(region => regionDistribution[region]);
  let chartLabels = [...topRegions];
  
  if (otherRegions.length > 0) {
    const otherRegionsTotal = otherRegions.reduce((sum, region) => sum + regionDistribution[region], 0);
    chartData.push(otherRegionsTotal);
    chartLabels.push('Otros');
  }
  
  // Colores para las regiones
  const backgroundColors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(40, 159, 64, 0.8)',
    'rgba(210, 99, 132, 0.8)',
    'rgba(128, 128, 128, 0.8)' // Para "Otros"
  ];
  
  const data = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Distribución por Departamento',
        font: {
          size: 16
        }
      },
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = chartData.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} órdenes (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default RegionDistributionChart;
