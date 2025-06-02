const auth = require("../../middleware/auth");

module.exports = app => {
  const locations = require("../controllers/location.controllers");
  var router = require("express").Router();
  
  // Record new location
  router.post("/record", locations.recordLocation);
  
  // Get location history for an agent
  router.get("/agent/:agentId", locations.getAgentLocationHistory);
  
  // Get last known location for an agent
  router.get("/agent/:agentId/last", locations.getLastLocation);
  
  // Delete old locations (admin only)
  router.delete("/cleanup", locations.deleteOldLocations);
  
  app.use('/locations', router);
};