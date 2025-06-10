import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, Button, ListGroup, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

const SearchBar = ({ 
  placeholder = "Buscar libros, autores, géneros...", 
  size = "lg",
  showSuggestions = true 
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { searchHistory, addSearchTerm } = useLibrary();
  const searchRef = useRef(null);

  // Sugerencias predefinidas
  const defaultSuggestions = [
    "Stephen King",
    "Ficción científica",
    "Romance",
    "Misterio",
    "Biografías",
    "Historia",
    "Autoayuda",
    "Fantasía",
    "Thriller",
    "Clásicos"
  ];

  // Combinar historial con sugerencias predefinidas
  const getSuggestions = () => {
    const filtered = defaultSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase()) && suggestion.toLowerCase() !== query.toLowerCase()
    );
    
    const historyFiltered = searchHistory.filter(term =>
      term.toLowerCase().includes(query.toLowerCase()) && term.toLowerCase() !== query.toLowerCase()
    );

    // Combinar y limitar
    return [...new Set([...historyFiltered, ...filtered])].slice(0, 8);
  };

  // Manejar búsqueda
  const handleSearch = (searchTerm = query) => {
    if (searchTerm.trim()) {
      addSearchTerm(searchTerm.trim());
      setShowDropdown(false);
      setQuery('');
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Manejar submit del form
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(showSuggestions && value.length > 0);
  };

  // Manejar selección de sugerencia
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar teclas especiales
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const suggestions = showDropdown ? getSuggestions() : [];

  return (
    <div className="search-bar-container position-relative" ref={searchRef}>
      <Form onSubmit={handleSubmit}>
        <InputGroup size={size}>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(showSuggestions && query.length > 0)}
            className="search-input"
            style={{
              borderRadius: size === 'lg' ? '25px 0 0 25px' : '20px 0 0 20px'
            }}
          />
          <Button 
            variant="primary" 
            type="submit"
            style={{
              borderRadius: size === 'lg' ? '0 25px 25px 0' : '0 20px 20px 0'
            }}
          >
            🔍
          </Button>
        </InputGroup>
      </Form>

      {/* Dropdown de sugerencias */}
      {showDropdown && suggestions.length > 0 && (
        <Card className="position-absolute w-100 mt-1 shadow-lg" style={{ zIndex: 1050 }}>
          <ListGroup variant="flush">
            {suggestions.map((suggestion, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleSuggestionClick(suggestion)}
                className="d-flex align-items-center py-2"
                style={{ cursor: 'pointer' }}
              >
                <span className="me-2">
                  {searchHistory.includes(suggestion) ? '🕒' : '🔍'}
                </span>
                <span>{suggestion}</span>
                {searchHistory.includes(suggestion) && (
                  <small className="text-muted ms-auto">Búsqueda reciente</small>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      {/* Estilo para hover y focus */}
      <style jsx>{`
        .search-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          border-color: #80bdff;
        }
        
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
        
        .search-bar-container {
          max-width: 600px;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;