const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const doctorRoutes = require('../../routes/doctorRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Routes
app.use('/', doctorRoutes);  // Root path'e taşındı çünkü gateway path'i yönetiyor

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start the service
async function startService() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
      console.log(`Doctors service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Service startup error:', error);
    process.exit(1);
  }
}

startService(); 