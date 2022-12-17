
module.exports = mongoose => {
    const Farmers = mongoose.model(
      "Farmers",
      mongoose.Schema(
        {
          name: {
            type: String,
            required: true,
         },
          contact: {
           type: String,
           required: true,
        },
        adderID: {
            type: String,
            required: true,
         },
          farmProducts: { 
            type : Array ,
             default : [] },// list of crops
          location: String,
          packages: { 
            type : Array , // custom hybrid many to many
            default : [] },// list of objects with less information and ids
        },
        { timestamps: true }
      )
    );
  
    return Farmers;
  };