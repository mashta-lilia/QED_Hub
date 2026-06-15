import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        display: ["Onest", "Manrope", "ui-sans-serif", "system-ui"],
        serif: ["Literata", "Georgia", "serif"],
        quote: ["Spectral", "Literata", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: "#23344a",
        mist: "#e9f1fb",
        line: "#dbe6f3",
        navy: "#18365c",
        accent: "#2f6fdb",
        teal: "#1f8aa3",
        green: "#1f9d6b",
        amber: "#e0922f",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(29, 60, 99, 0.08)",
        lift: "0 22px 60px rgba(20, 45, 80, 0.16)",
        float: "0 28px 80px rgba(20, 45, 80, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
