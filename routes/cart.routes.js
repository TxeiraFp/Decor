const { Router } = require("express");
const CartController = require("../controllers/cartController");
const { autenticarToken } = require("../middlewares/auth");

console.log("auth:", autenticarToken);
console.log("controller:", CartController);

const routes = Router();

// Prefixo "/cart" já é aplicado no arquivo principal de rotas
// (routes.use("/cart", cartRoutes)), então aqui ficam só os caminhos relativos.

routes.get(
  "/",
  autenticarToken,
  CartController.getMyCart // GET /cart
);

routes.post(
  "/items",
  autenticarToken,
  CartController.addItem // POST /cart/items
);

routes.put(
  "/items/:itemId",
  autenticarToken,
  CartController.updateItem // PUT /cart/items/:itemId
);

routes.delete(
  "/items/:itemId",
  autenticarToken,
  CartController.removeItem // DELETE /cart/items/:itemId
);

module.exports = routes;