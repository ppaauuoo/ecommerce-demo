/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.ejs",
      "./public/**/*.css",
      "./*.html",
    ],
    theme: {
      extend: {},
    },
    plugins: [
      {
        tailwindcss: {},
        autoprefixer: {},
      },
    ],
  }
  
  