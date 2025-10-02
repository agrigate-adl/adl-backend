const auth = require("../../middleware/auth");

module.exports = (app) => {
  const users = require("../controllers/user.controllers");
  var router = require("express").Router();
  router.post("/register-a", users.Createuser);
  router.post("/agent/suspend/:id", users.suspendAgent);
  router.post("/agent/unsuspend/:id", users.unsuspendAgent);
  router.put("/agent/:id", users.updateAgent);
  router.delete("/agent/:id", users.deleteAgent);
  router.post("/login", users.login);
  router.post("/verify-otp", users.verifyOTP);
  router.post("/resend-otp", users.resendOTP);
  router.post("/register-agent", users.Createagent);
  router.get("/agents", users.getAllUsers);
  router.get("/agent/:id", users.getAgent);
  router.get("/users/:contact", users.getUserByContact);
  router.get("/:id", users.getAdmin);
  router.post("/change-password", auth, users.changePassword);
  router.post("/agent/reset-password/:agentId", auth, users.resetAgentPassword);

  app.use("/admin", router);
};
