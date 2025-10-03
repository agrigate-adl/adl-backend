require("dotenv").config();
const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const EmailService = require("../../services/emailService");
const Handlefailure = require("../../middleware/failureHandler");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

("use strict");

const Users = db.Users;

// Sending an Email to the user for Registration verification...
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_PASSWORD,
  },
});

// Sending Email to Registered Agent ..
function sendAgentRegistrationEmail(name, email, password) {
  const mailOptions = {
    from: process.env.COMPANY_EMAIL,
    to: email,
    subject: "Agent Registration",
    text: `
        Hello ${name},
        You have been registered as An Agent on the AGRI-GATE COMPANY LIMITED 
        use the following credentials to login into the system.

        email : ${email}
        password : ${password}
      `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending agent registration email:", error);
    } else {
      console.log("Agent Registration Email Sent:", info.response);
    }
  });
}

// sms api
const africastalking = require("africastalking")({
  apiKey: process.env.AFRICA_TALKING_API_KEY,
  username: process.env.AFRICA_TALKING_USERNAME,
});

// format phone to international
function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if the number starts with 0 (local format)
  if (cleaned.startsWith("0")) {
    return `+256${cleaned.slice(1)}`; // Replace leading 0 with +256
  }

  // If already in international format, return as is
  if (cleaned.startsWith("256")) {
    return `+${cleaned}`;
  }

  // Otherwise, assume it's invalid
  throw new Error("Invalid phone number format");
}

// otp generation
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// send otp via SMS (now optional - email is primary)
async function sendOTP(contact, otp) {
  try {
    const formattedContact = formatPhoneNumber(contact);
    const message = `Hello, Your OTP is ${otp}.Please enter this code within the next 10 minutes. 
    If you did not request this, 
    please ignore this message. Thank you.`;

    // Check if SMS is disabled or we're in development/test mode
    const smsEnabled = process.env.SMS_OTP_ENABLED === "true";
    const isDevelopment = process.env.NODE_ENV === "development";
    const isEmailTestMode = process.env.EMAIL_TEST_MODE === "true";

    if (!smsEnabled || isDevelopment || isEmailTestMode) {
      // In development, just log to console and return mock response
      console.log("\n" + "=".repeat(60));
      let modeText;
      if (!smsEnabled) {
        modeText = "SMS DISABLED - Email-First Mode";
      } else if (isEmailTestMode) {
        modeText = "EMAIL TEST MODE - SMS DISABLED";
      } else {
        modeText = "DEVELOPMENT MODE - SMS NOT SENT";
      }
      console.log(`📱 ${modeText}`);
      console.log("=".repeat(60));
      console.log(`📧 Contact: ${formattedContact}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`📝 Message: ${message}`);
      console.log(`⚙️ SMS_OTP_ENABLED: ${smsEnabled}`);
      console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
      if (!smsEnabled) {
        console.log(
          `💡 Note: SMS OTP is disabled - Email is the primary delivery method`
        );
      }
      console.log("=".repeat(60) + "\n");

      // Return a mock successful response
      let responseMessage;
      if (!smsEnabled) {
        responseMessage =
          "SMS disabled - Email-first mode active (no SMS costs)";
      } else if (isEmailTestMode) {
        responseMessage =
          "OTP logged to console (email test mode - SMS disabled)";
      } else {
        responseMessage = "OTP logged to console (development mode)";
      }
      return {
        status: "success",
        message: responseMessage,
        recipients: [formattedContact],
      };
    }

    // In production, send actual SMS
    const sms = africastalking.SMS;
    const options = {
      to: formattedContact,
      message: message,
    };
    const response = await sms.send(options);
    console.log(
      `OTP sent to ${formattedContact}:`,
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error) {
    console.error(`Error sending OTP to ${formattedContact}:`, error.message);
    throw error;
  }
}

exports.Createuser = async (req, res) => {
  try {
    // Get user input
    const { name, contact, email, password } = req.body;
    // Validate user input
    if (!(email && password && name && contact)) {
      return res.status(400).send({ message: "All input is required" });
    }
    // check if user already exist ..
    // Validate if user exist in our database
    const oldUser = await Users.findOne({ email });
    if (oldUser) {
      return res
        .status(409)
        .send({ message: "User Already Exist. Please Login" });
    }
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);
    // Create user in our database
    const user = await Users.create({
      name,
      contact,
      role: "admin",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      suspended: false,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "12h",
      }
    );
    // save user token
    user.token = token;
    // return new user
    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(err.status).json({ error: err.message });
  }
};

exports.Createagent = async (req, res) => {
  try {
    // Get user input ..
    const { name, contact, email, password } = req.body;
    // Validate user input ..
    if (!(email && password && name && contact)) {
      return res.status(400).send({ message: "All input is required" });
    }
    // check if agent already exists ..

    const oldUser = await Users.findOne({ email });
    if (oldUser) {
      return res
        .status(409)
        .send({ message: "User with this email Already Exists. Please Login" });
    }

    // Encrypt user password ..
    encryptedPassword = await bcrypt.hash(password, 10);
    // Create agent in the database ..
    const user = await Users.create({
      name,
      contact,
      role: "agent",
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      suspended: false,
    });

    try {
      await EmailService.sendAgentRegistrationEmail(
        user.name,
        user.email,
        password
      );
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // Don't fail the request if email fails
    }

    // return successful message for creation of the agent  ..

    return res.status(201).send("Agent has been created successfully");
  } catch (err) {
    console.log(err);
    return res.status(err.status).json({ error: err.message });
  }
};

// Login function with device-based OTP (first-time devices only)
exports.login = async (req, res) => {
  try {
    // Default to email as primary OTP delivery method
    const { email, password, deviceId, otpMethod = "email" } = req.body;

    if (!(email && password)) {
      return res.status(400).send({ message: "All input is required" });
    }

    // Check if SMS is available
    const smsEnabled = process.env.SMS_OTP_ENABLED === "true";

    // Validate otpMethod and availability
    if (otpMethod && !["sms", "email"].includes(otpMethod)) {
      return res
        .status(400)
        .send({ message: "Invalid OTP method. Use 'sms' or 'email'" });
    }

    // If SMS is requested but not enabled, inform user
    if (otpMethod === "sms" && !smsEnabled) {
      return res.status(400).send({
        message: "SMS OTP is currently unavailable. Please use email delivery.",
        availableMethods: ["email"],
      });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "Invalid Credentials" });
    }

    if (user.suspended) {
      return res.status(403).send({
        message: "Your account is suspended. Please contact support.",
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if this is a registered device for this user
      const isRegisteredDevice =
        deviceId &&
        user.registeredDevices &&
        user.registeredDevices.some((device) => device.deviceId === deviceId);

      // If device is already registered, allow direct login (no OTP)
      if (isRegisteredDevice) {
        console.log(
          `🔑 Direct login for registered device: ${deviceId.substring(
            0,
            12
          )}...`
        );

        // Update last login time for this device
        const deviceIndex = user.registeredDevices.findIndex(
          (device) => device.deviceId === deviceId
        );
        if (deviceIndex !== -1) {
          user.registeredDevices[deviceIndex].lastLoginAt = new Date();
          await user.save();
        }

        // Generate token and return successful login
        const token = jwt.sign(
          { user_id: user._id, email: user.email },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "12h" }
        );

        return res.status(200).send({
          message: "Login successful",
          token,
          requiresOTP: false,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
        });
      }

      // New device or no device ID provided - require OTP verification
      console.log(`🆔 New device login detected - requiring OTP verification`);
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Enhanced logging for development/testing purposes
      const isDevelopment = process.env.NODE_ENV === "development";
      const logTitle = isDevelopment
        ? "🔐 OTP GENERATED - DEVELOPMENT MODE 🔐"
        : "🔐 OTP GENERATED FOR TESTING 🔐";

      console.log("=".repeat(60));
      console.log(logTitle);
      console.log("=".repeat(60));
      console.log(`📧 User Email: ${user.email}`);
      console.log(`📱 User Contact: ${user.contact}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`📋 Requested Method: ${otpMethod.toUpperCase()}`);
      console.log(`⚙️ SMS Enabled: ${smsEnabled}`);
      console.log(`⏰ Expires At: ${otpExpires.toLocaleString()}`);
      if (isDevelopment) {
        console.log(`🚫 SMS Status: DISABLED (Development Mode)`);
        console.log(`💡 Note: Change NODE_ENV to 'production' to enable SMS`);
      } else if (!smsEnabled) {
        console.log(
          `💰 SMS Status: DISABLED (Cost Control - Email-First Mode)`
        );
        console.log(`💡 Note: Set SMS_OTP_ENABLED=true to enable SMS`);
      }
      console.log("=".repeat(60));

      try {
        // Primary delivery method: Email (always available)
        if (otpMethod === "email") {
          await EmailService.sendOTPEmail(user.name, user.email, otp);
          return res.status(200).send({
            message: "New device detected. OTP sent to your email address",
            userId: user._id,
            requiresOTP: true,
            otpMethod: "email",
          });
        }
        // Secondary delivery method: SMS (only if enabled)
        else if (otpMethod === "sms" && smsEnabled) {
          await sendOTP(user.contact, otp);
          return res.status(200).send({
            message:
              "New device detected. OTP sent to registered contact number",
            userId: user._id,
            requiresOTP: true,
            otpMethod: "sms",
          });
        }
        // Fallback to email if SMS requested but not available
        else {
          await EmailService.sendOTPEmail(user.name, user.email, otp);
          return res.status(200).send({
            message:
              "New device detected. SMS unavailable, OTP sent to your email address instead.",
            userId: user._id,
            requiresOTP: true,
            otpMethod: "email",
          });
        }
      } catch (deliveryError) {
        console.error(`Error sending OTP via ${otpMethod}:`, deliveryError);

        // Smart fallback logic
        if (otpMethod === "email" && smsEnabled) {
          // If email fails and SMS is available, try SMS as backup
          try {
            await sendOTP(user.contact, otp);
            return res.status(200).send({
              message:
                "Email delivery failed. OTP sent to your phone number instead.",
              userId: user._id,
              otpMethod: "sms",
            });
          } catch (smsError) {
            console.error("Both email and SMS delivery failed:", smsError);
          }
        } else if (otpMethod === "sms") {
          // If SMS fails, try email as backup
          try {
            await EmailService.sendOTPEmail(user.name, user.email, otp);
            return res.status(200).send({
              message:
                "SMS delivery failed. OTP sent to your email address instead.",
              userId: user._id,
              otpMethod: "email",
            });
          } catch (emailError) {
            console.error("Both SMS and email delivery failed:", emailError);
          }
        }

        return res.status(500).send({
          message:
            "Failed to deliver OTP via all available methods. Please try again or contact support.",
          error: deliveryError.message,
        });
      }
    } else {
      return res.status(400).send({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "An error occurred" });
  }
};

// OTP verification function with device registration
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp, deviceId, deviceName } = req.body;

    if (!(userId && otp)) {
      return res.status(400).send({ message: "User ID and OTP are required" });
    }

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.otp === otp && user.otpExpires > new Date()) {
      const token = jwt.sign(
        { user_id: user._id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "12h" }
      );

      // Register the device if deviceId is provided
      if (deviceId) {
        // Check if device is already registered
        const existingDeviceIndex = user.registeredDevices
          ? user.registeredDevices.findIndex(
              (device) => device.deviceId === deviceId
            )
          : -1;

        if (existingDeviceIndex === -1) {
          // Add new device
          if (!user.registeredDevices) {
            user.registeredDevices = [];
          }

          user.registeredDevices.push({
            deviceId,
            deviceName: deviceName || "Unknown Device",
            registeredAt: new Date(),
            lastLoginAt: new Date(),
          });

          console.log(
            `📱 New device registered: ${deviceId.substring(
              0,
              12
            )}... for user ${user.email}`
          );
        } else {
          // Update existing device info
          user.registeredDevices[existingDeviceIndex].lastLoginAt = new Date();
          if (deviceName) {
            user.registeredDevices[existingDeviceIndex].deviceName = deviceName;
          }
          console.log(
            `🔄 Updated existing device: ${deviceId.substring(
              0,
              12
            )}... for user ${user.email}`
          );
        }
      }

      user.otp = null; // Clear OTP after successful verification
      user.otpExpires = null;
      await user.save();

      return res.status(200).send({
        message: "Login successful" + (deviceId ? " - Device registered" : ""),
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    } else {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "An error occurred" });
  }
};

// Resend OTP function (Email-first, SMS optional)
exports.resendOTP = async (req, res) => {
  try {
    // Default to email as primary OTP delivery method
    const { userId, otpMethod = "email" } = req.body;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    // Check if SMS is available
    const smsEnabled = process.env.SMS_OTP_ENABLED === "true";

    // Validate otpMethod
    if (otpMethod && !["sms", "email"].includes(otpMethod)) {
      return res
        .status(400)
        .send({ message: "Invalid OTP method. Use 'sms' or 'email'" });
    }

    // If SMS is requested but not enabled, inform user
    if (otpMethod === "sms" && !smsEnabled) {
      return res.status(400).send({
        message: "SMS OTP is currently unavailable. Please use email delivery.",
        availableMethods: ["email"],
      });
    }

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(
      `🔄 Resending OTP via ${otpMethod.toUpperCase()} for user: ${
        user.email
      } (SMS Enabled: ${smsEnabled})`
    );

    try {
      // Send OTP via selected method
      if (otpMethod === "email") {
        await EmailService.sendOTPEmail(user.name, user.email, otp);
        return res.status(200).send({
          message: "New OTP sent to your email address",
          otpMethod: "email",
        });
      } else {
        // Default SMS method
        await sendOTP(user.contact, otp);
        return res.status(200).send({
          message: "New OTP sent to registered contact number",
          otpMethod: "sms",
        });
      }
    } catch (deliveryError) {
      console.error(`Error resending OTP via ${otpMethod}:`, deliveryError);

      // If email fails, try SMS as backup (if email was selected)
      if (otpMethod === "email") {
        try {
          await sendOTP(user.contact, otp);
          return res.status(200).send({
            message:
              "Email delivery failed. New OTP sent to your phone number instead.",
            otpMethod: "sms",
          });
        } catch (smsError) {
          console.error("Both email and SMS resend failed:", smsError);
        }
      }

      return res.status(500).send({
        message: "Failed to resend OTP. Please try again or contact support.",
        error: deliveryError.message,
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ error: "An error occurred while resending OTP" });
  }
};

exports.getAdmin = (req, res) => {
  const id = req.params.id;
  Users.findById(id)
    .then((data) => {
      if (data !== null) {
        res.status(200).send({ message: "success", data: data });
      } else {
        res.status(404).send({ message: "no user retrieved", data: null });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "error, can't retrieve data",
      });
    });
};

exports.getAllUsers = async (req, res) => {
  try {
    /* console.log("Fetching users..."); // Log start */
    const data = await Users.find(); // Fetch users
    /* console.log("Users fetched:", data); // Log result */

    if (data.length === 0) {
      return res.status(404).send({ message: "No users found" });
    }

    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (err) {
    /* console.error("Error in getAllUsers:", err.message); // Detailed logging */
    res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.deleteAgent = async (req, res) => {
  const id = req.params.id;
  /* console.log('Deleting agent with ID:', id); */
  try {
    await Users.deleteOne({ _id: ObjectId(id) });
    res.status(200).send({
      message: "deleted Agent successfully",
    });
  } catch (e) {
    res.status(500).send({
      message: "failed to delete agent",
    });
  }
};

exports.suspendAgent = async (req, res) => {
  const id = req.params.id;

  try {
    await Users.updateOne({ _id: ObjectId(id) }, { $set: { suspended: true } });

    res.status(200).send({
      message: "Agent suspended successfully",
    });
  } catch (e) {
    res.status(500).send({
      message: "Failed to suspend agent",
    });
  }
};

exports.unsuspendAgent = async (req, res) => {
  const id = req.params.id;

  try {
    await Users.updateOne(
      { _id: ObjectId(id) },
      { $set: { suspended: false } }
    );

    res.status(200).send({
      message: "Agent unsuspended successfully",
    });
  } catch (e) {
    res.status(500).send({
      message: "Failed to unsuspend agent",
    });
  }
};

exports.getUserByContact = async (req, res) => {
  try {
    const { contact } = req.params;

    if (!contact) {
      return res.status(400).send({ message: "Contact is required" });
    }

    const user = await Users.findOne({ contact });

    if (user) {
      return res.status(200).json({ message: "User found", data: user });
    } else {
      return res
        .status(404)
        .send({ message: "No user found with the provided contact" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "An error occurred", error: err.message });
  }
};

// Update agent information
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, contact } = req.body;

    if (!id) {
      return res.status(400).send({ message: "Agent ID is required" });
    }

    // Validate that at least one field is provided
    if (!email && !contact) {
      return res.status(400).send({
        message: "At least one field (email or contact) must be provided",
      });
    }

    // Check if agent exists
    const existingAgent = await Users.findById(id);
    if (!existingAgent) {
      return res.status(404).send({ message: "Agent not found" });
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (contact) updateData.contact = contact;

    // Update the agent
    const updatedAgent = await Users.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Agent updated successfully",
      data: updatedAgent,
    });
  } catch (err) {
    console.error("Error updating agent:", err);
    return res.status(500).send({
      message: "An error occurred while updating the agent",
      error: err.message,
    });
  }
};

// Get specific agent by ID
exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "Agent ID is required" });
    }

    const agent = await Users.findById(id);

    if (!agent) {
      return res.status(404).send({ message: "Agent not found" });
    }

    // Only return if the user is an agent
    if (agent.role !== "agent") {
      return res.status(404).send({ message: "Agent not found" });
    }

    return res.status(200).json({
      message: "Agent found",
      data: agent,
    });
  } catch (err) {
    console.error("Error fetching agent:", err);
    return res.status(500).send({
      message: "An error occurred while fetching the agent",
      error: err.message,
    });
  }
};

// Change password function
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id; // From auth middleware

    if (!(currentPassword && newPassword)) {
      return res.status(400).send({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({
        message: "New password must be at least 6 characters long",
      });
    }

    // Find the user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).send({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    console.log(`Password changed successfully for user: ${user.email}`);

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).send({
      message: "An error occurred while changing password",
      error: err.message,
    });
  }
};

// Admin reset agent password function
exports.resetAgentPassword = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { newPassword } = req.body;
    const adminId = req.user.user_id; // From auth middleware

    if (!newPassword) {
      return res.status(400).send({
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({
        message: "New password must be at least 6 characters long",
      });
    }

    // Verify admin user exists and has admin privileges
    const admin = await Users.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .send({ message: "Access denied. Admin privileges required." });
    }

    // Find the agent
    const agent = await Users.findById(agentId);
    if (!agent) {
      return res.status(404).send({ message: "Agent not found" });
    }

    if (agent.role !== "agent") {
      return res.status(400).send({ message: "User is not an agent" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update agent password
    agent.password = hashedNewPassword;
    await agent.save();

    // Send email notification to agent
    try {
      await EmailService.sendPasswordResetEmail(
        agent.name,
        agent.email,
        newPassword
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails
    }

    console.log(
      `Password reset by admin ${admin.email} for agent: ${agent.email}`
    );

    return res.status(200).json({
      message: "Agent password reset successfully. Email notification sent.",
    });
  } catch (err) {
    console.error("Error resetting agent password:", err);
    return res.status(500).send({
      message: "An error occurred while resetting password",
      error: err.message,
    });
  }
};
