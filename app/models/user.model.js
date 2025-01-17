// admin user
module.exports = mongoose => {
    const Users = mongoose.model(
      "Users",
      mongoose.Schema(
        {
          email: String,
          name: String,
          contact: String,
          password: String,
          role: String,
          suspended: { type: Boolean, default: false },
        },
        { timestamps: true }
      )
    );
  
    return Users;
  };