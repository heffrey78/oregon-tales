import { FC, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
  helpText?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  htmlFor,
  className = '',
  children,
  helpText
}) => {
  const labelClass = "block text-sm font-medium text-gray-700";
  
  return (
    <div className={`${className}`}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
