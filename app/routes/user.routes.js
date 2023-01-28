const auth = require("../../middleware/auth");

module.exports = app => {
    const users = require("../controllers/user.controllers"); 
    var router = require("express").Router();
  
    router.post("/register-a",users.Createuser);
    router.post("/login", users.login);
    router.get("/:id", users.getAdmin);


    app.use('/admin', router);
  };