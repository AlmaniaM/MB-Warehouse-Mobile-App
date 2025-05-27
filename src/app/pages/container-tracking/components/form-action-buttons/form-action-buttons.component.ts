import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';

export interface FormActionButtonsConfig {
  resetLabel?: string;
  submitLabel?: string;
  updateLabel?: string;
  showReset?: boolean;
  isLoading?: boolean;
  isFormValid?: boolean;
  isEditMode?: boolean;
}

@Component({
  selector: 'app-form-action-buttons',
  templateUrl: './form-action-buttons.component.html',
  styleUrls: ['./form-action-buttons.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonSpinner
  ]
})
export class FormActionButtonsComponent {
  readonly config = input.required<FormActionButtonsConfig>();
  readonly resetClicked = output<void>();
  readonly submitClicked = output<void>();

  get shouldShowReset(): boolean {
    return this.config().showReset ?? true;
  }

  get isLoading(): boolean {
    return this.config().isLoading ?? false;
  }

  get isFormValid(): boolean {
    return this.config().isFormValid ?? false;
  }

  get isEditMode(): boolean {
    return this.config().isEditMode ?? false;
  }

  get resetLabel(): string {
    return this.config().resetLabel ?? 'Reset';
  }

  get submitLabel(): string {
    return this.config().submitLabel ?? 'Submit';
  }

  get updateLabel(): string {
    return this.config().updateLabel ?? 'Update';
  }

  get buttonText(): string {
    if (this.isLoading) {
      return '';
    }
    return this.isEditMode ? this.updateLabel : this.submitLabel;
  }

  onResetClick(): void {
    this.resetClicked.emit();
  }

  onSubmitClick(): void {
    this.submitClicked.emit();
  }
}
