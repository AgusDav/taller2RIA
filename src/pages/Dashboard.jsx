"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap"
import { Link } from "react-router-dom"
import BookCarousel from "../components/books/BookCarousel"
import SearchBar from "../components/search/SearchBar"
import { getPopularBooks, getRecentBooks, getBooksByCategory } from "../services/googleBooksAPI"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [featuredBook, setFeaturedBook] = useState(null)
  const [popularBooks, setPopularBooks] = useState([])
  const [recentBooks, setRecentBooks] = useState([])
  const [fictionBooks, setFictionBooks] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar datos en paralelo
      const [popularData, recentData, fictionData] = await Promise.all([
        getPopularBooks(),
        getRecentBooks(),
        getBooksByCategory("fiction"),
      ])

      setPopularBooks(popularData.books.slice(0, 10))
      setRecentBooks(recentData.books.slice(0, 10))
      setFictionBooks(fictionData.books.slice(0, 10))

      // Seleccionar libro destacado de los populares
      if (popularData.books.length > 0) {
        setFeaturedBook(popularData.books[0])
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err)
      setError("Error al cargar los datos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-container">
          <div>
            <Spinner animation="border" role="status" className="mb-3" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <h4 className="text-muted">Preparando tu biblioteca...</h4>
            <p className="text-muted">Cargando los mejores libros para ti</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <div className="mb-3">
            <span style={{ fontSize: "3rem" }}>😔</span>
          </div>
          <Alert.Heading>¡Oops! Algo salió mal</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadDashboardData} className="me-2">
            <span className="me-2">🔄</span>
            Intentar de nuevo
          </Button>
          <Button variant="secondary" as={Link} to="/search">
            <span className="me-2">🔍</span>
            Ir a búsqueda
          </Button>
        </Alert>
      </Container>
    )
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
                <Col lg={8}>
                  <div className="mb-4">
                    <span className="badge bg-warning text-dark px-3 py-2 mb-3">
                      ✨ Bienvenido a tu biblioteca digital
                    </span>
                  </div>
                  <h1 className="display-4 fw-bold mb-3 gradient-text">Descubre tu próxima gran lectura</h1>
                  <p className="lead mb-4">
                    Explora miles de libros, organiza tu biblioteca personal y encuentra recomendaciones perfectas para
                    ti. Tu aventura literaria comienza aquí.
                  </p>
                  <div className="mb-4">
                    <SearchBar placeholder="Buscar libros, autores, géneros..." />
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button as={Link} to="/search" variant="warning" size="lg" className="hover-lift">
                      <span className="me-2">🚀</span>
                      Comenzar a explorar
                    </Button>
                    <Button as={Link} to="/my-library" variant="outline-light" size="lg" className="hover-lift">
                      <span className="me-2">📚</span>
                      Mi biblioteca
                    </Button>
                  </div>
                </Col>
                {featuredBook && (
                  <Col lg={4} className="text-center">
                    <div className="featured-book-container">
                      <Card className="featured-book shadow-lg pulse-hover">
                        <div className="position-relative">
                          <Card.Img
                            variant="top"
                            src={featuredBook.volumeInfo?.imageLinks?.thumbnail?.replace("http:", "https:")}
                            alt={featuredBook.volumeInfo?.title}
                            style={{ height: "250px", objectFit: "cover" }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-danger">🔥 Popular</span>
                          </div>
                        </div>
                        <Card.Body>
                          <Card.Title className="text-dark h6">{featuredBook.volumeInfo?.title}</Card.Title>
                          <Card.Text className="small text-muted">{featuredBook.volumeInfo?.authors?.[0]}</Card.Text>
                          <Button
                            as={Link}
                            to={`/book/${featuredBook.id}`}
                            variant="primary"
                            size="sm"
                            className="w-100"
                          >
                            <span className="me-1">👁️</span>
                            Ver Detalles
                          </Button>
                        </Card.Body>
                      </Card>
                    </div>
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
          <Card className="text-center h-100 shadow-sm hover-lift glass-effect">
            <Card.Body className="p-4">
              <div className="mb-3">
                <div className="display-4 text-primary mb-2">📚</div>
                <div className="badge bg-primary-subtle text-primary px-3 py-2 mb-2">Explorar</div>
              </div>
              <Card.Title className="h5 fw-bold">Miles de libros</Card.Title>
              <Card.Text className="text-muted">
                Descubre una vasta colección de libros de todos los géneros, desde clásicos hasta los últimos
                bestsellers.
              </Card.Text>
              <Button as={Link} to="/search" variant="outline-primary" className="hover-lift">
                <span className="me-2">🔍</span>
                Comenzar a explorar
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm hover-lift glass-effect">
            <Card.Body className="p-4">
              <div className="mb-3">
                <div className="display-4 text-success mb-2">🏷️</div>
                <div className="badge bg-success-subtle text-success px-3 py-2 mb-2">Organizar</div>
              </div>
              <Card.Title className="h5 fw-bold">Tu biblioteca personal</Card.Title>
              <Card.Text className="text-muted">
                Crea estantes virtuales personalizados y organiza tus libros por categorías: leyendo, por leer, leídos.
              </Card.Text>
              <Button as={Link} to="/my-library" variant="outline-success" className="hover-lift">
                <span className="me-2">📖</span>
                Mi Biblioteca
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm hover-lift glass-effect">
            <Card.Body className="p-4">
              <div className="mb-3">
                <div className="display-4 text-warning mb-2">⭐</div>
                <div className="badge bg-warning-subtle text-warning px-3 py-2 mb-2">Descubrir</div>
              </div>
              <Card.Title className="h5 fw-bold">Recomendaciones</Card.Title>
              <Card.Text className="text-muted">
                Recibe sugerencias personalizadas basadas en tus gustos y descubre nuevos autores y géneros.
              </Card.Text>
              <Button variant="outline-warning" disabled className="hover-lift">
                <span className="me-2">🚧</span>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">
                  <span className="me-2">📈</span>
                  Libros Populares
                </h3>
                <p className="text-muted mb-0">Los más leídos y recomendados</p>
              </div>
              <Button as={Link} to="/search?filter=popular" variant="outline-primary" size="sm" className="hover-lift">
                <span className="me-2">👀</span>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">
                  <span className="me-2">🆕</span>
                  Lanzamientos Recientes
                </h3>
                <p className="text-muted mb-0">Las últimas novedades literarias</p>
              </div>
              <Button as={Link} to="/search?filter=recent" variant="outline-primary" size="sm" className="hover-lift">
                <span className="me-2">🔥</span>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">
                  <span className="me-2">📖</span>
                  Ficción Destacada
                </h3>
                <p className="text-muted mb-0">Sumérgete en mundos imaginarios</p>
              </div>
              <Button
                as={Link}
                to="/search?category=fiction"
                variant="outline-primary"
                size="sm"
                className="hover-lift"
              >
                <span className="me-2">🌟</span>
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
          <Card className="glass-effect border-0 shadow-lg">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <span style={{ fontSize: "4rem" }}>🎯</span>
              </div>
              <h4 className="fw-bold mb-3">¿No encuentras lo que buscas?</h4>
              <p className="lead text-white mb-4">
                Utiliza nuestra búsqueda avanzada para encontrar libros específicos por autor, género, año o palabras
                clave. ¡Tu libro perfecto te está esperando!
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Button as={Link} to="/search" variant="primary" size="lg" className="hover-lift">
                  <span className="me-2">🔍</span>
                  Búsqueda Avanzada
                </Button>
                <Button as={Link} to="/my-library" variant="outline-secondary" size="lg" className="hover-lift">
                  <span className="me-2">📚</span>
                  Ver mi biblioteca
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Categories */}
      <Row className="mb-5">
        <Col>
          <h4 className="fw-bold mb-4 text-center">
            <span className="me-2">🏷️</span>
            Explora por categorías
          </h4>
          <Row className="g-3">
            {[
              { name: "Ficción", icon: "📚", category: "fiction", color: "primary" },
              { name: "Misterio", icon: "🔍", category: "mystery", color: "light" },
              { name: "Romance", icon: "💕", category: "romance", color: "danger" },
              { name: "Ciencia Ficción", icon: "🚀", category: "science fiction", color: "info" },
              { name: "Biografía", icon: "👤", category: "biography", color: "warning" },
              { name: "Historia", icon: "🏛️", category: "history", color: "secondary" },
            ].map((cat, index) => (
              <Col md={2} sm={4} xs={6} key={index}>
                <Button
                  as={Link}
                  to={`/search?category=${cat.category}`}
                  variant={`outline-${cat.color}`}
                  className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 hover-lift"
                  style={{ minHeight: "100px" }}
                >
                  <div style={{ fontSize: "2rem" }} className="mb-2">
                    {cat.icon}
                  </div>
                  <small className="fw-bold">{cat.name}</small>
                </Button>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
