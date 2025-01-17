require("dotenv").config();
const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const Handlefailure = require("../../middleware/failureHandler");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

"use strict";

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
      subject: 'Agent Registration',
      text: `
        Hello ${ name },
        You have been registered as An Agent on the AGRI-GATE COMPANY LIMITED 
        use the following credentials to login into the system.

        email : ${ email }
        password : ${ password }
      `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending agent registration email:', error);
      } else {
          console.log('Agent Registration Email Sent:', info.response);
      }
  });
}

// sms api
const africastalking = require('africastalking')({
  apiKey: process.env.AFRICA_TALKING_API_KEY,
  username: process.env.AFRICA_TALKING_USERNAME
});

// format phone to international
function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if the number starts with 0 (local format)
  if (cleaned.startsWith('0')) {
    return `+256${cleaned.slice(1)}`; // Replace leading 0 with +256
  }

  // If already in international format, return as is
  if (cleaned.startsWith('256')) {
    return `+${cleaned}`;
  }

  // Otherwise, assume it's invalid
  throw new Error('Invalid phone number format');
}


// otp generation
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// send otp
async function sendOTP(contact, otp) {
  try {
    const sms = africastalking.SMS;
    const formattedContact = formatPhoneNumber(contact);
    const message = `Your OTP is ${otp}. It is valid for 10 minutes.`;
    const options = {
      to: formattedContact,
      message: message,
    };
    const response = await sms.send(options);
    console.log(`OTP sent to ${formatPhoneNumber}:`, response);
    return response;
  } catch (error) {
    console.error(`Error sending OTP to ${formatPhoneNumber}:`, error);
    throw error;
  }
}

exports.Createuser = async (req, res) => {
   try {
    // Get user input
    const { name, contact, email, password } = req.body;
    // Validate user input
    if (!(email && password && name && contact)) {

      return res.status(400).send({message:"All input is required"});
    }
    // check if user already exist ..
    // Validate if user exist in our database
    const oldUser = await Users.findOne({ email });
    if (oldUser) {
      return res.status(409).send({message:"User Already Exist. Please Login"});
    }
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);
    // Create user in our database
    const user = await Users.create({
      name,
      contact,
      role:'admin',
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
    return  res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(err.status).json({error: err.message});
  }
};

exports.Createagent = async (req, res) => {
  try {
   // Get user input ..
   const { name, contact, email, password } = req.body;
   // Validate user input ..
   if (!(email && password && name && contact)) {

     return res.status(400).send({message:"All input is required"});
   }
   // check if agent already exists ..

   const oldUser = await Users.findOne({ email });
   if (oldUser) {
     return res.status(409).send({message:"User with this email Already Exists. Please Login"});
   }

   // Encrypt user password ..
   encryptedPassword = await bcrypt.hash(password, 10);
   // Create agent in the database ..
   const user = await Users.create({
     name,
     contact,
     role:'agent',
     email: email.toLowerCase(), // sanitize: convert email to lowercase
     password: encryptedPassword,
     suspended: false,
   });

   sendAgentRegistrationEmail(user.name, user.email, password);

   // return successful message for creation of the agent  ..

   return  res.status(201).send("Agent has been created successfully");

 } catch (err) {
   console.log(err);
   return res.status(err.status).json({error: err.message});
 }
};

// Login function with OTP generation
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send({ message: "All input is required" });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "Invalid Credentials" });
    }

    if (user.suspended) {
      return res.status(403).send({ message: "Your account is suspended. Please contact support." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      await sendOTP(user.contact, otp);

      return res.status(200).send({
        message: "OTP sent to registered contact number",
        userId: user._id,
      });
    } else {
      return res.status(400).send({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "An error occurred" });
  }
};

// OTP verification function
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

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

      user.otp = null; // Clear OTP after successful verification
      user.otpExpires = null;
      await user.save();

      return res.status(200).send({ message: "Login successful", token });
    } else {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "An error occurred" });
  }
};

exports.getAdmin = (req, res) => {
  const id = req.params.id;
  Users.findById(id)
  .then(data => {
    if( data !== null){
      res.status(200).send( { message: 'success', data:data});
    }
   else{
    res.status(404).send( {message:'no user retrieved', data:null});
   }
  })
  .catch(err => {
    res.status(500).send({
      message: "error, can't retrieve data"
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
  await Users.deleteOne( { "_id" : ObjectId(id) } );
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
    await Users.updateOne(
      { _id: ObjectId(id) },
      { $set: { suspended: true } }
    );

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
      return res.status(404).send({ message: "No user found with the provided contact" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "An error occurred", error: err.message });
  }
};






