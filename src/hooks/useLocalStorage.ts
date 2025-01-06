import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.getItem(key, initialValue);
  });

  // Update localStorage when state changes
  useEffect(() => {
    storage.setItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}