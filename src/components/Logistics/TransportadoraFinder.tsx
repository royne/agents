import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { carrierDatabaseService, UserCarrier, BaseCarrier } from '../../services/database/carrierDatabaseService';
import { useAppContext } from '../../contexts/AppContext';

// Interfaz para el resultado de búsqueda
interface CarrierResult {
  id: string;
  name: string;
  city: string;
  state: string;
  // Indica si el resultado es de la tabla base_carriers
  isBaseCarrier?: boolean;
  // ID de la transportadora base si se encontró en base_carriers
  base_id?: string;
}

const TransportadoraFinder: React.FC = () => {
  const { authData } = useAppContext();
  // Siempre buscaremos por ciudad
  const searchType = 'city';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<CarrierResult | null>(null);

  // Obtener la función isAdmin del contexto
  const { isAdmin } = useAppContext();

  // Inicializar el servicio de base de datos
  useEffect(() => {
    if (authData?.isAuthenticated) {
      // Pasar el company_id completo como está en el contexto
      carrierDatabaseService.setUserAndCompany(null, authData.company_id || null, isAdmin());
    }
  }, [authData, isAdmin]);



  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primero buscamos en las transportadoras del usuario por ciudad
      const userResults = await carrierDatabaseService.searchUserCarriers('city', searchTerm);
      
      // Si encontramos resultados del usuario, los usamos
      if (userResults.length > 0) {
        const userCarrier = userResults[0];
        setSearchResult({
          id: userCarrier.id || '',
          name: userCarrier.name,
          city: userCarrier.city,
          state: userCarrier.state,
          isBaseCarrier: false,
          base_id: userCarrier.base_id
        });
        setLoading(false);
        return;
      }
      
      // Si no hay resultados del usuario, buscamos en las transportadoras base por ciudad
      const baseResults = await carrierDatabaseService.searchBaseCarriers('city', searchTerm);
      
      if (baseResults.length > 0) {
        const baseCarrier = baseResults[0];
        setSearchResult({
          id: baseCarrier.id || '',
          name: baseCarrier.name,
          city: baseCarrier.city,
          state: baseCarrier.state,
          isBaseCarrier: true,
          base_id: baseCarrier.id
        });
      } else {
        setError(`No se encontró ninguna transportadora para la ciudad "${searchTerm}"`);
      }
    } catch (err) {
      setError('Error al buscar transportadoras: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { name: string; city: string; state: string }) => {
    try {
      setLoading(true);
      
      // Si tenemos un ID, actualizamos la transportadora existente
      if (searchResult?.id) {
        let updateData: any = {
          name: data.name,
          city: data.city,
          state: data.state
        };
        
        // Si el resultado es de la tabla base_carriers, necesitamos asignar el base_id
        if (searchResult.isBaseCarrier && searchResult.base_id) {
          updateData.base_id = searchResult.base_id;
        }
        
        const updatedCarrier = await carrierDatabaseService.updateUserCarrier(searchResult.id, updateData);
        
        if (updatedCarrier) {
          setSearchResult({
            id: updatedCarrier.id || '',
            name: updatedCarrier.name,
            city: updatedCarrier.city,
            state: updatedCarrier.state,
            isBaseCarrier: false,
            base_id: updatedCarrier.base_id
          });
          setError(null);
        } else {
          throw new Error('No se pudo actualizar la transportadora');
        }
      } else {
        // Si no tenemos ID, creamos una nueva transportadora
        let createData: any = {
          name: data.name,
          city: data.city,
          state: data.state
        };
        
        // Si tenemos un base_id (porque el resultado vino de base_carriers), lo usamos
        if (searchResult?.base_id) {
          createData.base_id = searchResult.base_id;
        }
        
        const newCarrier = await carrierDatabaseService.createUserCarrier(createData);
        
        if (newCarrier) {
          setSearchResult({
            id: newCarrier.id || '',
            name: newCarrier.name,
            city: newCarrier.city,
            state: newCarrier.state,
            isBaseCarrier: false,
            base_id: newCarrier.base_id
          });
          setError(null);
        } else {
          throw new Error('No se pudo crear la transportadora');
        }
      }
    } catch (err) {
      setError('Error al guardar la transportadora: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Buscador de Transportadoras</h2>
      
      <SearchForm 
        onSearch={handleSearch} 
      />
      
      {(loading || error || searchResult) && (
        <div className="mt-6">
          <SearchResults 
            result={searchResult}
            loading={loading}
            error={error}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
};

export default TransportadoraFinder;
