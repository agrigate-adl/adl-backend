const db = require("../models/index");

// const Users = db.Users;
const Farmers = db.Farmers;
const Packages = db.FPackages

exports.addPackageToFarmer = async (req, res) => {
    const { name, owner, adderID, totalAmount, products } = req.body;
    if (!(name && owner && adderID && totalAmount && products)) {
        return res.status(400).send({message:"All input is required"});
    }
      const  package =new Packages({
        name: name,
        owner: owner,
        adderId: adderID,
        totalAmount: totalAmount,
        products: products,
        balance:0,
        status:'pending',
      }); 
      package
        .save(package)
        .then( async (data)  => {
          //edit farmer field
          try {
          owner_farm = await Farmers.findById(owner)
          var packages = owner_farm.packages
          var productNames = []
          products.forEach(element => {
            productNames.push(element.name)
          });
          packages.push({
            packageID: data._id,
            totalDue:totalAmount,
            balance:0,
            status:'pending',
            products:productNames,
            name: name
          })
          owner_farm.packages = packages
          await owner_farm.save();
          res.status(201).send({
            message:"success",
            data
          });
          }catch(e){
            res.status(401).send({messsage:
                "package added but failed to update farmer"
            });
          }

        })
        .catch((error) => {
          res.status(500).send({
            message: error.message,
          });
        });
}

exports.getFarmerPackage = async (req, res) => {
    const id = req.params.id;
    Packages.findById(id)
    .then(data => {
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no package retrieved', data:null});
     }
    })
    .catch(err => {
      res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
}

exports.getAllPackages = async (req, res) => {
Packages
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

// change farmer package too
exports.editPackage = async (req, res) => {
   
}