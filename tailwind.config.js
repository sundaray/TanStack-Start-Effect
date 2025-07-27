/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        sm: {
          css: {
            "li > p": {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
          },
        },
      },
    },
  },
};
