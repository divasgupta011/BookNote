--Create table in sql--

CREATE TABLE book_note (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) NOT NULL,
    book_name VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 10),
    notes TEXT
);

-- INSERT --
INSERT INTO book_note (isbn, book_name, author_name, publish_date, rating, notes)
VALUES ('9780553403947', 'Powershift', 'Alvin Toffler', '2024-06-03', 7, 'This is a note about the book.');