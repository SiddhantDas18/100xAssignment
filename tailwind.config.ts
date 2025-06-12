import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)'],
        inter: ['var(--font-inter)'],
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#3B82F6",
      },
    },
  },
  plugins: [],
};

export default config; 