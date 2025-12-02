import React, { ReactNode } from 'react';

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
}

interface InputProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {}
interface TextAreaProps extends BaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
interface SelectProps extends BaseProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
}

export const InputField: React.FC<InputProps> = ({ label, error, required, className = '', ...props }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-500 
        ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}
      `}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const TextAreaField: React.FC<TextAreaProps> = ({ label, error, required, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      {...props}
      className={`w-full px-4 py-2 border rounded-lg transition-colors min-h-[100px]
        ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}
      `}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const SelectField: React.FC<SelectProps> = ({ label, options, error, required, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-2 border rounded-lg transition-colors bg-white
         ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}
      `}
    >
      <option value="">-- Pilih --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  subLabel?: string;
  error?: string; // Add error prop support
}

export const CheckboxField: React.FC<CheckboxProps> = ({ label, checked, onChange, subLabel, error }) => (
  <div className="mb-2">
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checked ? 'border-brand-500 bg-brand-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${checked ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'}`}>
          {checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className={`text-sm font-medium ${checked ? 'text-brand-900' : 'text-gray-700'}`}>
          {label}
        </span>
        {subLabel && <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>}
      </div>
    </label>
    {error && <p className="text-red-500 text-xs px-1">{error}</p>}
  </div>
);

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  currentFile: File | null;
  required?: boolean;
  error?: string;
  maxSizeMB?: number; // New Prop for Max Size
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, currentFile, required, error, maxSizeMB = 2 }) => {
  const [internalError, setInternalError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validation: Check Size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setInternalError(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`);
        onChange(null); // Reset
        return;
      }
      
      onChange(file);
    }
  };

  const displayError = error || internalError;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${displayError 
            ? 'border-red-300 bg-red-50 hover:bg-red-100' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className={`w-8 h-8 mb-3 ${displayError ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span></p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG atau PDF (Max {maxSizeMB}MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={accept} 
            onChange={handleFileChange} 
          />
        </label>
      </div>
      
      {currentFile && !displayError && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100 animate-fadeIn">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate max-w-xs">{currentFile.name}</span>
          <span className="text-xs text-gray-400">({(currentFile.size / 1024 / 1024).toFixed(2)} MB)</span>
          <button 
            onClick={() => onChange(null)} 
            type="button"
            className="ml-auto text-gray-400 hover:text-red-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {displayError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {displayError}
      </p>}
    </div>
  );
};