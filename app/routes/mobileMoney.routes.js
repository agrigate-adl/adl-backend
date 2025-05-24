// app/routes/mobileMoney.routes.js
// const auth = require("../../middleware/auth");

module.exports = app => {
    const mobileMoney = require("../controllers/mobileMoney.controller");
    
    var router = require("express").Router();
    
    // Existing callback route
    router.post("/callback", mobileMoney.handlePesapalCallback);
    router.get("/callback", mobileMoney.handlePesapalCallback); // Add GET support too
    
    // NEW: IPN routes (both GET and POST for Pesapal compatibility)
    router.post("/ipn", mobileMoney.handleIPN);
    router.get("/ipn", mobileMoney.handleIPN);

    router.get("/test-ipn-list", mobileMoney.testGetIPNList);
    
    app.use('/mobile-money', router);
};