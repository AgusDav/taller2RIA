import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';

// 1. Añadimos 'subtitle' a la lista de props
const BookCarousel = ({ books, title, subtitle, icon, viewAllLink }) => {
    const scrollContainerRef = useRef(null);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    useEffect(() => {
        const container = scrollContainerRef.current;
        const checkScrollPosition = () => {
            if (container) {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
                setIsAtStart(scrollLeft === 0);
            }
        };
        if (container) {
            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [books]);

    const scroll = (scrollOffset) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    if (!books || books.length === 0) {
        return null;
    }

    return (
        <div className="book-carousel">
            <div className="carousel-header">
                <div className="carousel-title-container">
                    {icon && <span className="carousel-icon">{icon}</span>}
                    {/* 2. Envolvemos el título y el nuevo subtítulo en un div para agruparlos verticalmente */}
                    <div>
                        {title && <h4 className="carousel-title">{title}</h4>}
                        {subtitle && <p className="carousel-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {viewAllLink && (
                    <Link to={viewAllLink} className="btn btn-sm view-all-btn">
                        Ver todos
                    </Link>
                )}
            </div>

            <div className="carousel-body">
                <Button
                    className="carousel-btn carousel-btn-left"
                    onClick={() => scroll(-350)}
                    disabled={isAtStart}
                    aria-label="Desplazar a la izquierda"
                >
                    ←
                </Button>
                <Button
                    className="carousel-btn carousel-btn-right"
                    onClick={() => scroll(350)}
                    disabled={isAtEnd}
                    aria-label="Desplazar a la derecha"
                >
                    →
                </Button>
                <div ref={scrollContainerRef} className="carousel-scroll-container">
                    {books.map((book, index) => (
                        <div key={`${book.id}-${index}`} className="carousel-item-wrapper">
                            <BookCard book={book} showShelfActions={true} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookCarousel;