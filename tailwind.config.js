module.exports = {
  content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
        colors: {
        primary: {
          DEFAULT: '#2563EB',
          weak: '#93B2F5', 
          strong: '#1B4AB0'
        }, // Primario
        secondary: '#DA00FB', // Secondary
        accent: '#000000', // Acento
        background: '#FFFFFF', // Fondo
        text:{
          DEFAULT:'#1F2937', // Texto
          secondary: '#B2B2B2', // Texto Secondary
        },
        details: '#E5E7EB', // Detalles
      }
    }
 },
  plugins: []
}