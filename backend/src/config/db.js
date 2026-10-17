const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fraudradar';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB at ${uri}`);
    console.error(`Reason: ${error.message}`);
    console.error(`
Troubleshooting tips:
1. If using local MongoDB, verify that your MongoDB service is running:
   - On Windows, check Services or run: net start MongoDB
2. If using MongoDB Atlas, check your connection string in backend/.env:
   - Ensure your IP address is whitelisted in Atlas Network Access
   - Ensure your username & password are correct
`);
    throw error;
  }
};

module.exports = connectDB;
