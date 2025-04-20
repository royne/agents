import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusDistributionChartProps {
  statusDistribution: Record<string, number>;
}

/**
 * Componente para visualizar la distribución de órdenes por estado
 * Muestra un gráfico circular con los diferentes estados de las órdenes
 * Agrupa todos los estados excepto "entregado", "cancelado" y "devoluciones" en "otros"
 */
const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  statusDistribution
}) => {
  // Definir los estados principales a mostrar individualmente
  const mainStatuses = ['entregado', 'cancelado', 'devolución', 'devolucion'];
  
  // Colores para los diferentes estados
  const COLORS = {
    entregado: '#00C49F', // Verde para entregados
    cancelado: '#FF8042', // Naranja para cancelados
    devolución: '#FF0000', // Rojo para devoluciones
    devolucion: '#FF0000', // Rojo para devoluciones (sin tilde)
    otros: '#8884D8' // Púrpura para otros estados
  };
  
  // Preparar los datos para el gráfico agrupando estados
  const processedData = Object.entries(statusDistribution).reduce((result, [status, count]) => {
    const lowerStatus = status.toLowerCase();
    
    // Verificar si el estado es uno de los principales o debe ir a "otros"
    let category = 'otros';
    
    for (const mainStatus of mainStatuses) {
      if (lowerStatus.includes(mainStatus)) {
        // Si es devolución, normalizar el nombre
        if (mainStatus === 'devolución' || mainStatus === 'devolucion') {
          category = 'devolución';
        } else {
          category = mainStatus;
        }
        break;
      }
    }
    
    // Acumular el conteo en la categoría correspondiente
    result[category] = (result[category] || 0) + count;
    return result;
  }, {} as Record<string, number>);
  
  // Convertir a formato para el gráfico
  const data = Object.entries(processedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Ordenar por cantidad (descendente)
  
  // Función para determinar el color basado en el estado
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'entregado') return COLORS.entregado;
    if (lowerStatus === 'cancelado') return COLORS.cancelado;
    if (lowerStatus === 'devolución') return COLORS.devolución;
    if (lowerStatus === 'devolucion') return COLORS.devolucion;
    return COLORS.otros;
  };

  // Calcular el total de órdenes
  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

  // Capitalizar la primera letra de cada nombre para mejor presentación
  const formatStatusName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Distribución por Estado</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill={getStatusColor(data[index].name)}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontWeight="bold"
                >
                  {`${formatStatusName(data[index].name)}: ${(percent * 100).toFixed(1)}%`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} órdenes (${((value / totalOrders) * 100).toFixed(1)}%)`, 'Cantidad']}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            formatter={(value) => formatStatusName(value)}
            wrapperStyle={{ paddingTop: 20 }}
            iconSize={10}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistributionChart;
