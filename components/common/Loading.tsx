'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ text, fullScreen = true }: LoadingProps) {
  const t = useTranslations('common');

  const content = (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* 旋转圆环 */}
      <div className="relative inline-block w-16 h-16 mb-6">
        {/* 外层圆环 */}
        <motion.div
          className="absolute inset-0 rounded-full border-[3px] border-white/10"
          style={{
            borderTopColor: 'rgb(255, 255, 255)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* 内层小圆环 */}
        <motion.div
          className="absolute inset-2 rounded-full border-[2px] border-white/5"
          style={{
            borderBottomColor: 'rgba(255, 255, 255, 0.6)',
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* 加载文本 */}
      <motion.p
        className="text-base text-white/90 font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {text || t('loading')}
      </motion.p>

      {/* 简洁的进度点 */}
      <div className="flex justify-center items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{
              y: [-3, 3, -3],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        {content}
      </div>
    );
  }

  return content;
}
