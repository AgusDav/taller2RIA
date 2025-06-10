import React, { useState } from 'react';
import { 
  Modal, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Dropdown,
  ButtonGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { normalizeBookData } from '../../services/googleBooksAPI';

const BookModal = ({ show, onHide, book, onBookUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const {
    addToBookshelf,
    removeFromBookshelf,
    toggleFavorite,
    isBookInShelf,
    isFavorite
  } = useLibrary();

  if (!book) return null;

  const normalizedBook = normalizeBookData(book);
  const {
    id,
    title,
    authors,
    description,
    thumbnail,
    publishedDate,
    pageCount,
    categories,
    language,
    publisher,
    averageRating,
    ratingsCount,
    previewLink,
    infoLink
  } = normalizedBook;

  // Funciones para manejar acciones
  const handleAddToShelf = async (shelf) => {
    try {
      setLoading(true);
      setError(null);
      addToBookshelf(normalizedBook, shelf);
      if (onBookUpdate) onBookUpdate(normalizedBook, 'added', shelf);
    } catch (err) {
      setError('Error al agregar el libro al estante');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShelf = async (shelf) => {
    try {
      setLoading(true);
      setError(null);
      removeFromBookshelf(id, shelf);
      if (onBookUpdate) onBookUpdate(normalizedBook, 'removed', shelf);
    } catch (err) {
      setError('Error al remover el libro del estante');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);
      setError(null);
      const wasFavorite = isFavorite(id);
      toggleFavorite(normalizedBook);
      if (onBookUpdate) {
        onBookUpdate(normalizedBook, wasFavorite ? 'unfavorited' : 'favorited');
      }
    } catch (err) {
      setError('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Mira este libro: ${title} por ${authors.join(', ')}`,
      url: window.location.origin + `/book/${id}`
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Enlace copiado al portapapeles');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const formatDescription = (desc) => {
    if (!desc || desc === 'No description available') return null;
    
    // Truncar descripción si es muy larga
    const maxLength = 500;
    if (desc.length > maxLength) {
      return desc.substring(0, maxLength) + '...';
    }
    return desc;
  };

  const getYear = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('-')[0];
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">📖 Información del libro</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Row>
          {/* Imagen del libro */}
          <Col md={4} className="text-center mb-4">
            <div className="position-relative d-inline-block">
              {!imageError && thumbnail ? (
                <img
                  src={thumbnail.replace('http:', 'https:')}
                  alt={title}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div 
                  className="d-flex align-items-center justify-content-center bg-light rounded shadow"
                  style={{ width: '200px', height: '300px' }}
                >
                  <span className="display-4">📖</span>
                </div>
              )}
              
              {/* Botón de favorito */}
              <Button
                variant={isFavorite(id) ? "danger" : "outline-danger"}
                size="sm"
                className="position-absolute top-0 end-0 rounded-circle"
                style={{ transform: 'translate(25%, -25%)', width: '35px', height: '35px' }}
                onClick={handleToggleFavorite}
                disabled={loading}
              >
                ❤️
              </Button>
            </div>

            {/* Información rápida */}
            <div className="mt-3 text-start">
              <small className="text-muted d-block">
                📄 {pageCount || 'N/A'} páginas
              </small>
              <small className="text-muted d-block">
                🌍 {language ? language.toUpperCase() : 'N/A'}
              </small>
              <small className="text-muted d-block">
                📅 {getYear(publishedDate)}
              </small>
              {publisher && (
                <small className="text-muted d-block">
                  🏢 {publisher}
                </small>
              )}
            </div>
          </Col>

          {/* Información del libro */}
          <Col md={8}>
            <div className="mb-3">
              <h4 className="fw-bold mb-2">{title}</h4>
              <p className="text-muted mb-2">
                <strong>Por:</strong> {authors.join(', ')}
              </p>

              {/* Rating */}
              {averageRating > 0 && (
                <div className="d-flex align-items-center mb-3">
                  <span className="text-warning me-2">⭐</span>
                  <span className="fw-bold me-2">{averageRating.toFixed(1)}</span>
                  {ratingsCount > 0 && (
                    <small className="text-muted">({ratingsCount} reseñas)</small>
                  )}
                </div>
              )}

              {/* Categorías */}
              {categories.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((category, index) => (
                      <Badge key={index} bg="secondary" className="px-2 py-1">
                        {category}
                      </Badge>
                    ))}
                    {categories.length > 3 && (
                      <Badge bg="light" text="dark" className="px-2 py-1">
                        +{categories.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="mb-4">
                <h6 className="fw-bold">📝 Descripción:</h6>
                {formatDescription(description) ? (
                  <p className="small text-muted" style={{ lineHeight: '1.6' }}>
                    {formatDescription(description)}
                  </p>
                ) : (
                  <p className="small text-muted fst-italic">
                    No hay descripción disponible.
                  </p>
                )}
              </div>

              {/* Acciones principales */}
              <div className="d-grid gap-2">
                <Dropdown as={ButtonGroup}>
                  <Button 
                    variant="primary" 
                    className="flex-grow-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      '📚 Agregar a biblioteca'
                    )}
                  </Button>

                  <Dropdown.Toggle 
                    split 
                    variant="primary" 
                    disabled={loading}
                  />

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
                        <Dropdown.Header>Remover de:</Dropdown.Header>
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
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    as={Link}
                    to={`/book/${id}`}
                    onClick={onHide}
                    className="flex-grow-1"
                  >
                    🔍 Ver detalles completos
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleShare}
                    className="flex-grow-1"
                  >
                    📤 Compartir
                  </Button>
                </div>

                {/* Enlaces externos */}
                {(previewLink || infoLink) && (
                  <div className="d-flex gap-2 mt-2">
                    {previewLink && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        href={previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow-1"
                      >
                        📖 Vista previa
                      </Button>
                    )}
                    {infoLink && (
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        href={infoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow-1"
                      >
                        ℹ️ Más info
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookModal;