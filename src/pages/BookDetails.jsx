import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Alert,
  Dropdown,
  ButtonGroup,
  Modal
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBook } from '../hooks/useBooks';
import { useLibrary } from '../context/LibraryContext';
import { normalizeBookData } from '../services/googleBooksAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookCarousel from '../components/books/BookCarousel';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, loading, error, loadBook } = useBook(id);
  const [showPreview, setShowPreview] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  
  const {
    addToBookshelf,
    removeFromBookshelf,
    toggleFavorite,
    isBookInShelf,
    isFavorite
  } = useLibrary();

  useEffect(() => {
    loadBook();
  }, [id, loadBook]);

  // Cargar libros relacionados cuando se carga el libro principal
  useEffect(() => {
    if (book && book.volumeInfo) {
      loadRelatedBooks();
    }
  }, [book]);

  const loadRelatedBooks = async () => {
    try {
      const { searchBooks } = await import('../services/googleBooksAPI');
      const categories = book.volumeInfo.categories;
      const authors = book.volumeInfo.authors;
      
      let query = '';
      if (categories && categories.length > 0) {
        query = `subject:"${categories[0]}"`;
      } else if (authors && authors.length > 0) {
        query = `inauthor:"${authors[0]}"`;
      } else {
        query = 'popular';
      }

      const result = await searchBooks(query, { maxResults: 10 });
      // Filtrar el libro actual de los relacionados
      const filtered = result.books.filter(relatedBook => relatedBook.id !== id);
      setRelatedBooks(filtered.slice(0, 8));
    } catch (err) {
      console.error('Error loading related books:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Cargando detalles del libro..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error al cargar el libro</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-danger" onClick={loadBook}>
              Intentar de nuevo
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver atrás
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Libro no encontrado</h4>
          <p>El libro que buscas no está disponible.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Ir al inicio
          </Button>
        </Alert>
      </Container>
    );
  }

  const normalizedBook = normalizeBookData(book);
  const {
    title,
    authors,
    description,
    thumbnail,
    publishedDate,
    pageCount,
    categories,
    language,
    publisher,
    isbn,
    averageRating,
    ratingsCount,
    previewLink,
    infoLink
  } = normalizedBook;

  // Funciones para manejar acciones
  const handleAddToShelf = (shelf) => {
    addToBookshelf(normalizedBook, shelf);
  };

  const handleRemoveFromShelf = (shelf) => {
    removeFromBookshelf(id, shelf);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(normalizedBook);
  };

  const handleShareBook = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Mira este libro: ${title} por ${authors.join(', ')}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('URL copiada al portapapeles');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getReadingTime = (pages) => {
    if (!pages) return 'Tiempo desconocido';
    const minutesPerPage = 2; // Promedio de lectura
    const totalMinutes = pages * minutesPerPage;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `~${hours}h ${minutes}m de lectura`;
    }
    return `~${minutes}m de lectura`;
  };

  return (
    <Container className="py-4">
      {/* Navegación */}
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
          ← Volver
        </Button>
        <Button variant="outline-primary" as={Link} to="/search">
          Buscar más libros
        </Button>
      </div>

      <Row>
        {/* Imagen y acciones principales */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm">
            <div className="position-relative">
              {thumbnail ? (
                <Card.Img
                  variant="top"
                  src={thumbnail.replace('http:', 'https:')}
                  alt={title}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: '400px' }}
                >
                  <span className="display-1">📖</span>
                </div>
              )}
              
              {/* Botón de favorito */}
              <Button
                variant={isFavorite(id) ? "danger" : "outline-danger"}
                className="position-absolute top-0 end-0 m-3 rounded-circle"
                onClick={handleToggleFavorite}
                style={{ width: '45px', height: '45px' }}
              >
                ❤️
              </Button>
            </div>

            <Card.Body>
              {/* Acciones principales */}
              <div className="d-grid gap-2 mb-3">
                <Dropdown as={ButtonGroup}>
                  <Button variant="primary" className="flex-grow-1">
                    📚 Agregar a Biblioteca
                  </Button>

                  <Dropdown.Toggle split variant="primary" />

                  <Dropdown.Menu>
                    <Dropdown.Item 
                      onClick={() => handleAddToShelf('toRead')}
                      disabled={isBookInShelf(id, 'toRead')}
                    >
                      📚 Por Leer {isBookInShelf(id, 'toRead') && '✓'}
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => handleAddToShelf('reading')}
                      disabled={isBookInShelf(id, 'reading')}
                    >
                      📖 Leyendo {isBookInShelf(id, 'reading') && '✓'}
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => handleAddToShelf('read')}
                      disabled={isBookInShelf(id, 'read')}
                    >
                      ✅ Leído {isBookInShelf(id, 'read') && '✓'}
                    </Dropdown.Item>
                    
                    {(isBookInShelf(id, 'toRead') || isBookInShelf(id, 'reading') || isBookInShelf(id, 'read')) && (
                      <>
                        <Dropdown.Divider />
                        {isBookInShelf(id, 'toRead') && (
                          <Dropdown.Item onClick={() => handleRemoveFromShelf('toRead')}>
                            ❌ Quitar de "Por Leer"
                          </Dropdown.Item>
                        )}
                        {isBookInShelf(id, 'reading') && (
                          <Dropdown.Item onClick={() => handleRemoveFromShelf('reading')}>
                            ❌ Quitar de "Leyendo"
                          </Dropdown.Item>
                        )}
                        {isBookInShelf(id, 'read') && (
                          <Dropdown.Item onClick={() => handleRemoveFromShelf('read')}>
                            ❌ Quitar de "Leído"
                          </Dropdown.Item>
                        )}
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                {/* Acciones secundarias */}
                <div className="d-flex gap-2">
                  {previewLink && (
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      className="flex-grow-1"
                    >
                      👁️ Vista previa
                    </Button>
                  )}
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleShareBook}
                    className="flex-grow-1"
                  >
                    📤 Compartir
                  </Button>
                </div>
              </div>

              {/* Información rápida */}
              <div className="border-top pt-3">
                <small className="text-white d-block mb-1">
                  📄 {pageCount || 'N/A'} páginas
                </small>
                <small className="text-white d-block mb-1">
                  ⏱️ {getReadingTime(pageCount)}
                </small>
                <small className="text-white d-block mb-1">
                  🌍 {language ? language.toUpperCase() : 'N/A'}
                </small>
                {isbn && (
                  <small className="text-white d-block">
                    📋 ISBN: {isbn}
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Información detallada */}
        <Col lg={8}>
          <div className="mb-4">
            <h1 className="display-6 fw-bold">{title}</h1>
            <p className="lead text-white">
              Por: {authors.join(', ')}
            </p>

            {/* Rating y metadata */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              {averageRating > 0 && (
                <div className="d-flex align-items-center">
                  <span className="text-warning me-2">⭐⭐⭐⭐⭐</span>
                  <span className="fw-bold">{averageRating.toFixed(1)}</span>
                  {ratingsCount > 0 && (
                    <span className="text-white ms-1">({ratingsCount} reseñas)</span>
                  )}
                </div>
              )}
              
              {publishedDate && (
                <Badge bg="secondary">
                  📅 {formatDate(publishedDate)}
                </Badge>
              )}
              
              {publisher && (
                <Badge bg="info">
                  🏢 {publisher}
                </Badge>
              )}
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Categorías:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <Badge key={index} bg="success" className="px-3 py-2">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">📖 Descripción</h5>
              {description && description !== 'No description available' ? (
                <div 
                  className="description-content"
                  dangerouslySetInnerHTML={{ 
                    __html: description.replace(/\n/g, '<br/>') 
                  }}
                />
              ) : (
                <p className="text-muted fst-italic">
                  No hay descripción disponible para este libro.
                </p>
              )}
            </div>

            {/* Enlaces adicionales */}
            {(infoLink || previewLink) && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Enlaces adicionales:</h6>
                <div className="d-flex gap-2">
                  {infoLink && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      href={infoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 Más información
                    </Button>
                  )}
                  {previewLink && (
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      href={previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📖 Leer muestra
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Libros relacionados */}
      {relatedBooks.length > 0 && (
        <Row className="mt-5">
          <Col>
            <h4 className="fw-bold mb-4">📚 Libros relacionados</h4>
            <BookCarousel books={relatedBooks} />
          </Col>
        </Row>
      )}

      {/* Modal de vista previa */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa - {title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewLink ? (
            <iframe
              src={previewLink}
              width="100%"
              height="600"
              title={`Vista previa de ${title}`}
              frameBorder="0"
            />
          ) : (
            <p>Vista previa no disponible</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Cerrar
          </Button>
          {previewLink && (
            <Button 
              variant="primary"
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir en Google Books
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .description-content {
          line-height: 1.7;
          font-size: 1rem;
        }
        
        .description-content p {
          margin-bottom: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default BookDetails;