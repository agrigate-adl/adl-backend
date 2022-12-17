const db = require("../models/index");

const Products = db.Products;

exports.addProduct = async (req, res) => {
    const { name, adderID, price, description } = req.body;
    if (!(name  && adderID && description && price)) {
        return res.status(400).send({message:"All input is required"});
    }
      const product = new Products({
        name: name,
        adderID: adderID,
        description: description,
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

exports.editProduct = async (req, res) => {

}