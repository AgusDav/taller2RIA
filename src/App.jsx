import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

// Context
import { LibraryProvider } from './context/LibraryContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import BookDetails from './pages/BookDetails';
import MyLibrary from './pages/MyLibrary';

function App() {
  return (
    <LibraryProvider>
      <Router>
        <div className="App min-vh-100 d-flex flex-column">
          <ErrorBoundary>
            <Header />
            <main className="flex-grow-1">
              <Container fluid className="py-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/my-library" element={<MyLibrary />} />
                </Routes>
              </Container>
            </main>
            <Footer />
          </ErrorBoundary>
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;