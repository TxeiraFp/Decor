const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

const LoginController = {
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // 🔍 busca usuário no Prisma
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // 🔐 verifica senha
      const senhaValida = await bcrypt.compare(password, user.password);

      if (!senhaValida) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      // 🎟️ gera token
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        usuario: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });

    } catch (error) {
      return res.status(500).json({
        error: "Erro ao realizar login",
        detalhes: error.message
      });
    }
  }
};

module.exports = LoginController;