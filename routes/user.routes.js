const { Router } = require("express");

const UserController = require("../controllers/UserController");
const {
  autenticarToken,
  somenteAdmin
} = require("../middlewares/auth");

const routes = Router();

/**
 * 👤 Criar usuário (público)
 */
routes.post("/users", UserController.createUser);

/**
 * 📋 Listar usuários (somente admin)
 */
routes.get(
  "/users",
  autenticarToken,
  somenteAdmin,
  UserController.userList
);

/**
 * 🔍 Buscar usuário por ID (logado)
 */
routes.get(
  "/users/:id",
  autenticarToken,
  UserController.getUserById
);

module.exports = routes;