import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { TastevinPreset } from './theme';

registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      // tema sempre scuro: attivo grazie alla classe "app-dark" su <html> (index.html)
      theme: { preset: TastevinPreset, options: { darkModeSelector: '.app-dark' } },
      ripple: true,
      translation: {
        accept: 'Sì', reject: 'No', emptyMessage: 'Nessun risultato', emptySearchMessage: 'Nessun risultato',
        firstDayOfWeek: 1,
      },
    }),
    { provide: LOCALE_ID, useValue: 'it-IT' },
    MessageService,
    ConfirmationService,
  ],
};
