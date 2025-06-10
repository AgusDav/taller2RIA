import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLibrary } from '../../context/LibraryContext';

const Header = () => {
  const { bookshelves } = useLibrary();
  
  // Contar libros en la biblioteca personal
  const totalBooks = Object.values(bookshelves).reduce(
    (total, shelf) => total + shelf.length, 
    0
  );

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold">
            📚 BiblioTech
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Inicio</Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/search">
              <Nav.Link>Explorar</Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/my-library">
              <Nav.Link>
                Mi Biblioteca
                {totalBooks > 0 && (
                  <Badge bg="secondary" className="ms-2">
                    {totalBooks}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <Nav.Text className="text-light">
              Descubre tu próxima gran lectura
            </Nav.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;