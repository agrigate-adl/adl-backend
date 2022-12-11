// admin user
module.exports = mongoose => {
    const scratchCards = mongoose.model(
      "scratchCards",
      mongoose.Schema(
        {
         amount: {
            type: String,
            required: true,
         },
        status: {
           type: Boolean,// true on usage
           required: true,
        },
        serialNumber: {
            type: Number,
            required: true
         },
        value: {
            type: String,
         },
         generatorID: {
            type: String,
         },
         farmer: {
            type: String,
            default: ""
         },
        },
        { timestamps: true }
      )
    );
  
    return scratchCards;
  };