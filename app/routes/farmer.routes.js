const auth = require("../../middleware/auth");

module.exports = app => {
    const farmers = require("../controllers/farmer.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-farmer",auth,farmers.addFarmer);
    router.get("/",auth,farmers.getAllFarmers);
    router.get("/:id",auth,farmers.getFarmer);
    router.patch("/:id",auth,farmers.editFarmer)
    router.delete("/:id",auth, farmers.deleteFarmer);
    router.post("/search-farmer",auth, farmers.searchkey);
    
    app.use('/farmer', router);
  };