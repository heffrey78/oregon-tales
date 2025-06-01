import { FC, ReactNode } from 'react';

interface AdminActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const AdminActionButton: FC<AdminActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button'
}) => {
  const baseClass = "flex items-center rounded font-semibold disabled:bg-gray-400";
  
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2",
    lg: "px-4 py-2 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
