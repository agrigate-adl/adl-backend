const auth = require("../../middleware/auth");

module.exports = app => {
    const scratchCard = require("../controllers/scratchCard.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/print-newcards",scratchCard.addCardBatchs);
    router.get("/available",scratchCard.getCardAvailableCounts);
    router.get("/unavailable",scratchCard.getCardAvailableCounts);

    app.use('/cards', router);
  };