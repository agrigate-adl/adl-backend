
const dbConfig = require("../../config/dbconfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.Users = require("./user.model.js")(mongoose);
db.Farmers = require("./farmer.model.js")(mongoose);
db.FPackages = require("./fpackage.model.js")(mongoose);
db.Products = require("./product.model.js")(mongoose);
db.ScratchCards = require("./scratchCard.model.js")(mongoose);
db.Transactions = require("./transactions.model.js")(mongoose);
db.Counters = require("./counters.model.js")(mongoose);


module.exports = db;