const { stringify } = require("uuid");

// admin user
module.exports = (mongoose) => {
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
        otp: String,
        otpExpires: Date,
        registeredDevices: [
          {
            deviceId: String,
            deviceName: String,
            registeredAt: { type: Date, default: Date.now },
            lastLoginAt: Date,
          },
        ],
      },
      { timestamps: true }
    )
  );

  return Users;
};
