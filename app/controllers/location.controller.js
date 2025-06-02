const db = require("../models/index");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const LocationHistory = db.LocationHistory;

// Record new location
exports.recordLocation = async (req, res) => {
  try {
    const { agentId, coordinates, address, accuracy, activity } = req.body;
    
    if (!agentId || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).send({ 
        message: "Agent ID and coordinates (lat, lng) are required" 
      });
    }

    const location = await LocationHistory.create({
      agentId,
      coordinates,
      address,
      accuracy,
      activity,
    });

    res.status(201).json({
      message: "Location recorded successfully",
      data: location
    });

  } catch (err) {
    console.error("Error recording location:", err);
    res.status(500).send({
      message: "Failed to record location",
      error: err.message
    });
  }
};

// Get location history for an agent
exports.getAgentLocationHistory = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, startDate, endDate } = req.query;
    
    let query = { agentId };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const locations = await LocationHistory
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      message: "Success",
      data: locations,
      count: locations.length
    });

  } catch (err) {
    console.error("Error fetching location history:", err);
    res.status(500).send({
      message: "Failed to fetch location history",
      error: err.message
    });
  }
};

// Get last known location for an agent
exports.getLastLocation = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const lastLocation = await LocationHistory
      .findOne({ agentId })
      .sort({ timestamp: -1 });

    if (!lastLocation) {
      return res.status(404).send({
        message: "No location history found for this agent"
      });
    }

    res.status(200).json({
      message: "Success",
      data: lastLocation
    });

  } catch (err) {
    console.error("Error fetching last location:", err);
    res.status(500).send({
      message: "Failed to fetch last location",
      error: err.message
    });
  }
};

// Delete old location history (for privacy/cleanup)
exports.deleteOldLocations = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to 30 days
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await LocationHistory.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      message: "Old locations deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("Error deleting old locations:", err);
    res.status(500).send({
      message: "Failed to delete old locations",
      error: err.message
    });
  }
};