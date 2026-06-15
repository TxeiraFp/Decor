const { Router } = require("express");

const LoginController = require("../controllers/login");

const routes = Router();

/**
 * 🔑 Login
 */
routes.post("/auth/login", LoginController.login);

module.exports = routes;