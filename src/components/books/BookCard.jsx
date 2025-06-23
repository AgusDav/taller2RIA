import React, { useState } from 'react';
import { Card, Button, Badge, Dropdown, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { normalizeBookData } from '../../services/googleBooksAPI';

const BookCard = ({ book, showShelfActions = true }) => {
  const [imageError, setImageError] = useState(false);
  const {
    addToBookshelf,
    removeFromBookshelf,
    toggleFavorite,
    isBookInShelf,
    isFavorite
  } = useLibrary();

  const normalizedBook = normalizeBookData(book);
  const {
    id,
    title,
    authors,
    thumbnail,
    publishedDate,
    categories,
    averageRating,
    ratingsCount
  } = normalizedBook;

  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
  };

  // Agregar a estante
  const handleAddToShelf = (shelf) => {
    addToBookshelf(normalizedBook, shelf);
  };

  // Remover de estante
  const handleRemoveFromShelf = (shelf) => {
    removeFromBookshelf(id, shelf);
  };

  // Toggle favorito
  const handleToggleFavorite = () => {
    toggleFavorite(normalizedBook);
  };

  // Truncar texto largo
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Obtener año de publicación
  const getYear = (date) => {
    if (!date) return 'N/A';
    return date.split('-')[0];
  };

  return (
    <Card className="h-100 shadow-sm book-card">
      <div className="position-relative">
        {/* Imagen del libro */}
        <div className="book-cover-container" style={{ height: '200px', overflow: 'hidden' }}>
          {!imageError && thumbnail ? (
            <Card.Img
              variant="top"
              src={thumbnail.replace('http:', 'https:')}
              alt={title}
              onError={handleImageError}
              className="book-cover"
              style={{ 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center bg-light"
              style={{ height: '100%' }}
            >
              <span className="text-muted fs-1">📖</span>
            </div>
          )}
        </div>

        {/* Botón de favorito */}
        <Button
          variant={isFavorite(id) ? "danger" : "outline-danger"}
          size="sm"
          className="position-absolute top-0 end-0 m-2 rounded-circle"
          onClick={handleToggleFavorite}
          style={{ width: '35px', height: '35px' }}
        >
          ❤️
        </Button>
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Título */}
        <Card.Title className="fw-bold mb-2" style={{ fontSize: '1rem' }}>
          <Link 
            to={`/book/${id}`} 
            className="text-decoration-none text-white"
            title={title}
          >
            {truncateText(title, 60)}
          </Link>
        </Card.Title>

        {/* Autores */}
        <Card.Text className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
          Por: {authors.join(', ')}
        </Card.Text>

        {/* Rating y año */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          {averageRating > 0 ? (
            <div className="d-flex align-items-center">
              <span className="text-white me-1">⭐</span>
              <small className="text-white">
                {averageRating.toFixed(1)} 
                {ratingsCount > 0 && ` (${ratingsCount})`}
              </small>
            </div>
          ) : (
            <small className="text-white">Sin rating</small>
          )}
          
          <Badge bg="secondary">{getYear(publishedDate)}</Badge>
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="mb-2">
            <Badge bg="info" className="me-1">
              {categories[0]}
            </Badge>
          </div>
        )}

        {/* Spacer para empujar botones hacia abajo */}
        <div className="flex-grow-1"></div>

        {/* Acciones de estante */}
        {showShelfActions && (
          <div className="mt-2">
            <Dropdown as={ButtonGroup} className="w-100">
              <Button 
                variant="outline-primary" 
                size="sm"
                as={Link}
                to={`/book/${id}`}
                className="flex-grow-1"
              >
                Ver Detalles
              </Button>

              <Dropdown.Toggle 
                split 
                variant="outline-primary" 
                size="sm"
                id="dropdown-split-basic" 
              />

              <Dropdown.Menu>
                <Dropdown.Header>Agregar a:</Dropdown.Header>
                
                <Dropdown.Item 
                  onClick={() => handleAddToShelf('toRead')}
                  disabled={isBookInShelf(id, 'toRead')}
                >
                  📚 Por Leer
                  {isBookInShelf(id, 'toRead') && ' ✓'}
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => handleAddToShelf('reading')}
                  disabled={isBookInShelf(id, 'reading')}
                >
                  📖 Leyendo
                  {isBookInShelf(id, 'reading') && ' ✓'}
                </Dropdown.Item>
                
                <Dropdown.Item 
                  onClick={() => handleAddToShelf('read')}
                  disabled={isBookInShelf(id, 'read')}
                >
                  ✅ Leído
                  {isBookInShelf(id, 'read') && ' ✓'}
                </Dropdown.Item>

                <Dropdown.Divider />
                
                {/* Opciones para remover si está en algún estante */}
                {(isBookInShelf(id, 'toRead') || isBookInShelf(id, 'reading') || isBookInShelf(id, 'read')) && (
                  <>
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
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookCard;