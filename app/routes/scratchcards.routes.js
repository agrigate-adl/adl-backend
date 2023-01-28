const auth = require("../../middleware/auth");

module.exports = app => {
    const scratchCard = require("../controllers/scratchCard.controllers");
  
    var router = require("express").Router(); 
    
    router.post("/print-newcards",auth,scratchCard.addCardBatchs);
    router.post("/available",auth,scratchCard.getCardAvailableCounts);
    router.post("/unavailable",auth,scratchCard.getCardUsedCounts);

    app.use('/cards', router);
  };