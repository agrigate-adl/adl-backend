const auth = require("../../middleware/auth");

module.exports = app => {
    const transactions = require("../controllers/transactions.controllers");
  
    var router = require("express").Router(); 
    
    router.get("/",transactions.getAllTransactions);
    router.post("/monthly_data",transactions.getMonthlyTransactions);
    router.post("/farmer/:contact",transactions.getTransactionsByContact);
    router.get("/:id",transactions.getTransactions);
  

    // user transactions

    app.use('/transactions', router);
  };