import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleMapComponent from '../../components/maps/SimpleMapComponent';
import TransportadoraFinder from '../../components/Logistics/TransportadoraFinder';

// Definición de las transportadoras con sus propiedades
interface Transportadora {
  id: string;
  nombre: string;
  color: string;
  urlRastreo: string;
  logo?: string;
  bloqueaIframe?: boolean; // Indica si el sitio bloquea iframes
}

const transportadoras: Transportadora[] = [
  {
    id: 'veloces',
    nombre: 'Veloces',
    color: '#E94CAF',
    urlRastreo: 'https://tracking.veloces.app/',
  },
  {
    id: 'interrapidisimo',
    nombre: 'Inter Rapidísimo',
    color: '#032B44',
    urlRastreo: 'https://www.interrapidisimo.com/sigue-tu-envio/',
  },
  {
    id: 'coordinadora',
    nombre: 'Coordinadora',
    color: '#3366CC',
    urlRastreo: 'https://coordinadora.com/rastreo/rastreo-de-guia/',
    bloqueaIframe: true,
  },
  {
    id: 'tcc',
    nombre: 'TCC',
    color: '#FFC300',
    urlRastreo: 'https://tcc.com.co/courier/mensajeria/rastrear-envio/',
    bloqueaIframe: true,
  },
  {
    id: 'envia',
    nombre: 'Envía',
    color: '#C70039',
    urlRastreo: 'https://envia.co/',
    bloqueaIframe: true,
  },
];

export default function Logistics() {
  const [transportadoraActiva, setTransportadoraActiva] = useState<string | null>(null);
  const [notas, setNotas] = useState<string>('');
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [errorIframe, setErrorIframe] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Cambiar la transportadora activa y actualizar el iframe
  const seleccionarTransportadora = (id: string) => {
    const transportadora = transportadoras.find(t => t.id === id);
    
    if (transportadoraActiva === id) {
      // Si ya está seleccionada, la deseleccionamos
      setTransportadoraActiva(null);
      setIframeUrl('');
      setErrorIframe(false);
    } else {
      // Seleccionamos la nueva transportadora
      setTransportadoraActiva(id);
      if (transportadora) {
        setIframeUrl(transportadora.urlRastreo);
        setErrorIframe(!!transportadora.bloqueaIframe);
      }
    }
  };
  
  // Guardar las notas en localStorage cuando cambien
  useEffect(() => {
    if (notas) {
      localStorage.setItem('logisticaNotes', notas);
    }
  }, [notas]);
  
  // Cargar las notas desde localStorage al iniciar
  useEffect(() => {
    const notasGuardadas = localStorage.getItem('logisticaNotes');
    if (notasGuardadas) {
      setNotas(notasGuardadas);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Logística</h1>
        
        {/* Componentes de mapa y notas */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Mapa */}
          <div className="w-full md:w-1/2 bg-gray-800 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Buscar Ubicación</h2>
            <SimpleMapComponent className="w-full" />
          </div>
          
          {/* Panel para notas */}
          <div className="w-full md:w-1/2 bg-gray-800 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Notas de Seguimiento</h2>
            <textarea
              className="w-full h-[300px] bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Escribe aquí tus notas sobre los envíos..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel izquierdo con tarjetas y iframe */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Tarjetas de transportadoras */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {transportadoras.map((transportadora) => (
                <button
                  key={transportadora.id}
                  onClick={() => seleccionarTransportadora(transportadora.id)}
                  className={`
                    relative rounded-xl p-4 transition-all duration-300 transform hover:scale-105
                    ${transportadoraActiva === transportadora.id 
                      ? 'ring-2 ring-white shadow-lg scale-105' 
                      : 'opacity-80 hover:opacity-100'}
                  `}
                  style={{ 
                    backgroundColor: transportadora.color,
                    boxShadow: transportadoraActiva === transportadora.id ? `0 0 15px ${transportadora.color}` : 'none'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-24">
                    {transportadora.logo ? (
                      <img 
                        src={transportadora.logo} 
                        alt={transportadora.nombre} 
                        className="w-12 h-12 object-contain mb-2" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-2">
                        <span className="text-xl font-bold text-white">
                          {transportadora.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-white font-medium text-center text-sm">
                      {transportadora.nombre}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Panel desplegable con iframe */}
            <div 
              className={`
                bg-gray-800 rounded-xl overflow-hidden transition-all duration-500 ease-in-out
                ${transportadoraActiva ? 'h-[500px] opacity-100' : 'h-0 opacity-0'}
              `}
            >
              {transportadoraActiva && !errorIframe && (
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title={`Rastreo ${transportadoras.find(t => t.id === transportadoraActiva)?.nombre || ''}`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                />
              )}
              
              {transportadoraActiva && errorIframe && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="bg-yellow-600 bg-opacity-20 p-4 rounded-xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Esta página no permite ser mostrada en un iframe</h3>
                    <p className="text-gray-300 mb-4">Por razones de seguridad, el sitio web de {transportadoras.find(t => t.id === transportadoraActiva)?.nombre} no permite ser embebido en nuestra aplicación.</p>
                    <a 
                      href={iframeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Abrir sitio en una nueva pestaña
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Panel derecho para buscador de transportadoras */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-gray-800 rounded-xl p-4 h-full">
              <TransportadoraFinder />
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
