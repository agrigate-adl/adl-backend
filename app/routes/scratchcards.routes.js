const auth = require("../../middleware/auth");

module.exports = app => {
    const scratchCard = require("../controllers/scratchCard.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/print-newcards",scratchCard.addCardBatchs);
    router.post("/available",scratchCard.getCardAvailableCounts);
    router.post("/unavailable",scratchCard.getCardUsedCounts);

    app.use('/cards', router);
  };