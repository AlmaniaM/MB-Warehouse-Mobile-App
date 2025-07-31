import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  private toastController: ToastController = inject(ToastController);
  
  async openToast(message: string, duration: number = 1800, position: 'top' | 'bottom' | 'middle' = 'bottom') { 
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position
    });
    await toast.present();
  }
}
