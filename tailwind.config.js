/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.ejs",
      "./public/**/*.css",
      "./*.html",
    ],
    theme: {
      extend: {            
        gridTemplateColumns: {
        // Simple 16 column grid
        '16': 'repeat(16, minmax(0, 1fr))',
        '32': 'repeat(32, minmax(0, 1fr))',
      },
    },
      container: {
        center: true,
        padding: '2rem',
        overflow: 'auto',
      },

    },
    plugins: [
      {
        tailwindcss: {},
        autoprefixer: {},
      },
      require('daisyui'),
    ],
  }
  
  