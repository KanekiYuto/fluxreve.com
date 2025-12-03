'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// FAQ 项目接口
export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  namespace?: string; // 翻译命名空间,默认为 'pricing'
  className?: string;
}

export default function FAQ({ namespace = 'pricing', className = '' }: FAQProps) {
  const t = useTranslations(namespace);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 从翻译文件中获取 FAQ 数据
  const faqItems = t.raw('faq.items') as FAQItem[];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 ${className}`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs sm:text-sm font-semibold text-primary">{t('faq.badge')}</span>
          </div>
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
  index,
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
        className="w-full px-6 sm:px-8 py-5 sm:py-6 text-left transition-all duration-300 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-start justify-between gap-4">
          {/* 问题 */}
          <div className="flex-1">
            <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
              isOpen ? 'text-primary' : 'text-white group-hover:text-primary'
            }`}>
              {item.question}
            </h3>
          </div>

          {/* 展开/收起图标 */}
          <div className="flex-shrink-0 mt-1">
            <ChevronIcon
              className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* 答案 */}
        <div
          className={`grid transition-all duration-300 ${
            isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <p className="text-sm sm:text-base text-text-muted leading-relaxed whitespace-pre-line">
              {item.answer}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

// 下拉箭头图标
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
