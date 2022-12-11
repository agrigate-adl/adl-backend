const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Handlefailure = require("../../middleware/failureHandler");

"use strict";

const Users = db.Users;

exports.Createuser = async (req, res) => {
   try {
    // Get user input
    const { name, contact, email, password } = req.body;
    // Validate user input
    if (!(email && password && name && contact)) {

      return res.status(400).send({message:"All input is required"});
    }
    // check if user already exist
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

exports.login = async (req, res) => {
 // Our login logic starts here
 try {
  // Get user input
  const { email, password } = req.body;

  // Validate user input
  if (!(email && password)) {
    return  res.status(400).send({message:"All input is required"});
  }
  // Validate if user exist in our database
  const user = await Users.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "12h",
      }
    );
    return  res.status(200).json({user,
     token
    });
  }
  res.status(400).send({messege:"Invalid Credentials"});
} catch (err) {
  console.log(err);
  return res.status(err.status).json({error: err.message});
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




