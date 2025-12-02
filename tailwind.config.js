/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        apfel: ["ApfelGrotezk", "sans-serif"],
      },
      colors: {
        // Glass aesthetic (water/ocean - aqua/turquoise tint)
        glass: {
          tint: {
            light: "rgba(64, 224, 208, 0.04)",
            DEFAULT: "rgba(64, 224, 208, 0.08)",
            dark: "rgba(32, 178, 170, 0.12)",
          },
          border: {
            light: "rgba(127, 255, 212, 0.15)",
            DEFAULT: "rgba(127, 255, 212, 0.25)",
            dark: "rgba(72, 209, 204, 0.35)",
          },
          text: {
            light: "rgba(255, 255, 255, 0.95)",
            DEFAULT: "rgba(255, 255, 255, 0.9)",
            muted: "rgba(255, 255, 255, 0.7)",
          },
        },
        // Parchment aesthetic
        parchment: {
          light: "#f5f5dc",
          DEFAULT: "#e8e4d0",
          dark: "#d4cfb5",
          darker: "#c4bfa5",
        },
        ink: {
          light: "#5c2d0a",
          DEFAULT: "#2d1a0a",
          dark: "#1a0f06",
        },
        brown: {
          light: "#a0785a",
          DEFAULT: "#8b4513",
          dark: "#6b3410",
        },
      },
      backdropBlur: {
        glass: "10px",
        "glass-heavy": "16px",
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(32, 178, 170, 0.08) 100%)",
        "glass-gradient-hover":
          "linear-gradient(135deg, rgba(64, 224, 208, 0.08) 0%, rgba(32, 178, 170, 0.12) 100%)",
      },
      borderRadius: {
        parchment: "2px",
        "parchment-md": "4px",
      },
      boxShadow: {
        glass:
          "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
        "glass-lg":
          "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15)",
        parchment: "0 4px 12px rgba(0, 0, 0, 0.3)",
        "parchment-lg": "0 8px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
