const auth = require("../../middleware/auth");

module.exports = app => {
    const packages = require("../controllers/fpackage.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/add-package",auth,packages.addPackageToFarmer);
    router.get("/:id",auth,packages.getFarmerPackage);
    router.get("/",auth,packages.getAllPackages);
    router.patch("/:id",auth,packages.editPackage)
    router.delete("/:id",auth,packages.deletePackage)
    
    app.use('/packages', router);
  };