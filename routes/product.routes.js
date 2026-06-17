const { Router } = require("express");
const ProductController = require("../controllers/productController");
const { autenticarToken, somenteAdmin } = require("../middlewares/auth");

const routes = Router();

routes.post("/products", autenticarToken, somenteAdmin, ProductController.createProduct);

routes.get("/products", ProductController.getProducts);

routes.get("/products/:product_id", ProductController.getProductById);

routes.put("/products/:product_id", autenticarToken, somenteAdmin, ProductController.updateProduct);

routes.delete("/products/:product_id", autenticarToken, somenteAdmin, ProductController.deleteProduct);

module.exports = routes;