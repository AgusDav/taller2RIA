import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Alert, 
  Modal,
  Form,
  Table,
  Badge,
  ProgressBar,
  Accordion
} from 'react-bootstrap';
import { useLibrary } from '../../context/LibraryContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const BookshelfManager = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [notification, setNotification] = useState(null);

  const { 
    bookshelves, 
    favorites,
    searchHistory,
    addToBookshelf,
    removeFromBookshelf,
    moveBook
  } = useLibrary();

  // Calcular estadísticas detalladas
  const getDetailedStats = () => {
    const allBooks = Object.values(bookshelves).flat();
    const uniqueBooks = new Set(allBooks.map(book => book.id));
    
    const genreStats = {};
    const authorStats = {};
    const yearStats = {};
    
    allBooks.forEach(book => {
      // Géneros
      if (book.categories) {
        book.categories.forEach(category => {
          genreStats[category] = (genreStats[category] || 0) + 1;
        });
      }
      
      // Autores
      if (book.authors) {
        book.authors.forEach(author => {
          authorStats[author] = (authorStats[author] || 0) + 1;
        });
      }
      
      // Años
      if (book.publishedDate) {
        const year = book.publishedDate.split('-')[0];
        yearStats[year] = (yearStats[year] || 0) + 1;
      }
    });

    return {
      totalBooks: allBooks.length,
      uniqueBooks: uniqueBooks.size,
      duplicates: allBooks.length - uniqueBooks.size,
      totalPages: allBooks.reduce((sum, book) => sum + (book.pageCount || 0), 0),
      averagePages: Math.round(allBooks.reduce((sum, book) => sum + (book.pageCount || 0), 0) / allBooks.length) || 0,
      topGenres: Object.entries(genreStats).sort(([,a], [,b]) => b - a).slice(0, 5),
      topAuthors: Object.entries(authorStats).sort(([,a], [,b]) => b - a).slice(0, 5),
      yearRange: {
        oldest: Math.min(...Object.keys(yearStats).map(Number).filter(n => !isNaN(n))),
        newest: Math.max(...Object.keys(yearStats).map(Number).filter(n => !isNaN(n)))
      }
    };
  };

  const stats = getDetailedStats();

  // Exportar datos
  const handleExport = () => {
    const exportData = {
      bookshelves,
      favorites,
      searchHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = `biblioteca-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        const allBooks = Object.values(bookshelves).flat();
        const csvHeader = 'Título,Autor,Categoría,Estante,Páginas,Año,Rating\n';
        const csvContent = allBooks.map(book => {
          const shelf = Object.entries(bookshelves).find(([, books]) => 
            books.some(b => b.id === book.id)
          )?.[0] || '';
          
          return [
            `"${book.title || ''}"`,
            `"${book.authors ? book.authors.join(', ') : ''}"`,
            `"${book.categories ? book.categories[0] : ''}"`,
            shelf,
            book.pageCount || 0,
            book.publishedDate ? book.publishedDate.split('-')[0] : '',
            book.averageRating || ''
          ].join(',');
        }).join('\n');
        
        content = csvHeader + csvContent;
        filename = `biblioteca-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    showNotification('Datos exportados exitosamente', 'success');
  };

  // Importar datos
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      if (data.bookshelves && data.favorites) {
        // Validar estructura básica
        Object.entries(data.bookshelves).forEach(([shelf, books]) => {
          books.forEach(book => {
            if (book.id && book.title) {
              addToBookshelf(book, shelf);
            }
          });
        });

        setShowImportModal(false);
        setImportData('');
        showNotification('Datos importados exitosamente', 'success');
      } else {
        throw new Error('Formato de archivo inválido');
      }
    } catch (error) {
      showNotification('Error al importar: ' + error.message, 'danger');
    }
  };

  // Limpiar biblioteca
  const handleClearLibrary = () => {
    localStorage.removeItem('bookshelves');
    localStorage.removeItem('favorites');
    localStorage.removeItem('searchHistory');
    
    // Recargar la página para reiniciar el estado
    window.location.reload();
  };

  // Encontrar duplicados
  const findDuplicates = () => {
    const allBooks = Object.values(bookshelves).flat();
    const seen = new Set();
    const duplicates = [];

    allBooks.forEach(book => {
      const key = `${book.title}-${book.authors?.[0]}`;
      if (seen.has(key)) {
        duplicates.push(book);
      } else {
        seen.add(key);
      }
    });

    return duplicates;
  };

  // Mostrar notificación
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Obtener libros sin categoría
  const getBooksWithoutCategory = () => {
    const allBooks = Object.values(bookshelves).flat();
    return allBooks.filter(book => !book.categories || book.categories.length === 0);
  };

  const duplicates = findDuplicates();
  const booksWithoutCategory = getBooksWithoutCategory();

  return (
    <div>
      {notification && (
        <Alert 
          variant={notification.type} 
          dismissible 
          onClose={() => setNotification(null)}
          className="mb-4"
        >
          {notification.message}
        </Alert>
      )}

      {/* Estadísticas detalladas */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0 fw-bold">📊 Estadísticas detalladas</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td><strong>Total de libros:</strong></td>
                    <td>{stats.totalBooks}</td>
                  </tr>
                  <tr>
                    <td><strong>Libros únicos:</strong></td>
                    <td>{stats.uniqueBooks}</td>
                  </tr>
                  <tr>
                    <td><strong>Duplicados:</strong></td>
                    <td>
                      {stats.duplicates}
                      {stats.duplicates > 0 && (
                        <Badge bg="warning" className="ms-2">!</Badge>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total páginas:</strong></td>
                    <td>{stats.totalPages.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Promedio páginas:</strong></td>
                    <td>{stats.averagePages}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Progreso de lectura:</strong>
                <ProgressBar 
                  now={bookshelves.read.length / stats.totalBooks * 100} 
                  label={`${Math.round(bookshelves.read.length / stats.totalBooks * 100)}%`}
                  className="mt-1"
                />
              </div>
              
              <div className="mb-2">
                <strong>Rango de años:</strong> {stats.yearRange.oldest} - {stats.yearRange.newest}
              </div>
              
              <div>
                <strong>Favoritos:</strong> {favorites.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Análisis y recomendaciones */}
      <Accordion className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header>🔍 Análisis de biblioteca</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold">📚 Géneros más populares:</h6>
                {stats.topGenres.map(([genre, count], index) => (
                  <div key={genre} className="d-flex justify-content-between mb-1">
                    <span>{genre}</span>
                    <Badge bg="primary">{count}</Badge>
                  </div>
                ))}
              </Col>
              <Col md={6}>
                <h6 className="fw-bold">✍️ Autores favoritos:</h6>
                {stats.topAuthors.map(([author, count], index) => (
                  <div key={author} className="d-flex justify-content-between mb-1">
                    <span>{author}</span>
                    <Badge bg="success">{count}</Badge>
                  </div>
                ))}
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            ⚠️ Problemas detectados 
            {(duplicates.length > 0 || booksWithoutCategory.length > 0) && (
              <Badge bg="warning" className="ms-2">
                {duplicates.length + booksWithoutCategory.length}
              </Badge>
            )}
          </Accordion.Header>
          <Accordion.Body>
            {duplicates.length > 0 && (
              <Alert variant="warning">
                <strong>Libros duplicados encontrados ({duplicates.length}):</strong>
                <ul className="mb-0 mt-2">
                  {duplicates.slice(0, 5).map((book, index) => (
                    <li key={index}>{book.title} - {book.authors?.[0]}</li>
                  ))}
                  {duplicates.length > 5 && <li>...y {duplicates.length - 5} más</li>}
                </ul>
              </Alert>
            )}

            {booksWithoutCategory.length > 0 && (
              <Alert variant="info">
                <strong>Libros sin categoría ({booksWithoutCategory.length}):</strong>
                <p className="mb-0 mt-2">
                  Algunos libros no tienen géneros asignados, lo que puede afectar las recomendaciones.
                </p>
              </Alert>
            )}

            {duplicates.length === 0 && booksWithoutCategory.length === 0 && (
              <Alert variant="success">
                <strong>¡Excelente!</strong> No se encontraron problemas en tu biblioteca.
              </Alert>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Herramientas de gestión */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0 fw-bold">🛠️ Herramientas de gestión</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="mb-2">📤</div>
                  <h6>Exportar biblioteca</h6>
                  <p className="small text-muted">
                    Descarga tu biblioteca en diferentes formatos
                  </p>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                  >
                    Exportar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="mb-2">📥</div>
                  <h6>Importar biblioteca</h6>
                  <p className="small text-muted">
                    Importa libros desde un archivo de respaldo
                  </p>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => setShowImportModal(true)}
                  >
                    Importar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="mb-2">🗑️</div>
                  <h6>Limpiar biblioteca</h6>
                  <p className="small text-muted">
                    Elimina todos los libros y datos guardados
                  </p>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => setShowClearModal(true)}
                  >
                    Limpiar
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal de exportación */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📤 Exportar biblioteca</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Formato de exportación:</Form.Label>
            <Form.Select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="json">JSON (completo con metadatos)</option>
              <option value="csv">CSV (solo información básica)</option>
            </Form.Select>
            <Form.Text className="text-muted">
              {exportFormat === 'json' 
                ? 'Incluye toda la información y puede ser reimportado completamente.'
                : 'Formato simple para hojas de cálculo, no incluye toda la información.'
              }
            </Form.Text>
          </Form.Group>
          
          <Alert variant="info">
            Se exportarán {stats.totalBooks} libros, {favorites.length} favoritos y 
            {searchHistory.length} búsquedas recientes.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Descargar archivo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de importación */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📥 Importar biblioteca</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Pega el contenido del archivo JSON:</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Pega aquí el contenido del archivo JSON exportado..."
            />
          </Form.Group>
          
          <Alert variant="warning">
            <strong>Atención:</strong> Esta acción agregará los libros a tu biblioteca actual. 
            No eliminará los libros existentes.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleImport}
            disabled={!importData.trim()}
          >
            Importar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación de limpieza */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Confirmar limpieza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>¡Atención!</strong> Esta acción eliminará permanentemente:
            <ul className="mt-2 mb-0">
              <li>Todos los libros de tus estantes ({stats.totalBooks} libros)</li>
              <li>Todos tus favoritos ({favorites.length} libros)</li>
              <li>Tu historial de búsquedas ({searchHistory.length} búsquedas)</li>
            </ul>
          </Alert>
          
          <p><strong>Esta acción no se puede deshacer.</strong></p>
          <p>Te recomendamos exportar tu biblioteca antes de continuar.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setShowClearModal(false);
              setShowExportModal(true);
            }}
          >
            Exportar primero
          </Button>
          <Button variant="danger" onClick={handleClearLibrary}>
            Eliminar todo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookshelfManager;