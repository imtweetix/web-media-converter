// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private activeOperations: Map<string, number> = new Map();

  start(operation: string): string {
    const startTime = performance.now();
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.activeOperations.set(operationId, startTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Started: ${operation}`);
    }

    return operationId;
  }

  end(operationId: string, success: boolean = true, error?: string): number {
    const startTime = this.activeOperations.get(operationId);
    if (!startTime) {
      console.warn(
        `Performance monitor: No start time found for operation ${operationId}`
      );
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const operation = operationId.split('-')[0];

    this.activeOperations.delete(operationId);

    const metric: PerformanceMetrics = {
      operation,
      startTime,
      endTime,
      duration,
      success,
      ...(error && { error }),
    };

    this.metrics.push(metric);

    if (process.env.NODE_ENV === 'development') {
      const status = success ? '✅' : '❌';
      console.log(`${status} ${operation}: ${duration.toFixed(2)}ms`);
      if (error) {
        console.error(`Error in ${operation}:`, error);
      }
    }

    return duration;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageDuration(operation: string): number {
    const operationMetrics = this.metrics.filter(
      m => m.operation === operation
    );
    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );
    return totalDuration / operationMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }

  getSlowOperations(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => (m.duration || 0) > threshold);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Higher-order function for performance tracking
export const trackPerformance = <T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    const operationId = performanceMonitor.start(operation);
    try {
      const result = await fn(...args);
      performanceMonitor.end(operationId, true);
      return result;
    } catch (error) {
      performanceMonitor.end(
        operationId,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }) as T;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    return {
      used: memInfo.usedJSHeapSize,
      total: memInfo.jsHeapSizeLimit,
      percentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100,
    };
  }
  return null;
};

// Memory pressure detection
export const isMemoryPressureHigh = (threshold: number = 80): boolean => {
  const memory = getMemoryUsage();
  return memory ? memory.percentage > threshold : false;
};

// Debounced function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttled function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Request idle callback polyfill
export const requestIdleCallback = (
  callback: () => void,
  timeout?: number
): number => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, timeout ? { timeout } : {});
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, 1) as unknown as number;
  }
};

export const cancelIdleCallback = (id: number): void => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// Batch operations for better performance
export const batchOperations = async <T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 3
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }

  return results;
};

// Performance observer for long tasks
export const observeLongTasks = (
  callback: (tasks: PerformanceEntry[]) => void
) => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        const longTasks = list
          .getEntries()
          .filter(entry => entry.duration > 50);
        if (longTasks.length > 0) {
          callback(longTasks);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      return observer;
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }
  return null;
};

// Export all utilities
export default {
  performanceMonitor,
  trackPerformance,
  getMemoryUsage,
  isMemoryPressureHigh,
  debounce,
  throttle,
  requestIdleCallback,
  cancelIdleCallback,
  batchOperations,
  observeLongTasks,
};
