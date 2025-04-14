const auth = require("../../middleware/auth");

module.exports = app => {
    const credits = require("../controllers/credit.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-credit", credits.addCredit);    
    router.get("/", credits.getAllCredits);
    router.get("/:id", credits.getCreditById);    
    router.put("/:id", credits.updateCredit);    
    router.delete("/:id", credits.deleteCredit);    
    router.post("/search-credit", credits.searchCredits);
    
    app.use('/credit', router);
};
