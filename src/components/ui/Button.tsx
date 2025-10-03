import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: IconDefinition;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  icon,
  loading = false,
  className = '',
}: ButtonProps) {
  const baseClasses =
    'px-6 py-2 rounded-lg transition-colors flex items-center';

  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className={`h-4 w-4 ${children ? 'mr-2' : ''} ${loading ? 'animate-spin' : ''}`}
        />
      )}
      {children}
    </button>
  );
}
