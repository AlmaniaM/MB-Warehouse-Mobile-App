import { Injectable, inject } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { BehaviorSubject, Observable } from 'rxjs';

import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private toastService: ToastService = inject(ToastService);
  private callbackId: string | null = null;
  private locationSubject: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(null);
	public readonly location: Observable<Position | null> = this.locationSubject.asObservable();

  constructor() { 
    this.initializeLocationPermission();
  }

  public async initializeLocationPermission() {
    const currentStatus = await this.checkLocationPermission();
    if (currentStatus.location === 'granted') {
      this.getLocation();
      return;
    }
    const deviceInfo = await Device.getInfo();
    if (deviceInfo.platform === 'web') {
      this.toastService.openToast('You have not allowed for the app to access your location.');
    } else {
      const requestStatus = await this.requestLocationPermission();
      if (requestStatus.location === 'granted') {
        this.getLocation();
      }
    }
  }

  public async checkLocationPermission() { 
    const status = await Geolocation.checkPermissions();
    return status;
  }

  public async requestLocationPermission() { 
    const status = await Geolocation.requestPermissions();
    if (status.location === 'granted') {
      this.toastService.openToast('You have allowed for the app to access your location.');
    }
    this.toastService.openToast('You have not allowed for the app to access your location.');
    return status;
  }

  public async getLocation() {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    });
    this.locationSubject.next(position);
    return position;
  }

  public async listenToLocationChanges() {  
    this.toastService.openToast('App is now listening to your location.');
    this.callbackId = await Geolocation.watchPosition({
      enableHighAccuracy: true
    }, (position, err) => {
      if (err) {
        this.toastService.openToast('App Failed to listen to your location.');
        console.error(err);
      } else {
        this.locationSubject.next(position);
      }
    });
  }

  public async stopListeningToLocation() {
    if (!this.callbackId) { return;}
    this.toastService.openToast('App has stopped listening to your location.');
    Geolocation.clearWatch({ id: this.callbackId });
  }

}
