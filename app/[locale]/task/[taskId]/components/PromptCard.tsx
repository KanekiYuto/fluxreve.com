'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PromptCardProps {
  prompt: string;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const t = useTranslations('task.details');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (copied) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div className="col-span-2 bg-surface-secondary rounded-xl p-3 border border-border/50">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs text-text-muted uppercase tracking-wide">{t('prompt')}</div>
        <TooltipProvider>
          <Tooltip open={copied}>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="p-1 rounded transition-colors hover:bg-zinc-700/50 cursor-pointer"
                aria-label={copied ? t('promptCopied') : t('copyPrompt')}
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              className="bg-zinc-800 text-white border-0"
              arrowClassName="fill-zinc-800"
            >
              <p>{t('promptCopied')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-sm text-white line-clamp-3" title={prompt}>
        {prompt}
      </div>
    </div>
  );
}
