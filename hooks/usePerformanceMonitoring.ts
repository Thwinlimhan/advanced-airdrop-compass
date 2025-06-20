import { useEffect } from 'react';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Page load time:', navEntry.loadEventEnd - navEntry.loadEventStart);
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    return () => observer.disconnect();
  }, []);
};
