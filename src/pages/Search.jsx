import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/books/BookCard';
import FilterPanel from '../components/search/filterPanel';
import SearchBar from '../components/search/SearchBar';
import LoadingSpinner, { BookLoadingSpinner } from '../components/common/LoadingSpinner';
import { useBooks } from '../hooks/useBooks';
import { useLibrary } from '../context/LibraryContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'newest', 'title'
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 20;

  // Estados para filtros
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    author: searchParams.get('author') || '',
    language: searchParams.get('language') || '',
    publishedAfter: searchParams.get('publishedAfter') || '',
    publishedBefore: searchParams.get('publishedBefore') || ''
  });

  const { addSearchTerm } = useLibrary();
  
  // Hook personalizado para manejar búsquedas
  const { 
    books, 
    loading, 
    error, 
    totalItems, 
    searchBooks, 
    loadMore,
    hasMore 
  } = useBooks();

  // Ejecutar búsqueda cuando cambien los filtros
  useEffect(() => {
    if (filters.query || filters.category || filters.author) {
      performSearch();
    }
  }, [filters, sortBy, currentPage]);

  // Actualizar filtros desde URL
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    
    if (queryFromUrl || categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        query: queryFromUrl,
        category: categoryFromUrl
      }));
    }
  }, [searchParams]);

  const performSearch = async () => {
    try {
      let searchQuery = '';
      
      // Construir query de búsqueda
      if (filters.query) {
        searchQuery = filters.query;
      }
      
      if (filters.author) {
        searchQuery += (searchQuery ? ' ' : '') + `inauthor:"${filters.author}"`;
      }
      
      if (filters.category) {
        searchQuery += (searchQuery ? ' ' : '') + `subject:"${filters.category}"`;
      }

      const startIndex = (currentPage - 1) * booksPerPage;
      
      await searchBooks(searchQuery, {
        startIndex,
        maxResults: booksPerPage,
        orderBy: sortBy,
        langRestrict: filters.language || null
      });

      // Agregar al historial si es una búsqueda por query
      if (filters.query) {
        addSearchTerm(filters.query);
      }

    } catch (err) {
      console.error('Error in search:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Actualizar URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: '',
      author: '',
      language: '',
      publishedAfter: '',
      publishedBefore: ''
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <Container fluid className="px-4">
      <Row>
        {/* Sidebar de filtros */}
        <Col lg={3} className="mb-4">
          <div className="position-sticky" style={{ top: '20px' }}>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
        </Col>

        {/* Contenido principal */}
        <Col lg={9}>
          {/* Barra de búsqueda principal */}
          <div className="mb-4">
            <SearchBar 
              size="md"
              placeholder="Buscar libros, autores, géneros..."
            />
          </div>

          {/* Controles de vista y ordenamiento */}
          <Row className="mb-4 align-items-center">
            <Col md={6}>
              {totalItems > 0 && (
                <p className="text-muted mb-0">
                  Mostrando {books.length} de {totalItems.toLocaleString()} resultados
                  {filters.query && ` para "${filters.query}"`}
                </p>
              )}
            </Col>
            
            <Col md={6}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                {/* Selector de ordenamiento */}
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="relevance">Relevancia</option>
                  <option value="newest">Más nuevos</option>
                  <option value="title">Título A-Z</option>
                </Form.Select>

                {/* Selector de vista */}
                <div className="btn-group" role="group">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    ⚏
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </Button>
                </div>
              </div>
            </Col>
          </Row>

          {/* Estados de carga y error */}
          {loading && currentPage === 1 && (
            <BookLoadingSpinner count={8} />
          )}

          {error && (
            <Alert variant="danger" className="text-center">
              <Alert.Heading>Error en la búsqueda</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={performSearch}>
                Intentar de nuevo
              </Button>
            </Alert>
          )}

          {/* Resultados */}
          {!loading && books.length === 0 && (filters.query || filters.category || filters.author) && (
            <div className="text-center py-5">
              <div className="mb-4">
                <span style={{ fontSize: '4rem' }}>📚🔍</span>
              </div>
              <h4>No se encontraron resultados</h4>
              <p className="text-muted mb-4">
                Intenta ajustar tus filtros de búsqueda o usa términos diferentes.
              </p>
              <Button variant="primary" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Vista de resultados */}
          {books.length > 0 && (
            <>
              <div className={viewMode === 'grid' ? 'books-grid' : 'books-list'}>
                {books.map((book, index) => (
                  <div key={`${book.id}-${index}`} className="book-item">
                    <BookCard 
                      book={book} 
                      showShelfActions={true}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>

              {/* Botón cargar más */}
              {hasMore && (
                <div className="text-center mt-4">
                  {loading && currentPage > 1 ? (
                    <LoadingSpinner message="Cargando más libros..." />
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={handleLoadMore}
                      className="px-5"
                    >
                      Cargar más libros
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Estado inicial - sin búsqueda */}
          {!loading && books.length === 0 && !filters.query && !filters.category && !filters.author && (
            <div className="text-center py-5">
              <div className="mb-4">
                <span style={{ fontSize: '4rem' }}>🔍📖</span>
              </div>
              <h4>Explora nuestra biblioteca</h4>
              <p className="text-muted mb-4">
                Utiliza la barra de búsqueda o los filtros para encontrar libros increíbles.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleFilterChange({ ...filters, category: 'fiction' })}
                >
                  Ficción
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleFilterChange({ ...filters, category: 'mystery' })}
                >
                  Misterio
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleFilterChange({ ...filters, category: 'romance' })}
                >
                  Romance
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleFilterChange({ ...filters, category: 'science' })}
                >
                  Ciencia
                </Button>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <style jsx>{`
        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .books-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .books-list .book-item {
          max-width: 100%;
        }
        
        @media (max-width: 768px) {
          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default Search;