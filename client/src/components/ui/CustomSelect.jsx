import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = 'Seleziona...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Helper to get label/color from option
  const getOptionLabel = (option) => (option && typeof option === 'object') ? option.label : option;
  const getOptionValue = (option) => (option && typeof option === 'object') ? option.value : option;
  const getOptionColor = (option) => (option && typeof option === 'object') ? option.color : null;

  const selectedOption = options.find(opt => getOptionValue(opt) === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white dark:bg-slate-800"
      >
        <span className="truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {getOptionColor(selectedOption) && (
                <span className={`w-2 h-2 rounded-full ${getOptionColor(selectedOption)}`}></span>
              )}
              {getOptionLabel(selectedOption)}
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
          <div className="p-1">
            {options.map((option) => {
              const optValue = getOptionValue(option);
              const isSelected = value === optValue;
              const color = getOptionColor(option);

              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => handleSelect(optValue)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  {color && <span className={`w-2 h-2 rounded-full ${color}`}></span>}
                  <span>{getOptionLabel(option)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
