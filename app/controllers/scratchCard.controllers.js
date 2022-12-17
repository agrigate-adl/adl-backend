const db = require("../models/index");

const sc = db.ScratchCards;


exports.addCardBatchs = async (req, res) => {
const { generatorID, count, amount } = req.body;
if (!(generatorID && count && amount)) {
        return res.status(400).send({message:"Not enough data to add cards"});
}
if (count > 50 ) {
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
