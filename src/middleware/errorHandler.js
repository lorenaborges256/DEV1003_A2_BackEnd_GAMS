/* Global error handling middleware for the GAMS Express application.
   Handles all errors forwarded via next(err) from controllers and middleware.
   Must be registered AFTER all routes in server.js.

   Covered error categories:
   - 400 Mongoose ValidationError  (schema validation failures)
   - 400 Mongoose CastError        (invalid ObjectId format)
   - 409 Duplicate key error       (MongoDB code 11000 — unique field conflict)
   - 401 JsonWebTokenError         (malformed or invalid JWT)
   - 401 TokenExpiredError         (expired JWT)
   - 404 Not Found                 (explicit 404 errors forwarded from routes)
   - 500 Internal Server Error     (all unhandled/unexpected errors)
*/

// ─── Mongoose ValidationError ────────────────────────────────────────────────
// Triggered when a document fails schema-level validation (required, minlength, match, enum).
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return {
    status: 400,
    error: 'Validation Error',
    details: messages,
  };
};

// ─── Mongoose CastError ───────────────────────────────────────────────────────
// Triggered when an invalid value is cast to a schema type (e.g. bad ObjectId in params).
const handleCastError = (err) => ({
  status: 400,
  error: 'Invalid ID',
  details: [`Invalid value for field '${err.path}': ${err.value}`],
});

// ─── MongoDB Duplicate Key Error ──────────────────────────────────────────────
// Triggered when a unique-indexed field (e.g. email) already exists in the collection.
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return {
    status: 409,
    error: 'Duplicate Value',
    details: [`A record with that ${field} already exists.`],
  };
};

// ─── JWT Errors ───────────────────────────────────────────────────────────────
// JsonWebTokenError: token is malformed or signature is invalid.
// TokenExpiredError: token was valid but has passed its expiry time.
const handleJWTError = () => ({
  status: 401,
  error: 'Invalid token. Please log in again.',
  details: [],
});

const handleJWTExpiredError = () => ({
  status: 401,
  error: 'Your session has expired. Please log in again.',
  details: [],
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Express identifies this as an error-handling middleware by its four-argument signature.
// The leading underscore on _next signals to ESLint that the parameter is intentionally unused.
const errorHandler = (err, request, response, _next) => {
  // Default to 500 unless the error carries an explicit status
  let status = err.status || 500;
  let body = {
    error: err.message || 'Internal Server Error',
    details: [],
  };

  // Route to the appropriate handler based on error type / code
  if (err.name === 'ValidationError') {
    ({ status, ...body } = handleValidationError(err));
  } else if (err.name === 'CastError') {
    ({ status, ...body } = handleCastError(err));
  } else if (err.code === 11000) {
    ({ status, ...body } = handleDuplicateKeyError(err));
  } else if (err.name === 'JsonWebTokenError') {
    ({ status, ...body } = handleJWTError());
  } else if (err.name === 'TokenExpiredError') {
    ({ status, ...body } = handleJWTExpiredError());
  }

  // Log unexpected server errors for debugging — suppressed in test environment
  if (status === 500 && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[ErrorHandler]', err);
  }

  return response.status(status).json(body);
};

module.exports = errorHandler;
