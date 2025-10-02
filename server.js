const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Configure CORS to only allow specified origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Check exact matches first
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
      return;
    }

    // Allow any Vercel domain (*.vercel.app)
    if (origin && origin.match(/^https:\/\/.*\.vercel\.app$/)) {
      console.log(`CORS: Allowing Vercel domain: ${origin}`);
      callback(null, true);
      return;
    }

    // Log rejected origins for debugging
    console.log(`CORS: Rejected origin: ${origin}`);
    console.log(`CORS: Allowed origins: ${allowedOrigins.join(", ")}`);
    callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models/index");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
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

// Location tracking routes
app.use("/admin/locations", require("./app/routes/location.routes"));

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
