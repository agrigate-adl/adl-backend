// admin user
module.exports = mongoose => {
    const Packages = mongoose.model(
      "Packages",
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
            type: Number,
         },
        },
        { timestamps: true }
      )
    );
  
    return Packages;
  };