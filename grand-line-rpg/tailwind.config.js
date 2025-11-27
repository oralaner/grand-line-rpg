/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Si tu utilises le dossier src
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Si tu utilises le dossier app à la racine (ce qui semble être ton cas d'après les logs)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Autres dossiers standards
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Sécurité absolue : regarde tous les fichiers JS à la racine
    "./*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        pirate: ['"Pirata One"', 'cursive'],
        paper: ['"Crimson Text"', 'serif'],
      },
    },
  },
  plugins: [],
};