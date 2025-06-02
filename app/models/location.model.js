module.exports = mongoose => {
  const LocationHistory = mongoose.model(
    "LocationHistory",
    mongoose.Schema(
      {
        agentId: {
          type: String,
          required: true,
        },
        coordinates: {
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          }
        },
        address: {
          type: String,
          required: false,
        },
        accuracy: {
          type: Number, // GPS accuracy in meters
          required: false,
        },
        activity: {
          type: String, // What the agent was doing (e.g., "Adding farmer", "Visiting farm")
          required: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        }
      },
      { timestamps: true }
    )
  );

  return LocationHistory;
};