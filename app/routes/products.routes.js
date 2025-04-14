const auth = require("../../middleware/auth");

module.exports = app => {
    const products = require("../controllers/products.controllers");
  
    var router = require("express").Router(); 

    router.post("/add-product",products.addProduct);
    router.get("/",products.getAllProducts);
    router.get("/:id",products.getProduct);
      // Update price
  router.put("/:id/price", products.editPrice);
    router.delete("/:id",products.deleteProduct)
/*     router.patch("/:id", products.editProduct) */

    app.use('/products', router);
  };