import { ConversionStatus } from '../../types';

interface StatusBadgeProps {
  status: ConversionStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          classes: 'bg-yellow-100 text-yellow-800',
          text: 'Ready to convert',
        };
      case 'converting':
        return {
          classes: 'bg-blue-100 text-blue-800',
          text: 'Converting...',
        };
      case 'converted':
        return {
          classes: 'bg-green-100 text-green-800',
          text: 'Converted',
        };
      case 'error':
        return {
          classes: 'bg-red-100 text-red-800',
          text: 'Conversion failed',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {config.text}
    </span>
  );
}