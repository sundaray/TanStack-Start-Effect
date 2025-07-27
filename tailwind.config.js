// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        sm: {
          css: {
            // We are no longer targeting 'li' directly.
            // Instead, we are targeting the 'p' inside the 'li'.
            "li > p": {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
            // It's also good practice to reset the li's own margin,
            // just in case, to ensure the p is the only thing creating space.
            li: {
              marginTop: "0",
              marginBottom: "0",
            },
          },
        },
      },
    },
  },
};
