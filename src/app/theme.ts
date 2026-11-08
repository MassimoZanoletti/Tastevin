import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/** Tema Aura con colore primario "bordeaux". */
export const TastevinPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf2f3', 100: '#f5dfe2', 200: '#ebbcc3', 300: '#dc8e9a', 400: '#c75b6d',
      500: '#a8344a', 600: '#8e2439', 700: '#761d30', 800: '#5f1828', 900: '#4c1421', 950: '#2b0a12',
    },
    colorScheme: {
      light: { primary: { color: '{primary.700}', hoverColor: '{primary.800}', activeColor: '{primary.900}' } },
      dark: { primary: { color: '{primary.300}', hoverColor: '{primary.200}', activeColor: '{primary.100}', contrastColor: '{primary.950}' } },
    },
  },
});
