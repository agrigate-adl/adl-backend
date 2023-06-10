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
  //save cards record
}
exports.getCard  = async (req, res)=>{
  const val = req.params.val;
  sc.findOne({ cardNumber: val })
    .then((data) => {
      if (data !== null) {
        res.status(200).send({ message: "success", data: data });
      } else {
        res.status(404).send({ message: "no card retrieved", data: null });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "error, can't retrieve data",
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
  try {
    const counts = await sc.aggregate([
      {
        $facet: {
          Used: [
            { $match: { status: "used" } },
            { $count: "count" },
          ],
          Unused: [
            { $match: { status: "unused" } },
            { $count: "count" },
          ],
          C500: [
            {
              $match: {
                $and: [{ amount: "500" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C1000: [
            {
              $match: {
                $and: [{ amount: "1000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C2000: [
            {
              $match: {
                $and: [{ amount: "2000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C5000: [
            {
              $match: {
                $and: [{ amount: "5000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C10000: [
            {
              $match: {
                $and: [{ amount: "10000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C20000: [
            {
              $match: {
                $and: [{ amount: "20000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
          C50000: [
            {
              $match: {
                $and: [{ amount: "50000" }, { status: "used" }],
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
    
    const formattedCounts = counts[0]; // Access the first element of the array
    console.log(formattedCounts)
    const result = {
      Used: formattedCounts.Used[0].count || 0,
      Unused: formattedCounts.Unused[0].count || 0,
      C500: formattedCounts.C500[0].count || 0,
      C1000: formattedCounts.C1000[0].count || 0,
      C2000: formattedCounts.C2000[0].count || 0,
      C5000: formattedCounts.C5000[0].count || 0,
      C10000: formattedCounts.C10000[0].count || 0,
      C20000: formattedCounts.C20000[0].count || 0,
      C50000: formattedCounts.C50000[0].count || 0,
    };

    return res.status(200).send({ message: "success", count: result });
  } catch (error) {
    return res.status(430).send({ message: "failed to get count" });
  }
};