/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#C22222",
          greenAction: "#235D4B",
          bgBeige: "#FAF7F2",
        },
      },
    },
  },
  plugins: [],
};
