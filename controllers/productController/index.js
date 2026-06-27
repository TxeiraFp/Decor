const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProductController = {

  // CREATE
  async createProduct(req, res) {
    const productData = req.body;
    try {
      console.log("📦 PRODUCT RECEBIDO:", productData);

      if (!productData.name || !productData.price || !productData.categoryId) {
        return res.status(400).json({
          error: "Campos obrigatórios faltando (name, price, categoryId)"
        });
      }

      const newProduct = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          categoryId: productData.categoryId,
          images: productData.images || [],
          variants: {
            create: (productData.variants || []).map(v => ({
              size: v.size,
              color: v.color,
              stock: {
                create: {
                  quantity: v.stock?.quantity || 0
                }
              }
            }))
          }
        },
        include: {
          variants: true,
          category: true
        }
      });

      return res.status(201).json(newProduct);
    } catch (error) {
      console.log("❌ ERRO CREATE PRODUCT:", error);
      return res.status(400).json({
        error: "Erro ao cadastrar o produto!",
        details: error.message
      });
    }
  },

  // UPDATE
  async updateProduct(req, res) {
    const bodyData = req.body;
    const { product_id } = req.params;
    try {
      const updateData = {
        name: bodyData.name,
        description: bodyData.description || null,
        categoryId: bodyData.categoryId
      };

      if (bodyData.price !== undefined) {
        updateData.price = Number(bodyData.price);
      }

      if (bodyData.images) {
        updateData.images = bodyData.images;
      }

      const product = await prisma.product.update({
        where: { id: product_id },
        data: updateData,
      });

      if (bodyData.variants && bodyData.variants.length > 0) {
        for (const v of bodyData.variants) {
          const variant = await prisma.variant.findFirst({
            where: { productId: product_id }
          });

          if (variant) {
            await prisma.variant.update({
              where: { id: variant.id },
              data: {
                size: v.size,
                color: v.color
              }
            });

            await prisma.stock.update({
              where: { variantId: variant.id },
              data: {
                quantity: Number(v.stock?.quantity || 0)
              }
            });
          }
        }
      }

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product_id },
        include: {
          category: true,
          variants: {
            include: { stock: true }
          }
        }
      });

      return res.status(200).json({
        message: "Produto atualizado com sucesso",
        produto: updatedProduct
      });
    } catch (error) {
      console.log("❌ UPDATE ERROR:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      return res.status(400).json({
        error: "Erro ao atualizar o produto",
        details: error.message
      });
    }
  },

  // GET ALL (com suporte a busca, filtro por categoria e ordenação)
  // Query params aceitos:
  //   ?search=camisa            -> busca por nome (case-insensitive)
  //   ?categoryId=abc123        -> filtra pela categoria E suas subcategorias
  //   ?order=asc | desc         -> ordena por preço
  async getProducts(req, res) {
    try {
      const { search, categoryId, order } = req.query;

      const where = {};

      // Busca por nome (case-insensitive)
      if (search) {
        where.name = {
          contains: search,
          mode: "insensitive"
        };
      }

      // Filtro por categoria, incluindo subcategorias filhas
      if (categoryId) {
        const children = await prisma.category.findMany({
          where: { parentId: categoryId },
          select: { id: true }
        });
        const categoryIds = [categoryId, ...children.map(c => c.id)];
        where.categoryId = { in: categoryIds };
      }

      // Ordenação por preço
      let orderBy = { createdAt: "desc" }; // padrão: mais recentes primeiro
      if (order === "asc") orderBy = { price: "asc" };
      if (order === "desc") orderBy = { price: "desc" };

      const products = await prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
          variants: {
            include: { stock: true }
          }
        }
      });

      return res.status(200).json(products);
    } catch (error) {
      console.log("❌ ERRO GET PRODUCTS:", error);
      return res.status(400).json({
        error: "Erro ao buscar produtos",
        details: error.message
      });
    }
  },

  // GET BY ID
  async getProductById(req, res) {
    try {
      const { product_id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: product_id },
        include: {
          category: true,
          variants: {
            include: { stock: true }
          }
        }
      });

      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.status(200).json(product);
    } catch (error) {
      return res.status(400).json({
        error: "Erro ao buscar o produto pelo id",
        details: error.message
      });
    }
  },

  // DELETE
  async deleteProduct(req, res) {
    const { product_id } = req.params;
    try {
      await prisma.product.delete({
        where: { id: product_id }
      });
      return res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      console.log("DELETE ERROR:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      return res.status(400).json({
        error: "Erro ao deletar o produto",
        details: error.message
      });
    }
  }

  // OBS: getProductsByUser foi removido — o schema de Product não possui
  // o campo userId, então essa rota sempre falharia. Se quiser produtos
  // por usuário (ex: "quem cadastrou"), é necessário adicionar um campo
  // userId no model Product no schema.prisma e rodar uma migration.
};

module.exports = ProductController;