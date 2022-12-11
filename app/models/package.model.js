// admin user
module.exports = mongoose => {
    const Packages = mongoose.model(
      "Packages",
      mongoose.Schema(
        {
          name: {
            type: String,
            required: true,
         },
          owner: {
           type: Object,
           required: true,
        },// number, id and name 
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
            type: Number,
            default: 0
         },
        crops: { 
            type : Array ,
             default : [] },// list of crops
        products: { 
            type : Array , // custom hybrid many to many
            default : [] },// list of objects with less information and ids
        },
        { timestamps: true }
      )
    );
  
    return Packages;
  };