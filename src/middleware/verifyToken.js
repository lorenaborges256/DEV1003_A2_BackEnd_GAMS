const jwt = require('jsonwebtoken');

const verifyToken = (request, response, next) => {
  // Read the Authorization header — expected format: "Bearer <token>"
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded payload to the request so downstream middleware and controllers can use it
    request.user = decoded;
    return next();
  } catch (err) {
    return response.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
