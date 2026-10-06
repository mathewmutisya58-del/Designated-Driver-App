const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware
app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));  
app.use('/api/rides', require('./routes/rideRoutes'));  


// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Designated Driver API Server is active and operational!',
    timestamp: new Date()
  });
});


// Start Server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});