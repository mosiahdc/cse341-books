# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations


### Goal
Create an authors collection in MongoDB and provide full CRUD operations for authors. Every author route must be documented and testable through Swagger.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required
- `birthYear`: number, required

Authors will use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Books
Each author can be referenced by multiple books using the `authorId` field.

When deleting an author, the API will first check whether any books reference that author's id.

If books still reference the author, the API will reject the deletion with `409 Conflict` to prevent broken relationships.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a3",
      "name": "Example Author",
      "birthYear": 1985
    }

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if required fields are missing or invalid
- `400` if the id already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:

    {
      "name": "Updated Author",
      "birthYear": 1986
    }

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if required fields are missing or invalid
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id
- `409` if books still reference this author
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document all five author routes, including request bodies, parameters, success responses, and error responses.


### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

---

## Version 1 Evaluation

### Question 1: Are there any bugs or short-sighted decisions?

Yes, there are several potential issues:

- Duplicate book and author IDs could be created without database uniqueness constraints.
- Empty strings and invalid field values are not fully addressed.
- publicationDate should use a valid YYYY-MM-DD date.
- birthYear should be a valid integer within a reasonable range.
- Existing Week 01 books need to be migrated from author names to authorId references.

### Question 2: Are there any security considerations missing?

Yes, the specification should address:

- Validation of incoming request data.
- Protection of MongoDB's internal _id field.
- Safe error messages without exposing database details.
- Rejecting unexpected or unauthorized fields.
- Keeping database credentials in environment variables.

### Question 3: Are there any efficiency concerns?

Yes, possible improvements include:

- Creating unique indexes for book and author IDs.
- Using findOne() to validate author references.
- Checking for existing book references before deleting an author.
- Validating inputs before executing database queries.

### Question 4: Are any response examples or error behaviors unclear?

Yes, several behaviors need clarification:

- Define a consistent JSON error response format.
- Specify what happens when additional fields are submitted.
- Clarify whether PUT requires all editable fields.
- Clearly distinguish 400 validation errors from 409 conflicts.
- Ensure DELETE returns 204 without a response body.

### Evaluation Summary

The Version 1 specification covers the required CRUD routes and relationships. However, improvements are needed for input validation, duplicate prevention, database integrity, security, error responses, and migration of existing book data.

These findings will be addressed in Version 2.


---

# Books API Week 02 Spec - Version 2

## Feature 1: Book CRUD Operations and Author References

### Goal
Extend the Week 01 Books API to support complete CRUD operations, reference authors using authorId, validate incoming data, and provide accurate Swagger documentation.

### Data Model
Books will be stored in the `books` collection.

Required fields:
- `id`: string, unique custom identifier such as `b1`
- `authorId`: string, references an existing author such as `a1`
- `title`: string, non-empty
- `publicationDate`: string, valid date formatted as YYYY-MM-DD

The MongoDB `_id` field will not be used for API route parameters or exposed in responses.

### Validation Rules
- All required fields must be provided.
- String fields cannot be empty or contain only whitespace.
- Custom book ids must follow the format b followed by a positive integer.
- publicationDate must be a real calendar date in YYYY-MM-DD format.
- authorId must reference an existing author.
- Duplicate book ids are rejected with status 400.
- Unknown request fields are rejected with status 400.
- Clients cannot modify the book id through PUT.
- PUT requires all editable fields: authorId, title, and publicationDate.
- Invalid requests return status 400 with a safe JSON message.

Create a unique MongoDB index on the book `id` field to prevent duplicate ids, including concurrent insert requests.

### Relationship to Authors
Each book references an author using authorId.

Before creating or updating a book, the API checks the authors collection using findOne().

If no matching author is found, the API returns:

Status: 400

    {
      "message": "Author does not exist"
    }

### Routes

#### GET /books
Purpose: Retrieve all books.

Success:
- Status: 200
- Response: Array of book objects

Errors:
- 500: Unexpected server or database error

#### GET /books/:id
Purpose: Retrieve a book using its custom id.

Success:
- Status: 200
- Response: Matching book object

Errors:
- 404: Book not found
- 500: Unexpected server or database error

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status: 201
- Response: Created book object

Errors:
- 400: Missing or invalid fields
- 400: Duplicate book id
- 400: Referenced author does not exist
- 500: Unexpected server or database error

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status: 200
- Response: Updated book object

Errors:
- 400: Missing or invalid fields
- 400: Referenced author does not exist
- 404: Book not found
- 500: Unexpected server or database error

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status: 204
- Response: No response body

Errors:
- 404: Book not found
- 500: Unexpected server or database error

### Error Response Format
All errors with response bodies must use a consistent format.

Example:

    {
      "message": "Book not found"
    }

Unexpected errors must return status 500 with:

    {
      "message": "Internal server error"
    }

Database connection strings, stack traces, and internal error details must not be returned to clients.

### Existing Week 01 Data
Existing book documents may contain an author name rather than an authorId.

Before converting existing records:
- Back up the existing books collection.
- Create corresponding author records in the authors collection.
- Match existing author names to their new custom author ids.
- Update book documents to use authorId.
- Verify that all authorId values reference existing authors.
- Remove the old author field only after verification.

The migration must preserve existing book ids, titles, and publication dates.

### Swagger Documentation
All book routes must be documented using OpenAPI 3.

Documentation must include:
- HTTP method and route
- Route description and tags
- Path parameters
- Request body schemas and examples
- Success response codes
- Error response codes

Swagger documentation must match the actual controller behavior.

### Deployment Expectations
All book routes must work locally and on the deployed Render application.

Swagger UI must be accessible at `/api-docs`.

The following operations must be tested:
- Retrieve all books
- Retrieve an existing book
- Retrieve a nonexistent book
- Create a valid book
- Reject invalid book data
- Reject duplicate book ids
- Reject nonexistent author ids
- Update an existing book
- Delete an existing book
- Return 404 when deleting a nonexistent book


## Feature 2: Author CRUD Operations

### Goal
Create an authors collection that supports complete CRUD operations. Each author can be referenced by books through authorId. The API must validate author data, prevent duplicate ids, protect relationships, and provide Swagger documentation.

### Data Model
Authors will be stored in the `authors` collection.

Required fields:
- `id`: string, unique custom identifier such as `a1`
- `name`: string, required and non-empty
- `birthYear`: number, required and a valid integer

The MongoDB `_id` field will not be used for API route parameters or exposed in responses.

### Validation Rules
- All required fields must be provided.
- Author ids must follow the format a followed by a positive integer.
- Author names cannot be empty or contain only whitespace.
- birthYear must be an integer from 1000 through the current calendar year.
- Duplicate author ids are rejected with status 400.
- Unknown request fields are rejected with status 400.
- Clients cannot change the author id through PUT.
- PUT requires both editable fields: name and birthYear.
- Invalid requests return status 400 with a safe JSON message.

Create a unique MongoDB index on the author `id` field to prevent duplicate ids, including concurrent insert requests.

### Relationship to Books
One author can be referenced by multiple books.

Books reference authors using the `authorId` field.

Before deleting an author, the API checks the books collection for documents that reference the author's id.

If books reference that author, deletion is blocked.

Status: 409

    {
      "message": "Cannot delete author because books reference this author"
    }

This prevents books from referencing deleted authors.

### Routes

#### GET /authors
Purpose: Retrieve all authors.

Success:
- Status: 200
- Response: Array of author objects

Errors:
- 500: Unexpected server or database error

#### GET /authors/:id
Purpose: Retrieve an author using a custom id.

Success:
- Status: 200
- Response: Matching author object

Errors:
- 404: Author not found
- 500: Unexpected server or database error

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a3",
      "name": "Example Author",
      "birthYear": 1985
    }

Success:
- Status: 201
- Response: Created author object

Errors:
- 400: Missing or invalid fields
- 400: Duplicate author id
- 500: Unexpected server or database error

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:

    {
      "name": "Updated Author",
      "birthYear": 1986
    }

Success:
- Status: 200
- Response: Updated author object

Errors:
- 400: Missing or invalid fields
- 404: Author not found
- 500: Unexpected server or database error

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status: 204
- Response: No response body

Errors:
- 404: Author not found
- 409: Author still has books referencing it
- 500: Unexpected server or database error

### Error Response Format
All errors with response bodies must use a consistent JSON format.

Example:

    {
      "message": "Author not found"
    }

Unexpected errors must return status 500 with:

    {
      "message": "Internal server error"
    }

Database credentials, stack traces, and internal database error details must not be exposed.

### Database Integrity
- Create a unique index on authors.id.
- Validate author data before inserting or updating.
- Prevent duplicate author ids.
- Prevent deletion of authors referenced by books.
- Preserve custom author ids during updates.
- Create author records before migrating existing books to authorId references.

### Swagger Documentation
All author routes must be documented using OpenAPI 3.

Documentation must include:
- HTTP methods and routes
- Route descriptions and tags
- Path parameters
- Request body schemas and examples
- Success response codes
- Validation error responses
- Relationship conflict responses

Swagger documentation must match the actual controller behavior.

### Deployment Expectations
All author routes must work locally and on the deployed Render application.

Swagger UI must be accessible at `/api-docs`.

The following operations must be tested:
- Retrieve all authors
- Retrieve an existing author
- Retrieve a nonexistent author
- Create a valid author
- Reject missing or invalid fields
- Reject duplicate author ids
- Update an existing author
- Delete an author without books
- Reject deletion of an author with books
- Return 404 when deleting a nonexistent author
