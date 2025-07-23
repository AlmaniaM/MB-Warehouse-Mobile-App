import { MsalInterceptorConfiguration, MsalGuardConfiguration } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, LogLevel, BrowserCacheLocation } from '@azure/msal-browser';

import { environment } from '../../../../environments/environment';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
const microsoftScopes = ['user.read'];

export function loggerCallback(logLevel: LogLevel, message: string) { console.log('Level: ' + logLevel + ' Message: ' + message); }

export function MSALInstanceFactory(): IPublicClientApplication {
	const application = new PublicClientApplication({
		auth: {
			clientId: environment.azureClientId,
			authority: 'https://login.microsoftonline.com/' + environment.azureTenantId,
			redirectUri: environment.appBaseUrl,
			postLogoutRedirectUri: environment.appBaseUrl,
			clientCapabilities: ['CP1'],
			navigateToLoginRequestUrl: true
		},
		cache: {
			cacheLocation: isIE ? BrowserCacheLocation.SessionStorage : BrowserCacheLocation.LocalStorage,
			storeAuthStateInCookie: isIE || true
		},
		system: {
			loggerOptions: {
				loggerCallback,
				logLevel: LogLevel.Warning,
				piiLoggingEnabled: false
			},
			tokenRenewalOffsetSeconds: 300,
			allowRedirectInIframe: true
		}
	});
	application.initialize();
	return application;
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
	const protectedResourceMap = new Map<string, Array<string>>();
	protectedResourceMap.set(environment.azureProfileUrl, microsoftScopes);
	protectedResourceMap.set(environment.azureInventoryTrackingApiBaseUrl + '*', [environment.azureInventoryTrackingApiScope]);

	return {
		interactionType: InteractionType.Popup,
		protectedResourceMap
	};
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
	return {
		interactionType: InteractionType.Popup,
		authRequest: {
			scopes: [...microsoftScopes]
		},
		loginFailedRoute: '/'
	};
}
