const auth = require("../../middleware/auth");

module.exports = app => {
    const products = require("../controllers/products.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-product",products.addProduct);
    router.get("/",products.getAllProducts);
    router.get("/:id",products.getProduct);
    router.patch("/:id",products.editProduct)
    router.delete("/:id",products.deleteProduct)

    app.use('/products', router);
  };