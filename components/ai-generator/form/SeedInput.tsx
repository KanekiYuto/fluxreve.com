'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SeedInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function SeedInput({
  value,
  onChange,
  label = '随机种子',
  placeholder = '留空随机生成',
  id = 'seed',
}: SeedInputProps) {
  // 生成随机种子
  const handleRandomSeed = () => {
    onChange(Math.floor(Math.random() * 1000000).toString());
  };

  // 处理输入，只允许数字
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字
    if (value === '' || /^\d+$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={handleRandomSeed}
          className="flex items-center justify-center w-10 h-10 rounded-md gradient-border bg-transparent transition-colors cursor-pointer"
          aria-label="生成随机种子"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
