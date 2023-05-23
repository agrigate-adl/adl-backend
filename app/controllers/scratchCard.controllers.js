const db = require("../models/index");

const sc = db.ScratchCards;


exports.addCardBatchs = async (req, res) => {
const { generatorID, count, amount } = req.body;
if (!(generatorID && count && amount)) {
        return res.status(400).send({message:"Not enough data to add cards"});
}
if (count > 400 ) {
    return res.status(430).send({message:"too many cards requested"});
}
var insertationArray = []
for (var i = 1; i <= count; i++) {
    var cardVal = Math.floor(10000000000000 + Math.random() * 90000000000000)
    insertationArray.push( { 
        amount: amount,
        status:"unused",
        generatorID:generatorID,
        farmer:"",
        cardNumber:cardVal.toString()
    } );
}
sc.insertMany(insertationArray).then((data) => {
    res.status(201).send(
        {
          message:"success",
          data
        }
      );
  })
  .catch((error) => {
    res.status(500).send({
      message: "failed to insert cards",
    });
   });
}

exports.getCardAvailableCounts = async (req, res) => {
    const { cardAmount } = req.body;
    if (cardAmount==="") {
        sc.aggregate([
            {
              $match: { "status": "unused" }
            },
            {
              $count: "count"
            }
          ])
            .then((count)=>{
                return res.status(200).send({message:"success",count});
            }).catch((e)=>{
                return res.status(430).send({message:"failed to get count"});
            })
    }else{
        sc.countDocuments({ $and: [ {amount: cardAmount },
            {status:"unused"}]}).then((count)=>{
                return res.status(200).send({message:"success",count});
            }).catch((e)=>{
                return res.status(430).send({message:"failed to get count"});
            })
    }  
}

exports.getCardUsedCounts = async (req, res) => {
    const { cardAmount } = req.body;
    if (cardAmount==="") {
        sc.aggregate([
            {
              $match: { "status": "used" }
            },
            {
              $count: "count"
            }
          ])
            .then((count)=>{
                return res.status(200).send({message:"success",count});
            }).catch((e)=>{
                return res.status(430).send({message:"failed to get count"});
            })
    }else{
        sc.countDocuments({ $and: [ {amount: cardAmount },
            {status:"used"}]}).then((count)=>{
                return res.status(200).send({message:"success",count});
            }).catch((e)=>{
                return res.status(430).send({message:"failed to get count"});
            })
    }  
}

exports.overAllCount = async (req, res) => {
        sc.aggregate([
            { "$facet": {
              "Used": [
                { "$match" : {  "status": "used" }},
                { "$count": "Used" },
              ],
              "Unused": [
                { "$match" : {  "status": "unused" }},
                { "$count": "Unused" }
              ],
              "C500": [
                { "$match" : {"$and": [ {"amount": "500" },{"status":"used"}]}},
                { "$count": "C500" }
              ],
              "C1000": [
                { "$match" : {"$and": [ {"amount": "1000" },{"status":"used"}]}},
                { "$count": "C1000" }
              ],
              "C2000": [
                { "$match" : {"$and": [ {"amount": "2000" },{"status":"used"}]}},
                { "$count": "C2000" }
              ],
              "C5000": [
                { "$match" : {"$and": [ {"amount": "5000" },{"status":"used"}]}},
                { "$count": "C5000" }
              ],
              "C10000": [
                { "$match" : {"$and": [ {"amount": "10000" },{"status":"used"}]}},
                { "$count": "C10000" }
              ],
              "C20000": [
                { "$match" : {"$and": [ {"amount": "20000" },{"status":"used"}]}},
                { "$count": "C20000" }
              ],
              "C50000": [
                { "$match" : {"$and": [ {"amount": "50000" },{"status":"used"}]}},
                { "$count": "C50000" }
              ],
            }},
            { "$project": {
              "Used": { "$arrayElemAt": ["$Used.Used", 0] },
              "Unused": { "$arrayElemAt": ["$Unused.Unused", 0] },
              "C500": { "$arrayElemAt": ["$C500.C500", 0] },
              "C1000": { "$arrayElemAt": ["$C1000.C1000", 0] },
              "C2000": { "$arrayElemAt": ["$C2000.C2000", 0] },
              "C5000": { "$arrayElemAt": ["$C5000.C5000", 0] },
              "C10000": { "$arrayElemAt": ["$C10000.C10000", 0] },
              "C20000": { "$arrayElemAt": ["$C20000.C20000", 0] },
              "C50000": { "$arrayElemAt": ["$C50000.C50000", 0] },
            }}
          ])
            .then((count)=>{
                console.log(count)
                return res.status(200).send({message:"success",count});
            }).catch((e)=>{
                return res.status(430).send({message:"failed to get count"});
            })
    
}