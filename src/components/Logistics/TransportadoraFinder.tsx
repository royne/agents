import React, { useState } from 'react';
import SearchTypeToggle from './SearchTypeToggle';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

// Datos de ejemplo para simular la búsqueda
const mockData = [
  { id: '1', transportadora: 'Veloces', ciudad: 'Bogotá', departamento: 'Cundinamarca' },
  { id: '2', transportadora: 'Inter Rapidísimo', ciudad: 'Medellín', departamento: 'Antioquia' },
  { id: '3', transportadora: 'Coordinadora', ciudad: 'Cali', departamento: 'Valle del Cauca' },
  { id: '4', transportadora: 'TCC', ciudad: 'Barranquilla', departamento: 'Atlántico' }
];

const TransportadoraFinder: React.FC = () => {
  const [searchType, setSearchType] = useState<'ciudad' | 'departamento'>('ciudad');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Limpiar los resultados cuando cambie el tipo de búsqueda
  const handleSearchTypeChange = (type: 'ciudad' | 'departamento') => {
    setSearchType(type);
    setSearchResult(null);
    setError(null);
  };

  const handleSearch = (searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    // Simulamos una búsqueda con un pequeño retraso
    setTimeout(() => {
      const results = mockData.filter(item => {
        if (searchType === 'ciudad') {
          return item.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return item.departamento.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      
      if (results.length > 0) {
        setSearchResult(results[0]);
      } else {
        setError(`No se encontró ninguna transportadora para ${searchType === 'ciudad' ? 'la ciudad' : 'el departamento'} "${searchTerm}"`);
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleSave = (data: { transportadora: string; ciudad: string; departamento: string }) => {
    // Aquí iría la lógica para guardar en la base de datos
    console.log('Guardando datos:', data);
    
    // Simulamos una actualización exitosa
    setSearchResult({
      id: searchResult?.id || Date.now().toString(),
      ...data
    });
    
    alert('Información guardada correctamente');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Buscador de Transportadoras</h2>
      
      <SearchTypeToggle 
        searchType={searchType} 
        setSearchType={handleSearchTypeChange} 
      />
      
      <SearchForm 
        searchType={searchType} 
        onSearch={handleSearch} 
      />
      
      {(loading || error || searchResult) && (
        <div className="mt-6">
          <SearchResults 
            result={searchResult}
            loading={loading}
            error={error}
            searchType={searchType}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
};

export default TransportadoraFinder;
