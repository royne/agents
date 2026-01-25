import React from 'react';
import { FaRocket, FaCalendarAlt, FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import { Launch } from '../../../services/launches/types';
import Link from 'next/link';

interface LaunchCardProps {
  launch: Launch;
}

const LaunchCard: React.FC<LaunchCardProps> = ({ launch }) => {
  const statusColors = {
    draft: 'bg-white/10 text-white/60',
    active: 'bg-primary-color/20 text-primary-color',
    completed: 'bg-green-500/20 text-green-500',
    archived: 'bg-red-500/20 text-red-500'
  };

  const formattedDate = new Date(launch.updated_at || launch.created_at || '').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="group relative bg-white/[0.03] border border-white/5 rounded-[24px] overflow-hidden hover:border-primary-color/30 transition-all duration-500 backdrop-blur-3xl flex flex-col h-full shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-color/5 blur-[60px] rounded-full group-hover:bg-primary-color/10 transition-colors duration-700"></div>

      {/* Card Header/Media */}
      <div className="aspect-[21/9] w-full bg-black/40 relative overflow-hidden">
        {launch.thumbnail_url ? (
          <img
            src={launch.thumbnail_url}
            alt={launch.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <FaBoxOpen className="text-2xl" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${statusColors[launch.status as keyof typeof statusColors] || statusColors.draft}`}>
            {launch.status}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 relative z-10">
        <div className="mb-2">
          <h3 className="text-sm font-black text-white uppercase tracking-tighter line-clamp-1 mb-0.5 group-hover:text-primary-color transition-colors">
            {launch.name}
          </h3>
          <div className="flex items-center gap-2 text-[7px] text-white/30 font-bold uppercase tracking-widest">
            <FaCalendarAlt className="text-primary-color/40" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <p className="text-[10px] text-white/40 line-clamp-2 leading-tight mb-4 font-medium italic">
          {launch.creative_strategy?.package?.name ? launch.creative_strategy.package.name : 'Análisis completado.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex -space-x-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-[#12141a] bg-white/5 overflow-hidden">
                <div className="w-full h-full bg-primary-color/10 flex items-center justify-center text-[5px] font-black text-primary-color">AI</div>
              </div>
            ))}
          </div>

          <Link href={`/launches/${launch.id}`} className="group/btn flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-primary-color/40 rounded-lg transition-all">
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Abrir</span>
            <FaChevronRight className="text-[6px] text-primary-color group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LaunchCard;
