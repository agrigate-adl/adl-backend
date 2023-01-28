const auth = require("../../middleware/auth");

module.exports = app => {
    const transactions = require("../controllers/transactions.controllers");
  
    var router = require("express").Router(); 
    
    router.get("/",transactions.getAllTransactions);
    router.get("/:id",transactions.getTransactions);

    app.use('/transactions', router);
  };