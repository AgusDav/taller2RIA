import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BookCard from '../components/books/BookCard';
import BookCarousel from '../components/books/BookCarousel';
import SearchBar from '../components/search/SearchBar';
import { 
  getPopularBooks, 
  getRecentBooks, 
  getBooksByCategory 
} from '../services/googleBooksAPI';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredBook, setFeaturedBook] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [fictionBooks, setFictionBooks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [popularData, recentData, fictionData] = await Promise.all([
        getPopularBooks(),
        getRecentBooks(),
        getBooksByCategory('fiction')
      ]);

      setPopularBooks(popularData.books.slice(0, 10));
      setRecentBooks(recentData.books.slice(0, 10));
      setFictionBooks(fictionData.books.slice(0, 10));

      // Seleccionar libro destacado de los populares
      if (popularData.books.length > 0) {
        setFeaturedBook(popularData.books[0]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p>Cargando biblioteca...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>¡Oops! Algo salió mal</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadDashboardData}>
            Intentar de nuevo
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="hero-section bg-gradient p-5 rounded-3 text-white position-relative overflow-hidden">
            <div className="hero-background"></div>
            <div className="position-relative z-index-1">
              <Row className="align-items-center">
                <Col md={8}>
                  <h1 className="display-4 fw-bold mb-3">
                    Descubre tu próxima gran lectura
                  </h1>
                  <p className="lead mb-4">
                    Explora miles de libros, organiza tu biblioteca personal y 
                    encuentra recomendaciones perfectas para ti.
                  </p>
                  <SearchBar placeholder="Buscar libros, autores, géneros..." />
                </Col>
                {featuredBook && (
                  <Col md={4} className="text-center">
                    <Card className="featured-book shadow-lg">
                      <Card.Img
                        variant="top"
                        src={featuredBook.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:')}
                        alt={featuredBook.volumeInfo?.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title className="text-dark">
                          {featuredBook.volumeInfo?.title}
                        </Card.Title>
                        <Button 
                          as={Link} 
                          to={`/book/${featuredBook.id}`}
                          variant="primary"
                          size="sm"
                        >
                          Ver Detalles
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-primary mb-2">📚</div>
              <Card.Title>Explora</Card.Title>
              <Card.Text>
                Miles de libros de todos los géneros esperándote
              </Card.Text>
              <Button as={Link} to="/search" variant="outline-primary">
                Comenzar a explorar
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-success mb-2">🏷️</div>
              <Card.Title>Organiza</Card.Title>
              <Card.Text>
                Crea tu biblioteca personal con estantes virtuales
              </Card.Text>
              <Button as={Link} to="/my-library" variant="outline-success">
                Mi Biblioteca
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="display-4 text-warning mb-2">⭐</div>
              <Card.Title>Descubre</Card.Title>
              <Card.Text>
                Recibe recomendaciones basadas en tus gustos
              </Card.Text>
              <Button variant="outline-warning" disabled>
                Próximamente
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección de libros populares */}
      {popularBooks.length > 0 && (
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold">📈 Libros Populares</h3>
              <Button as={Link} to="/search?filter=popular" variant="outline-primary" size="sm">
                Ver todos
              </Button>
            </div>
            <BookCarousel books={popularBooks} />
          </Col>
        </Row>
      )}

      {/* Sección de libros recientes */}
      {recentBooks.length > 0 && (
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold">🆕 Lanzamientos Recientes</h3>
              <Button as={Link} to="/search?filter=recent" variant="outline-primary" size="sm">
                Ver todos
              </Button>
            </div>
            <BookCarousel books={recentBooks} />
          </Col>
        </Row>
      )}

      {/* Sección de ficción */}
      {fictionBooks.length > 0 && (
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold">📖 Ficción Destacada</h3>
              <Button as={Link} to="/search?category=fiction" variant="outline-primary" size="sm">
                Ver todos
              </Button>
            </div>
            <BookCarousel books={fictionBooks} />
          </Col>
        </Row>
      )}

      {/* Call to Action */}
      <Row className="mb-5">
        <Col>
          <Card className="bg-light">
            <Card.Body className="text-center py-5">
              <h4 className="fw-bold mb-3">¿No encuentras lo que buscas?</h4>
              <p className="mb-4">
                Utiliza nuestra búsqueda avanzada para encontrar libros específicos 
                por autor, género, año o palabras clave.
              </p>
              <Button as={Link} to="/search" variant="primary" size="lg">
                Búsqueda Avanzada
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;