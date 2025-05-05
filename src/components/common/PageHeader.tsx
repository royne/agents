import React, { ReactNode } from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
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
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">{title}</h1>
        <p className="text-theme-secondary">
          {description}
        </p>
      </div>
      <div className="flex space-x-2">
        {backLink && (
          <Link href={backLink}>
            <button className="px-4 py-2 bg-theme-component rounded-lg shadow-sm text-theme-primary hover:bg-theme-component-hover hover:shadow-md transition-all flex items-center">
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
