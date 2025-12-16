import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ProductStatus } from "../../../../generated/prisma";

// Public product listing schema
const publicProductListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  size: z.string().optional(),
  ageRange: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z
    .enum(["featured", "price-asc", "price-desc", "newest", "name"])
    .default("featured"),
});

export const productsRouter = createTRPCRouter({
  // List active products for public shop
  list: publicProcedure
    .input(publicProductListSchema)
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        search,
        categoryId,
        categorySlug,
        size,
        ageRange,
        minPrice,
        maxPrice,
        sortBy,
      } = input;
      const skip = (page - 1) * limit;

      // Resolve categoryId from slug if provided
      let resolvedCategoryId = categoryId;
      if (categorySlug && !categoryId) {
        const category = await ctx.db.category.findUnique({
          where: { slug: categorySlug },
          select: { id: true },
        });
        resolvedCategoryId = category?.id;
      }

      // Build where clause - only show ACTIVE products
      const where = {
        status: ProductStatus.ACTIVE,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
        ...(size && { size }),
        ...(ageRange && { ageRange }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
      };

      // Build orderBy based on sortBy
      const orderBy = (() => {
        switch (sortBy) {
          case "price-asc":
            return { price: "asc" as const };
          case "price-desc":
            return { price: "desc" as const };
          case "newest":
            return { createdAt: "desc" as const };
          case "name":
            return { name: "asc" as const };
          case "featured":
          default:
            return [
              { featured: "desc" as const },
              { createdAt: "desc" as const },
            ];
        }
      })();

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
            categoryRelation: true,
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

  // Get single product by slug (for product detail page)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: {
          slug: input.slug,
          status: ProductStatus.ACTIVE,
        },
        include: {
          images: {
            orderBy: { position: "asc" },
          },
          categoryRelation: true,
        },
      });

      return product;
    }),

  // Get single product by ID (fallback)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: {
          id: input.id,
          status: ProductStatus.ACTIVE,
        },
        include: {
          images: {
            orderBy: { position: "asc" },
          },
          categoryRelation: true,
        },
      });

      return product;
    }),

  // Get all categories with product counts
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      featured: c.featured,
      count: c._count.products,
    }));
  }),

  // Get single category by slug
  getCategoryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return category;
    }),

  // Get filter options (sizes, age ranges with counts)
  getFilterOptions: publicProcedure.query(async ({ ctx }) => {
    const [sizes, ageRanges, priceStats] = await Promise.all([
      ctx.db.product.groupBy({
        by: ["size"],
        where: { status: ProductStatus.ACTIVE, size: { not: null } },
        _count: { size: true },
      }),
      ctx.db.product.groupBy({
        by: ["ageRange"],
        where: { status: ProductStatus.ACTIVE, ageRange: { not: null } },
        _count: { ageRange: true },
      }),
      ctx.db.product.aggregate({
        where: { status: ProductStatus.ACTIVE },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      sizes: sizes
        .filter((s) => s.size)
        .map((s) => ({
          name: s.size!,
          count: s._count.size,
        })),
      ageRanges: ageRanges
        .filter((a) => a.ageRange)
        .map((a) => ({
          name: a.ageRange!,
          count: a._count.ageRange,
        })),
      priceRange: {
        min: priceStats._min.price ?? 0,
        max: priceStats._max.price ?? 10000,
      },
    };
  }),

  // Get related products (same category)
  getRelated: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        category: z.string(), // Keep for backwards compatibility
        categoryId: z.string().optional(),
        limit: z.number().int().min(1).max(10).default(4),
      })
    )
    .query(async ({ ctx, input }) => {
      // First get the product to find its categoryId
      const sourceProduct = await ctx.db.product.findUnique({
        where: { id: input.productId },
        select: { categoryId: true },
      });

      const products = await ctx.db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          categoryId: input.categoryId ?? sourceProduct?.categoryId,
          id: { not: input.productId },
        },
        take: input.limit,
        orderBy: { featured: "desc" },
        include: {
          images: {
            orderBy: { position: "asc" },
            take: 1,
          },
          categoryRelation: true,
        },
      });

      return products;
    }),

  // Get featured products (for homepage)
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          featured: true,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      });

      return products;
    }),
});
