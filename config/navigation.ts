/**
 * 导航配置文件
 * 统一管理站点所有导航菜单的配置
 */

// ==================== Header 导航配置 ====================
// 用于顶部 Header 导航栏（桌面端和移动端菜单）

export interface HeaderNavItem {
  name: string; // 导航项名称
  href: string; // 导航链接
}

export const headerNavigation: HeaderNavItem[] = [
  { name: 'home', href: '/' },
  { name: 'ai-generator', href: '/ai-generator' },
  { name: 'nano-banana-pro', href: '/nano-banana-pro' },
  { name: 'z-image', href: '/z-image' },
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
      { name: 'dashboard', href: '/dashboard', icon: 'dashboard' },
      { name: 'quota', href: '/quota', icon: 'quota' },
      { name: 'subscription', href: '/subscription', icon: 'subscription' },
      { name: 'pricing', href: '/pricing', icon: 'pricing' },
    ],
  },
  {
    title: 'content', // 内容管理分组
    items: [
      { name: 'ai-generator', href: '/ai-generator', icon: 'image' },
      { name: 'nano-banana-pro', href: '/nano-banana-pro', icon: 'sparkles' },
      { name: 'z-image', href: '/z-image', icon: 'sparkles' },
    ],
  },
  {
    title: 'settings', // 设置分组
    items: [
      { name: 'settings', href: '/settings', icon: 'settings' },
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
    title: 'quick-links', // 快速链接
    links: [
      { name: 'home', href: '/' },
      { name: 'ai-generator', href: '/ai-generator' },
      { name: 'pricing', href: '/pricing' },
    ],
  },
  {
    title: 'models', // AI 模型
    links: [
      { name: 'nano-banana-pro', href: '/nano-banana-pro' },
      { name: 'z-image', href: '/z-image' },
    ],
  },
  {
    title: 'legal', // 法律相关
    links: [
      { name: 'terms', href: '/terms' },
      { name: 'privacy', href: '/privacy' },
    ],
  },
];
