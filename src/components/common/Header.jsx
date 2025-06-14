import { Navbar, Nav, Container, Badge } from "react-bootstrap"
import { NavLink } from "react-router-dom"
import { useLibrary } from "../../context/LibraryContext"

const Header = () => {
  const { bookshelves = {} } = useLibrary()

  const totalBooks = Object.values(bookshelves).reduce((total, shelf) => total + shelf.length, 0)

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-lg">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold d-flex align-items-center">
          <span className="me-2" style={{ fontSize: "1.5rem" }}>
            📚
          </span>
          BiblioTech
          <span className="ms-2 text-warning" style={{ fontSize: "0.8rem" }}>
            LIBRARY
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" className="d-flex align-items-center">
              <span className="me-2">🏠</span>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/search" className="d-flex align-items-center">
              <span className="me-2">🔍</span>
              Explorar
            </Nav.Link>
            <Nav.Link as={NavLink} to="/my-library" className="d-flex align-items-center">
              <span className="me-2">📖</span>
              Mi Biblioteca
              {totalBooks > 0 && (
                <Badge bg="warning" text="dark" className="ms-2">
                  {totalBooks}
                </Badge>
              )}
            </Nav.Link>
          </Nav>

          <Navbar.Text className="text-light d-flex align-items-center">
            <span className="me-2">✨</span>
            <span className="d-none d-md-inline">Descubre tu próxima gran lectura</span>
            <span className="d-md-none">Tu biblioteca digital</span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
