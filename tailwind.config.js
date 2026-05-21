/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './app/**/*.{js,ts,tsx}',
    './global.css', // Include global.css
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '24px',
      },
      colors: {
        // Dynamic colors (mantener compatibilidad con CSS variables)
        primary: 'var(--color-primary)',
        invert: 'var(--color-invert)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        text: 'var(--color-text)',
        highlight: 'var(--color-highlight)',
        border: 'var(--color-border)',
        darker: 'var(--color-darker)',

        // Colores corporativos de Servitel
        servitel: {
          primary: '#3e78b2', // Rich Cerulean - Azul corporativo principal
          secondary: '#004ba8', // Cobalt Blue - Azul secundario
          accent: '#deefb7', // Tea Green - Color de acento
          neutral: '#bcabae', // Lilac Ash - Color neutral
          dark: '#0f0f0f', // Onyx - Color oscuro
        },

        // Colores de estado
        success: '#17c964', // Verde - éxito
        warning: '#f5a524', // Naranja - advertencia
        error: '#f44336', // Rojo - error
        info: '#2196f3', // Azul - información
        pending: '#f5a524', // Naranja - pendiente
        active: '#17c964', // Verde - activo
        inactive: '#9e9e9e', // Gris - inactivo
      },
    },
  },
  plugins: [],
};
