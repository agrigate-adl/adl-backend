module.exports = mongoose => {
  const Credit = mongoose.model(
      "Credit",
      mongoose.Schema(
          {
              name: { type: String, required: true },
              /* phone: { type: String, required: true},
              email: { type: String, required: true}, */

              address: { type: String, required: true },
              amount: { type: Number, required: true },
              balance: { type: Number, required: true },
              paymentPeriod: { type: Number, required: true }, // in months
              interestRate: { type: Number, required: true }, // percentage
              creditType: { type: String, required: true },
              status: { type: String, required: true, default: 'pending' },

          },
          { timestamps: true }
      )
  );

  return Credit;
};

