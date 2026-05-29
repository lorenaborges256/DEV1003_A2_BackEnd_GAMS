const isAdmin = (request, response, next) => {
  if (request.user && request.user.role === 'admin') {
    return next();
  }
  return response.status(403).json({ error: 'Access denied. Admins only.' });
};

module.exports = isAdmin;
