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

export { getAllBooks, getBookById };