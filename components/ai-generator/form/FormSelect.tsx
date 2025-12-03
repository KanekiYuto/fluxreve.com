'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function FormSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  id,
}: FormSelectProps) {
  const t = useTranslations('ai-generator.form');
  const displayPlaceholder = placeholder ?? t('selectPlaceholder');
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={displayPlaceholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#161618] text-white">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-[#27272A] focus:bg-[#27272A] data-[state=checked]:text-primary"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
