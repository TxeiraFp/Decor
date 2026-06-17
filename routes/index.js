const { Router } = require("express");

const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const uploadRoutes = require("./upload.routes");
const categoriaRoutes = require("./categoria.routes");

const routes = Router();

routes.use(userRoutes);
routes.use(authRoutes);
routes.use(productRoutes);
routes.use("/upload", uploadRoutes);
routes.use(categoriaRoutes);


module.exports = routes;