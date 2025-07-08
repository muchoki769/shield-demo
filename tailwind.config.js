/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './views/**/*.ejs', // Ensure Tailwind scans your EJS files
      './public/**/*.js',
      './public/**/*.html',
      // "./src/*.{html,js,css} ", // Tailwind will also look through your JS files in the public folder
    ],
    // mode: "jit",
    theme: {
      extend: {},
    },
    plugins: [],
  };
  