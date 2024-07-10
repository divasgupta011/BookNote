import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import path from "path";  // Add this for path resolution

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booknotes",
    password: "Divas@1434",
    port: 5432,
});

db.connect().catch(err => console.error('Database connection error:', err.stack));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));  
app.set('view engine', 'ejs'); 

// Fetch all book notes and render them on the homepage
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book_note");
        const books = result.rows;
        const covers = await Promise.all(books.map(async (book) => {
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
            return { ...book, coverUrl };
        }));
        res.render("index", { bookNotes: covers });
    } catch (err) {
        console.error('Error fetching book notes:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// add book form
app.get("/addbook", (req, res) => {
    res.render("add");
});

// adding a new book note
app.post("/addbook", async (req, res) => {
    try {
        const { isbn, book_name, author_name, publish_date, rating, notes } = req.body;
        if (!isbn || !book_name || !author_name || !publish_date || !rating) {
            return res.status(400).send('All fields except notes are required');
        }
        if (isNaN(rating) || rating < 1 || rating > 10) {
            return res.status(400).send('Rating must be a number between 1 and 10');
        }
        await db.query(
            "INSERT INTO book_note (isbn, book_name, author_name, publish_date, rating, notes) VALUES ($1, $2, $3, $4, $5, $6)",
            [isbn, book_name, author_name, publish_date, rating, notes]
        );
        res.redirect("/");
    } catch (err) {
        console.error('Error adding book note:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Handle deleting a book note
app.post("/deletebook/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).send('Invalid book ID');
        }
        await db.query("DELETE FROM book_note WHERE id = $1", [id]);
        res.redirect("/");
    } catch (err) {
        console.error('Error deleting book note:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// edit book form
app.get("/editbook/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).send('Invalid book ID');
        }
        const result = await db.query("SELECT * FROM book_note WHERE id = $1", [id]);
        const book = result.rows[0];
        if (!book) {
            return res.status(404).send('Book note not found');
        }
        res.render("edit", { book });
    } catch (err) {
        console.error('Error fetching book note:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// updating a book note
app.post("/editbook/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { isbn, book_name, author_name, publish_date, rating, notes } = req.body;
        if (!isbn || !book_name || !author_name || !publish_date || !rating) {
            return res.status(400).send('All fields except notes are required');
        }
        if (isNaN(id) || isNaN(rating) || rating < 1 || rating > 10) {
            return res.status(400).send('Invalid data');
        }
        await db.query(
            "UPDATE book_note SET isbn = $1, book_name = $2, author_name = $3, publish_date = $4, rating = $5, notes = $6 WHERE id = $7",
            [isbn, book_name, author_name, publish_date, rating, notes, id]
        );
        res.redirect("/");
    } catch (err) {
        console.error('Error updating book note:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
