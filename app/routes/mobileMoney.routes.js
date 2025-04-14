// app/routes/mobileMoney.routes.js
// const auth = require("../../middleware/auth");

module.exports = app => {
    const mobileMoney = require("../controllers/mobileMoney.controller");
  
    var router = require("express").Router();
  
    router.post("/callback", mobileMoney.handlePesapalCallback);
    
    app.use('/mobile-money', router);
};