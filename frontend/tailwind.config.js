/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Onyx scale — the brand "dark". Repurposed from the old forest greens
        // to a near-black / charcoal / raised-grey set that follows the logo.
        forest: {
          DEFAULT: '#0D0D0F',
          mid: '#18181B',
          light: '#27272B',
        },
        gold: {
          DEFAULT: '#B8923A',
          light: '#D4AE6A',
          muted: '#8B6B28',
          ember: '#E8881C',
          faint: 'rgba(184,146,58,0.12)',
        },
        cream: {
          DEFAULT: '#F5F1E8',
          dark: '#EDE8DC',
        },
        gsf: {
          white: '#FAFAF7',
          slate: '#1F1F23',
          muted: '#6B6B72',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
    },
  },
  plugins: [],
}
