const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CategoryController = {

  // CREATE CATEGORY
  async createCategory(req, res) {
    const { name, parentId } = req.body;
    try {
      const category = await prisma.category.create({
        data: {
          name,
          parentId: parentId || null
        }
      });
      return res.status(201).json(category);
    } catch (error) {
      return res.status(400).json({
        error: "Erro ao criar categoria",
        details: error.message
      });
    }
  },

  // LIST ALL CATEGORIES (somente raízes, com filhos aninhados)
  async getCategories(req, res) {
    try {
      const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              products: true
            }
          },
          products: true
        }
      });
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(400).json({
        error: "Erro ao buscar categorias"
      });
    }
  },

  // GET CATEGORY BY ID
  async getCategoryById(req, res) {
    const { id } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          children: true,
          products: true
        }
      });
      if (!category) {
        return res.status(404).json({
          error: "Categoria não encontrada"
        });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(400).json({
        error: "Erro ao buscar categoria"
      });
    }
  },

  // UPDATE CATEGORY
  async updateCategory(req, res) {
    const { id } = req.params;
    const { name, parentId } = req.body;
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          parentId: parentId || null
        }
      });
      return res.status(200).json({
        message: "Categoria atualizada com sucesso",
        category
      });
    } catch (error) {
      return res.status(400).json({
        error: "Erro ao atualizar categoria"
      });
    }
  },

  // DELETE CATEGORY
  async deleteCategory(req, res) {
    const { id } = req.params;
    try {
      const products = await prisma.product.count({
        where: { categoryId: id }
      });

      if (products > 0) {
        return res.status(400).json({
          error: `Não é possível apagar. Existem ${products} produto(s) nesta categoria.`
        });
      }

      await prisma.category.deleteMany({
        where: { parentId: id }
      });

      await prisma.category.delete({
        where: { id }
      });

      return res.status(200).json({
        message: "Categoria deletada com sucesso"
      });
    } catch (error) {
      console.error("ERRO DELETE:", error);
      return res.status(400).json({
        error: "Erro ao deletar categoria",
        details: error.message
      });
    }
  }
};

module.exports = CategoryController;