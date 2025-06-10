import { useState, useEffect, useCallback } from 'react';

// Hook principal para localStorage
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { 
    serialize = JSON.stringify, 
    deserialize = JSON.parse,
    syncAcrossTabs = true 
  } = options;

  // Estado para el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback((value) => {
    try {
      // Permitir que value sea una función para casos como setState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
      
      // Disparar evento personalizado para sincronización
      window.dispatchEvent(new CustomEvent('localStorage-change', {
        detail: { key, value: valueToStore }
      }));
      
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronización entre tabs (opcional)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`Error deserializing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
};

// Hook especializado para arrays
export const useLocalStorageArray = (key, initialValue = []) => {
  const [array, setArray, removeArray] = useLocalStorage(key, initialValue);

  const addItem = useCallback((item) => {
    setArray(currentArray => {
      if (Array.isArray(currentArray)) {
        return [...currentArray, item];
      }
      return [item];
    });
  }, [setArray]);

  const removeItem = useCallback((predicate) => {
    setArray(currentArray => {
      if (Array.isArray(currentArray)) {
        if (typeof predicate === 'function') {
          return currentArray.filter(item => !predicate(item));
        } else {
          return currentArray.filter(item => item !== predicate);
        }
      }
      return [];
    });
  }, [setArray]);

  const updateItem = useCallback((predicate, updater) => {
    setArray(currentArray => {
      if (Array.isArray(currentArray)) {
        return currentArray.map(item => {
          if (typeof predicate === 'function' ? predicate(item) : item === predicate) {
            return typeof updater === 'function' ? updater(item) : updater;
          }
          return item;
        });
      }
      return [];
    });
  }, [setArray]);

  const clearArray = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const hasItem = useCallback((predicate) => {
    if (!Array.isArray(array)) return false;
    
    if (typeof predicate === 'function') {
      return array.some(predicate);
    }
    return array.includes(predicate);
  }, [array]);

  return {
    array,
    setArray,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    hasItem,
    removeArray
  };
};

// Hook para objetos con estructura específica
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [object, setObject, removeObject] = useLocalStorage(key, initialValue);

  const updateProperty = useCallback((property, value) => {
    setObject(currentObject => ({
      ...currentObject,
      [property]: value
    }));
  }, [setObject]);

  const removeProperty = useCallback((property) => {
    setObject(currentObject => {
      const newObject = { ...currentObject };
      delete newObject[property];
      return newObject;
    });
  }, [setObject]);

  const mergeObject = useCallback((newData) => {
    setObject(currentObject => ({
      ...currentObject,
      ...newData
    }));
  }, [setObject]);

  return {
    object,
    setObject,
    updateProperty,
    removeProperty,
    mergeObject,
    removeObject
  };
};

// Hook específico para configuraciones de usuario
export const useUserPreferences = () => {
  const defaultPreferences = {
    theme: 'light',
    language: 'es',
    booksPerPage: 20,
    defaultView: 'grid',
    notifications: true,
    autoSave: true
  };

  const {
    object: preferences,
    updateProperty: updatePreference,
    mergeObject: updatePreferences,
    setObject: setPreferences
  } = useLocalStorageObject('userPreferences', defaultPreferences);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    setPreferences,
    resetPreferences: () => setPreferences(defaultPreferences)
  };
};

// Hook para manejo de cache con expiración
export const useLocalStorageCache = (key, ttlMinutes = 60) => {
  const [cache, setCache] = useLocalStorage(key, null);

  const isExpired = useCallback((timestamp) => {
    if (!timestamp) return true;
    const now = Date.now();
    const expiry = timestamp + (ttlMinutes * 60 * 1000);
    return now > expiry;
  }, [ttlMinutes]);

  const getCachedData = useCallback(() => {
    if (!cache || !cache.timestamp || isExpired(cache.timestamp)) {
      return null;
    }
    return cache.data;
  }, [cache, isExpired]);

  const setCachedData = useCallback((data) => {
    setCache({
      data,
      timestamp: Date.now()
    });
  }, [setCache]);

  const clearCache = useCallback(() => {
    setCache(null);
  }, [setCache]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isExpired: cache ? isExpired(cache.timestamp) : true
  };
};

// Hook para estadísticas de uso
export const useUsageStats = () => {
  const defaultStats = {
    totalSearches: 0,
    totalBooksViewed: 0,
    favoriteGenres: {},
    lastActivity: null,
    sessionCount: 0
  };

  const {
    object: stats,
    updateProperty: updateStat,
    mergeObject: updateStats
  } = useLocalStorageObject('usageStats', defaultStats);

  const incrementSearches = useCallback(() => {
    updateStat('totalSearches', stats.totalSearches + 1);
    updateStat('lastActivity', Date.now());
  }, [stats.totalSearches, updateStat]);

  const incrementBooksViewed = useCallback(() => {
    updateStat('totalBooksViewed', stats.totalBooksViewed + 1);
    updateStat('lastActivity', Date.now());
  }, [stats.totalBooksViewed, updateStat]);

  const addGenreInteraction = useCallback((genre) => {
    const currentCount = stats.favoriteGenres[genre] || 0;
    updateStats({
      favoriteGenres: {
        ...stats.favoriteGenres,
        [genre]: currentCount + 1
      },
      lastActivity: Date.now()
    });
  }, [stats.favoriteGenres, updateStats]);

  const startSession = useCallback(() => {
    updateStat('sessionCount', stats.sessionCount + 1);
    updateStat('lastActivity', Date.now());
  }, [stats.sessionCount, updateStat]);

  return {
    stats,
    incrementSearches,
    incrementBooksViewed,
    addGenreInteraction,
    startSession,
    updateStats
  };
};