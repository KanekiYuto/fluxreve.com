'use client';

import CreditsCard from '@/components/ai-generator/base/CreditsCard';

interface Model {
  id: string;
  name: string;
  credits: number;
}

interface GenerateSectionProps {
  selectedModel: string;
  models: Model[];
  onGenerate: () => void;
  session: any;
  credits: number | null;
  isCreditsLoading: boolean;
  onCreditsRefresh: () => void;
  isGenerating?: boolean;
  requiredCredits: number;
}

export default function GenerateSection({
  selectedModel,
  models,
  onGenerate,
  session,
  credits,
  isCreditsLoading,
  onCreditsRefresh,
  isGenerating = false,
  requiredCredits,
}: GenerateSectionProps) {

  return (
    <div className="rounded-xl p-4 gradient-border">
      <div className="space-y-3">
        <button
          className="w-full rounded-xl px-6 py-3 transition-all duration-300 cursor-pointer text-white font-semibold text-base gradient-bg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            `生成 (${requiredCredits} 积分)`
          )}
        </button>
        {session && credits !== undefined && (
          <CreditsCard
            credits={credits}
            isLoading={isCreditsLoading}
            onRefresh={onCreditsRefresh}
          />
        )}
      </div>
    </div>
  );
}
