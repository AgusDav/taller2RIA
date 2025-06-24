import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ 
  size = 'lg', 
  message = 'Cargando...', 
  fullPage = false,
  variant = 'primary' 
}) => {
  const spinnerContent = (
    <div className="text-center">
      <Spinner 
        animation="border" 
        role="status" 
        variant={variant}
        size={size}
        className="mb-3"
      >
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
      
      {message && (
        <div className="loading-message">
          <p className="text-white mb-0">{message}</p>
          <div className="loading-dots mt-2">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .loading-dots {
          display: inline-flex;
          gap: 4px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          background-color: var(--bs-primary);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <Container 
        fluid 
        className="d-flex align-items-center justify-content-center loading-container"
        style={{ minHeight: '60vh' }}
      >
        {spinnerContent}
      </Container>
    );
  }

  return spinnerContent;
};

// Componente especializado para libros
export const BookLoadingSpinner = ({ count = 6 }) => {
  return (
    <div className="book-loading-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="book-skeleton">
          <div className="skeleton-cover"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-author"></div>
          <div className="skeleton-button"></div>
        </div>
      ))}
      
      <style jsx>{`
        .book-loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
        }
        
        .book-skeleton {
          background: white;
          border-radius: 15px;
          padding: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .skeleton-cover {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .skeleton-title {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          width: 80%;
        }
        
        .skeleton-author {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 1rem;
          width: 60%;
        }
        
        .skeleton-button {
          height: 35px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 20px;
          width: 100%;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        @media (max-width: 768px) {
          .book-loading-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Componente para loading de texto
export const TextLoadingSpinner = ({ lines = 3 }) => {
  return (
    <div className="text-loading">
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className="skeleton-line"
          style={{ 
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${index * 0.1}s`
          }}
        ></div>
      ))}
      
      <style jsx>{`
        .text-loading {
          padding: 1rem 0;
        }
        
        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.8rem;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;