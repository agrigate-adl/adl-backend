module.exports = (mongoose) => {
    const Credit = mongoose.model(
      "Credit",
      mongoose.Schema(
        {
          creditorName: { type: String, required: true },
          residenceDetails: { type: String, required: true },
          loanValue: { type: Number, required: true },
          paymentPeriod: { type: Number, required: true }, // in months
          interestRate: { type: Number, required: true }, // percentage
          supportingDocuments: { type: [String], default: [] }, // Array of file paths or URLs
          creditType: { type: String, required: true }, // "cash" or "produce"
        },
        { timestamps: true }
      )
    );
  
    return Credit;
  };
  