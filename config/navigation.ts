/**
 * 导航配置文件
 * 统一管理站点所有导航菜单的配置
 */

// ==================== Header 导航配置 ====================
// 用于顶部 Header 导航栏（桌面端和移动端菜单）

// 子菜单项
export interface HeaderSubItem {
  name: string; // 导航项名称（用于翻译）
  href: string; // 导航链接
  icon: string; // 图标名称
  description?: string; // 描述文本（用于翻译）
}

// 单个链接项
export interface HeaderLinkItem {
  type: 'link';
  name: string; // 导航项名称（用于翻译）
  href: string; // 导航链接
}

// 带子菜单的分组项
export interface HeaderDropdownItem {
  type: 'dropdown';
  title: string; // 分组标题（用于翻译）
  items: HeaderSubItem[]; // 子菜单项
}

// Header 导航项（单个链接或下拉分组）
export type HeaderNavEntry = HeaderLinkItem | HeaderDropdownItem;

// Header 导航配置
export const headerNavigation: HeaderNavEntry[] = [
  { type: 'link', name: 'home', href: '/' },
  { type: 'link', name: 'ai-generator', href: '/ai-generator' },
  {
    type: 'dropdown',
    title: 'models', // AI 模型
    items: [
      { name: 'nano-banana-pro', href: '/nano-banana-pro', icon: 'banana', description: 'nanoBananaProDesc' },
      { name: 'z-image', href: '/z-image', icon: 'zap', description: 'zImageDesc' },
      { name: 'flux-2-pro', href: '/flux-2-pro', icon: 'sparkles', description: 'flux2ProDesc' },
      { name: 'seedreamV45', href: '/seedream-v45', icon: 'sparkles', description: 'seedreamV45Desc' },
      { name: 'image-upscaler', href: '/image-upscaler', icon: 'sparkles', description: 'imageUpscalerDesc' },
      { name: 'image-watermark-remover', href: '/image-watermark-remover', icon: 'sparkles', description: 'imageWatermarkRemoverDesc' },
    ],
  },
  { type: 'link', name: 'explore', href: '/explore' },
  { type: 'link', name: 'tasks', href: '/tasks' },
  { type: 'link', name: 'pricing', href: '/pricing' },
];

// ==================== Sidebar 导航菜单配置 ====================
// 用于左侧边栏导航，支持分组和图标

export interface NavItem {
  name: string; // 导航项名称
  href: string; // 导航链接
  icon: string; // 图标名称（对应 Sidebar.tsx 中的 Icon 组件）
}

export interface NavGroup {
  title: string; // 分组标题
  items: NavItem[]; // 分组内的导航项
}

export const navigationGroups: NavGroup[] = [
  {
    title: 'main', // 主要功能分组
    items: [
      { name: 'home', href: '/', icon: 'home' },
      { name: 'pricing', href: '/pricing', icon: 'pricing' },
      { name: 'dashboard', href: '/dashboard', icon: 'dashboard' },
      { name: 'ai-generator', href: '/ai-generator', icon: 'image' },
      { name: 'explore', href: '/explore', icon: 'image' },
    ],
  },
  {
    title: 'user', // 用户分组
    items: [
      { name: 'tasks', href: '/tasks', icon: 'tasks' },
      { name: 'quota', href: '/quota', icon: 'quota' },
      { name: 'subscription', href: '/subscription', icon: 'subscription' },
      { name: 'settings', href: '/settings', icon: 'settings' },
    ],
  },
  {
    title: 'content', // 内容管理分组
    items: [
      { name: 'nano-banana-pro', href: '/nano-banana-pro', icon: 'sparkles' },
      { name: 'z-image', href: '/z-image', icon: 'sparkles' },
      { name: 'flux-2-pro', href: '/flux-2-pro', icon: 'sparkles' },
      { name: 'seedreamV45', href: '/seedream-v45', icon: 'sparkles' },
      { name: 'image-upscaler', href: '/image-upscaler', icon: 'sparkles' },
      { name: 'image-watermark-remover', href: '/image-watermark-remover', icon: 'sparkles' },
    ],
  },
  {
    title: 'more', // 更多分组
    items: [
      { name: 'help', href: '/help', icon: 'help' },
    ],
  },
];

// ==================== Footer 链接配置 ====================
// 用于页脚底部的链接区域，支持外部链接

export interface FooterLink {
  name: string; // 链接名称
  href: string; // 链接地址
  external?: boolean; // 是否为外部链接（会在新标签页打开）
}

export interface FooterSection {
  title: string; // 链接组标题
  links: FooterLink[]; // 链接组内的链接列表
}

export const footerSections: FooterSection[] = [
  {
    title: 'nav', // 导航
    links: [
      { name: 'home', href: '/' },
      { name: 'ai-generator', href: '/ai-generator' },
      { name: 'explore', href: '/explore' },
      { name: 'pricing', href: '/pricing' },
      { name: 'help', href: '/help' },
    ],
  },
  {
    title: 'models', // AI 模型
    links: [
      { name: 'nano-banana-pro', href: '/nano-banana-pro' },
      { name: 'z-image', href: '/z-image' },
      { name: 'flux-2-pro', href: '/flux-2-pro' },
      { name: 'seedreamV45', href: '/seedream-v45' },
      { name: 'image-upscaler', href: '/image-upscaler' },
      { name: 'image-watermark-remover', href: '/image-watermark-remover' },
    ],
  },
  {
    title: 'company', // 公司相关
    links: [
      { name: 'terms', href: '/terms' },
      { name: 'privacy', href: '/privacy' },
    ],
  },
];
