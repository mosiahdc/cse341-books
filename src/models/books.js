import { getDb } from '../db/connect.js';

// Retrieve all books
const getAllBooks = async () => {
  const database = getDb();

  const books = await database
    .collection('books')
    .find({})
    .toArray();

  return books;
};

// Retrieve one book using its custom id
const getBookById = async (bookId) => {
  const database = getDb();

  const book = await database
    .collection('books')
    .findOne({ id: bookId });

  return book;
};

// Create a new book
const createBook = async (book) => {
  const database = getDb();

  await database
    .collection('books')
    .insertOne({ ...book });

  return book;
};

// Update an existing book
const updateBook = async (bookId, book) => {
  const database = getDb();

  const result = await database
    .collection('books')
    .updateOne(
      { id: bookId },
      { $set: book },
    );

  return result;
};

// Delete a book using its custom id
const deleteBook = async (bookId) => {
  const database = getDb();

  const result = await database
    .collection('books')
    .deleteOne({ id: bookId });

  return result;
};

// Check whether an author exists
const authorExists = async (authorId) => {
  const database = getDb();

  const author = await database
    .collection('authors')
    .findOne({ id: authorId });

  return author !== null;
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
};