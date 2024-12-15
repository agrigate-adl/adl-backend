const db = require("../models/index");
const dbConfig = require("../../config/dbconfig.js");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Users = db.Users;
const Counters = db.Counters;
const Farmers = db.Farmers;

exports.addFarmer = async (req, res) => {
  const { name, contact, adderID, farmProducts, location, gender } = req.body;
  if (!(name && contact && adderID && farmProducts && location)) {
    return res.status(400).send({ message: "All input is required" });
  }
  Farmers.findOne({ contact: contact })
    .then(async (data) => {
      if (data !== null) {
        res.status(502).send({ message: "Contact already in user" });
        return;
      }
      var num
      var collectionExists = await Counters.findById(dbConfig.counterCollection)
      if (collectionExists == null) {
        const count = new Counters({
          _id: new ObjectId(dbConfig.counterCollection),
          farmers: 1,
          products: 0,
          packages: 0,
        });
       var counts =  await count.save(count)
       num = counts.farmers
      } else {
        try {
          let doc = await Counters.findByIdAndUpdate(dbConfig.counterCollection.toString(), 
          {$inc: {farmers: 1}}, {new: true, useFindAndModify:false })
           if (doc) { 
              num = doc.farmers
            } 
          } catch (err) {
            res.status(500).send({ message: "failed to add user" });
            return
          }
      }

      if (typeof num === "number" || !num) {
        const farmer = new Farmers({
          name: name,
          contact: contact,
          adderID: adderID,
          number: num,
          farmProducts: farmProducts,
          location: location,
          gender: gender,
          packages: [],
        });
        
        farmer
          .save(farmer)
          .then((data) => {
            res.status(201).send({
              message: "success",
              data,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: error.message,
            });
          });
      } else {
        res.status(502).send({ message: "Failed to save farmer" });
        return;
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message,
      });
    });
};

exports.getFarmer = async (req, res) => {
  const id = req.params.id;
  Farmers.findById(id)
    .then((data) => {
      if (data !== null) {
        res.status(200).send({ message: "success", data: data });
      } else {
        res.status(404).send({ message: "no farmer retrieved", data: null });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "error, can't retrieve data",
      });
    });
};

exports.getAllFarmers = async (req, res) => {
  Farmers.find()
    .then((data) => {
      res.status(200).json({
        message: "success",
        data: data,
      });
    })
    .catch(() => {
      res.status(500).send({
        message: "failed",
      });
    });
};
exports.deleteFarmer = async (req, res) => {
  const id = req.params.id;
  try {
  await Farmers.deleteOne( { "_id" : ObjectId(id) } );
  res.status(200).send({
    message: "deleted farmer successfully",
  });
 } catch (e) {
  res.status(500).send({
    message: "failed to delete farmer",
  });
 }
};

exports.editFarmer = async (req, res) => {};

exports.searchkey =(req,res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No body syntax from the request'});
    return;
  }

  if(req.body.word){
        var filter = [{
          '$search': {
            'index': 'default',
            'text': {
              'path': ['name', 'contact'],
              'query': req.body.word,
            }
        }
      },{"$limit" : 10}];
     // Books.index( { title: "text", author: "text" ,category:"text"} );
      Farmers.aggregate(filter)
      .then(data => {
        // console.log(req.body.word, data);
        if( data.length > 0){    
          res.status(200).send({ message: 'success',  data});  
        }
       else{
        res.status(200).send({ message: 'no farmers found'});
       }

      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving farmers."
        });
      });
     
    }else{
      res.status(401).send({text: 'failed', msg: 'no word given', result:null});
      return;
    }
};


exports.getFarmerByContact = async (req, res) => {
  try {
  
    const { contact } = req.params; 

    if (!contact) {
      return res.status(400).send({ message: "Contact is required" });
    }

    const farmer = await Farmers.findOne({ contact });

    if (farmer) {
      return res.status(200).json({ message: "Farmer found", data: farmer });
    } else {
      return res.status(404).send({ message: "No Farmer found with the provided contact" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "An error occurred", error: err.message });
  }
};

