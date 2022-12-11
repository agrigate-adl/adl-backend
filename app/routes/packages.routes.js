const auth = require("../../middleware/auth");

module.exports = app => {
    const packages = require("../controllers/package.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/add-package",packages.addPackageToFarmer);
    router.get("/:id",packages.getFarmerPackage);
    router.get("/",packages.getAllPackages);
    router.patch("/:id",packages.editPackage)
    
    
    app.use('/packages', router);
  };