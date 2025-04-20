import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DailySalesData {
  date: string;
  sales: number;
  products?: { name: string; quantity: number }[];
}

interface ProductDailySalesChartProps {
  dailySales: DailySalesData[];
}

/**
 * Componente para visualizar las ventas de productos por día
 * Muestra un gráfico de barras con las ventas diarias
 */
const ProductDailySalesChart: React.FC<ProductDailySalesChartProps> = ({
  dailySales
}) => {
  // Verificar si hay datos
  const hasSalesData = dailySales && dailySales.length > 0;
  
  // Ordenar datos por fecha (ascendente)
  const sortedSales = hasSalesData 
    ? [...dailySales].sort((a, b) => {
        return a.date.localeCompare(b.date);
      })
    : [];
  
  // Formatear fecha para mostrar en formato más amigable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    
    // Si comienza con 'fecha-', es un identificador genérico
    if (dateStr.startsWith('fecha-')) {
      return dateStr.substring(6);
    }
    
    try {
      // Intentar formatear como fecha
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-CO', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };
  
  // Colores para las barras
  const getBarColor = (index: number) => {
    const colors = [
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', 
      '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0',
      '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
      '#009688', '#4DB6AC', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  // Depurar los datos para verificar que tenemos la información correcta
  React.useEffect(() => {
    console.log('Datos de ventas diarias:', sortedSales);
  }, [sortedSales]);

  // Función para renderizar el contenido del tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0].payload;
    console.log('Datos en tooltip:', data); // Depurar los datos en el tooltip
    
    const formattedDate = formatDate(label);
    
    return (
      <div className="bg-theme-component p-4 rounded shadow-lg border border-gray-700" style={{ maxWidth: '350px', minWidth: '250px' }}>
        <p className="font-bold text-lg mb-2 text-theme-text">{formattedDate}</p>
        <p className="text-primary-color font-semibold mb-3 text-lg">Total: {data.sales} unidades</p>
        
        {data.products && data.products.length > 0 ? (
          <div>
            <p className="font-semibold mb-2 text-theme-text border-b border-gray-700 pb-1">Productos vendidos:</p>
            <div className="max-h-60 overflow-y-auto pr-2 mt-2" style={{ scrollbarWidth: 'thin' }}>
              {data.products
                .sort((a: any, b: any) => b.quantity - a.quantity)
                .map((product: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-gray-700 hover:bg-gray-800">
                    <span className="text-sm truncate mr-3 text-theme-secondary" style={{ maxWidth: '220px' }}>
                      {product.name}
                    </span>
                    <span className="text-sm font-medium text-primary-color">{product.quantity}</span>
                  </div>
                ))
              }
            </div>
          </div>
        ) : (
          <p className="text-theme-secondary italic">No hay detalles de productos</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Ventas Diarias de Productos</h3>
      {!hasSalesData ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-gray-500">No hay datos de ventas disponibles</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={sortedSales}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString('es-CO')}
          />
          <Tooltip 
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: 'auto' }}
          />
          <Legend />
          <Bar 
            dataKey="sales" 
            name="Ventas (unidades)"
          >
            {sortedSales.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductDailySalesChart;
