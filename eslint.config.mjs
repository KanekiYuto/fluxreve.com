import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig = require("eslint-config-next");
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

// 确保配置是数组格式
const ensureArray = (config) => Array.isArray(config) ? config : [config];

const eslintConfig = [
  ...ensureArray(nextConfig),
  ...ensureArray(nextCoreWebVitals),
  {
    rules: {
      // 对于 PrismaticBurst 组件，允许直接修改 canvas DOM 样式
      'react-hooks/immutability': 'off',
    },
  },
];

export default eslintConfig;
