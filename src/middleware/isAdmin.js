// Checks that the authenticated user has the 'admin' role.
// Must be used AFTER verifyToken in the middleware chain.
const isAdmin = (request, response, next) => {
  if (request.user && request.user.role === 'admin') {
    return next();
  }
  const err = new Error('Access denied. Admins only.');
  err.status = 403;
  return next(err);
};

module.exports = isAdmin;
