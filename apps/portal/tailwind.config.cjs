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
        'primary':              '#121212', // Obsidian
        'primary-container':    '#1D1D1D', // Graphite Black
        'on-primary':           '#F8F6F1', // Matte Ivory
        'on-primary-container': '#D6D0C7', // Dust Border

        'secondary':            '#A56A43', // Burnt Copper
        'secondary-container':  '#F8F6F1', // Matte Ivory
        'on-secondary':         '#121212',

        'surface':              '#F8F6F1', // Matte Ivory
        'surface-dim':          '#E7E0D4', // Soft Sandstone
        'surface-bright':       '#F8F6F1',
        'surface-variant':      '#E7E0D4',
        'surface-container-lowest': '#F8F6F1',
        'surface-container-low':'#F4F1EA',
        'surface-container':    '#F8F6F1',
        'surface-container-high':'#E7E0D4',

        'on-surface':           '#121212',
        'on-surface-variant':   '#5C5C5C', // Ash Graphite

        'background':           '#F4F1EA', // Mineral White
        'on-background':        '#121212',

        'outline':              '#D6D0C7', // Dust Border
        'outline-variant':      'rgba(18, 18, 18, 0.15)',

        'error':                '#9C4B45', // Oxide Red
        'error-container':      '#F0D9D6',

        // Utility colors
        dark:    '#141414',
        accent:  '#A56A43',
        muted:   '#5C5C5C',
        off:     '#F4F1EA',
        border:  '#D6D0C7',
      },
      fontFamily: {
        'body-md':     ['General Sans', 'Satoshi', 'Neue Montreal', 'Inter', 'sans-serif'],
        'body-sm':     ['General Sans', 'Satoshi', 'Neue Montreal', 'Inter', 'sans-serif'],
        'headline-lg': ['Clash Display', 'Cabinet Grotesk', 'Poppins', 'Sora', 'sans-serif'],
        'headline-xl': ['Clash Display', 'Cabinet Grotesk', 'Poppins', 'Sora', 'sans-serif'],
        'label-caps':  ['Clash Display', 'Cabinet Grotesk', 'Poppins', 'Sora', 'sans-serif'],
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
        sm:   '6px',
        md:   '12px',
        btn:  '24px',
        card: '24px',
        lg:   '24px',
        xl:   '24px',
        '2xl': '24px',
        '3xl': '28px',
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
