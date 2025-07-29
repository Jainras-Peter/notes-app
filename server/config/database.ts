import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';

    await mongoose.connect(mongoURI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed - running in development mode with mock data');
    console.warn('To use a real database, set MONGODB_URI environment variable');
    isConnected = false;
  }
};

export const isDatabaseConnected = () => isConnected;

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});
