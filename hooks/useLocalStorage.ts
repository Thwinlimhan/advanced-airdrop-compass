
import { useState, useEffect } from 'react';
import localforage from 'localforage';

// Configure localforage if needed (e.g., driver preference)
localforage.config({
    name: 'AirdropCompassDB',
    storeName: 'appDataStore',
    description: 'Local storage for Airdrop Compass application data'
});

function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const item = await localforage.getItem<T>(key);
        if (item !== null) {
          setStoredValue(item);
        } else {
          // If no item in storage, set initialValue to storage
          await localforage.setItem(key, initialValue);
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        // Fallback to initial value and try to set it
         await localforage.setItem(key, initialValue);
         setStoredValue(initialValue);
      }
    };
    loadPersistedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes (shouldn't happen often)


  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await localforage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
