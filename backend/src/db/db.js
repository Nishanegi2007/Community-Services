const mongoose = require("mongoose");

async function connectDB(){
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required to connect to the database.');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log('Database connected successfully');
}

module.exports = connectDB;
