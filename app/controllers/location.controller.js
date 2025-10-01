const Locations = require("../models/location.model.js");

// Record location data from agents
exports.recordLocation = async (req, res) => {
  try {
    const { agentId, coordinates, accuracy, timestamp, activity } = req.body;

    // Validate required fields
    if (
      !agentId ||
      !coordinates ||
      !coordinates.lat ||
      !coordinates.lng ||
      !accuracy ||
      !timestamp
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: agentId, coordinates (lat, lng), accuracy, and timestamp are required",
      });
    }

    // Validate coordinate ranges
    if (coordinates.lat < -90 || coordinates.lat > 90) {
      return res.status(400).json({
        message: "Invalid latitude. Must be between -90 and 90",
      });
    }

    if (coordinates.lng < -180 || coordinates.lng > 180) {
      return res.status(400).json({
        message: "Invalid longitude. Must be between -180 and 180",
      });
    }

    // Create location record
    const locationData = new Locations({
      agentId,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      accuracy,
      timestamp: new Date(timestamp),
      activity: activity || "Unknown",
    });

    const savedLocation = await locationData.save();

    res.status(201).json({
      message: "Location recorded successfully",
      location: savedLocation,
    });
  } catch (error) {
    console.error("Error recording location:", error);
    res.status(500).json({
      message: "Internal server error while recording location",
      error: error.message,
    });
  }
};

// Get location history for an agent
exports.getAgentLocations = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, skip = 0, startDate, endDate } = req.query;

    if (!agentId) {
      return res.status(400).json({
        message: "Agent ID is required",
      });
    }

    // Build query filters
    let query = { agentId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const locations = await Locations.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await Locations.countDocuments(query);

    res.status(200).json({
      message: "Location history retrieved successfully",
      locations,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + locations.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error getting agent locations:", error);
    res.status(500).json({
      message: "Internal server error while retrieving locations",
      error: error.message,
    });
  }
};

// Get recent locations for all agents (admin dashboard)
exports.getAllRecentLocations = async (req, res) => {
  try {
    const { limit = 100, hours = 24 } = req.query;

    // Get locations from the last X hours
    const cutoffTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

    const locations = await Locations.aggregate([
      {
        $match: {
          timestamp: { $gte: cutoffTime },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$agentId",
          latestLocation: { $first: "$$ROOT" },
          locationCount: { $sum: 1 },
        },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$latestLocation",
              { locationCount: "$locationCount" },
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Recent locations retrieved successfully",
      locations,
      metadata: {
        hoursBack: parseInt(hours),
        cutoffTime,
        totalAgents: locations.length,
      },
    });
  } catch (error) {
    console.error("Error getting recent locations:", error);
    res.status(500).json({
      message: "Internal server error while retrieving recent locations",
      error: error.message,
    });
  }
};
