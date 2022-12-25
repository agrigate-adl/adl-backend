// const auth = require("../../middleware/auth");

module.exports = app => {
    const users = require("../controllers/ussd.controllers");
  
    var router = require("express").Router();
  
    router.post("/v1",users.welcomeFarmer);
    
   
    app.use('/ussd', router);
  };