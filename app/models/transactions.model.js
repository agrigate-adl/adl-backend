// admin user
module.exports = mongoose => {
    const Transactions = mongoose.model(
      "Transactions",
      mongoose.Schema(
        {
        payee: {
           type: Object,
           required: true,
        },// number, id and name 
        package: {
            type: String,
            required:true
         },
         amount: {
            type: Number,
            required: true
         },
         reference: {
            type: String,
         },
        },
        { timestamps: true }
      )
    );
  
    return Transactions;
  };