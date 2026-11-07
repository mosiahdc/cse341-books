import { getAllBooks, getBookById } from '../models/books.js';

// Controller for GET /books
const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();

    return res.status(200).json(books);
  } catch (error) {
    console.error('Failed to retrieve books:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Controller for GET /books/:id
const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Failed to retrieve book:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export { getBooksHandler, getBookByIdHandler };
