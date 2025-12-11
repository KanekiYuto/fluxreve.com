'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// FAQ 项目接口
export interface FAQItem {
  question: string;
  answer: string;
}

interface LandingFAQProps {
  namespace: string;
}

export default function LandingFAQ({ namespace }: LandingFAQProps) {
  const t = useTranslations(namespace);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 从翻译文件中获取 FAQ 数据
  const faqItems = t.raw('faq.items') as FAQItem[];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 bg-bg-base">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
            {t('faq.title')}
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ 列表 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          {faqItems.map((item, index) => (
            <FAQItemComponent
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ 单项组件
function FAQItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'gradient-border-colorful bg-gradient-to-br from-primary/5 via-bg-elevated to-bg-elevated'
          : 'gradient-border bg-bg-elevated hover:bg-bg-hover'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3 sm:gap-4 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-0 leading-snug pr-2">
            {item.question}
          </h3>
        </div>
        <div
          className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? 'gradient-bg text-white rotate-180'
              : 'bg-border-subtle text-text-muted group-hover:bg-primary/20 group-hover:text-primary'
          }`}
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-6 pb-4 sm:pb-5">
            <div className="pt-0 text-sm sm:text-base text-text-muted leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
