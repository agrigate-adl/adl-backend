// admin user
module.exports = mongoose => {
    const FPackages = mongoose.model(
      "FPackages",
      mongoose.Schema(
        {
         name: {
            type: String,
            required: true,
         },
          owner: {
           type: String,
           required: true,
        },//id
        status: {
            type: String,
            default: 'pending',//pending and complete
         },
         totalAmount: {
            type: Number,
            required: true
         },
         balance: {
            type: Number,
            default: 0
         },
         adderId: {
            type: String,
            required: true
         },
        products: { 
            type : Array , // custom hybrid many to many
            default : [] },// list of objects with less information and ids item and amount 
        },
        { timestamps: true }
      )
    );
  
    return FPackages;
  };