import mongoose, { type Mongoose } from 'mongoose';

// Create a new Mongoose instance..
const db: Mongoose = mongoose;
// Mongoose Promise..
mongoose.Promise = global.Promise;

// Mongo Options..
const options: mongoose.ConnectOptions = {};

export async function connectDB(url: string): Promise<Mongoose> {
  try {
    await db.connect(url, options);
    console.log('-------- DATABASE IS CONNECTED -------');
    return db;
  } catch (error) {
    console.error('MongoDB connection error: ', error);
    throw error;
  }
}
