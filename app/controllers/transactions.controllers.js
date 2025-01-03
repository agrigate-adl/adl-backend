
const db = require("../models/index");

const Transactions  = db.Transactions;
const Farmers =  db.Farmers

exports.getTransactions = async (req, res) => {
    const id = req.params.id;
    Transactions.findById(id)
    .then(data => {
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no transaction retrieved', data:null});
     }
    })
    .catch(err => {
      res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
}

exports.getAllTransactions = async (req, res) => {
Transactions
.find()
.then((data) => {
  res.status(200).json({
    message: "success",
    data:data
  });
})
.catch(() => {
  res.status(500).send(
    {
      message:"failed"
    }
  );
});
}


exports.getMonthlyTransactions = async (req, res) => {
  try {
      const transactions = await Transactions.find();

      // Group data by year and month
      const groupedData = transactions.reduce((acc, transaction) => {
          const date = new Date(transaction.createdAt);
          const year = date.getFullYear();
          const month = date.toLocaleString('default', { month: 'short' });

          if (!acc[year]) acc[year] = {};
          if (!acc[year][month]) acc[year][month] = 0;

          acc[year][month] += transaction.amount; 
          return acc;
      }, {});


      const formattedData = Object.entries(groupedData).map(([year, months]) => {
          return {
              year,
              ...months,
          };
      });

      res.status(200).json({
          message: "success",
          data: formattedData,
      });
  } catch (err) {
      res.status(500).send({
          message: "error, can't retrieve data",
      });
  }
};


exports.getTransactionsByContact = async (req, res) => {
  const { contact } = req.params;

  if (!contact) {
    return res.status(400).send({ message: 'Contact is required' });
  }

  try {
    
    const farmer = await Farmers.findOne({ contact });
    if (!farmer) {
      return res.status(404).send({ message: 'Farmer not found' });
    }

    const transactions = await Transactions.find({ "payee.contact": farmer.contact });

    res.status(200).send({
      message: 'Transactions retrieved successfully',
      data: transactions,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to retrieve transactions',
      error: error.message,
    });
  }
};
