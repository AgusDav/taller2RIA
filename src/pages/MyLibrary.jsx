import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Nav, 
  Tab, 
  Badge,
  Button,
  Alert,
  ProgressBar,
  Dropdown
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import BookCard from '../components/books/BookCard';
import BookshelfManager from '../components/books/BookshelfManager';

const MyLibrary = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, title, author, rating
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  
  const { bookshelves, favorites } = useLibrary();

  // Calcular estadísticas
  const stats = {
    totalBooks: Object.values(bookshelves).reduce((total, shelf) => total + shelf.length, 0),
    toRead: bookshelves.toRead.length,
    reading: bookshelves.reading.length,
    read: bookshelves.read.length,
    favorites: favorites.length,
    totalPages: Object.values(bookshelves)
      .flat()
      .reduce((total, book) => total + (book.pageCount || 0), 0),
    avgRating: (() => {
      const booksWithRating = Object.values(bookshelves)
        .flat()
        .filter(book => book.averageRating > 0);
      if (booksWithRating.length === 0) return 0;
      return booksWithRating.reduce((sum, book) => sum + book.averageRating, 0) / booksWithRating.length;
    })()
  };

  // Funciones de utilidad
  const sortBooks = (books, sortBy) => {
    const sorted = [...books];
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'author':
        return sorted.sort((a, b) => (a.authors[0] || '').localeCompare(b.authors[0] || ''));
      case 'rating':
        return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'dateAdded':
      default:
        return sorted.reverse(); // Más recientes primero
    }
  };

  const getGenreStats = () => {
    const allBooks = Object.values(bookshelves).flat();
    const genreCount = {};
    
    allBooks.forEach(book => {
      if (book.categories) {
        book.categories.forEach(category => {
          genreCount[category] = (genreCount[category] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getReadingProgress = () => {
    if (stats.totalBooks === 0) return 0;
    return Math.round((stats.read / stats.totalBooks) * 100);
  };

  const renderBookShelf = (books, shelfName, emptyMessage) => {
    const sortedBooks = sortBooks(books, sortBy);

    if (sortedBooks.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>📚</span>
          </div>
          <h5 className="text-muted">{emptyMessage}</h5>
          <Button as={Link} to="/search" variant="outline-primary" className="mt-2">
            Explorar libros
          </Button>
        </div>
      );
    }

    return (
      <div className={viewMode === 'grid' ? 'books-grid' : 'books-list'}>
        {sortedBooks.map((book, index) => (
          <BookCard
            key={`${book.id}-${index}`}
            book={book}
            showShelfActions={true}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  };

  if (stats.totalBooks === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="mb-4">
            <span style={{ fontSize: '5rem' }}>📚</span>
          </div>
          <h2 className="fw-bold mb-3">¡Bienvenido a tu biblioteca personal!</h2>
          <p className="lead text-white mb-4">
            Comienza a construir tu colección de libros favoritos. 
            Organiza tus lecturas en estantes virtuales y lleva un registro de tu progreso.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/search" variant="primary" size="lg">
              🔍 Explorar libros
            </Button>
            <Button as={Link} to="/" variant="outline-primary" size="lg">
              🏠 Ir al inicio
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold">📚 Mi Biblioteca</h1>
            <div className="d-flex gap-2">
              {/* Selector de ordenamiento */}
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  Ordenar por: {
                    sortBy === 'dateAdded' ? 'Fecha agregado' :
                    sortBy === 'title' ? 'Título' :
                    sortBy === 'author' ? 'Autor' :
                    'Rating'
                  }
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSortBy('dateAdded')}>
                    📅 Fecha agregado
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('title')}>
                    🔤 Título A-Z
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('author')}>
                    👤 Autor A-Z
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('rating')}>
                    ⭐ Rating
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

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
          </div>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col lg={3} className="mb-4">
            {/* Sidebar con estadísticas y navegación */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0 fw-bold">📊 Estadísticas</h6>
              </Card.Header>
              <Card.Body>
                <div className="stats-grid">
                  <div className="stat-item text-center">
                    <div className="stat-number text-primary fw-bold fs-3">
                      {stats.totalBooks}
                    </div>
                    <div className="stat-label text-white small">Total de libros</div>
                  </div>
                  
                  <div className="stat-item text-center">
                    <div className="stat-number text-success fw-bold fs-4">
                      {stats.read}
                    </div>
                    <div className="stat-label text-white small">Leídos</div>
                  </div>
                  
                  <div className="stat-item text-center">
                    <div className="stat-number text-warning fw-bold fs-4">
                      {stats.reading}
                    </div>
                    <div className="stat-label text-white small">Leyendo</div>
                  </div>
                  
                  <div className="stat-item text-center">
                    <div className="stat-number text-info fw-bold fs-4">
                      {stats.toRead}
                    </div>
                    <div className="stat-label text-white small">Por leer</div>
                  </div>
                </div>

                <hr />

                {/* Progreso de lectura */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="fw-bold text-white">Progreso de lectura</small>
                    <small>{getReadingProgress()}%</small>
                  </div>
                  <ProgressBar 
                    now={getReadingProgress()} 
                    variant="success"
                    style={{ height: '8px' }}
                  />
                </div>

                {/* Estadísticas adicionales */}
                <div className="small text-white">
                  <div className="d-flex justify-content-between mb-1">
                    <span>📄 Total páginas:</span>
                    <span className="fw-bold">{stats.totalPages.toLocaleString()}</span>
                  </div>
                  {stats.avgRating > 0 && (
                    <div className="d-flex justify-content-between mb-1">
                      <span>⭐ Rating promedio:</span>
                      <span className="fw-bold">{stats.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between">
                    <span>❤️ Favoritos:</span>
                    <span className="fw-bold">{stats.favorites}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Géneros favoritos */}
            {getGenreStats().length > 0 && (
              <Card className="shadow-sm mb-4 text-white">
                <Card.Header>
                  <h6 className="mb-0 fw-bold">🏷️ Géneros favoritos</h6>
                </Card.Header>
                <Card.Body>
                  {getGenreStats().map(([genre, count], index) => (
                    <div key={genre} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small">{genre}</span>
                      <Badge bg="secondary">{count}</Badge>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* Navegación de estantes */}
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="d-flex justify-content-between">
                  📊 Resumen
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reading" className="d-flex justify-content-between">
                  📖 Leyendo
                  <Badge bg="warning">{stats.reading}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="toRead" className="d-flex justify-content-between">
                  📚 Por leer
                  <Badge bg="info">{stats.toRead}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="read" className="d-flex justify-content-between">
                  ✅ Leídos
                  <Badge bg="success">{stats.read}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="favorites" className="d-flex justify-content-between">
                  ❤️ Favoritos
                  <Badge bg="danger">{stats.favorites}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="manage" className="d-flex justify-content-between">
                  ⚙️ Gestionar
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col lg={9}>
            <Tab.Content>
              {/* Resumen */}
              <Tab.Pane eventKey="overview">
                <h3 className="fw-bold mb-4">📊 Resumen de tu biblioteca</h3>
                
                {/* Actividad reciente */}
                <Row>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Header>
                        <h6 className="mb-0">📖 Leyendo actualmente</h6>
                      </Card.Header>
                      <Card.Body>
                        {stats.reading > 0 ? (
                          renderBookShelf(
                            bookshelves.reading.slice(0, 3), 
                            'reading',
                            ''
                          )
                        ) : (
                          <p className="text-white">No tienes libros marcados como "leyendo"</p>
                        )}
                        {stats.reading > 3 && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => setActiveTab('reading')}
                          >
                            Ver todos ({stats.reading})
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Header>
                        <h6 className="mb-0">❤️ Favoritos recientes</h6>
                      </Card.Header>
                      <Card.Body>
                        {stats.favorites > 0 ? (
                          renderBookShelf(
                            favorites.slice(0, 3), 
                            'favorites',
                            ''
                          )
                        ) : (
                          <p className="text-white">No tienes libros favoritos aún</p>
                        )}
                        {stats.favorites > 3 && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => setActiveTab('favorites')}
                          >
                            Ver todos ({stats.favorites})
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Leyendo */}
              <Tab.Pane eventKey="reading">
                <h3 className="fw-bold mb-4">📖 Leyendo actualmente</h3>
                {renderBookShelf(
                  bookshelves.reading,
                  'reading',
                  'No tienes libros marcados como "leyendo" actualmente.'
                )}
              </Tab.Pane>

              {/* Por leer */}
              <Tab.Pane eventKey="toRead">
                <h3 className="fw-bold mb-4">📚 Por leer</h3>
                {renderBookShelf(
                  bookshelves.toRead,
                  'toRead',
                  'Tu lista de "por leer" está vacía. ¡Agrega algunos libros!'
                )}
              </Tab.Pane>

              {/* Leídos */}
              <Tab.Pane eventKey="read">
                <h3 className="fw-bold mb-4">✅ Libros leídos</h3>
                {renderBookShelf(
                  bookshelves.read,
                  'read',
                  'Aún no has marcado ningún libro como leído.'
                )}
              </Tab.Pane>

              {/* Favoritos */}
              <Tab.Pane eventKey="favorites">
                <h3 className="fw-bold mb-4">❤️ Tus libros favoritos</h3>
                {renderBookShelf(
                  favorites,
                  'favorites',
                  'No has marcado ningún libro como favorito aún.'
                )}
              </Tab.Pane>

              {/* Gestión */}
              <Tab.Pane eventKey="manage">
                <h3 className="fw-bold mb-4">⚙️ Gestionar biblioteca</h3>
                <BookshelfManager />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

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
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat-item {
          padding: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default MyLibrary;