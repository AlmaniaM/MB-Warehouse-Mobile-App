import { Injectable, Signal, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

import { ToastService } from 'src/app/modules/global/services/toast.service';
import { LocationService } from './location.service';

export interface CameraPhoto {
  index: number;
  filepath: string;
  webviewPath?: string;
  latitudeCaptured: number;
  longitudeCaptured: number;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  private locationService: LocationService = inject(LocationService);
	private toastService: ToastService = inject(ToastService);
	private photosSubject: BehaviorSubject<CameraPhoto[]> = new BehaviorSubject<CameraPhoto[]>(<CameraPhoto[]> []);
	public statusSubject: BehaviorSubject<'taking' | 'taken' | 'error' | 'stable'> = new BehaviorSubject<'taking' | 'taken' | 'error' | 'stable'>('stable');

	public readonly photos: Observable<CameraPhoto[]> = this.photosSubject.asObservable();
	public readonly status: Observable<'taking' | 'taken' | 'error' | 'stable'> = this.statusSubject.asObservable();

  constructor() { 
    this.locationService.getLocation();
    this.resetPhotos();
  }

  async takePhoto() {
    this.statusSubject.next('taking');
    const location = await this.locationService.getLocation();

    Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 85
    }).then((photo: Photo) => {
    
      this.photosSubject.next([
        ...this.photosSubject.value, {
        index: this.photosSubject.value.length,
        filepath: photo.path!,
        webviewPath: photo.webPath!, 
        latitudeCaptured: location ? location.coords.latitude : 0,
        longitudeCaptured: location ? location.coords.longitude : 0
      }]);
      this.statusSubject.next('taken');
    
    }).catch((error) => {
      this.toastService.openToast(error.message);
      this.statusSubject.next('error');
    });
    
  }

  removePhoto(index: number) { 
    const photos = this.photosSubject.value;
    photos.splice(index, 1);
    this.photosSubject.next([...photos]);
  }  

  resetPhotos() {
    this.photosSubject.next([]);
  }

}
