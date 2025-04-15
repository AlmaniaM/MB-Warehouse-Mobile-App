export const environment = {
	production: false,
	appName: 'MBN Warehouse Mobile App',
  //ionic serve
	appBaseUrl: 'http://localhost:8100/',
  //ionic serve --external --ssl
 	//appBaseUrl: 'https://10.0.0.187:8100/',
  azureProfileUrl: 'https://graph.microsoft.com/v1.0/me',
  azureTenantId: 'b0300ad2-8904-4c25-ad06-8596002cf330',
  azureClientId: '',
  azureInventoryTrackingApiScope: 'api://f0da2fd6-f1e6-4e8f-abc4-f904dec3ec56/ReadWriteInventoryDevData',
  //For Local Development
  azureInventoryTrackingApiBaseUrl: 'https://localhost:44368/api/',
  azureReportServiceBaseUrl: 'https://localhost:3000/',
  //For Testing Live API Locally
  //azureInventoryTrackingApiBaseUrl: 'https://mbn-inventory-api.delightfulglacier-f4e73e43.westus3.azurecontainerapps.io/api/',
  //azureReportServiceBaseUrl: 'https://mbn-inventory-report-service-dev.delightfulglacier-f4e73e43.westus3.azurecontainerapps.io/',
};
