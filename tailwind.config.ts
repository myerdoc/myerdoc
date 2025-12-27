import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // <-- THIS IS THE FIX
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;