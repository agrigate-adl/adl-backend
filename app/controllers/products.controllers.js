const db = require("../models/index");
const dbConfig = require("../../config/dbconfig.js");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Products = db.Products;
const Counters = db.Counters;

exports.addProduct = async (req, res) => {
    const { name, adderID, price, description } = req.body;
    if (!(name  && adderID && description && price)) {
        return res.status(400).send({message:"All input is required"});
    }

    Products.findOne({ name: name })
    .then(async (data) => {
      if (data !== null) {
        res.status(502).send({ message: "product already exists" });
        return;
      }
      var num
      var collectionExists = await Counters.findById(dbConfig.counterCollection)
      if (collectionExists == null) {
        const count = new Counters({
          _id: new ObjectId(dbConfig.counterCollection),
          farmers: 0,
          products: 1,
          packages: 0,
        });
       var counts =  await count.save(count)
       num = counts.products
      } else {
        try {
          let doc = await Counters.findByIdAndUpdate(dbConfig.counterCollection.toString(), 
          {$inc: {products: 1}}, {new: true, useFindAndModify:false })
           if (doc) { 
              num = doc.products
            } 
          } catch (err) {
            res.status(500).send({ message: "failed to add product" });
            return
          }
      }

      if (typeof num === "number" || !num) {

      const product = new Products({
        name: name,
        adderID: adderID,
        description: description,
        number:num,
        unitPrice: price,
      }); 
      product
        .save(product)
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
      } else {
        res.status(502).send({ message: "Failed to save product" });
        return;
      }

      }).catch((e) => {
          res.status(500).send({
            message: e.message,
          });
        });
}

exports.getProduct = async (req, res) => {
    const id = req.params.id;
    Products.findById(id)
    .then(data => {
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no product retrieved', data:null});
     }
    })
    .catch(err => {
      res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
}

exports.getAllProducts = async (req, res) => {
Products
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
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
  await Products.deleteOne( { "_id" : ObjectId(id) } );
  res.status(200).send({
    message: "deleted product successfully",
  });
 } catch (e) {
  console.log(e)
  res.status(500).send({
    message: "failed to product product",
  });
 }
};

exports.editProduct = async (req, res) => {
  const id = req.params.id; // Get product ID from the request parameters
  const { name, price, description } = req.body; // Extract fields to update

  // Validate input
  if (!(name || price || description)) {
    return res.status(400).send({ message: "At least one field is required to update the product." });
  }

  try {
    // Find the product by ID and update the fields
    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(price && { unitPrice: price }),
        ...(description && { description }),
      },
      { new: true, useFindAndModify: false } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).send({ message: "Product not found." });
    }

    res.status(200).send({
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).send({ message: "An error occurred while updating the product." });
  }
};
