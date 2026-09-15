const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('your_mongodb_atlas')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000 // 4s fast timeout if local mongo is not running
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.log(`⚠️ Database connection attempt to ${uri} failed (${err.message}).`);
      console.log(`🔄 Initializing fallback In-Memory MongoDB engine...`);
    }
  }

  // Fallback to MongoMemoryServer so registration and CRUD work instantly out-of-the-box!
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`=======================================================`);
    console.log(`✅ In-Memory MongoDB Server Active & Ready at: ${memoryUri}`);
    console.log(`=======================================================`);
    return conn;
  } catch (fallbackErr) {
    console.error(`Failed to start database fallback: ${fallbackErr.message}`);
  }
};

module.exports = connectDB;
