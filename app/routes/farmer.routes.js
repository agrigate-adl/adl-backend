const auth = require("../../middleware/auth");

module.exports = app => {
    const farmers = require("../controllers/farmer.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-farmer",farmers.addFarmer);
    router.get("/",farmers.getAllFarmers);
    router.get("/:id",farmers.getFarmer);
    router.patch("/:id",farmers.editFarmer)
    router.delete("/:id", farmers.deleteFarmer);
    router.post("/search-farmer", farmers.searchkey);
    
    app.use('/farmer', router);
  };