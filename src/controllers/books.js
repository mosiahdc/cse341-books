import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
} from '../models/books.js';

// Exclude MongoDB _id and the legacy author field from API responses.
const formatBook = (book) => {return {
  id: book.id,
  authorId: book.authorId,
  title: book.title,
  publicationDate: book.publicationDate,
}};

// Accept only the fields defined in the request schema.
const hasExactFields = (body, fields) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }

  const keys = Object.keys(body);

  return keys.length === fields.length && fields.every((field) =>
    {return Object.prototype.hasOwnProperty.call(body, field)});
};

// Custom IDs contain 1-40 letters, numbers, underscores, or hyphens.
const validId = (value) =>
  {return typeof value === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(value)};

// Reject invalid and impossible calendar dates.
const validPublicationDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(value);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
};

// Validate new and updated book data.
const validBookData = (body, creating) => {
  const fields = creating
    ? ['id', 'authorId', 'title', 'publicationDate']
    : ['authorId', 'title', 'publicationDate'];

  if (!hasExactFields(body, fields)) {
    return false;
  }

  if (creating && !validId(body.id)) {
    return false;
  }

  if (!validId(body.authorId)) {
    return false;
  }

  if (typeof body.title !== 'string') {
    return false;
  }

  const trimmedTitle = body.title.trim();

  if (!trimmedTitle || trimmedTitle.length > 200) {
    return false;
  }

  return validPublicationDate(body.publicationDate);
};

// GET /books
const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();

    return res.status(200).json(books.map(formatBook));
  } catch (error) {
    console.error('Failed to retrieve books:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// GET /books/:id
const getBookByIdHandler = async (req, res) => {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(formatBook(book));
  } catch (error) {
    console.error('Failed to retrieve book:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// POST /books
const createBookHandler = async (req, res) => {
  try {
    if (!validBookData(req.body, true)) {
      return res.status(400).json({
        message: 'Invalid book data'
      });
    }

    const { id, authorId, publicationDate } = req.body;

    // Prevent duplicate custom book IDs.
    if (await getBookById(id)) {
      return res.status(400).json({
        message: 'Book id already exists'
      });
    }

    // Verify that the referenced author exists.
    if (!(await authorExists(authorId))) {
      return res.status(400).json({
        message: 'Author not found'
      });
    }

    const book = {
      id,
      authorId,
      title: req.body.title.trim(),
      publicationDate,
    };

    await createBook(book);

    return res.status(201).json(formatBook(book));
  } catch (error) {
    // Handle duplicate inserts caught by the unique MongoDB index.
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Book id already exists'
      });
    }

    console.error('Failed to create book:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// PUT /books/:id
const updateBookHandler = async (req, res) => {
  try {
    if (!validBookData(req.body, false)) {
      return res.status(400).json({
        message: 'Invalid book data'
      });
    }

    const { id } = req.params;

    // Verify that the book exists.
    if (!(await getBookById(id))) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Verify the new author reference.
    if (!(await authorExists(req.body.authorId))) {
      return res.status(400).json({
        message: 'Author not found'
      });
    }

    const changes = {
      authorId: req.body.authorId,
      title: req.body.title.trim(),
      publicationDate: req.body.publicationDate,
    };

    const result = await updateBook(id, changes);

    // matchedCount allows a valid unchanged update to return 200.
    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json({
      id,
      ...changes,
    });
  } catch (error) {
    console.error('Failed to update book:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// DELETE /books/:id
const deleteBookHandler = async (req, res) => {
  try {
    const result = await deleteBook(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete book:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};