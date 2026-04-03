import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["car", "bike"], // 👈 clear, no confusion
    required: true
  },

  manufacturer: {
    type: String,
    required: true,
    trim: true
  },

  model: {
    type: String,
    required: true,
    trim: true
  },

  number: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  }

}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);