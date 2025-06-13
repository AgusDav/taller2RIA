import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

const Header = () => {
  const { bookshelves = {} } = useLibrary();

  const totalBooks = Object.values(bookshelves).reduce(
      (total, shelf) => total + shelf.length,
      0
  );

  return (
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="fw-bold">
            📚 BiblioTech
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">Inicio</Nav.Link>
              <Nav.Link as={NavLink} to="/search">Explorar</Nav.Link>
              <Nav.Link as={NavLink} to="/my-library">
                Mi Biblioteca
                {totalBooks > 0 && (
                    <Badge bg="secondary" className="ms-2">
                      {totalBooks}
                    </Badge>
                )}
              </Nav.Link>
            </Nav>

            {/* 👇 AQUÍ ESTÁ EL CAMBIO 👇 */}
            <Navbar.Text className="text-light">
              Descubre tu próxima gran lectura
            </Navbar.Text>

          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Header;