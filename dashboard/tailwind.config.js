/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--bg)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          hover: 'var(--bg-hover)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
          4: 'var(--text-4)',
        },
        line: {
          DEFAULT: 'var(--border)',
          2: 'var(--border-2)',
          3: 'var(--border-3)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent-2)',
        },
        danger: 'var(--v-red)',
        warn:   'var(--v-yellow)',
        ok:     'var(--v-green)',
        info:   'var(--v-blue)',
        hi:     'var(--v-orange)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '1.4'],
        xs:    ['11px', '1.5'],
        sm:    ['12px', '1.5'],
        base:  ['13px', '1.5'],
        md:    ['14px', '1.5'],
        lg:    ['15px', '1.5'],
        xl:    ['17px', '1.3'],
        '2xl': ['20px', '1.3'],
        '3xl': ['26px', '1.1'],
      },
      width: {
        sidebar: 'var(--sidebar-w)',
      },
      height: {
        topbar: 'var(--header-h)',
      },
      minWidth: {
        sidebar: 'var(--sidebar-w)',
      },
    },
  },
  plugins: [],
};
