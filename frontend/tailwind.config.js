/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4F0E6',
          light: '#FBF9F3',
          warm: '#EAE5D8',
          dark: '#DDD7C7',
          border: '#D8D1BE',
        },
        cream: {
          DEFAULT: '#FFF9EC',
          light: '#FFFDF7',
          dark: '#F4ECCC',
        },
        forest: {
          DEFAULT: '#183C32',
          950: '#10231D',
          900: '#142E26',
          800: '#183C32',
          700: '#215043',
          600: '#2E6E5C',
          500: '#3D8C76',
        },
        ink: {
          DEFAULT: '#14201B',
          muted: '#63726B',
          faint: '#8E9C95',
          border: '#CFC8B7',
        },
        lime: {
          DEFAULT: '#C8E65A',
          hover: '#B8D849',
          light: '#EEF8CE',
          dark: '#8EAA24',
        },
        coral: {
          DEFAULT: '#E96D5B',
          hover: '#D45A48',
          light: '#FBECE8',
          dark: '#BA4433',
        },
        sky: {
          DEFAULT: '#73B9C8',
          hover: '#5DA7B7',
          light: '#E6F4F7',
          dark: '#3E8392',
        },
        gold: {
          DEFAULT: '#E4B85C',
          hover: '#D1A344',
          light: '#FBF3DF',
          dark: '#A67D27',
        },
        lavender: {
          DEFAULT: '#9A8CC7',
          hover: '#8777B7',
          light: '#F0EDF8',
          dark: '#6D5D9E',
        },
        sand: {
          DEFAULT: '#D9C7A2',
          light: '#EAE0C9',
          dark: '#C2AE84',
        },
        attention: {
          DEFAULT: '#E96D5B',
          faint: '#FBECE8',
        },
        // Semantic Category Palette
        cat: {
          food: '#E48246',
          care: '#C8E65A',
          cleaning: '#73B9C8',
          baby: '#E96D5B',
          pet: '#E4B85C',
          home: '#183C32',
          auto: '#5D7B93',
          diy: '#C85A3A',
          tech: '#9A8CC7',
          medicine: '#4A7C59',
          garden: '#6A8E3F',
          water: '#48A9A6',
        }
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 35, 29, 0.05)',
        'tray': '0 4px 20px -2px rgba(16, 35, 29, 0.08), 0 2px 6px -1px rgba(16, 35, 29, 0.04)',
        'sheet': '0 10px 30px -5px rgba(16, 35, 29, 0.12), 0 4px 10px -2px rgba(16, 35, 29, 0.04)',
        'overlap': '0 16px 36px -8px rgba(16, 35, 29, 0.16)',
      },
      letterSpacing: {
        tightest: '-0.035em',
        editorial: '-0.02em',
        label: '0.08em',
      }
    },
  },
  plugins: [],
}
