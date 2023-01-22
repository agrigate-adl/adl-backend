const db = require("../models/index");

const Users = db.Users;
const Farmers = db.Farmers;

exports.addFarmer = async (req, res) => {
    const { name, contact, adderID, farmProducts, location, gender } = req.body;
    if (!(name && contact && adderID && farmProducts && location)) {
        return res.status(400).send({message:"All input is required"});
    }
      const farmer = new Farmers({
        name: name,
        contact: contact,
        adderID: adderID,
        farmProducts: farmProducts,
        location: location,
        gender:gender,
        packages: [],
      }); 
      farmer
        .save(farmer)
        .then((data) => {
          res.status(201).send({
            message:"success",
            data
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: error.message,
          });
        });
}

exports.getFarmer = async (req, res) => {
    const id = req.params.id;
    Farmers.findById(id)
    .then(data => {
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no farmer retrieved', data:null});
     }
    })
    .catch(err => {
      res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
}

exports.getAllFarmers = async (req, res) => {
Farmers
.find()
.then((data) => {
  res.status(200).json({
    message: "success",
    data:data
  });
})
.catch(() => {
  res.status(500).send(
    {
      message:"failed"
    }
  );
});
}

exports.editFarmer = async (req, res) => {

}