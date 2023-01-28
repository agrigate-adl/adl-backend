const auth = require("../../middleware/auth");

module.exports = app => {
    const products = require("../controllers/products.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-product",auth,products.addProduct);
    router.get("/",auth,products.getAllProducts);
    router.get("/:id",auth,products.getProduct);
    router.patch("/:id",auth,products.editProduct)
    router.delete("/:id",auth,products.deleteProduct)

    app.use('/products', router);
  };