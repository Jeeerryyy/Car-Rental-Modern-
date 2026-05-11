/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Owner CRM Design System (Brand Refresh) ──
        'primary':              '#111827',
        'primary-container':    '#172033',
        'on-primary':           '#ffffff',
        'on-primary-container': '#D1D5DB',

        'secondary':            '#C89B5B',
        'secondary-container':  '#F3F4F6',
        'on-secondary':         '#111827',

        'surface':              '#F8F7F4',
        'surface-dim':          '#E5E7EB',
        'surface-bright':       '#F8F7F4',
        'surface-variant':      '#F3F4F6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':'#F8F7F4',
        'surface-container':    '#F3F4F6',
        'surface-container-high':'#E5E7EB',

        'on-surface':           '#0F172A',
        'on-surface-variant':   '#6B7280',

        'background':           '#F8F7F4',
        'on-background':        '#0F172A',

        'outline':              '#9CA3AF',
        'outline-variant':      '#E5E7EB',

        'error':                '#ba1a1a',
        'error-container':      '#ffdad6',

        // Utility colors
        dark:    '#111827',
        accent:  '#C89B5B',
        muted:   '#6B7280',
        off:     '#F8F7F4',
        border:  '#E5E7EB',
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
