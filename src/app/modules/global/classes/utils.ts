export class Utils {

  static generateUUID(characterLength: number = 12): string { 
    return crypto.randomUUID().slice(0, characterLength);
  }

  static UUIDToNumber(characterLength: number = 12, negative: boolean = true): number { 
    const uuid = Utils.generateUUID(characterLength);
    const numericOnly = uuid.replace(/[^0-9]/g, '');
    const number = parseInt(numericOnly.substring(0, characterLength), 10);
    return negative ? -1 * number : number;
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  static memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
    const cache = new Map<string, T>();
    return (...args: any[]): T => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }

  static memoizeArray<Args extends unknown[], T>(fn: (args: Args) => T): (args: Args) => T {
  const cache = new Map<any, any>();

  return (args: Args): T => {
    let current = cache;
    for (const arg of args) {
      if (!current.has(arg)) current.set(arg, new Map());
      current = current.get(arg);
    }

    if (current.has("__result")) return current.get("__result");

    const result = fn(args);
    current.set("__result", result);
    return result;
  };
}

  static orderObjectProperties(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).sort().reduce((result: Record<string, any>, key: string) => {
      const value = obj[key];
  
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.orderObjectProperties(value);
      } else {
        result[key] = value;
      }
      
      return result;
    }, {});
  }

  static areObjectsEqual(obj1: Record<string, any>, obj2: Record<string, any>): boolean { 
    const orderedObj1 = this.orderObjectProperties(obj1);
    const orderedObj2 = this.orderObjectProperties(obj2);
    return JSON.stringify(orderedObj1) === JSON.stringify(orderedObj2);
  }

  static areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) { return false; }

    for (let i = 0; i < arr1.length; i++) {
      const val1 = arr1[i];
      const val2 = arr2[i];

      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        if (Array.isArray(val1) && Array.isArray(val2)) {
          if (!this.areArraysEqual(val1, val2)) {
            return false;
          }
        } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
          if (!this.areObjectsEqual(val1, val2)) {
            return false;
          }
        } else {
          return false;
        }
      } else if (val1 !== val2) {
        return false;
      }
    }

    return true;
  }

  static getTotalWeeksInYear(year: number) {
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
  
    const firstMonday = this.getFirstMonday(firstDayOfYear);
    const lastMonday = this.getFirstMonday(lastDayOfYear);
  
    const totalWeeks = Math.ceil((lastMonday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return totalWeeks;
  }
  
  static getFirstMonday(date: Date): Date {
    const firstMonday = new Date(date);
    firstMonday.setDate(date.getDate() + (1 - date.getDay() + 7) % 7);
    return firstMonday;
  }
  
  static parseDateAsLocal(isoDateOnly: string): Date {
    const [y, m, d] = isoDateOnly.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  static getWeekNumber(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  static getWeekStartDateForWeekNumber(weekNumber: number, year: number, startOfWeek = 0): Date {
    const firstDayOfYear = new Date(year, 0, 1);
    const weekStartDate = new Date(firstDayOfYear);
    const daysOffset = (weekNumber - 1) * 7;
    weekStartDate.setDate(firstDayOfYear.getDate() + daysOffset);
    return this.getWeekStartDate(weekStartDate, startOfWeek);
  }

  static getWeekEndDateForWeekNumber(weekNumber: number, year: number, startOfWeek = 0): Date {
    const weekStartDate = this.getWeekStartDateForWeekNumber(weekNumber, year, startOfWeek);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    return weekEndDate;
  }

  static getWeekStartDate(date: Date, startOfWeek = 0) {
    const weekStartDate = new Date(date);
    const day = (weekStartDate.getDay() + 7 - startOfWeek) % 7;
    weekStartDate.setDate(weekStartDate.getDate() - day);
    return weekStartDate;
  }
  
  static getWeekEndDate(date: Date) {
    const weekStartDate = this.getWeekStartDate(date);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    return weekEndDate;
  }
  
  static getMonthStartDate(date: Date) {
    const monthStartDate = new Date(date);
    monthStartDate.setDate(1);
    return monthStartDate;
  }
  
  static getMonthEndDate(date: Date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(year, month + 1, 0);
  }

  static getWeekDays(date: Date, startOfWeek: number = 0): WeekDay[] {
    const weekStartDate = this.getWeekStartDate(date, startOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const dayOffset = (i + startOfWeek) % 7;
      const date = new Date(weekStartDate.getTime() + (i * 24 * 60 * 60 * 1000));

      return { 
        name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(dayOffset + 7) % 7],
        order: dayOffset,
        date: date,
        localeDateString: date.toLocaleDateString()
      };
    });
  }

  static getThisWeekNumber() { 
    return this.getWeekNumber(new Date());
  }

  static getThisWeekStartDate() { 
    return this.getWeekStartDate(new Date());
  }

  static getThisWeekEndDate() { 
    return this.getWeekEndDate(new Date());
  }

  static getThisWeekWeekDays() { 
    return this.getWeekDays(new Date());
  }

  static getThisMonthStartDate() { 
    return this.getMonthStartDate(new Date());
  }

  static getThisMonthEndDate() { 
    return this.getMonthEndDate(new Date());
  }

  static getNow() {
    return new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
  }
}

export interface WeekDay {
  name: string;
  order: number;
  date: Date;
  localeDateString: string;
}