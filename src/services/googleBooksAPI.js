// Google Books API Service
const BASE_URL = 'https://www.googleapis.com/books/v1';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

// Helper para construir URLs con parámetros
const buildURL = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Agregar API key si existe
  if (API_KEY) {
    url.searchParams.append('key', API_KEY);
  }
  
  // Agregar otros parámetros
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Búsqueda general de libros
export const searchBooks = async (query, options = {}) => {
  const {
    startIndex = 0,
    maxResults = 20,
    orderBy = 'relevance',
    filter = null,
    langRestrict = null
  } = options;

  try {
    const url = buildURL('/volumes', {
      q: query,
      startIndex,
      maxResults,
      orderBy,
      filter,
      langRestrict
    });

    const response = await fetch(url);
    const data = await handleResponse(response);
    
    return {
      books: data.items || [],
      totalItems: data.totalItems || 0
    };
  } catch (error) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books. Please try again.');
  }
};

// Obtener detalles específicos de un libro
export const getBookDetails = async (bookId) => {
  try {
    const url = buildURL(`/volumes/${bookId}`);
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw new Error('Failed to load book details. Please try again.');
  }
};

// Búsqueda por categoría/género
export const getBooksByCategory = async (subject, maxResults = 20) => {
  try {
    return await searchBooks(`subject:${subject}`, {
      maxResults,
      orderBy: 'relevance'
    });
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw new Error('Failed to load books by category. Please try again.');
  }
};

// Búsqueda por autor
export const getBooksByAuthor = async (author, maxResults = 20) => {
  try {
    return await searchBooks(`inauthor:"${author}"`, {
      maxResults,
      orderBy: 'relevance'
    });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    throw new Error('Failed to load books by author. Please try again.');
  }
};

// Obtener libros populares (simulado con búsquedas genéricas)
export const getPopularBooks = async () => {
  const popularQueries = [
    'bestseller',
    'popular fiction',
    'award winning',
    'new york times'
  ];
  
  try {
    const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
    return await searchBooks(randomQuery, {
      maxResults: 20,
      orderBy: 'relevance'
    });
  } catch (error) {
    console.error('Error fetching popular books:', error);
    throw new Error('Failed to load popular books. Please try again.');
  }
};

// Obtener libros recientes
export const getRecentBooks = async () => {
  const currentYear = new Date().getFullYear();
  try {
    return await searchBooks(`publishedDate:${currentYear}`, {
      maxResults: 20,
      orderBy: 'newest'
    });
  } catch (error) {
    console.error('Error fetching recent books:', error);
    throw new Error('Failed to load recent books. Please try again.');
  }
};

// Búsqueda avanzada con múltiples filtros
export const advancedSearch = async (filters) => {
  const {
    title = '',
    author = '',
    subject = '',
    isbn = '',
    publisher = '',
    publishedAfter = '',
    publishedBefore = '',
    maxResults = 20,
    startIndex = 0
  } = filters;

  // Construir query compleja
  let query = '';
  const queryParts = [];

  if (title) queryParts.push(`intitle:"${title}"`);
  if (author) queryParts.push(`inauthor:"${author}"`);
  if (subject) queryParts.push(`subject:"${subject}"`);
  if (isbn) queryParts.push(`isbn:${isbn}`);
  if (publisher) queryParts.push(`inpublisher:"${publisher}"`);

  query = queryParts.join('+');

  // Si no hay términos específicos, usar búsqueda general
  if (!query) {
    query = 'books';
  }

  try {
    return await searchBooks(query, {
      maxResults,
      startIndex,
      orderBy: 'relevance'
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    throw new Error('Advanced search failed. Please try again.');
  }
};

// Helper para normalizar datos de libros
export const normalizeBookData = (book) => {
  const volumeInfo = book.volumeInfo || {};
  
  return {
    id: book.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description || 'No description available',
    thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
    publishedDate: volumeInfo.publishedDate || 'Unknown',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || [],
    language: volumeInfo.language || 'unknown',
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
          volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    previewLink: volumeInfo.previewLink || null,
    infoLink: volumeInfo.infoLink || null
  };
};