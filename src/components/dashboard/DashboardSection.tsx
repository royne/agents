import React from 'react';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children }) => {
  return (
    <section className="mb-8 last:mb-0 w-full">
      <div className="dashboard-section-title justify-center !mb-6">
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  );
};

export default DashboardSection;
