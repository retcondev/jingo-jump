import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  staffProcedure,
} from "~/server/api/trpc";

const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
});

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string(),
});

export const adminCategoriesRouter = createTRPCRouter({
  // List all categories
  list: staffProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return categories;
  }),

  // Get single category by ID
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Get category by slug
  getBySlug: staffProcedure
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

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Create new category
  create: adminProcedure
    .input(categoryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for unique name and slug
      const existing = await ctx.db.category.findFirst({
        where: {
          OR: [{ name: input.name }, { slug: input.slug }],
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: existing.name === input.name
            ? "A category with this name already exists"
            : "A category with this slug already exists",
        });
      }

      // Get max position if not provided
      if (input.position === 0) {
        const maxPosition = await ctx.db.category.findFirst({
          orderBy: { position: "desc" },
          select: { position: true },
        });
        input.position = (maxPosition?.position ?? 0) + 1;
      }

      const category = await ctx.db.category.create({
        data: input,
      });

      return category;
    }),

  // Update category
  update: adminProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.category.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Check for unique name and slug (if changing)
      if (data.name || data.slug) {
        const conflict = await ctx.db.category.findFirst({
          where: {
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.slug ? [{ slug: data.slug }] : []),
            ],
            NOT: { id },
          },
        });

        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: conflict.name === data.name
              ? "A category with this name already exists"
              : "A category with this slug already exists",
          });
        }
      }

      const category = await ctx.db.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  // Delete category
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: { _count: { select: { products: true } } },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      if (category._count.products > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete category with ${category._count.products} product(s). Reassign products first.`,
        });
      }

      await ctx.db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Reorder categories
  reorder: adminProcedure
    .input(z.object({
      categories: z.array(z.object({
        id: z.string(),
        position: z.number().int().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.categories.map((cat) =>
          ctx.db.category.update({
            where: { id: cat.id },
            data: { position: cat.position },
          })
        )
      );

      return { success: true };
    }),

  // Toggle featured status
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const updated = await ctx.db.category.update({
        where: { id: input.id },
        data: { featured: !category.featured },
      });

      return updated;
    }),
});
