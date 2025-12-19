'use client';

import { useTranslations } from 'next-intl';

interface ExampleImage {
  id: number;
  before: string;
  after: string;
  alt: string;
}

interface ExampleSelectorProps {
  examples: ExampleImage[];
  onExampleClick: (before: string, after: string) => void;
}

export default function ExampleSelector({ examples, onExampleClick }: ExampleSelectorProps) {
  const t = useTranslations('case-generator');

  return (
    <div>
      <p className="text-sm text-text-muted mb-3">{t('examplesTitle')}</p>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => onExampleClick(example.before, example.after)}
            className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary transition-all bg-surface-secondary/50 flex-shrink-0 group cursor-pointer"
          >
            <img
              src={example.after}
              alt={example.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
