import React from 'react';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';

interface ModuleCardProps {
  name: string;
  description: string;
  icon: any;
  path: string;
  gradientClass?: string;
  buttonText: string;
  buttonClass?: string;
  disabled?: boolean;
  badge?: string;
  imageNode?: React.ReactNode;
  isLarge?: boolean;
  containerId?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  name,
  description,
  icon: Icon,
  path,
  gradientClass = '',
  buttonText,
  buttonClass = 'btn-premium-blue',
  disabled = false,
  badge,
  imageNode,
  isLarge = false,
  containerId
}) => {
  const CardContent = (
    <div id={containerId} className={`premium-card h-full ${isLarge ? 'p-5' : 'p-3.5'} flex flex-col justify-between ${gradientClass} ${disabled ? 'disabled' : ''}`}>
      {disabled && (
        <div className="premium-card-disabled-overlay rounded-2xl">
          <FaLock className={`${isLarge ? 'w-12 h-12' : 'w-8 h-8'} text-white/40`} />
        </div>
      )}

      <div className="relative z-10 w-full flex flex-col items-start">
        <div className={`flex items-center ${isLarge ? 'gap-3 mb-2' : 'gap-2.5 mb-1.5'} w-full`}>
          {Icon && !imageNode && (
            <div className={`${isLarge ? 'p-2 rounded-xl' : 'p-1.5 rounded-lg'} bg-white/5 border border-white/10 shadow-lg shrink-0 group-hover:bg-white/10 transition-all`}>
              <Icon className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} text-white/90`} />
            </div>
          )}
          {imageNode && (
            <div className={`shrink-0 ${isLarge ? 'w-14 h-11' : 'w-11 h-8'} relative`}>
              {imageNode}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            {badge && (
              <span className={`inline-flex ${isLarge ? 'px-1.5 py-0.5 text-[8px]' : 'px-1 py-0.5 text-[7px]'} rounded-full bg-white/10 border border-white/10 font-black uppercase tracking-widest text-white/80 mb-0.5 w-fit`}>
                {badge}
              </span>
            )}
            <h2 className={`${isLarge ? 'text-base' : 'text-[13px]'} font-black text-white leading-tight tracking-tight truncate`}>
              {name}
            </h2>
          </div>
        </div>

        <p className={`text-gray-400 ${isLarge ? 'text-[11px] mb-3' : 'text-[10px] mb-2 line-clamp-1'} font-medium leading-relaxed`}>
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-auto w-full">
        <div className={`btn-premium ${disabled ? 'btn-premium-gray' : buttonClass} w-full ${isLarge ? 'py-2 text-[9px]' : 'py-1.5 text-[8px]'} font-bold tracking-wider uppercase`}>
          {buttonText}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return <div className="group h-full">{CardContent}</div>;
  }

  return (
    <Link href={path} className="group h-full block">
      {CardContent}
    </Link>
  );
};

export default ModuleCard;
