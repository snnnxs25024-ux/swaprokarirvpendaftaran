import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  description?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, icon, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        {icon && <div className="text-brand-600">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};