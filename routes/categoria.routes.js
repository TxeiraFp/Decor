const { Router } = require("express");
const CategoryController = require("../controllers/categoriaController");
const { autenticarToken, somenteAdmin } = require("../middlewares/auth");

const routes = Router();

routes.post(
    "/categories",
    autenticarToken,
    somenteAdmin,
    CategoryController.createCategory
);

routes.get("/categories", CategoryController.getCategories);

routes.get("/categories/:id", CategoryController.getCategoryById);

routes.put(
    "/categories/:id",
    autenticarToken,
    somenteAdmin,
    CategoryController.updateCategory
);

routes.delete(
    "/categories/:id",
    autenticarToken,
    somenteAdmin,
    CategoryController.deleteCategory
);

module.exports = routes;