import { ChangeEvent, forwardRef } from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'range' | 'file';
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
  className?: string;
  accept?: string;
  multiple?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      value,
      onChange,
      placeholder,
      min,
      max,
      disabled = false,
      className = '',
      accept,
      multiple,
    },
    ref
  ) => {
    const baseClasses =
      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

    const typeClasses = {
      text: 'w-full px-3 py-2 border border-gray-300 rounded-md',
      number: 'w-full px-3 py-2 border border-gray-300 rounded-md',
      range: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
      file: 'hidden',
    };

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className={`${baseClasses} ${typeClasses[type]} ${className}`}
      />
    );
  }
);

Input.displayName = 'Input';
