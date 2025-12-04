import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 对于 PrismaticBurst 组件，允许直接修改 canvas DOM 样式
      'react-hooks/immutability': 'off',
      // 允许使用 any 类型（用于第三方库集成）
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许未使用的变量（某些情况下需要保留用于类型推断）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // 允许 require 导入（用于配置文件）
      '@typescript-eslint/no-require-imports': 'off',
      // 允许 prefer-const 为警告而非错误
      'prefer-const': 'warn',
      // 关闭不存在的规则
      'react-hooks/set-state-in-effect': 'off',
      // 对于复杂的 3D 渲染组件,允许在 useEffect 中使用稳定的配置参数
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
