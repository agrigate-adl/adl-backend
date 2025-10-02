const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const locationController = require("../controllers/location.controller");

// Record agent location data
router.post("/record", auth, locationController.recordLocation);

// Get location history for a specific agent
router.get("/agent/:agentId", auth, locationController.getAgentLocations);

// Get recent locations for all agents (admin use)
router.get("/recent", auth, locationController.getAllRecentLocations);

module.exports = router;
