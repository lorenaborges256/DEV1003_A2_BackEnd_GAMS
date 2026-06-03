const jwt = require('jsonwebtoken');

// Verifies the Bearer JWT in the Authorization header.
// Attaches the decoded payload to request.user for downstream use.
// Forwards any JWT errors to the global error handler via next(err).
const verifyToken = (request, response, next) => {
  // Read the Authorization header — expected format: "Bearer <token>"
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Access denied. No token provided.');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded payload to the request so downstream middleware and controllers can use it
    request.user = decoded;
    return next();
  } catch (err) {
    // Forward JsonWebTokenError and TokenExpiredError to the global error handler
    return next(err);
  }
};

module.exports = verifyToken;
