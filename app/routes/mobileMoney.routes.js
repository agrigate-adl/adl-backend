// app/routes/mobileMoney.routes.js
module.exports = app => {
    const mobileMoney = require("../controllers/mobileMoney.controller");
    
    var router = require("express").Router();
    
    // Callback routes
    router.post("/callback", mobileMoney.handlePesapalCallback);
    router.get("/callback", mobileMoney.handlePesapalCallback);
    
    // IPN routes
    router.post("/ipn", mobileMoney.handleIPN);
    router.get("/ipn", mobileMoney.handleIPN);
    
    // REMOVE THIS LINE - it's causing the error
    // router.get("/test-ipn-list", mobileMoney.testGetIPNList);
    
    app.use('/mobile-money', router);
};