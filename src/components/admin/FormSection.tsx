import { FC, ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection: FC<FormSectionProps> = ({ title, children }) => (
  <div className="border-t pt-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {children}
    </div>
  </div>
);
