const auth = require("../../middleware/auth");

module.exports = app => {
    const users = require("../controllers/user.controllers"); 
    var router = require("express").Router();
    router.post("/register-a",users.Createuser);
    router.post("/login", users.login);
    router.post("/register-agent", users.Createagent);
    router.get("/agents", users.getAllUsers);
    router.get("/:id", users.getAdmin);
    router.get("/users/:contact", users.getUserByContact);  

    app.use('/admin', router);
  };