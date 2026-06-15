const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UserController = {

  // 🟢 CREATE USER
  async createUser(req, res) {
    const { email, name, password, role } = req.body;

    try {
      // verifica se já existe
      const existe = await prisma.user.findUnique({
        where: { email }
      });

      if (existe) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      // hash senha
      const senhaCriptografada = await bcrypt.hash(password, 10);

      // cria usuário
      const novoUsuario = await prisma.user.create({
        data: {
          email,
          name,
          password: senhaCriptografada,
          role: role || "CUSTOMER"
        }
      });

      return res.status(201).json({
        id: novoUsuario.id,
        email: novoUsuario.email,
        name: novoUsuario.name,
        role: novoUsuario.role
      });

    } catch (error) {
      return res.status(500).json({
        error: "Erro ao cadastrar usuário",
        detalhes: error.message
      });
    }
  },

  // 📋 LIST USERS
  async userList(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(200).json(users);

    } catch (error) {
      return res.status(500).json({
        error: "Erro ao listar usuários",
        detalhes: error.message
      });
    }
  },

  // 🔍 GET BY ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json(user);

    } catch (error) {
      return res.status(500).json({
        error: "Erro ao buscar usuário",
        detalhes: error.message
      });
    }
  }

};

module.exports = UserController;