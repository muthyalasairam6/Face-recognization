import '@angular/compiler';
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withHashLocation()),
    provideProtractorTestingSupport() // Needed for the Applet environment
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
