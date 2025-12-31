import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ProductMetricsChartProps {
  uniqueProductsCount: number;
  totalQuantity: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  productProfitData?: any[];
}

/**
 * Componente para visualizar un resumen de métricas de productos
 * Muestra un gráfico de radar con las principales métricas de los productos top
 */
const ProductMetricsChart: React.FC<ProductMetricsChartProps> = ({
  uniqueProductsCount,
  totalQuantity,
  totalValue,
  totalCost,
  totalProfit,
  averageMargin,
  productProfitData = []
}) => {
  // Definir colores fijos para las métricas
  const COLORS = useMemo(() => ({
    ganancia: '#9c27b0',  // Morado
    cantidad: '#4caf50',  // Verde
    valor: '#ff9800'      // Naranja
  }), []);

  // Función para limpiar el nombre del producto (quitar números al inicio)
  const cleanProductName = (name: string) => {
    return name.replace(/^[\d\s\-_.:#]+\s*/g, '');
  };

  // Obtener los 5 productos principales para el radar
  const topProducts = useMemo(() => {
    return productProfitData
      ?.slice(0, 5)
      .map(product => ({
        name: cleanProductName(product.name),
        profit: product.profit || 0,
        quantity: product.quantity || 0,
        value: product.totalValue || 0 // Usar totalValue en lugar de value
      })) || [];
  }, [productProfitData]);

  // Verificar si hay datos válidos
  const hasValidData = useMemo(() => {
    return topProducts.some(p => p.profit > 0 || p.quantity > 0 || p.value > 0);
  }, [topProducts]);

  // Calcular valores máximos para normalización
  const { maxProfit, maxQuantity, maxValue } = useMemo(() => {
    return {
      maxProfit: Math.max(...topProducts.map(p => p.profit), 1),
      maxQuantity: Math.max(...topProducts.map(p => p.quantity), 1),
      maxValue: Math.max(...topProducts.map(p => p.value), 1)
    };
  }, [topProducts]);

  // Preparar datos para el radar chart
  const data = useMemo(() => {
    return topProducts.map(product => {
      // Normalizar valores a porcentajes para el radar
      const profitPercent = (product.profit / maxProfit) * 100;
      const quantityPercent = (product.quantity / maxQuantity) * 100;
      const valuePercent = (product.value / maxValue) * 100;

      return {
        subject: product.name,
        Ganancia: profitPercent,
        Cantidad: quantityPercent,
        Valor: valuePercent,
        // Guardar valores originales para el tooltip
        originalProfit: product.profit,
        originalQuantity: product.quantity,
        originalValue: product.value
      };
    });
  }, [topProducts, maxProfit, maxQuantity, maxValue, COLORS]);

  // Formatear valores como moneda colombiana
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-theme-component p-4 rounded-lg shadow h-96">
      <h3 className="text-lg font-semibold mb-3 text-center">Métricas de Productos Top</h3>
      {data.length > 0 && hasValidData ? (
        <ResponsiveContainer width="100%" height="85%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid strokeOpacity={0.5} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#e2e8f0', fontSize: 11 }}
              tickFormatter={(value) => {
                // Limitar la longitud del texto
                return value.length > 15 ? value.substring(0, 15) + '...' : value;
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#e2e8f0' }}
              tickCount={5}
            />

            {/* Radar para Ganancia */}
            <Radar
              name="Ganancia"
              dataKey="Ganancia"
              stroke={COLORS.ganancia}
              fill={COLORS.ganancia}
              fillOpacity={0.6}
              animationDuration={1000}
              isAnimationActive={true}
            />

            {/* Radar para Cantidad */}
            <Radar
              name="Cantidad"
              dataKey="Cantidad"
              stroke={COLORS.cantidad}
              fill={COLORS.cantidad}
              fillOpacity={0.6}
              animationDuration={1000}
              isAnimationActive={true}
            />

            {/* Radar para Valor */}
            <Radar
              name="Valor"
              dataKey="Valor"
              stroke={COLORS.valor}
              fill={COLORS.valor}
              fillOpacity={0.6}
              animationDuration={1000}
              isAnimationActive={true}
            />

            {/* Tooltip personalizado */}
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const entry = props.payload;

                if (name === 'Ganancia') {
                  return [formatCurrency(entry.originalProfit), 'Ganancia'];
                } else if (name === 'Cantidad') {
                  return [entry.originalQuantity, 'Unidades'];
                } else if (name === 'Valor') {
                  return [formatCurrency(entry.originalValue), 'Valor Total'];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                color: '#e2e8f0',
                padding: '8px',
                borderRadius: '4px'
              }}
            />

            {/* Leyenda personalizada */}
            <Legend
              iconType="circle"
              wrapperStyle={{
                paddingTop: '10px',
                color: '#e2e8f0',
                fontSize: '12px'
              }}
              payload={[
                { value: 'Ganancia', type: 'circle', color: COLORS.ganancia },
                { value: 'Cantidad', type: 'circle', color: COLORS.cantidad },
                { value: 'Valor', type: 'circle', color: COLORS.valor }
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-theme-text">No hay suficientes datos de productos</p>
        </div>
      )}
    </div>
  );
};

export default ProductMetricsChart;
