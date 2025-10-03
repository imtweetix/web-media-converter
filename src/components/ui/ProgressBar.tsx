interface ProgressBarProps {
  progress: number;
  status: 'converting' | 'converted' | 'error';
  className?: string;
}

export function ProgressBar({ progress, status, className = '' }: ProgressBarProps) {
  const getColorClass = () => {
    switch (status) {
      case 'converted':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-indigo-500';
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Conversion Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}