import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Country, COUNTRIES, getCountryByName } from '../constants/countries';

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
  const { authData } = useAppContext();
  
  // País seleccionado (inicializar con el del usuario o Colombia por defecto)
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (authData?.country) {
      return getCountryByName(authData.country);
    }
    return COUNTRIES[0]; // Colombia por defecto
  });

  // Configuraciones predeterminadas
  const [productName, setProductName] = useState<string>('');
  const [productCost, setProductCost] = useState<number>(0);
  const [showAdditionalCosts, setShowAdditionalCosts] = useState<boolean>(false);
  
  // Inicializar configs con los valores del país seleccionado
  const [configs, setConfigs] = useState<PriceConfig[]>([
    { name: 'Inefectividad', value: 25 },
    { name: 'Flete', value: 20000 },
    { name: 'CPA base', value: 15000 },
    { name: 'Costo Administrativo', value: 0 },
    { name: 'Otros Gastos', value: 0 },
  ]);

  // Actualizar configs cuando cambia el país
  useEffect(() => {
    setConfigs(prev => prev.map(config => {
      if (config.name === 'Flete') return { ...config, value: selectedCountry.defaultFreight };
      if (config.name === 'CPA base') return { ...config, value: selectedCountry.defaultCPABase };
      return config;
    }));
  }, [selectedCountry]);
  
  // Márgenes de rentabilidad a calcular
  const [margins, setMargins] = useState<number[]>([10, 15, 20]);
  const [selectedMargin, setSelectedMargin] = useState<number>(20);
  const [customMargin, setCustomMargin] = useState<number>(0);
  const [useCustomMargin, setUseCustomMargin] = useState<boolean>(false);
  
  // Resultados calculados
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
    const cpaBase = cpaBaseConfig ? cpaBaseConfig.value : selectedCountry.defaultCPABase;
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
      // Redondeamos según la moneda
      let landingPrice = adjustedSellingPrice;
      if (selectedCountry.currency === 'COP' || selectedCountry.currency === 'CLP') {
        landingPrice = Math.ceil(adjustedSellingPrice / 100) * 100;
      } else {
        landingPrice = Math.ceil(adjustedSellingPrice);
      }
      
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
    if (selectedMarginItem) {
      // Calcular el CPA real (23% del precio de venta)
      const realCPA = selectedMarginItem.sellingPrice * 0.23;
      // Asegurarse de que el CPA no sea menor que el CPA base
      const adjustedCPA = Math.max(cpaBase, realCPA);
      
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
  }, [productCost, configs, margins, selectedMargin, customMargin, useCustomMargin, selectedCountry]);
  
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

  // Manejar cambio de país
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };
  
  // Formatear números como moneda
  const formatCurrency = (value: number) => {
    // Si es una moneda como COP o CLP, evitamos decimales
    const isNoDecimalCurrency = ['COP', 'CLP', 'ARS'].includes(selectedCountry.currency);
    
    return `${selectedCountry.symbol} ${value.toLocaleString(selectedCountry.locale, { 
      minimumFractionDigits: isNoDecimalCurrency ? 0 : 2, 
      maximumFractionDigits: isNoDecimalCurrency ? 0 : 2 
    })}`;
  };
  
  // Calcular valores adicionales para el resumen
  const getCalculatedValues = () => {
    if (!productCost || productCost <= 1 || profitMargins.length === 0) {
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
        breakeven: 0,
        selectedMargin: null
      };
    }

    // Obtener los valores de configuración
    const ineffectivityConfig = configs.find(c => c.name === 'Inefectividad');
    const freightConfig = configs.find(c => c.name === 'Flete');
    const cpaBaseConfig = configs.find(c => c.name === 'CPA base');
    
    // Valores por defecto si no se encuentran las configuraciones
    const ineffectivityPercentage = ineffectivityConfig ? ineffectivityConfig.value : 0;
    const baseFreight = freightConfig ? freightConfig.value : 0;
    const cpaBase = cpaBaseConfig ? cpaBaseConfig.value : selectedCountry.defaultCPABase;
    
    // Calcular flete total con inefectividad
    const ineffectivityFactor = ineffectivityPercentage / 100;
    const totalFreight = baseFreight / (1 - ineffectivityFactor);
    
    // Calcular CPA real (23% del precio de venta)
    const realCPA = selectedMarginItem.sellingPrice * 0.23;
    // Asegurarse de que el CPA no sea menor que el CPA base
    const adjustedCPA = Math.max(cpaBase, realCPA);
    
    // Calcular breakeven
    const adminCostConfig = configs.find(c => c.name === 'Costo Administrativo');
    const otherCostsConfig = configs.find(c => c.name === 'Otros Gastos');
    const adminCost = adminCostConfig ? adminCostConfig.value : 0;
    const otherCosts = otherCostsConfig ? otherCostsConfig.value : 0;
    
    const breakeven = selectedMarginItem.sellingPrice - (totalFreight + adjustedCPA + adminCost + otherCosts);
    
    return {
      realCPA: adjustedCPA,
      totalFreight,
      breakeven,
      selectedMargin: selectedMarginItem,
      totalFreightBase: baseFreight
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
    formatCurrency,
    selectedCountry,
    handleCountryChange
  };
};
