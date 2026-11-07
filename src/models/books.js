import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
  const database = getDb();

  const books = await database
    .collection('books')
    .find({})
    .toArray();

  return books;
};

export { getAllBooks };
