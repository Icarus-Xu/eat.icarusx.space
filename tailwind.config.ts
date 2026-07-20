import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"WenQuanYi Zen Hei"',
          '"WenQuanYi Micro Hei"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      borderColor: {
        DEFAULT: '#EFE4D6',
      },
      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
        // "Warm Appetite" design tokens (light + `-d` dark)
        paper: '#FBF5EC',
        'paper-d': '#211A15',
        card: '#FFFFFF',
        'card-d': '#2B2119',
        ink: '#2B211B',
        'ink-d': '#F3EADD',
        sub: '#6B5F55',
        'sub-d': '#C9B8A6',
        muted: '#94867A',
        'muted-d': '#A2917F',
        line: '#EFE4D6',
        'line-d': '#38291F',
        appetite: '#E4572E',
        'appetite-d': '#F06A40',
        'appetite-soft': '#FBE7DF',
        'appetite-soft-d': '#3A2419',
        star: '#F2A73B',
        'star-d': '#F5B450',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
