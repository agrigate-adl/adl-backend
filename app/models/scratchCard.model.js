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
           type: String,// used/unused
           required: true,
        },
        cardNumber: {
            type: Number,
            required: true
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