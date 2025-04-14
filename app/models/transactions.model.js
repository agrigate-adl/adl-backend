// admin user
module.exports = mongoose => {
   const Transactions = mongoose.model(
       "Transactions",
       mongoose.Schema(
           {
               payee: {
                   type: Object, // Contains { name, contact, id }
                   required: true,
               },
               package: {
                   type: String, // Assuming this is the package ID
                   required: true
               },
               amount: {
                   type: Number,
                   required: true
               },
               reference: {
                   type: String,
               },
               status: {
                   type: String,
                   enum: ['pending', 'completed', 'failed'],
                   default: 'pending' // Default to pending for mobile money payments
               }
           },
           { timestamps: true }
       )
   );
 
   return Transactions;
};