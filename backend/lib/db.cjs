const mongoose = require('mongoose');

// Global variable to cache the connection across hot reloads in serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering for serverless
    };

    const MONGO_URI = process.env.MONGO_URI;

    // --- START DEBUG LOGGING ---
    if (MONGO_URI) {
        // Log a masked version of the URI to check if it's loaded correctly
        console.log("Attempting to connect with URI:", MONGO_URI.replace(/:([^@:]+)@/, ':*****@'));
    } else {
        console.error("CRITICAL: MONGO_URI environment variable is NOT SET!");
    }
    // --- END DEBUG LOGGING ---

    if (!MONGO_URI) {
        throw new Error("Please define the MONGO_URI environment variable inside .env");
    }

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB connection promise resolved successfully.");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connection established successfully!");
  } catch (e) {
    cached.promise = null;
    // Log the full error from Mongoose
    console.error("❌ MongoDB Connection Error:", e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
