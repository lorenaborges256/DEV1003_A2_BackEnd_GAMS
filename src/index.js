// Import the server from server.js
const app = require('./server');

// Load up environment variables
require('dotenv').config();

// Connect to the database
const connectDB = require('./config/db');

connectDB();

// Run the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
