import { useState, useEffect } from 'react';

export interface PriceConfig {
  name: string;
  value: number;
}

export interface ProfitMargin {
  percentage: number;
  sellingPrice: number;
  landingPrice: number; // Precio de venta en landing
  profit: number;
}

export interface ChartData {
  name: string;
  valor: number;
}

export const usePriceCalculator = () => {
  // Configuraciones predeterminadas
  const [productName, setProductName] = useState<string>('');
  const [productCost, setProductCost] = useState<number>(0);
  const [showAdditionalCosts, setShowAdditionalCosts] = useState<boolean>(false);
  const [configs, setConfigs] = useState<PriceConfig[]>([
    { name: 'Inefectividad', value: 25 },
    { name: 'Flete', value: 20000 },
    { name: 'CPA base', value: 15000 },
    { name: 'Costo Administrativo', value: 0 },
    { name: 'Otros Gastos', value: 0 },
  ]);
  
  // Márgenes de rentabilidad a calcular
  const [margins, setMargins] = useState<number[]>([10, 15, 20]);
  const [selectedMargin, setSelectedMargin] = useState<number>(20);
  const [customMargin, setCustomMargin] = useState<number>(0);
  const [useCustomMargin, setUseCustomMargin] = useState<boolean>(false);
  
  // Resultados calculados:w
  const [profitMargins, setProfitMargins] = useState<ProfitMargin[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // Calcular el costo total y los márgenes de rentabilidad
  useEffect(() => {
    // Solo calcular si hay un precio de proveedor
    if (!productCost || productCost <= 0) {
      setTotalCost(0);
      setProfitMargins([]);
      setChartData([]);
      return;
    }
    
    // Obtener los valores de configuración
    const supplierCost = productCost;
    const ineffectivityConfig = configs.find(c => c.name === 'Inefectividad');
    const freightConfig = configs.find(c => c.name === 'Flete');
    const cpaBaseConfig = configs.find(c => c.name === 'CPA base');
    const adminCostConfig = configs.find(c => c.name === 'Costo Administrativo');
    const otherCostsConfig = configs.find(c => c.name === 'Otros Gastos');
    
    // Valores por defecto si no se encuentran las configuraciones
    const ineffectivityPercentage = ineffectivityConfig ? ineffectivityConfig.value : 0;
    const baseFreight = freightConfig ? freightConfig.value : 0;
    const cpaBase = cpaBaseConfig ? cpaBaseConfig.value : 15000;
    const adminCost = adminCostConfig ? adminCostConfig.value : 0;
    const otherCosts = otherCostsConfig ? otherCostsConfig.value : 0;
    
    // 1. Calcular el flete total con inefectividad
    // La fórmula correcta es: fletebase/(1-inefectividad)
    const ineffectivityFactor = ineffectivityPercentage / 100;
    const totalFreight = baseFreight / (1 - ineffectivityFactor);
    
    // Calcular márgenes de rentabilidad
    const marginsToCalculate = useCustomMargin 
      ? [...margins, customMargin].sort((a, b) => a - b) 
      : margins;
    
    const calculatedMargins = marginsToCalculate.map(percentage => {
      // Costos base sin CPA
      const baseCosts = supplierCost + totalFreight + adminCost + otherCosts;
      
      // Calcular el precio de venta considerando tanto el CPA (23%) como el margen de rentabilidad
      // Precio de venta = Costos / (1 - CPA% - Margen%)
      // Donde CPA% = 0.23 y Margen% = percentage/100
      const cpaPercentage = 0.23;
      const marginPercentage = percentage / 100;
      
      // Despejar el precio de venta total
      const finalSellingPrice = baseCosts / (1 - cpaPercentage - marginPercentage);
      
      // Calcular el CPA real (23% del precio de venta)
      const realCPA = finalSellingPrice * cpaPercentage;
      // Asegurarse de que el CPA no sea menor que el CPA base
      const adjustedCPA = Math.max(cpaBase, realCPA);
      
      // Si el CPA real es menor que el base, recalcular el precio de venta
      let adjustedSellingPrice = finalSellingPrice;
      if (realCPA < cpaBase) {
        // Recalcular con el CPA base
        adjustedSellingPrice = (baseCosts + cpaBase) / (1 - marginPercentage);
      }
      
      // Calcular el costo total incluyendo el CPA ajustado
      const calculatedTotalCost = baseCosts + (realCPA < cpaBase ? cpaBase : realCPA);
      
      // Calcular la ganancia
      const profit = adjustedSellingPrice - calculatedTotalCost;
      
      // Calcular el precio de venta en landing (aproximación que genere el mayor margen)
      // Redondeamos hacia arriba a la centena más cercana para tener un precio "limpio"
      const landingPrice = Math.ceil(adjustedSellingPrice / 100) * 100;
      
      return {
        percentage,
        sellingPrice: adjustedSellingPrice,
        landingPrice,
        profit
      };
    });
    
    // Actualizar el costo total con el cálculo final
    const selectedMarginItem = calculatedMargins.find(
      margin => margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
    );
    
    if (selectedMarginItem) {
      const totalCostWithRealCPA = selectedMarginItem.sellingPrice - selectedMarginItem.profit;
      setTotalCost(totalCostWithRealCPA);
    }
    
    setProfitMargins(calculatedMargins);
    
    // Preparar datos para el gráfico
    // Usamos la misma variable para evitar redeclaración
    if (selectedMarginItem) {
      // Obtener los valores de configuración
      const ineffectivityConfig = configs.find(c => c.name === 'Inefectividad');
      const freightConfig = configs.find(c => c.name === 'Flete');
      const cpaBaseConfig = configs.find(c => c.name === 'CPA base');
      const adminCostConfig = configs.find(c => c.name === 'Costo Administrativo');
      const otherCostsConfig = configs.find(c => c.name === 'Otros Gastos');
      
      // Valores por defecto si no se encuentran las configuraciones
      const ineffectivityPercentage = ineffectivityConfig ? ineffectivityConfig.value : 0;
      const baseFreight = freightConfig ? freightConfig.value : 0;
      const cpaBase = cpaBaseConfig ? cpaBaseConfig.value : 15000;
      
      // Calcular valores reales para el gráfico usando la fórmula correcta
      // La fórmula correcta es: fletebase/(1-inefectividad)
      const ineffectivityFactor = ineffectivityPercentage / 100;
      const totalFreight = baseFreight / (1 - ineffectivityFactor);
      
      // Calcular el CPA real (23% del precio de venta)
      const realCPA = selectedMarginItem.sellingPrice * 0.23;
      // Asegurarse de que el CPA no sea menor que el CPA base
      const adjustedCPA = Math.max(cpaBase, realCPA);
      
      const adminCost = adminCostConfig ? adminCostConfig.value : 0;
      const otherCosts = otherCostsConfig ? otherCostsConfig.value : 0;
      
      const graphData: ChartData[] = [
        { name: 'Costo Proveedor', valor: supplierCost },
        { name: 'Flete Total', valor: totalFreight },
        { name: 'CPA Real', valor: adjustedCPA },
      ];
      
      if (adminCost > 0) {
        graphData.push({ name: 'Costo Administrativo', valor: adminCost });
      }
      
      if (otherCosts > 0) {
        graphData.push({ name: 'Otros Gastos', valor: otherCosts });
      }
      
      graphData.push({
        name: 'Ganancia',
        valor: selectedMarginItem.profit
      });
      
      setChartData(graphData);
    } else {
      setChartData([]);
    }
  }, [productCost, configs, margins, selectedMargin, customMargin, useCustomMargin]);
  
  // Manejar cambios en las configuraciones
  const handleConfigChange = (index: number, value: number) => {
    const newConfigs = [...configs];
    newConfigs[index].value = value;
    setConfigs(newConfigs);
  };
  
  // Manejar cambio en el margen personalizado
  const handleCustomMarginChange = (value: number) => {
    setCustomMargin(value);
    setUseCustomMargin(true);
  };
  
  // Manejar selección de margen predefinido
  const handleMarginSelect = (margin: number) => {
    setSelectedMargin(margin);
    setUseCustomMargin(false);
  };
  
  // Formatear números como moneda
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Calcular valores adicionales para el resumen
  const getCalculatedValues = () => {
    if (!productCost || productCost <= 0 || profitMargins.length === 0) {
      return {
        realCPA: 0,
        totalFreight: 0,
        breakeven: 0,
        selectedMargin: null
      };
    }

    // Obtener el margen seleccionado
    const selectedMarginItem = profitMargins.find(
      margin => margin.percentage === (useCustomMargin ? customMargin : selectedMargin)
    );

    if (!selectedMarginItem) {
      return {
        realCPA: 0,
        totalFreight: 0,
        breakeven: 0
      };
    }

    // Obtener los valores de configuración
    const ineffectivityConfig = configs.find(c => c.name === 'Inefectividad');
    const freightConfig = configs.find(c => c.name === 'Flete');
    const cpaBaseConfig = configs.find(c => c.name === 'CPA base');
    
    // Valores por defecto si no se encuentran las configuraciones
    const ineffectivityPercentage = ineffectivityConfig ? ineffectivityConfig.value : 0;
    const baseFreight = freightConfig ? freightConfig.value : 0;
    const cpaBase = cpaBaseConfig ? cpaBaseConfig.value : 15000;
    
    // Calcular flete total con inefectividad
    // La fórmula correcta es: fletebase/(1-inefectividad)
    const ineffectivityFactor = ineffectivityPercentage / 100;
    const totalFreight = baseFreight / (1 - ineffectivityFactor);
    
    // Calcular CPA real (23% del precio de venta)
    const realCPA = selectedMarginItem.sellingPrice * 0.23;
    // Asegurarse de que el CPA no sea menor que el CPA base
    const adjustedCPA = Math.max(cpaBase, realCPA);
    
    // Calcular breakeven (precio máximo del producto que puedo pagar antes de perder dinero)
    // Breakeven = Precio de venta - (Flete total + CPA real + Costos administrativos + Otros gastos)
    const adminCostConfig = configs.find(c => c.name === 'Costo Administrativo');
    const otherCostsConfig = configs.find(c => c.name === 'Otros Gastos');
    const adminCost = adminCostConfig ? adminCostConfig.value : 0;
    const otherCosts = otherCostsConfig ? otherCostsConfig.value : 0;
    
    const breakeven = selectedMarginItem.sellingPrice - (totalFreight + adjustedCPA + adminCost + otherCosts);
    
    return {
      realCPA: adjustedCPA,
      totalFreight,
      breakeven,
      selectedMargin: selectedMarginItem
    };
  };
  
  const calculatedValues = getCalculatedValues();
  
  return {
    productName,
    setProductName,
    productCost,
    setProductCost,
    showAdditionalCosts,
    setShowAdditionalCosts,
    configs,
    margins,
    selectedMargin,
    customMargin,
    useCustomMargin,
    profitMargins,
    totalCost,
    chartData,
    calculatedValues,
    handleConfigChange,
    handleCustomMarginChange,
    handleMarginSelect,
    formatCurrency
  };
};
