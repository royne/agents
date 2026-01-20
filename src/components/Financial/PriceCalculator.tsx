import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import ProductInputSection from './PriceCalculatorComponents/ProductInputSection';
import MarginsSection from './PriceCalculatorComponents/MarginsSection';
import SummarySection from './PriceCalculatorComponents/SummarySection';
import ChartSection from './PriceCalculatorComponents/ChartSection';
import ProjectionSection from './PriceCalculatorComponents/ProjectionSection';
import CountrySelector from './PriceCalculatorComponents/CountrySelector';

const PriceCalculator = () => {
  const {
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
  } = usePriceCalculator();

  return (
    <div className="w-full">
      {/* Selector de País */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
        />
      </div>

      {/* Sección de entrada de datos */}
      <ProductInputSection
        productName={productName}
        setProductName={setProductName}
        productCost={productCost}
        setProductCost={setProductCost}
        showAdditionalCosts={showAdditionalCosts}
        setShowAdditionalCosts={setShowAdditionalCosts}
        configs={configs}
        handleConfigChange={handleConfigChange}
        currencySymbol={selectedCountry.symbol}
      />

      {/* Sección de márgenes de rentabilidad */}
      <MarginsSection
        margins={margins}
        selectedMargin={selectedMargin}
        customMargin={customMargin}
        useCustomMargin={useCustomMargin}
        profitMargins={profitMargins}
        handleMarginSelect={handleMarginSelect}
        handleCustomMarginChange={handleCustomMarginChange}
        formatCurrency={formatCurrency}
      />

      {/* Resumen y gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen */}
        <SummarySection
          productCost={productCost}
          configs={configs}
          totalCost={totalCost}
          profitMargins={profitMargins}
          selectedMargin={selectedMargin}
          customMargin={customMargin}
          useCustomMargin={useCustomMargin}
          calculatedValues={calculatedValues}
          formatCurrency={formatCurrency}
        />

        {/* Gráfico */}
        <ChartSection
          chartData={chartData}
          totalCost={totalCost}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Sección de proyección */}
      {productCost > 0 && (
        <ProjectionSection
          productName={productName}
          productCost={productCost}
          sellingPrice={calculatedValues.selectedMargin?.sellingPrice || 0}
          landingPrice={calculatedValues.selectedMargin?.landingPrice || 0}
          totalCost={totalCost}
          profit={calculatedValues.selectedMargin?.profit || 0}
          formatCurrency={formatCurrency}
          totalFreight={calculatedValues.totalFreight || 0}
          realCPA={calculatedValues.realCPA || 0}
          configs={configs}
          currencySymbol={selectedCountry.symbol}
        />
      )}
    </div>
  );
};

export default PriceCalculator;
