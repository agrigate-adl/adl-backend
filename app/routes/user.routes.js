const auth = require("../../middleware/auth");

module.exports = app => {
    const users = require("../controllers/user.controllers"); 
    var router = require("express").Router();
    router.post("/register-a", users.Createuser);
    router.post("/agent/suspend/:id", users.suspendAgent);
    router.post("/agent/unsuspend/:id", users.unsuspendAgent)
    router.delete("/agent/:id", users.deleteAgent);
    router.post("/login", users.login);
    router.post("/register-agent", users.Createagent);
    router.get("/agents", users.getAllUsers);
    router.get("/users/:contact", users.getUserByContact);
    router.get("/:id", users.getAdmin);
 

    app.use('/admin', router);
  };