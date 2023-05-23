// const auth = require("../../middleware/auth");

module.exports = app => {
    const ussd = require("../controllers/ussd.controllers");
  
    var router = require("express").Router();
  
    router.post("/v1",ussd.welcomeFarmer);
    router.post("/v1/bulk-sms",ussd.sendMessages);
    
    app.use('/ussd', router);
  };