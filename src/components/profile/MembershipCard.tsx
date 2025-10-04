import React from 'react';
import { FaCrown, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';

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
          badgeClass: 'bg-green-600/20 text-green-400',
          statusText: 'Membresía activa',
          statusIcon: <FaCheckCircle className="mr-2" />,
          textColor: 'text-theme-primary'
        };
      case 'trial':
        return {
          badgeClass: 'bg-blue-600/20 text-blue-400',
          statusText: 'Período de prueba',
          statusIcon: <FaCalendarAlt className="mr-2" />,
          textColor: 'text-theme-primary'
        };
      case 'inactive':
        return {
          badgeClass: 'bg-gray-600/20 text-gray-400',
          statusText: 'Membresía inactiva',
          statusIcon: <FaCalendarAlt className="mr-2" />,
          textColor: 'text-theme-primary'
        };
      default:
        return {
          badgeClass: 'bg-green-600/20 text-green-400',
          statusText: 'Membresía activa',
          statusIcon: <FaCheckCircle className="mr-2" />,
          textColor: 'text-theme-primary'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="rounded-lg border border-theme-border bg-theme-component shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.badgeClass} mb-2`}>
              {config.statusIcon}
              <span className="font-medium">{config.statusText}</span>
            </div>
            <h3 className={`text-xl font-semibold mb-1 ${config.textColor}`}>Plan {planName}</h3>
            {expirationDate && (
              <div className="flex items-center text-sm text-theme-secondary">
                <FaCalendarAlt className="mr-1" />
                <span>Válido hasta: {expirationDate}</span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-md bg-theme-component-hover">
            <FaCrown className="text-yellow-400 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
