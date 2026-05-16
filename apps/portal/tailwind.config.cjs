/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Owner CRM Design System (Public Site Match) ──
        'primary':              '#19130E',
        'primary-container':    '#2c241b',
        'on-primary':           '#F9F8F3',
        'on-primary-container': '#D1D5DB',

        'secondary':            '#B67C3D',
        'secondary-container':  '#F2EEE5',
        'on-secondary':         '#19130E',

        'surface':              '#F9F8F3',
        'surface-dim':          'rgba(25, 19, 14, 0.05)',
        'surface-bright':       '#F9F8F3',
        'surface-variant':      '#F2EEE5',
        'surface-container-lowest': '#F2EEE5',
        'surface-container-low':'#F9F8F3',
        'surface-container':    '#F2EEE5',
        'surface-container-high':'rgba(25, 19, 14, 0.1)',

        'on-surface':           '#19130E',
        'on-surface-variant':   '#6b5e50',

        'background':           '#F9F8F3',
        'on-background':        '#19130E',

        'outline':              'rgba(25, 19, 14, 0.3)',
        'outline-variant':      'rgba(25, 19, 14, 0.15)',

        'error':                '#ba1a1a',
        'error-container':      '#ffdad6',

        // Utility colors
        dark:    '#19130E',
        accent:  '#B67C3D',
        muted:   '#6b5e50',
        off:     '#F9F8F3',
        border:  'rgba(25, 19, 14, 0.15)',
      },
      fontFamily: {
        'body-md':     ['Inter', 'sans-serif'],
        'body-sm':     ['Inter', 'sans-serif'],
        'headline-lg': ['Poppins', 'Sora', 'sans-serif'],
        'headline-xl': ['Poppins', 'Sora', 'sans-serif'],
        'label-caps':  ['Poppins', 'Sora', 'sans-serif'],
        'data-tabular':['Inter', 'sans-serif'],
      },
      fontSize: {
        'body-md':     ['16px', { lineHeight: '24px', letterSpacing: '0', fontWeight: '400' }],
        'body-sm':     ['14px', { lineHeight: '20px', letterSpacing: '0', fontWeight: '400' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label-caps':  ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '700' }],
        'data-tabular':['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      spacing: {
        'gutter':            '24px',
        'section-gap':       '64px',
        'container-padding': '48px',
        'card-inner':        '24px',
        'unit':              '4px',
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        btn:  '12px',
        card: '20px',
        lg:   '0.5rem',
        xl:   '0.75rem',
        '2xl':'1rem',
        '3xl':'1.5rem',
        full: '9999px',
      },
      transitionDuration: {
        fast:   '150ms',
        normal: '250ms',
        slow:   '400ms',
      },
    },
  },
  plugins: [],
}
