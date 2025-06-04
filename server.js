const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models/index");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to adl application api." });
});

// Register routes
require("./app/routes/user.routes")(app);
require("./app/routes/farmer.routes")(app);
require("./app/routes/fpackages.routes")(app);
require("./app/routes/scratchcards.routes")(app);
require("./app/routes/products.routes")(app);
require("./app/routes/transactions.routes")(app);
require("./app/routes/ussd.routes")(app);
require("./app/routes/mobileMoney.routes")(app); // Add mobile money routes
require("./app/routes/credit.routes")(app);
require("./app/routes/location.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});