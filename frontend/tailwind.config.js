/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#030712",
          900: "#0a0a1a",
          800: "#0d1117",
          700: "#161b22",
          600: "#21262d",
          500: "#30363d",
        },
        quantum: {
          indigo: "#6366f1",
          violet: "#a855f7",
          cyan: "#22d3ee",
          pink: "#ec4899",
          glow: "#818cf8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #6366f155, 0 0 20px #6366f122" },
          "100%": { boxShadow: "0 0 20px #a855f788, 0 0 60px #6366f144" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
        "quantum-gradient": "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
}
