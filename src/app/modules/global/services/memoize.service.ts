import { computed, signal, Signal } from '@angular/core';

export interface MemoConfig {
  maxSize?: number;
  debounceDelay?: number;
}

export interface MemoOptions {
  maxSize?: number;
  key?: string | (() => string);
}

export interface AsyncMemoResult<T> {
  data: T | undefined;
  loading: boolean;
  error: any;
}

export class MemoizationService {
  private memoCache = new Map<string, { value: any; dependencies: any[] }>();
  private computedCache = new Map<string, { signal: Signal<any>; dependencies: Signal<any>[] }>();
  private config: Required<MemoConfig>;

  constructor(config: MemoConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      debounceDelay: config.debounceDelay ?? 100
    };
  }

  /**
   * Memoizes a function result based on dependencies
   */
  memo<T>(
    factory: () => T,
    deps: any[] | (() => any[]),
    options: MemoOptions = {}
  ): T {
    const key = this.generateKey(factory.toString(), this.getDeps(deps), options);
    const maxSize = options.maxSize ?? this.config.maxSize;

    const cached = this.memoCache.get(key);
    if (cached && this.areDependenciesEqual(cached.dependencies, this.getDeps(deps))) {
      return cached.value;
    }

    const value = factory();
    this.storeInCache(key, value, this.getDeps(deps), maxSize);
    
    return value;
  }

  /**
   * Memoizes a function to prevent unnecessary re-renders
   */
  callback<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[] | (() => any[]),
    options: MemoOptions = {}
  ): T {
    return this.memo(() => callback, this.getDeps(deps), options);
  }

  /**
   * Creates a memoized computed signal that only recalculates when dependencies change
   */
  computedMemo<T>(
    factory: () => T,
    deps: Signal<any>[] | (() => Signal<any>[]),
    options: MemoOptions = {}
  ): Signal<T> {
    const key = this.generateKey(factory.toString(), this.getDeps(deps).map(d => d.toString()), options);
    
    const cached = this.computedCache.get(key);
    if (cached && this.areSignalsEqual(cached.dependencies, this.getDeps(deps))) {
      return cached.signal;
    }

    // Create new computed signal
    const signal = computed(() => {
      this.getDeps(deps).forEach(dep => dep());
      return factory();
    });

    this.computedCache.set(key, { signal, dependencies: this.getDeps(deps) });
    
    return signal;
  }

  /**
   * Creates a mutable reference that persists across renders
   */
  ref<T>(initialValue: T): { current: T } {
    return this.memo(() => ({ current: initialValue }), []);
  }

  /**
   * Memoization with custom equality function
   */
  memoWithEquality<T>(
    factory: () => T,
    deps: any[] | (() => any[]),
    equalityFn: (a: any[], b: any[]) => boolean,
    options: MemoOptions = {}
  ): T {
    const key = this.generateKey(factory.toString(), this.getDeps(deps), options);
    const maxSize = options.maxSize ?? this.config.maxSize;

    const cached = this.memoCache.get(key);
    if (cached && equalityFn(cached.dependencies, this.getDeps(deps))) {
      return cached.value;
    }

    const value = factory();
    this.storeInCache(key, value, this.getDeps(deps), maxSize);
    
    return value;
  }

  /**
   * Memoizes async function results with proper cleanup
   */
  asyncMemo<T>(
    factory: () => Promise<T>,
    deps: any[] | (() => any[]),
    options: MemoOptions & { initialValue?: T } = {}
  ): AsyncMemoResult<T> {
    const key = this.generateKey(factory.toString(), this.getDeps(deps), options);
    const maxSize = options.maxSize ?? this.config.maxSize;
    
    const loading = signal(false);
    const error = signal<any>(null);
    const data = signal<T | undefined>(options.initialValue);

    const cached = this.memoCache.get(key);
    if (cached && this.areDependenciesEqual(cached.dependencies, this.getDeps(deps))) {
      data.set(cached.value);
      return { data: data(), loading: loading(), error: error() };
    }

    loading.set(true);
    error.set(null);
    
    factory()
      .then(result => {
        data.set(result);
        this.storeInCache(key, result, this.getDeps(deps), maxSize);
      })
      .catch(err => {
        error.set(err);
      })
      .finally(() => {
        loading.set(false);
      });

    return { data: data(), loading: loading(), error: error() };
  }

  /**
   * Debounced memoization for operations that should be debounced based on dependency changes
   */
  debouncedMemo<T>(
    factory: () => T,
    deps: any[] | (() => any[]),
    delay: number,
    options: MemoOptions = {}
  ): T {
    const key = this.generateKey(factory.toString(), this.getDeps(deps), options);
    const maxSize = options.maxSize ?? this.config.maxSize;
    
    let timeoutId: any;
    let lastResult: T | undefined;

    const cached = this.memoCache.get(key);
    if (cached && this.areDependenciesEqual(cached.dependencies, this.getDeps(deps))) {
      return cached.value;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const value = factory();
      lastResult = value;
      this.storeInCache(key, value, this.getDeps(deps), maxSize);
    }, delay);

    return lastResult || factory();
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memoCache.clear();
    this.computedCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { memoSize: number; computedSize: number; totalSize: number } {
    return {
      memoSize: this.memoCache.size,
      computedSize: this.computedCache.size,
      totalSize: this.memoCache.size + this.computedCache.size
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private helper methods
  private generateKey(fnString: string, deps: any[], options: MemoOptions): string {
    const key = typeof options.key === 'function' ? options.key() : options.key;
    if (key) return key;
    
    return `${fnString}-${deps.map(d => typeof d === 'object' ? JSON.stringify(d) : String(d)).join('-')}`;
  }


  private areDependenciesEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }
  
  private areSignalsEqual(a: Signal<any>[], b: Signal<any>[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((signal, index) => signal === b[index]);
  }

  private storeInCache(key: string, value: any, deps: any[], maxSize: number): void {
    if (this.memoCache.size >= maxSize) {
      const oldestKey = this.memoCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.memoCache.delete(oldestKey);
      }
    }
    
    this.memoCache.set(key, {
      value,
      dependencies: [...deps]
    });
  }

  private getDeps(deps: any[] | (() => any[])): any[] {
    return typeof deps === 'function' ? deps() : deps;
  }
}
