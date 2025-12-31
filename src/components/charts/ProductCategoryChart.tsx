import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ProductDepartmentChartProps {
  productsByDepartment: Record<string, number>;
}

/**
 * Componente para visualizar la distribución de productos por departamento de destino
 */
const ProductDepartmentChart: React.FC<ProductDepartmentChartProps> = ({
  productsByDepartment
}) => {
  // Colores para las categorías
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4caf50', '#ff5722', '#9c27b0', '#607d8b'];
  
  // Depurar los datos recibidos
  React.useEffect(() => {
  }, [productsByDepartment]);
  
  // Crear datos por defecto si no hay departamentos
  const processedData = useMemo(() => {
    // Si no hay departamentos o está vacío, mostrar mensaje
    if (!productsByDepartment || Object.keys(productsByDepartment).length === 0) {
      return [
        { name: 'Sin departamento', value: 100 }
      ];
    }
    
    // Convertir el objeto a un array de objetos {name, value}
    return Object.entries(productsByDepartment)
      .map(([name, value]) => ({ 
        name: name === '' ? 'Sin departamento' : name, 
        value: value || 0 
      }))
      .filter(item => item.value > 0) // Filtrar departamentos sin productos
      .sort((a, b) => b.value - a.value); // Ordenar por cantidad (descendente)
  }, [productsByDepartment]);
  
  // Preparar datos para el gráfico
  const data = useMemo(() => {
    
    // Limitar a las 8 categorías principales y agrupar el resto
    if (processedData.length > 8) {
      const topCategories = processedData.slice(0, 7);
      const otherCategories = processedData.slice(7);
      
      const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0);
      
      if (otherValue > 0) {
        topCategories.push({
          name: 'Otros',
          value: otherValue
        });
      }
      
      return topCategories;
    }
    
    return processedData;
  }, [processedData]);
  
  // Calcular el total de productos
  const totalProducts = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);
  
  // Formatear el porcentaje
  const formatPercent = (value: number) => {
    if (totalProducts === 0) return '0%';
    return `${((value / totalProducts) * 100).toFixed(1)}%`;
  };
  
  // Verificar si hay datos para mostrar
  const hasData = data.length > 0 && totalProducts > 0;
  
  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Productos por Departamento Destino</h3>
      
      {hasData ? (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={30}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} productos (${formatPercent(value)})`, 'Cantidad']}
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                color: '#e2e8f0',
                padding: '8px',
                borderRadius: '4px'
              }}
            />
            <Legend 
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                color: '#e2e8f0',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-theme-text">No hay datos de categorías disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ProductDepartmentChart;
