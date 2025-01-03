const db = require("../models/index");
const dbConfig = require("../../config/dbconfig.js");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// const Users = db.Users;
const Farmers = db.Farmers;
const Packages = db.FPackages
const Counters = db.Counters;

exports.addPackageToFarmer = async (req, res) => {
    const { name, owner, adderID, totalAmount, products } = req.body;
    if (!(name && owner && adderID && totalAmount && products)) {
        return res.status(400).send({message:"All input is required"});
    }
    var num
      try {
        let doc = await Counters.findByIdAndUpdate(dbConfig.counterCollection.toString(), 
        {$inc: {packages: 1}}, {new: true, useFindAndModify:false })
         if (doc) { 
            num = doc.packages
          } 
        } catch (err) {
          res.status(500).send({ message: "failed to add package" });
          return
        }
      const  package =new Packages({
        name: name,
        owner: owner,
        adderId: adderID,
        totalAmount: totalAmount,
        products: products,
        number: num,
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
            productNames.push(element.count + " of-" + element.name + " @" + element.price)
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
exports.deletePackage = async (req, res) => {
  const id = req.params.id;
  try {
  await Packages.deleteOne( { "_id" : ObjectId(id) } );
  res.status(200).send({
    message: "deleted package successfully",
  });
 } catch (e) {
  res.status(500).send({
    message: "failed to delete package",
  });
 }
};


// Editting the package ..

// exports.editPackage = async (req, res) => {
//   const { id } = req.params; 
//   const { name, owner, totalAmount, products } = req.body; 

//   if (!id || (!name && !owner && !totalAmount && !products)) {
//     return res.status(400).send({ message: "Invalid input. Provide package ID and fields to update." });
//   }

//   try {
//     const package = await Packages.findById(id);
//     if (!package) {
//       return res.status(404).send({ message: "Package not found" });
//     }

//     // Update package fields
//     if (name) package.name = name;
//     if (owner) package.owner = owner;
//     if (totalAmount) package.totalAmount = totalAmount;
//     if (products) package.products = products;

//     await package.save(); // Save updated package

//     // Update farmer's package information if needed
//     const ownerFarm = await Farmers.findById(package.owner);
//     if (ownerFarm) {
//       const packageIndex = ownerFarm.packages.findIndex(p => p.packageID.toString() === id);
//       if (packageIndex !== -1) {
//         if (name) ownerFarm.packages[packageIndex].name = name;
//         if (totalAmount) ownerFarm.packages[packageIndex].totalDue = totalAmount;
//         if (products) {
//           const productNames = products.map(p => `${p.count} of-${p.name} @${p.price}`);
//           ownerFarm.packages[packageIndex].products = productNames;
//         }
//         await ownerFarm.save(); // Save updated farmer
//       }
//     }

//     res.status(200).send({
//       message: "Package updated successfully",
//       data: package,
//     });
//   } catch (err) {
//     res.status(500).send({
//       message: "Failed to update package",
//       error: err.message,
//     });
//   }
// };

exports.editPackage = async (req, res) => {
  const { id } = req.params;
  const { name, owner, totalAmount, products } = req.body;

  if (!id || (!name  && !totalAmount && !products)) {
    return res.status(400).send({ message: "Invalid input. Provide package ID and fields to update." });
  }

  try {
    const package = await Packages.findById(id);
    if (!package) {
      return res.status(404).send({ message: "Package not found" });
    }

    if (name) package.name = name;
    if (products) package.products = products
    if (totalAmount) package.totalAmount = totalAmount
    
    package.updatedAt = new Date();

    await package.save(); 

    // Update farmer's package information if needed
    const ownerFarm = await Farmers.findById(package.owner);
    if (ownerFarm) {
      const updatedPackages = ownerFarm.packages.map(p => {
        if (p.packageID.toString() === id) {
          return {
            ...p,
            ...(name && { name }), 
            ...(totalAmount && { totalDue: totalAmount }), 
            ...(products && {
              products: products.map(p => `${p.count} of ${p.name} @${p.price}`)
            }), 
            updatedAt: package.updatedAt 
          };
        }
        return p; // Keep other packages unchanged
      });
      ownerFarm.packages = updatedPackages;
      await ownerFarm.save();
      }
    

    res.status(200).send({
      message: "Package updated successfully",
      data: package,
    });
  } catch (err) {
    res.status(500).send({
      message: "Failed to update package",
      error: err.message,
    });
  }
};
