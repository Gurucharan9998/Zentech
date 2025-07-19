import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./public/**/*.html"],
  theme: {
    extend: {}
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
