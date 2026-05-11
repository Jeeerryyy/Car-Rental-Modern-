/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark:         'var(--clr-dark)',
        'dark-alt':   'var(--clr-dark-alt)',
        'dark-light': 'var(--clr-dark-light)',
        accent:       'var(--clr-accent)',
        white:        'var(--clr-white)',
        'soft-white': 'var(--clr-soft-white)',
        'light-gray': 'var(--clr-light-gray)',
        border:       'var(--clr-border)',
        muted:        'var(--clr-muted)',
        text:         'var(--clr-text)',
        'text-light': 'var(--clr-text-light)',
      },
      fontFamily: {
        body:    'var(--font-body)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        btn:  'var(--radius-btn)',
        card: 'var(--radius-card)',
        lg:   '0.5rem',
        xl:   '0.75rem',
        '2xl':'1rem',
        '3xl':'1.5rem',
        full: '9999px',
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
