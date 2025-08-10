/** @type {import('tailwindcss').Config} */
export default {
  // Add the paths to all template files:
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Playfair Display", "Poppins", "Georgia", "serif"],
        mono: ["Fira Code", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        // Additional named stacks
        sansAlt: ["Poppins", "Inter", "sans-serif"],
        serifBody: ["Lora", "Georgia", "serif"],
        display: ["Poppins", "Playfair Display", "Inter", "sans-serif"],
        codeAlt: ["JetBrains Mono", "Fira Code", "monospace"],
        // Override core (optional)
        sans: ["Inter", "Roboto", "system-ui", "sans-serif"],
        serif: ["Lora", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}