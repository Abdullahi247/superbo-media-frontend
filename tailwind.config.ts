/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0c0a08',
          soft: '#14110e',
          muted: '#1c1814',
          line: '#2a241e',
        },
        ember: {
          DEFAULT: '#f59a2a',
          bright: '#ffb347',
          dim: '#c7771a',
        },
        mist: {
          DEFAULT: '#a89f94',
          soft: '#6e675e',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 80px rgba(245, 154, 42, 0.18)',
      },
      backgroundImage: {
        grid: `linear-gradient(rgba(245,154,42,0.04) 1px, transparent 1px),
               linear-gradient(90deg, rgba(245,154,42,0.04) 1px, transparent 1px)`,
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
};

export default config;
