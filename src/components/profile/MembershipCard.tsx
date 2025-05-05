import React from 'react';
import { FaCrown, FaCheckCircle, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

interface MembershipCardProps {
  status?: 'active' | 'inactive' | 'trial';
  planName?: string;
  expirationDate?: string;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  status = 'active',
  planName = 'Premium',
  expirationDate = '31/12/2025'
}) => {
  // Determinar colores y texto según el estado
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          statusText: 'Membresía Activa',
          statusIcon: <FaCheckCircle className="text-white mr-2" />,
          textColor: 'text-white'
        };
      case 'trial':
        return {
          bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          statusText: 'Período de Prueba',
          statusIcon: <FaCalendarAlt className="text-white mr-2" />,
          textColor: 'text-white'
        };
      case 'inactive':
        return {
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          statusText: 'Membresía Inactiva',
          statusIcon: <FaCalendarAlt className="text-white mr-2" />,
          textColor: 'text-white'
        };
      default:
        return {
          bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          statusText: 'Membresía Activa',
          statusIcon: <FaCheckCircle className="text-white mr-2" />,
          textColor: 'text-white'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${config.bgColor}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              {config.statusIcon}
              <span className={`font-semibold ${config.textColor}`}>{config.statusText}</span>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${config.textColor}`}>
              Plan {planName}
            </h3>
            <div className="flex items-center text-sm opacity-80 text-white">
              <FaCalendarAlt className="mr-1" />
              <span>Válido hasta: {expirationDate}</span>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <FaCrown className="text-yellow-300 text-2xl" />
          </div>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-10 p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-white">
            <span className="opacity-80">Acceso completo a todas las funciones</span>
          </div>
          <button className="bg-white text-primary-color hover:bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all">
            Administrar <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
