import { 
  Component, 
  InputSignal, 
  OutputEmitterRef, 
  Signal, 
  WritableSignal, 
  computed, 
  inject, 
  input, 
  output, 
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonFooter,
  IonSearchbar,
  IonList,
  IonItem,
  IonCheckbox
} from '@ionic/angular/standalone';

import { Employee, EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-selector',
  templateUrl: './employee-selector.component.html',
  styleUrls: ['./employee-selector.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonFooter,
    IonSearchbar,
    IonList,
    IonItem,
    IonCheckbox
  ]
})
export class EmployeeSelectorComponent {
  
  employeeService: EmployeeService = inject(EmployeeService);
  employeeServiceStatus: Signal<'error' | 'fetching' | 'stable'> = toSignal(this.employeeService.statusSubject, { requireSync: true });
  
  label: InputSignal<string> = input<string>('Employee');
  selectMultiple: InputSignal<boolean> = input<boolean>(false);
  
  selectedEmployeesChanged: OutputEmitterRef<Employee[]> = output<Employee[]>();
  selectionCancelledChanged: OutputEmitterRef<void> = output<void>();

  employees: Signal<Employee[]> = toSignal(this.employeeService.employees, { initialValue: [] });

  filteredEmployees: Signal<Employee[]> = computed(() => {
    if (this.employees().length === 0) { return []; }

    return this.employees()
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
      .filter(employee => employee.active)
      .filter(record => {
        if (this.searchFilter() === '') { return true; }
        return JSON.stringify(Object.values(record)).trim().toLowerCase().includes(this.searchFilter().trim().toLowerCase());
      });
  });

  searchFilter: WritableSignal<string> = signal('');
  selectedEmployees: WritableSignal<Employee[]> = signal<Employee[]>([]);
  selectedEmployeeIds: Signal<number[]> = computed(() => {
    if (this.selectedEmployees().length === 0) { return []; }
    return this.selectedEmployees().map(employee => employee.id);
  });

  isChecked(employee: Employee): boolean {
    return this.selectedEmployeeIds().includes(employee.id);
  }

  checkboxChange(event: CustomEvent<{ checked: boolean; value: Employee }>)  {

    const employee = event.detail.value;
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.selectMultiple()) {
        this.selectedEmployees.update(employees => [...employees, employee]);
      } else {
        this.selectedEmployees.set([employee]);
      }
    } else {
      this.selectedEmployees.update(employees => employees.filter(c => c.id !== employee.id));
    }
  }
}
