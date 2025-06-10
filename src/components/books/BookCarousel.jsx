import React, { useRef } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import BookCard from './BookCard';

const BookCarousel = ({ books, title }) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="book-carousel position-relative">
      {title && (
        <h4 className="mb-3 fw-bold">{title}</h4>
      )}
      
      {/* Botones de navegación */}
      <Button
        variant="outline-primary"
        className="carousel-btn carousel-btn-left position-absolute start-0 top-50 translate-middle-y"
        onClick={scrollLeft}
        style={{ 
          zIndex: 10,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ←
      </Button>

      <Button
        variant="outline-primary"
        className="carousel-btn carousel-btn-right position-absolute end-0 top-50 translate-middle-y"
        onClick={scrollRight}
        style={{ 
          zIndex: 10,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        →
      </Button>

      {/* Container scrolleable */}
      <div
        ref={scrollContainerRef}
        className="carousel-scroll-container"
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          gap: '1rem',
          padding: '1rem 0',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {books.map((book, index) => (
          <div
            key={`${book.id}-${index}`}
            className="carousel-item"
            style={{
              minWidth: '250px',
              maxWidth: '250px',
              flexShrink: 0
            }}
          >
            <BookCard book={book} showShelfActions={true} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .carousel-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .carousel-btn {
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
        
        .carousel-btn:hover {
          opacity: 1;
        }
        
        .book-carousel:hover .carousel-btn {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .carousel-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BookCarousel;