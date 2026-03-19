import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mirror: {
          bg: '#0a0a0a',
          fg: '#f5f5f5',
          muted: '#8a8a8a',
          accent: '#d7b36b'
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

