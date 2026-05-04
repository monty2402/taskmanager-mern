const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI; // 👈 USING ENVIRONMENT VARIABLE

    console.log("Using URI:", MONGO_URI);

    const conn = await mongoose.connect(MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;