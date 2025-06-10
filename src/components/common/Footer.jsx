import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="fw-bold mb-3">📚 BiblioTech</h5>
            <p className="mb-2">
              Tu biblioteca digital personal para descubrir, organizar y 
              disfrutar de la mejor literatura.
            </p>
            <p className="text-muted small">
              Desarrollado con React, Bootstrap y APIs públicas.
            </p>
          </Col>
          
          <Col md={3}>
            <h6 className="fw-bold mb-3">Enlaces</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-light text-decoration-none">
                  🏠 Inicio
                </a>
              </li>
              <li className="mb-2">
                <a href="/search" className="text-light text-decoration-none">
                  🔍 Explorar
                </a>
              </li>
              <li className="mb-2">
                <a href="/my-library" className="text-light text-decoration-none">
                  📖 Mi Biblioteca
                </a>
              </li>
            </ul>
          </Col>
          
          <Col md={3}>
            <h6 className="fw-bold mb-3">Fuentes de Datos</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a 
                  href="https://developers.google.com/books" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-light text-decoration-none small"
                >
                  Google Books API
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="https://openlibrary.org/developers/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-light text-decoration-none small"
                >
                  Open Library API
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="https://developer.nytimes.com/docs/books-product/1/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-light text-decoration-none small"
                >
                  NY Times Books API
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="mb-0 text-muted">
              © {currentYear} BiblioTech - Laboratorio RIA 2025. 
              Hecho con ❤️ para amantes de los libros.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;