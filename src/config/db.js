const mongoose = require('mongoose');

async function connectDB(uri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: 'ai_kannada',
  });
  return mongoose.connection;
}

module.exports = { connectDB };
