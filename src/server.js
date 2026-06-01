/* Main server module for setting up express app instance, general middleware and routes,
   configuration using environment variables and connecting to database. */

const express = require('express');
const cors = require('cors');

const app = express();

// General middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/items', require('./routes/itemRoutes'));
app.use('/contracts', require('./routes/contractRoutes'));
// app.use('/watchlist', require('./routes/watchlistRoutes'));
// app.use('/notifications', require('./routes/notificationRoutes'));
// app.use('/dashboard', require('./routes/dashboardRoutes'));

// Global error handling middleware
// Underscore prefix tells ESLint it is intentionally unused
app.use((err, request, response, _next) => {
  const status = err.status || 500;
  response.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
