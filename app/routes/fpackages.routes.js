const auth = require("../../middleware/auth");

module.exports = app => {
    const packages = require("../controllers/fpackage.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/add-package",packages.addPackageToFarmer);
    router.get("/:id",packages.getFarmerPackage);
    router.get("/",packages.getAllPackages);
    router.patch("/:id",packages.editPackage)
    router.delete("/:id",packages.deletePackage)
    
    app.use('/packages', router);
  };