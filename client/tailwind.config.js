/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using CSS var references — opacity modifiers (e.g. bg-dark/50) work
        // only when the variable resolves to an RGB channel triple.
        // Simple hex shortcuts below; full opacity-modifier support via the
        // CSS-variable approach requires Tailwind v3.1+ with `alpha` support.
        dark:    'var(--clr-dark)',
        'dark-2':'var(--clr-dark-2)',
        'dark-3':'var(--clr-dark-3)',
        accent:  'var(--clr-accent)',
        white:   'var(--clr-white)',
        off:     'var(--clr-off)',
        'off-2': 'var(--clr-off-2)',
        border:  'var(--clr-border)',
        muted:   'var(--clr-muted)',
        text:    'var(--clr-text)',
      },
      fontFamily: {
        body:    'var(--font-body)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': '12px',
        '3xl': '14px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
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
