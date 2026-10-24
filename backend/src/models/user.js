const mongoose =require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin', required: true },
}, { timestamps: true });

const userModel= mongoose.model("User", userSchema);
module.exports = userModel;
