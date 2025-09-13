import React from 'react';

interface LanguageSelectorProps {
  label?: string;
  value?: string;
  selectedLanguage?: string;
  onChange?: (value: string) => void;
  onLanguageChange?: (value: string) => void;
  placeholder?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  value,
  selectedLanguage,
  onChange,
  onLanguageChange,
  placeholder
}) => {
  const currentValue = value || selectedLanguage || '';
  const handleChange = onChange || onLanguageChange || (() => {});

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <select
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder || 'Select language'}</option>
        <option value="French">French</option>
        <option value="English">English</option>
        <option value="LSF">LSF</option>
        <option value="Spanish">Spanish</option>
        <option value="German">German</option>
      </select>
    </div>
  );
};