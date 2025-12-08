import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import { ProductStatus } from "../../../../../generated/prisma";

// Input validation schemas
const productCreateSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  salePrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  gradient: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  dimensions: z.string().optional().nullable(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  badge: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string(),
});

const productListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sortBy: z.enum(["name", "price", "createdAt", "stockQuantity", "sku"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const bulkImportSchema = z.object({
  products: z.array(productCreateSchema),
});

export const adminProductsRouter = createTRPCRouter({
  // List products with pagination, filtering, and sorting
  list: staffProcedure
    .input(productListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, category, status, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(category && { category }),
        ...(status && { status }),
      };

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
            _count: {
              select: { orderItems: true },
            },
          },
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single product by ID
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          images: {
            orderBy: { position: "asc" },
          },
          orderItems: {
            take: 10,
            orderBy: { order: { createdAt: "desc" } },
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  createdAt: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Create new product
  create: adminProcedure
    .input(productCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for unique SKU and slug
      const existing = await ctx.db.product.findFirst({
        where: {
          OR: [{ sku: input.sku }, { slug: input.slug }],
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: existing.sku === input.sku
            ? "A product with this SKU already exists"
            : "A product with this slug already exists",
        });
      }

      const product = await ctx.db.product.create({
        data: {
          ...input,
          publishedAt: input.status === ProductStatus.ACTIVE ? new Date() : null,
        },
      });

      return product;
    }),

  // Update product
  update: adminProcedure
    .input(productUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.product.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check for unique SKU and slug (if changing)
      if (data.sku || data.slug) {
        const conflict = await ctx.db.product.findFirst({
          where: {
            OR: [
              ...(data.sku ? [{ sku: data.sku }] : []),
              ...(data.slug ? [{ slug: data.slug }] : []),
            ],
            NOT: { id },
          },
        });

        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: conflict.sku === data.sku
              ? "A product with this SKU already exists"
              : "A product with this slug already exists",
          });
        }
      }

      // Set publishedAt if status changing to ACTIVE
      const updateData = {
        ...data,
        ...(data.status === ProductStatus.ACTIVE && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      };

      const product = await ctx.db.product.update({
        where: { id },
        data: updateData,
      });

      return product;
    }),

  // Delete product
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: { _count: { select: { orderItems: true } } },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (product._count.orderItems > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete product with existing orders. Archive it instead.",
        });
      }

      await ctx.db.product.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Bulk update status
  bulkUpdateStatus: adminProcedure
    .input(z.object({
      ids: z.array(z.string()),
      status: z.nativeEnum(ProductStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData = {
        status: input.status,
        ...(input.status === ProductStatus.ACTIVE ? { publishedAt: new Date() } : {}),
      };

      await ctx.db.product.updateMany({
        where: { id: { in: input.ids } },
        data: updateData,
      });

      return { success: true, count: input.ids.length };
    }),

  // Bulk import products
  bulkImport: adminProcedure
    .input(bulkImportSchema)
    .mutation(async ({ ctx, input }) => {
      const results = {
        created: 0,
        updated: 0,
        errors: [] as { sku: string; error: string }[],
      };

      for (const productData of input.products) {
        try {
          const existing = await ctx.db.product.findUnique({
            where: { sku: productData.sku },
          });

          if (existing) {
            await ctx.db.product.update({
              where: { sku: productData.sku },
              data: productData,
            });
            results.updated++;
          } else {
            await ctx.db.product.create({
              data: {
                ...productData,
                publishedAt: productData.status === ProductStatus.ACTIVE ? new Date() : null,
              },
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            sku: productData.sku,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    }),

  // Export products
  export: staffProcedure
    .input(z.object({
      status: z.nativeEnum(ProductStatus).optional(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.category && { category: input.category }),
        },
        include: {
          images: {
            orderBy: { position: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return products;
    }),

  // Get categories (for filters)
  getCategories: staffProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return products.map((p) => p.category);
  }),

  // Get low stock products
  getLowStock: staffProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: {
        trackInventory: true,
        stockQuantity: {
          lte: ctx.db.product.fields.lowStockThreshold,
        },
      },
      orderBy: { stockQuantity: "asc" },
      take: 20,
    });
    return products;
  }),

  // Update stock
  updateStock: adminProcedure
    .input(z.object({
      id: z.string(),
      stockQuantity: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: { stockQuantity: input.stockQuantity },
      });
      return product;
    }),

  // Add product image
  addImage: adminProcedure
    .input(z.object({
      productId: z.string(),
      url: z.string().url(),
      alt: z.string().optional(),
      position: z.number().int().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const maxPosition = await ctx.db.productImage.findFirst({
        where: { productId: input.productId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const image = await ctx.db.productImage.create({
        data: {
          productId: input.productId,
          url: input.url,
          alt: input.alt,
          position: input.position ?? (maxPosition?.position ?? 0) + 1,
        },
      });

      return image;
    }),

  // Delete product image
  deleteImage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.productImage.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
