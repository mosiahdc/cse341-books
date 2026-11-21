import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorFromDb,
  updateAuthor as updateAuthorFromDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks,
} from '../models/authors.js';

const formatAuthor = (author) => {return {
  id: author.id,
  name: author.name,
  birthYear: author.birthYear,
}};

const hasExactFields = (body, fields) =>
  {return body !== null &&
  typeof body === 'object' &&
  !Array.isArray(body) &&
  Object.keys(body).length === fields.length &&
  fields.every((field) =>
    {return Object.prototype.hasOwnProperty.call(body, field)}
  )};

const validAuthorData = (body, creating) => {
  const fields = creating
    ? ['id', 'name', 'birthYear']
    : ['name', 'birthYear'];

  if (!hasExactFields(body, fields)) return false;

  if (creating && (
    typeof body.id !== 'string' ||
    !/^a[1-9]\d*$/.test(body.id)
  )) return false;

  if (typeof body.name !== 'string' || !body.name.trim()) {
    return false;
  }

  return (
    Number.isInteger(body.birthYear) &&
    body.birthYear >= 1000 &&
    body.birthYear <= new Date().getFullYear()
  );
};

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors.map(formatAuthor));
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await getAuthorByIdFromDb(id);

    if (!author) {
      return res.status(404).json({
        message: 'Author not found'
      });
    }

    return res.status(200).json(formatAuthor(author));
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const createAuthor = async (req, res) => {
  try {
    if (!validAuthorData(req.body, true)) {
      return res.status(400).json({
        message: 'Invalid author data'
      });
    }

    const { id, birthYear } = req.body;
    const name = req.body.name.trim();

    const existingAuthor = await getAuthorByIdFromDb(id);

    if (existingAuthor) {
      return res.status(400).json({
        message: 'Author id already exists'
      });
    }

    const author = { id, name, birthYear };
    await createAuthorFromDb(author);

    return res.status(201).json(formatAuthor(author));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Author id already exists'
      });
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validAuthorData(req.body, false)) {
      return res.status(400).json({
        message: 'Invalid author data'
      });
    }

    const existingAuthor = await getAuthorByIdFromDb(id);

    if (!existingAuthor) {
      return res.status(404).json({
        message: 'Author not found'
      });
    }

    const updatedAuthor = await updateAuthorFromDb(id, {
      name: req.body.name.trim(),
      birthYear: req.body.birthYear,
    });

    return res.status(200).json(updatedAuthor);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAuthor = await getAuthorByIdFromDb(id);

    if (!existingAuthor) {
      return res.status(404).json({
        message: 'Author not found'
      });
    }

    if (await authorHasBooks(id)) {
      return res.status(409).json({
        message: 'Cannot delete author because books reference this author'
      });
    }

    const result = await deleteAuthorFromDb(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Author not found'
      });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};