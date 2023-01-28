const auth = require("../../middleware/auth");

module.exports = app => {
    const transactions = require("../controllers/transactions.controllers");
  
    var router = require("express").Router(); 
    
    router.get("/",auth,transactions.getAllTransactions);
    router.get("/:id",auth,transactions.getTransactions);

    app.use('/transactions', router);
  };