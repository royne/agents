import React from 'react';
import { FaCrown, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';

interface MembershipCardProps {
  status?: 'active' | 'inactive' | 'trial';
  planName?: string;
  expirationDate?: string;
  balance?: number;
  isUnlimited?: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  status = 'active',
  planName = 'Free',
  expirationDate,
  balance = 0,
  isUnlimited = false
}) => {
  // Mapeo estético de nombres de planes (si vienen como keys)
  const getDisplayPlanName = (name: string) => {
    const names: Record<string, string> = {
      'free': 'Gratuito',
      'starter': 'Starter',
      'pro': 'Professional',
      'business': 'Business',
      'tester': 'Tester'
    };
    return names[name.toLowerCase()] || name;
  };

  // Determinar colores y texto según el estado
  const getStatusConfig = () => {
    if (isUnlimited) {
      return {
        badgeClass: 'bg-purple-600/20 text-purple-400',
        statusText: 'Acceso Ilimitado',
        statusIcon: <FaCrown className="mr-2" />,
        textColor: 'text-theme-primary'
      };
    }

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
    <div className="rounded-2xl border border-theme-border bg-theme-component shadow-xl overflow-hidden relative group">
      {/* Efecto de brillo de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-color/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.badgeClass} mb-4 shadow-sm`}>
              {config.statusIcon}
              <span>{config.statusText}</span>
            </div>

            <h3 className={`text-3xl font-black mb-2 tracking-tight ${config.textColor}`}>
              Plan <span className="text-primary-color">{getDisplayPlanName(planName)}</span>
            </h3>

            <div className="mt-6 flex items-end gap-3">
              <div className="bg-theme-component-hover border border-theme-border p-3 rounded-xl shadow-inner">
                <span className="text-theme-tertiary text-[10px] block uppercase font-bold mb-1">Saldo Disponible</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-theme-primary">
                    {isUnlimited ? '∞' : balance.toLocaleString()}
                  </span>
                  <span className="text-xl">🪙</span>
                </div>
              </div>
            </div>

            {expirationDate && (
              <div className="mt-6 flex items-center text-xs text-theme-secondary font-medium">
                <FaCalendarAlt className="mr-2 opacity-50" />
                <span>Válido hasta: {expirationDate}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-color/20 to-primary-color/5 border border-primary-color/20 shadow-lg shadow-primary-color/5">
            <FaCrown className={`${isUnlimited ? 'text-purple-400' : 'text-yellow-400'} text-3xl drop-shadow-glow`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
