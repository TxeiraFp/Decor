const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes');

dotenv.config();

const app = express();

/**
 * MIDDLEWARES
 */
app.use(express.json());
app.use(cors({ origin: "*" }));

/**
 * LOGGER (TEM QUE VIR ANTES DAS ROTAS)
 */
app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

/**
 * ROTAS API
 * IMPORTANTE: precisam vir ANTES do express.static("public"),
 * senão qualquer pasta física dentro de /public com o mesmo nome
 * de uma rota (ex: public/cart/) é servida como estático primeiro
 * e a API nunca é alcançada (isso causava o 301 Redirecting em /cart).
 */
app.use("/uploads", express.static("uploads"));
app.use(routes);

/**
 * STATIC (FRONTEND)
 * Só serve arquivo estático se nenhuma rota de API acima já tiver
 * respondido — assim /cart, /products etc. continuam indo pro controller,
 * e só o resto (html, css, js do site) cai aqui.
 */
app.use(express.static("public"));

/**
 * FALLBACK (opcional)
 */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/**
 * PORT
 */
const PORT = process.env.PORT || 8008;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 servidor rodando em http://localhost:${PORT}`);
});