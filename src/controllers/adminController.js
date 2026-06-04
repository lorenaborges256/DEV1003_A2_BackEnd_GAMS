const User = require('../models/User');

// GET /admin/users
// Returns a list of all registered users (passwords excluded)
const getUsers = async (request, response, next) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    return response.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
};

// GET /admin/users/:id
// Returns a single user's details by ID (password excluded)
const getUserById = async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id).select('-password');
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }
    return response.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// DELETE /admin/users/:id
// Removes a user from the system. Admins cannot delete their own account.
const deleteUser = async (request, response, next) => {
  try {
    if (request.params.id === request.user.id) {
      return next({ status: 400, message: 'Admins cannot delete their own account' });
    }
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }
    return response.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUsers, getUserById, deleteUser };
