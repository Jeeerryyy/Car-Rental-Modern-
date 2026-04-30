/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: 'var(--clr-dark)',
        'dark-2': 'var(--clr-dark-2)',
        white: 'var(--clr-white)',
        off: 'var(--clr-off)',
        border: 'var(--clr-border)',
        muted: 'var(--clr-muted)',
      },
      fontFamily: {
        body: 'var(--font-body)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        md: 'var(--shadow-md)',
      }
    },
  },
  plugins: [],
}
