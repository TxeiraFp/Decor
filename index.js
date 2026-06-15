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
 * STATIC (FRONTEND)
 */
app.use(express.static("public"));

/**
 * ROTAS API
 */
app.use(routes);

/**
 * FALLBACK (opcional)
 */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/**
 * PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 servidor rodando em http://localhost:${PORT}`);
});