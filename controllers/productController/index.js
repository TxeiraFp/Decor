const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProductController = {

    // CREATE
    async createProduct(req, res) {
        const productData = req.body;

        try {
            console.log("📦 PRODUCT RECEBIDO:", productData);

            // validação mínima (mesma lógica)
            if (!productData.name || !productData.price || !productData.categoryId) {
                return res.status(400).json({
                    error: "Campos obrigatórios faltando (name, price, categoryId)"
                });
            }

            const newProduct = await prisma.product.create({
                data: {
                    name: productData.name,
                    description: productData.description || null,
                    price: productData.price, // Prisma Decimal aceita string ou Decimal
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

        // =========================
        // 1. UPDATE PRODUTO
        // =========================
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

        // =========================
        // 2. UPDATE VARIANT + STOCK
        // =========================
        if (bodyData.variants && bodyData.variants.length > 0) {

            for (const v of bodyData.variants) {

                // pega primeira variante (simples)
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

                    // update stock separado
                    await prisma.stock.update({
                        where: { variantId: variant.id },
                        data: {
                            quantity: Number(v.stock?.quantity || 0)
                        }
                    });
                }
            }
        }

        // =========================
        // 3. RETURN COMPLETO
        // =========================
        const updatedProduct = await prisma.product.findUnique({
            where: { id: product_id },
            include: {
                category: true,
                variants: {
                    include: {
                        stock: true
                    }
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
            return res.status(404).json({
                error: "Produto não encontrado"
            });
        }

        return res.status(400).json({
            error: "Erro ao atualizar o produto",
            details: error.message
        });
    }
},
    // GET ALL
    // GET ALL
async getProducts(req, res) {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                variants: {
                    include: {
                        stock: true
                    }
                }
            }
        });

        return res.status(200).json(products);

    } catch (error) {
        return res.status(400).json({
            error: "Erro ao buscar produtos",
            details: error.message
        });
    }
},

    // GET BY ID
    // GET BY ID
async getProductById(req, res) {
    try {
        const { product_id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: product_id },
            include: {
                category: true,
                variants: {
                    include: {
                        stock: true
                    }
                }
            }
        });

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


        // 2. depois apagar produto
        await prisma.product.delete({
            where: { id: product_id }
        });

        return res.status(200).json({
            message: "Produto deletado com sucesso"
        });

    } catch (error) {
        console.log("DELETE ERROR:", error);

        return res.status(400).json({
            error: "Erro ao deletar o produto",
            details: error.message
        });
    }
},

    // GET BY USER (PRECISA TER userId no schema)
    async getProductsByUser(req, res) {
        const { user_id } = req.params;

        try {
            const products = await prisma.product.findMany({
                where: {
                    userId: user_id
                },
                include: {
                    category: true,
                    variants: true
                }
            });

            return res.status(200).json(products);

        } catch (error) {
            return res.status(400).json({
                error: "Erro ao buscar produtos do usuario",
                details: error.message
            });
        }
    }
};

module.exports = ProductController;