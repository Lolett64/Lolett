'use client';

import Image from 'next/image';
import { ContentImageUpload } from '@/components/admin/ContentImageUpload';
import { ContentVideoUpload } from '@/components/admin/ContentVideoUpload';

interface FieldWithScreenshotProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea' | 'url' | 'image' | 'video';
  screenshotSrc?: string;
  placeholder?: string;
}

export function FieldWithScreenshot({
  label,
  name,
  value,
  onChange,
  type = 'text',
  screenshotSrc,
  placeholder,
}: FieldWithScreenshotProps) {
  const inputClasses =
    'w-full rounded-lg bg-[#faf7f2] border border-[#e8e0d6] px-3 py-2.5 text-sm text-[#2c2420] focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] outline-none transition-colors';

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClasses}
            style={{ minHeight: 100 }}
          />
        );
      case 'url':
        return (
          <input
            type="url"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputClasses} text-[#888]`}
          />
        );
      case 'image':
        return (
          <ContentImageUpload
            value={value}
            onChange={onChange}
            label={label}
          />
        );
      case 'video':
        return (
          <ContentVideoUpload
            value={value}
            onChange={onChange}
            label={label}
          />
        );
      default:
        return (
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {type !== 'image' && type !== 'video' && (
          <label className="block text-sm font-medium text-[#2c2420] mb-1.5">
            {label}
          </label>
        )}
        {renderField()}
      </div>

      {screenshotSrc && (
        <div className="w-[90px] flex-shrink-0">
          <Image
            src={screenshotSrc}
            alt={`Emplacement : ${label}`}
            width={90}
            height={60}
            className="rounded-lg border border-[#e8e0d6] object-cover"
          />
        </div>
      )}
    </div>
  );
}
