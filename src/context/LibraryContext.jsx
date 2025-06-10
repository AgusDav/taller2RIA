import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Tipos de acciones
const ACTIONS = {
  SET_BOOKSHELVES: 'SET_BOOKSHELVES',
  ADD_TO_BOOKSHELF: 'ADD_TO_BOOKSHELF',
  REMOVE_FROM_BOOKSHELF: 'REMOVE_FROM_BOOKSHELF',
  MOVE_BOOK: 'MOVE_BOOK',
  SET_SEARCH_HISTORY: 'SET_SEARCH_HISTORY',
  ADD_SEARCH_TERM: 'ADD_SEARCH_TERM',
  SET_FAVORITES: 'SET_FAVORITES',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE'
};

// Estado inicial
const initialState = {
  bookshelves: {
    reading: [],
    toRead: [],
    read: [],
    favorites: []
  },
  searchHistory: [],
  favorites: []
};

// Reducer
const libraryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_BOOKSHELVES:
      return {
        ...state,
        bookshelves: action.payload
      };
    
    case ACTIONS.ADD_TO_BOOKSHELF:
      return {
        ...state,
        bookshelves: {
          ...state.bookshelves,
          [action.payload.shelf]: [
            ...state.bookshelves[action.payload.shelf],
            action.payload.book
          ]
        }
      };
    
    case ACTIONS.REMOVE_FROM_BOOKSHELF:
      return {
        ...state,
        bookshelves: {
          ...state.bookshelves,
          [action.payload.shelf]: state.bookshelves[action.payload.shelf].filter(
            book => book.id !== action.payload.bookId
          )
        }
      };
    
    case ACTIONS.MOVE_BOOK:
      const { book, fromShelf, toShelf } = action.payload;
      const newState = { ...state };
      
      // Remover del estante anterior
      newState.bookshelves[fromShelf] = newState.bookshelves[fromShelf].filter(
        b => b.id !== book.id
      );
      
      // Agregar al nuevo estante
      newState.bookshelves[toShelf] = [...newState.bookshelves[toShelf], book];
      
      return newState;
    
    case ACTIONS.ADD_SEARCH_TERM:
      const newHistory = [action.payload, ...state.searchHistory.filter(term => term !== action.payload)];
      return {
        ...state,
        searchHistory: newHistory.slice(0, 10) // Mantener solo los últimos 10
      };
    
    case ACTIONS.TOGGLE_FAVORITE:
      const isFavorite = state.favorites.some(book => book.id === action.payload.id);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(book => book.id !== action.payload.id)
          : [...state.favorites, action.payload]
      };
    
    default:
      return state;
  }
};

// Context
const LibraryContext = createContext();

// Provider
export const LibraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedBookshelves = localStorage.getItem('bookshelves');
    const savedSearchHistory = localStorage.getItem('searchHistory');
    const savedFavorites = localStorage.getItem('favorites');

    if (savedBookshelves) {
      dispatch({
        type: ACTIONS.SET_BOOKSHELVES,
        payload: JSON.parse(savedBookshelves)
      });
    }

    if (savedSearchHistory) {
      dispatch({
        type: ACTIONS.SET_SEARCH_HISTORY,
        payload: JSON.parse(savedSearchHistory)
      });
    }

    if (savedFavorites) {
      dispatch({
        type: ACTIONS.SET_FAVORITES,
        payload: JSON.parse(savedFavorites)
      });
    }
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('bookshelves', JSON.stringify(state.bookshelves));
  }, [state.bookshelves]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
  }, [state.searchHistory]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Funciones de ayuda
  const addToBookshelf = (book, shelf) => {
    dispatch({
      type: ACTIONS.ADD_TO_BOOKSHELF,
      payload: { book, shelf }
    });
  };

  const removeFromBookshelf = (bookId, shelf) => {
    dispatch({
      type: ACTIONS.REMOVE_FROM_BOOKSHELF,
      payload: { bookId, shelf }
    });
  };

  const moveBook = (book, fromShelf, toShelf) => {
    dispatch({
      type: ACTIONS.MOVE_BOOK,
      payload: { book, fromShelf, toShelf }
    });
  };

  const addSearchTerm = (term) => {
    dispatch({
      type: ACTIONS.ADD_SEARCH_TERM,
      payload: term
    });
  };

  const toggleFavorite = (book) => {
    dispatch({
      type: ACTIONS.TOGGLE_FAVORITE,
      payload: book
    });
  };

  const isBookInShelf = (bookId, shelf) => {
    return state.bookshelves[shelf].some(book => book.id === bookId);
  };

  const isFavorite = (bookId) => {
    return state.favorites.some(book => book.id === bookId);
  };

  const value = {
    ...state,
    addToBookshelf,
    removeFromBookshelf,
    moveBook,
    addSearchTerm,
    toggleFavorite,
    isBookInShelf,
    isFavorite
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

// Hook personalizado
export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};