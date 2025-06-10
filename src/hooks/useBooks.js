import { useState, useCallback } from 'react';
import { 
  searchBooks as apiSearchBooks, 
  getBookDetails as apiGetBookDetails,
  getPopularBooks as apiGetPopularBooks,
  getRecentBooks as apiGetRecentBooks,
  getBooksByCategory as apiGetBooksByCategory,
  advancedSearch as apiAdvancedSearch
} from '../services/googleBooksAPI';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Función genérica para manejar llamadas a la API
  const handleApiCall = useCallback(async (apiFunction, ...args) => {
    try {
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      throw err;
    }
  }, []);

  // Búsqueda de libros
  const searchBooks = useCallback(async (query, options = {}) => {
    if (!query.trim()) {
      setBooks([]);
      setTotalItems(0);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setCurrentQuery(query);

    try {
      const result = await handleApiCall(apiSearchBooks, query, options);
      
      const { startIndex = 0 } = options;
      
      if (startIndex === 0) {
        // Nueva búsqueda
        setBooks(result.books || []);
      } else {
        // Cargar más resultados
        setBooks(prev => [...prev, ...(result.books || [])]);
      }
      
      setTotalItems(result.totalItems || 0);
      setHasMore(result.books && result.books.length === (options.maxResults || 20));
      
    } catch (err) {
      if (options.startIndex === 0) {
        setBooks([]);
        setTotalItems(0);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Cargar más resultados
  const loadMore = useCallback(async (options = {}) => {
    if (!currentQuery || loading || !hasMore) return;

    const startIndex = books.length;
    await searchBooks(currentQuery, { ...options, startIndex });
  }, [currentQuery, books.length, loading, hasMore, searchBooks]);

  // Obtener detalles de un libro específico
  const getBookDetails = useCallback(async (bookId) => {
    setLoading(true);
    try {
      const book = await handleApiCall(apiGetBookDetails, bookId);
      return book;
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Obtener libros populares
  const getPopularBooks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await handleApiCall(apiGetPopularBooks);
      setBooks(result.books || []);
      setTotalItems(result.totalItems || 0);
      setHasMore(false);
      return result;
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Obtener libros recientes
  const getRecentBooks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await handleApiCall(apiGetRecentBooks);
      setBooks(result.books || []);
      setTotalItems(result.totalItems || 0);
      setHasMore(false);
      return result;
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Obtener libros por categoría
  const getBooksByCategory = useCallback(async (category, maxResults = 20) => {
    setLoading(true);
    try {
      const result = await handleApiCall(apiGetBooksByCategory, category, maxResults);
      setBooks(result.books || []);
      setTotalItems(result.totalItems || 0);
      setHasMore(false);
      return result;
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Búsqueda avanzada
  const advancedSearch = useCallback(async (filters) => {
    setLoading(true);
    try {
      const result = await handleApiCall(apiAdvancedSearch, filters);
      setBooks(result.books || []);
      setTotalItems(result.totalItems || 0);
      setHasMore(result.books && result.books.length === (filters.maxResults || 20));
      return result;
    } finally {
      setLoading(false);
    }
  }, [handleApiCall]);

  // Limpiar resultados
  const clearBooks = useCallback(() => {
    setBooks([]);
    setTotalItems(0);
    setHasMore(false);
    setCurrentQuery('');
    setError(null);
  }, []);

  // Función para refrescar la búsqueda actual
  const refresh = useCallback(() => {
    if (currentQuery) {
      searchBooks(currentQuery);
    }
  }, [currentQuery, searchBooks]);

  return {
    // Estado
    books,
    loading,
    error,
    totalItems,
    hasMore,
    currentQuery,
    
    // Funciones
    searchBooks,
    loadMore,
    getBookDetails,
    getPopularBooks,
    getRecentBooks,
    getBooksByCategory,
    advancedSearch,
    clearBooks,
    refresh
  };
};

// Hook especializado para un libro específico
export const useBook = (bookId) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBook = useCallback(async () => {
    if (!bookId) return;

    setLoading(true);
    setError(null);

    try {
      const bookData = await apiGetBookDetails(bookId);
      setBook(bookData);
    } catch (err) {
      setError(err.message || 'Error al cargar el libro');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  return {
    book,
    loading,
    error,
    loadBook,
    refresh: loadBook
  };
};

// Hook para estadísticas de búsqueda
export const useSearchStats = () => {
  const [stats, setStats] = useState({
    totalSearches: 0,
    topCategories: [],
    recentSearches: []
  });

  const updateStats = useCallback((searchTerm, category = null) => {
    setStats(prev => ({
      ...prev,
      totalSearches: prev.totalSearches + 1,
      recentSearches: [
        searchTerm,
        ...prev.recentSearches.filter(term => term !== searchTerm)
      ].slice(0, 10)
    }));
  }, []);

  return {
    stats,
    updateStats
  };
};