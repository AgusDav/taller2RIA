import React from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes registrar el error en un servicio de reporte de errores
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Recargar la página
    window.location.reload();
  };

  handleReset = () => {
    // Reiniciar el estado del error
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <div className="text-center">
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="mb-4">
                  <span style={{ fontSize: '4rem' }}>📚💥</span>
                </div>
                
                <h2 className="fw-bold text-danger mb-3">
                  ¡Oops! Algo salió mal
                </h2>
                
                <Alert variant="danger" className="text-start">
                  <Alert.Heading>Error en la aplicación</Alert.Heading>
                  <p>
                    Lo sentimos, ha ocurrido un error inesperado en BiblioTech. 
                    Nuestro equipo de desarrollo ha sido notificado automáticamente.
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-3">
                      <summary className="fw-bold cursor-pointer">
                        Detalles técnicos (solo en desarrollo)
                      </summary>
                      <pre className="mt-2 p-3 bg-light rounded small text-muted">
                        {this.state.error.toString()}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </Alert>

                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={this.handleReset}
                    className="px-4"
                  >
                    🔄 Intentar de nuevo
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={this.handleReload}
                    className="px-4"
                  >
                    🏠 Recargar página
                  </Button>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-muted mb-3">Mientras tanto, puedes:</h6>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2">
                      📖 Revisar tu biblioteca personal (datos guardados localmente)
                    </li>
                    <li className="mb-2">
                      🔍 Intentar una búsqueda diferente
                    </li>
                    <li className="mb-2">
                      🔄 Refrescar la página en unos minutos
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Si el problema persiste, por favor contacta al administrador.
                    <br />
                    Error ID: {Date.now().toString(36)}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;