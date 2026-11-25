import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./styles/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
