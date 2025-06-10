import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Accordion, 
  Badge, 
  Row, 
  Col,
  ButtonGroup 
} from 'react-bootstrap';

const FilterPanel = ({ filters, onFilterChange, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Categorías predefinidas
  const categories = [
    { value: 'fiction', label: 'Ficción', icon: '📖' },
    { value: 'mystery', label: 'Misterio', icon: '🔍' },
    { value: 'romance', label: 'Romance', icon: '💕' },
    { value: 'science fiction', label: 'Ciencia Ficción', icon: '🚀' },
    { value: 'fantasy', label: 'Fantasía', icon: '🧙‍♂️' },
    { value: 'thriller', label: 'Thriller', icon: '😱' },
    { value: 'biography', label: 'Biografía', icon: '👤' },
    { value: 'history', label: 'Historia', icon: '🏛️' },
    { value: 'science', label: 'Ciencia', icon: '🔬' },
    { value: 'business', label: 'Negocios', icon: '💼' },
    { value: 'self help', label: 'Autoayuda', icon: '🌟' },
    { value: 'cooking', label: 'Cocina', icon: '👨‍🍳' }
  ];

  // Idiomas disponibles
  const languages = [
    { value: '', label: 'Todos los idiomas' },
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Portugués' }
  ];

  // Años predefinidos para filtros rápidos
  const yearRanges = [
    { label: 'Este año', after: new Date().getFullYear(), before: '' },
    { label: 'Últimos 5 años', after: new Date().getFullYear() - 5, before: '' },
    { label: 'Últimos 10 años', after: new Date().getFullYear() - 10, before: '' },
    { label: 'Clásicos (antes 1950)', after: '', before: 1950 },
    { label: 'Siglo XX (1900-1999)', after: 1900, before: 1999 }
  ];

  const handleLocalFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      query: '',
      category: '',
      author: '',
      language: '',
      publishedAfter: '',
      publishedBefore: ''
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onClear();
  };

  const selectCategory = (category) => {
    const newFilters = { ...localFilters, category };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectYearRange = (range) => {
    const newFilters = {
      ...localFilters,
      publishedAfter: range.after.toString(),
      publishedBefore: range.before.toString()
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value && value.toString().trim() !== ''
  ).length;

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">🔍 Filtros</h6>
          {activeFiltersCount > 0 && (
            <Badge bg="light" text="dark">{activeFiltersCount}</Badge>
          )}
        </div>
      </Card.Header>

      <Card.Body className="p-3">
        <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
          {/* Búsqueda por texto */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>📝 Búsqueda por texto</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título o palabras clave</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Harry Potter, amor, aventura"
                  value={localFilters.query}
                  onChange={(e) => handleLocalFilterChange('query', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Autor</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Stephen King, García Márquez"
                  value={localFilters.author}
                  onChange={(e) => handleLocalFilterChange('author', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </Form.Group>

              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={applyFilters}
                className="w-100"
              >
                Aplicar búsqueda
              </Button>
            </Accordion.Body>
          </Accordion.Item>

          {/* Categorías */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>📚 Categorías</Accordion.Header>
            <Accordion.Body>
              <div className="category-grid">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={localFilters.category === cat.value ? 'primary' : 'outline-primary'}
                    size="sm"
                    className="category-btn"
                    onClick={() => selectCategory(cat.value)}
                  >
                    <span className="me-1">{cat.icon}</span>
                    {cat.label}
                  </Button>
                ))}
              </div>
              
              {localFilters.category && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mt-2 w-100"
                  onClick={() => selectCategory('')}
                >
                  Limpiar categoría
                </Button>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* Idioma */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>🌍 Idioma</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={localFilters.language}
                onChange={(e) => {
                  handleLocalFilterChange('language', e.target.value);
                  // Auto-aplicar filtro de idioma
                  setTimeout(() => applyFilters(), 100);
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Año de publicación */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>📅 Año de publicación</Accordion.Header>
            <Accordion.Body>
              {/* Filtros rápidos por año */}
              <div className="mb-3">
                <Form.Label className="small fw-bold">Filtros rápidos:</Form.Label>
                <div className="d-flex flex-wrap gap-1">
                  {yearRanges.map((range, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => selectYearRange(range)}
                      className="flex-fill"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtros personalizados */}
              <Row>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Desde año:</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="1900"
                      min="1000"
                      max={new Date().getFullYear()}
                      value={localFilters.publishedAfter}
                      onChange={(e) => handleLocalFilterChange('publishedAfter', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Hasta año:</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder={new Date().getFullYear()}
                      min="1000"
                      max={new Date().getFullYear()}
                      value={localFilters.publishedBefore}
                      onChange={(e) => handleLocalFilterChange('publishedBefore', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={applyFilters}
                className="w-100 mt-2"
              >
                Aplicar filtro de fecha
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Botones de acción */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={applyFilters}
              disabled={!Object.values(localFilters).some(v => v && v.toString().trim())}
            >
              🔍 Aplicar todos los filtros
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline-secondary" 
                onClick={resetFilters}
                size="sm"
              >
                🗑️ Limpiar todos los filtros
              </Button>
            )}
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted fw-bold">Filtros activos:</small>
            <div className="mt-2">
              {localFilters.query && (
                <Badge bg="primary" className="me-1 mb-1">
                  📝 "{localFilters.query}"
                </Badge>
              )}
              {localFilters.author && (
                <Badge bg="info" className="me-1 mb-1">
                  👤 {localFilters.author}
                </Badge>
              )}
              {localFilters.category && (
                <Badge bg="success" className="me-1 mb-1">
                  📚 {categories.find(c => c.value === localFilters.category)?.label}
                </Badge>
              )}
              {localFilters.language && (
                <Badge bg="warning" className="me-1 mb-1">
                  🌍 {languages.find(l => l.value === localFilters.language)?.label}
                </Badge>
              )}
              {(localFilters.publishedAfter || localFilters.publishedBefore) && (
                <Badge bg="secondary" className="me-1 mb-1">
                  📅 {localFilters.publishedAfter || '...'} - {localFilters.publishedBefore || '...'}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>

      <style jsx>{`
        .category-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        
        .category-btn {
          justify-content: flex-start;
          text-align: left;
          border-radius: 20px;
          padding: 0.5rem 0.75rem;
          transition: all 0.2s ease;
        }
        
        .category-btn:hover {
          transform: translateX(3px);
        }
        
        @media (min-width: 1400px) {
          .category-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </Card>
  );
};

export default FilterPanel;