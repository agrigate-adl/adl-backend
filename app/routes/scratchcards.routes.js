const auth = require("../../middleware/auth");

module.exports = app => {
    const scratchCard = require("../controllers/scratchCard.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/print-newcards",scratchCard.addCardBatchs);
    router.get("/:val",scratchCard.getCard);
    router.post("/available",scratchCard.getCardAvailableCounts);
    router.post("/unavailable",scratchCard.getCardUsedCounts);
    router.get("/pro-count",scratchCard.overAllCount);

    app.use('/cards', router);
  };