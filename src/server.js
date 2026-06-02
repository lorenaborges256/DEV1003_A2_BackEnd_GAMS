/* Main server module for setting up express app instance, general middleware and routes,
   configuration using environment variables and connecting to database. */

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

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

// 404 — catch-all for any route that does not match the above
app.use((request, response) => {
  response.status(404).json({ error: `Route not found: ${request.method} ${request.originalUrl}` });
});

// Global error handling middleware — must be registered last
app.use(errorHandler);

module.exports = app;
