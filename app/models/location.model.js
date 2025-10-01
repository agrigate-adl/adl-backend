const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    ref: "Users",
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  accuracy: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  activity: {
    type: String,
    required: false,
    default: "Unknown",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
locationSchema.index({ agentId: 1, timestamp: -1 });
locationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Locations", locationSchema);
