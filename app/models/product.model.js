
module.exports = mongoose => {
  const Products = mongoose.model(
    "Products",
    mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
        },
        unitPrice: {
          type: String,
          required: true,
        },
        number: {
          type: Number,
          required: true,
        },
        adderID: {
          type: String,
          required: true,
        },
        description: String,

      },
      { timestamps: true }
    )
  );

  return Products;
};