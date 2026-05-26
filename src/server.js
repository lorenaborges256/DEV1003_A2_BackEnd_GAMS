/* Main server module for setting up express app instance, general middleware and routes,
   configuration using environment variables and connecting to database. */

const express = require('express');
const cors = require('cors');

const app = express();

// General middleware
app.use(cors());
app.use(express.json());

// Routes (uncomment as you build them)
// app.use('/auth', require('./routes/authRoutes'));
// app.use('/items', require('./routes/itemRoutes'));
// app.use('/quests', require('./routes/questRoutes'));
// app.use('/watchlist', require('./routes/watchlistRoutes'));
// app.use('/notifications', require('./routes/notificationRoutes'));
// app.use('/dashboard', require('./routes/dashboardRoutes'));

// Global error handling middleware
app.use((err, request, response) => {
  const status = err.status || 500;
  response.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
