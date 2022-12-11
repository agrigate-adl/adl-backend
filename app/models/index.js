
const dbConfig = require("../../config/dbconfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.Users = require("./user.model.js")(mongoose);
db.Farmers = require("./farmer.model.js")(mongoose);
db.Packages = require("./package.model.js")(mongoose);
db.ScratchCards = require("./scratchCard.model.js")(mongoose);
db.Transactions = require("./transactions.model.js")(mongoose);


module.exports = db;