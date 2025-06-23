import { Container, Row, Col } from "react-bootstrap"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer bg-dark text-light py-5 mt-5">
      <Container>
        <Row className="g-4">
          <Col lg={4} md={6}>
            <div className="mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center">
                <span className="me-2" style={{ fontSize: "1.5rem" }}>
                  📚
                </span>
                BiblioTech
                <span className="ms-2 badge bg-warning text-dark">LIBRARY</span>
              </h5>
              <p className="mb-3 text-white-emphasis">
                Tu biblioteca digital personal para descubrir, organizar y disfrutar de la mejor literatura mundial.
              </p>
              <p className="small text-white mb-0">
                <span className="me-2">⚡</span>
                Desarrollado con React, Bootstrap y APIs públicas
              </p>
            </div>
          </Col>

          <Col lg={2} md={6}>
            <h6 className="fw-bold mb-3 text-warning">
              <span className="me-2">🔗</span>
              Enlaces
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-light text-decoration-none d-flex align-items-center hover-lift">
                  <span className="me-2">🏠</span>
                  Inicio
                </a>
              </li>
              <li className="mb-2">
                <a href="/search" className="text-light text-decoration-none d-flex align-items-center hover-lift">
                  <span className="me-2">🔍</span>
                  Explorar
                </a>
              </li>
              <li className="mb-2">
                <a href="/my-library" className="text-light text-decoration-none d-flex align-items-center hover-lift">
                  <span className="me-2">📖</span>
                  Mi Biblioteca
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="fw-bold mb-3 text-warning">
              <span className="me-2">🌐</span>
              Fuentes de Datos
            </h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="https://developers.google.com/books"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light text-decoration-none small d-flex align-items-center hover-lift"
                >
                  <span className="me-2">📚</span>
                  Google Books API
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="fw-bold mb-3 text-warning">
              <span className="me-2">📊</span>
              Estadísticas
            </h6>
            <div className="small text-white-emphasis">
              <div className="d-flex justify-content-between mb-2">
                <span>📚 Libros disponibles:</span>
                <span className="fw-bold text-warning">Miles</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>🌍 Idiomas:</span>
                <span className="fw-bold text-warning">Múltiples</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>🏷️ Categorías:</span>
                <span className="fw-bold text-warning">Todas</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>⚡ Actualizaciones:</span>
                <span className="fw-bold text-warning">Diarias</span>
              </div>
            </div>
          </Col>
        </Row>

        <hr className="my-4 border-secondary" />

        <Row className="align-items-center">
          <Col md={6}>
            <p className="mb-0 text-muted">© {currentYear} BiblioTech - Laboratorio RIA 2025</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
