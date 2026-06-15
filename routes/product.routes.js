const { Router } = require("express");
const ProductController = require("../controllers/productController");
const { autenticarToken, somenteAdmin } = require("../middlewares/auth");

const routes = Router();

routes.post(
  "/products",
  autenticarToken,
  somenteAdmin,
  ProductController.createProduct
);

routes.get("/products", ProductController.getProducts);

routes.get("/products/:id", ProductController.getProductById);

routes.put(
  "/products/:id",
  autenticarToken,
  somenteAdmin,
  ProductController.updateProduct
);

routes.delete(
  "/products/:id",
  autenticarToken,
  somenteAdmin,
  ProductController.deleteProduct
);

module.exports = routes;