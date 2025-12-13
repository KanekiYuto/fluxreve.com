'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type Mode = 'text-to-image' | 'image-to-image';

interface ModeSwitcherProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  const tForm = useTranslations('ai-generator.form');

  return (
    <div className="flex gap-1 p-1 bg-[#161618] border border-[#27272A] rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange('text-to-image')}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
          mode === 'text-to-image'
            ? 'bg-primary text-white shadow-sm'
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
        }`}
      >
        {tForm('mode.textToImage')}
      </button>
      <button
        type="button"
        onClick={() => onModeChange('image-to-image')}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
          mode === 'image-to-image'
            ? 'bg-primary text-white shadow-sm'
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
        }`}
      >
        {tForm('mode.imageToImage')}
      </button>
    </div>
  );
}
