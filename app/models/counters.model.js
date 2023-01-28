
module.exports = mongoose => {
    const Counters = mongoose.model(
      "Counters",
      mongoose.Schema(
        {
        farmers: {
            type: Number,
        },
        products: {
           type: Number,
        },
        packages: {
            type: Number,
        },
       },
       { timestamps: true }
      )
    );
  
    return Counters;
  };