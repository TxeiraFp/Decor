const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CartController = {
  async createCart(req, res) {
    const userId = req.user.id;
    console.log("🟢 CREATE CART - USER:", userId);

    try {
      const existingCart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (existingCart) {
        console.log("🟡 CART JÁ EXISTE");
        return res.status(200).json(existingCart);
      }

      const cartCreated = await prisma.cart.create({
        data: { userId },
      });

      console.log("🟢 CART CRIADO:", cartCreated);
      return res.status(201).json(cartCreated);
    } catch (error) {
      console.log("🔴 ERRO CREATE CART:", error);
      return res.status(500).json({
        message: "Erro ao criar carrinho",
        error: error.message,
      });
    }
  },

  async getMyCart(req, res) {
    const userId = req.user.id;
    console.log("🟢 GET CART USER:", userId);
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
      console.log("🟢 CART ENCONTRADO:", cart);

      if (!cart) {
        console.log("🟡 CART NÃO EXISTE");
        return res.status(404).json({
          message: "Carrinho não encontrado",
        });
      }

      return res.status(200).json(cart);
    } catch (error) {
      console.log("🔴 ERRO GET CART:", error);
      return res.status(500).json({
        message: "Erro ao buscar carrinho",
        error: error.message,
      });
    }
  },

  async getCartById(req, res) {
    const { cart_id } = req.params;
    const userId = req.user.id;
    console.log("🟢 GET CART BY ID:", { cart_id, userId });
    try {
      const cart = await prisma.cart.findFirst({
        where: {
          id: cart_id,
          userId,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
      console.log("🟢 CART BY ID RESULT:", cart);

      if (!cart) {
        return res.status(404).json({
          message: "Carrinho não encontrado",
        });
      }

      return res.status(200).json(cart);
    } catch (error) {
      console.log("🔴 ERRO GET CART BY ID:", error);
      return res.status(500).json({
        message: "Erro ao buscar carrinho",
        error: error.message,
      });
    }
  },

  async addItem(req, res) {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    console.log("🟢 ADD ITEM RECEBIDO:");
    console.log("BODY:", req.body);
    console.log("USER:", userId);

    if (!variantId || !quantity) {
      console.log("🟡 DADOS INVÁLIDOS:", { variantId, quantity });
      return res.status(400).json({
        message: "variantId e quantity são obrigatórios",
      });
    }

    try {
      // Confere se a variante existe e tem estoque suficiente
      const variant = await prisma.variant.findUnique({
        where: { id: variantId },
        include: { stock: true },
      });

      if (!variant) {
        return res.status(404).json({
          message: "Variante não encontrada",
        });
      }

      if (variant.stock && variant.stock.quantity < quantity) {
        return res.status(400).json({
          message: "Estoque insuficiente para essa variante",
        });
      }

      let cart = await prisma.cart.findUnique({
        where: { userId },
      });
      console.log("🟢 CART BUSCADO:", cart);

      if (!cart) {
        console.log("🟡 CART NÃO EXISTE, CRIANDO...");
        cart = await prisma.cart.create({
          data: { userId },
        });
        console.log("🟢 CART CRIADO:", cart);
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variantId,
        },
      });
      console.log("🟢 ITEM EXISTENTE:", existingItem);

      if (existingItem) {
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
          include: {
            variant: {
              include: { product: true, stock: true },
            },
          },
        });
        console.log("🟢 ITEM ATUALIZADO:", updatedItem);
        return res.status(200).json(updatedItem);
      }

      const item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
        include: {
          variant: {
            include: { product: true, stock: true },
          },
        },
      });

      console.log("🟢 ITEM CRIADO:", item);
      return res.status(201).json(item);
    } catch (error) {
      console.log("🔴 ERRO ADD ITEM:", error);
      return res.status(500).json({
        message: "Erro ao adicionar item ao carrinho",
        error: error.message,
      });
    }
  },

  async updateItem(req, res) {
    const { itemId } = req.params;
    const { quantity } = req.body;
    console.log("🟢 UPDATE ITEM:", { itemId, quantity });

    if (!quantity) {
      return res.status(400).json({
        message: "quantity é obrigatório",
      });
    }

    try {
      const updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: {
          variant: {
            include: { product: true, stock: true },
          },
        },
      });
      console.log("🟢 ITEM ATUALIZADO:", updatedItem);
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.log("🔴 ERRO UPDATE ITEM:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      return res.status(500).json({
        message: "Erro ao atualizar item",
        error: error.message,
      });
    }
  },

  async removeItem(req, res) {
    const { itemId } = req.params;
    console.log("🟢 REMOVE ITEM:", itemId);
    try {
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
      });
      console.log("🟢 ITEM ENCONTRADO:", item);

      if (!item) {
        return res.status(404).json({
          message: "Item não encontrado",
        });
      }

      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      console.log("🟢 ITEM REMOVIDO");
      return res.status(200).json({
        message: "Item removido com sucesso",
      });
    } catch (error) {
      console.log("🔴 ERRO REMOVE ITEM:", error);
      return res.status(500).json({
        message: "Erro ao remover item",
        error: error.message,
      });
    }
  },
};

module.exports = CartController;