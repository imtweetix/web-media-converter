import { faChevronDown } from '@awesome.me/kit-26a4d59a75/icons/classic/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  className = '',
}: SelectProps) => {
  // Find the currently selected option
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <div className={className}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label}
        </label>
      )}
      <Menu as='div' className='relative'>
        <MenuButton className='inline-flex w-full justify-between items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
          <span className='flex-1 text-left'>{displayText}</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className='h-3 w-3 text-gray-400'
            aria-hidden='true'
          />
        </MenuButton>

        <MenuItems
          transition
          className='absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in'
        >
          <div className='py-1 max-h-60 overflow-auto'>
            {options.map(option => (
              <MenuItem key={option.value}>
                {({ focus }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      focus ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
                    } ${
                      option.value === value ? 'font-semibold' : 'font-normal'
                    } block w-full text-left px-4 py-2 text-sm`}
                  >
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
};

Select.displayName = 'Select';
