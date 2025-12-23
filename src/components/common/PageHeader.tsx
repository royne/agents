import React, { ReactNode } from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: ReactNode;
  description: string;
  backLink?: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backLink,
  actions
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
      <div className="relative">
        <h1 className="text-3xl font-bold mb-2 border-l-4 border-primary-color pl-4 tracking-tight text-theme-primary">{title}</h1>
        <p className="text-theme-secondary text-sm md:text-base opacity-80">
          {description}
        </p>
      </div>
      <div className="flex gap-3">
        {backLink && (
          <Link href={backLink}>
            <button className="px-5 py-2.5 bg-theme-component border border-white/10 rounded-xl text-theme-primary hover:border-primary-color/50 transition-all flex items-center btn-modern text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          </Link>
        )}
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
