import { ApplicationConfig, enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicRouteStrategy } from '@ionic/angular';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { MsalInterceptor, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalService, MsalGuard, MsalBroadcastService } from '@azure/msal-angular';
import { MSALInstanceFactory, MSALGuardConfigFactory, MSALInterceptorConfigFactory } from './app/auth/msal-config';

import { environment } from './environments/environment';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

export const appConfig: ApplicationConfig = { 
	providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
		importProvidersFrom(BrowserAnimationsModule),
		provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    MsalService,
    MsalGuard,
    MsalBroadcastService
	]
};

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
defineCustomElements(window);
