import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { light: '#FAFAFA', dark: '#0A0A0A' },
        card: { light: '#FFFFFF', dark: '#171717' },
        accent: { DEFAULT: '#2563EB', dark: '#3B82F6' },
        'accent-secondary': { DEFAULT: '#6366F1', dark: '#818CF8' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { container: '16px', card: '12px', btn: '8px' },
      transitionDuration: { DEFAULT: '200ms' },
    },
  },
  plugins: [],
};

export default config;
