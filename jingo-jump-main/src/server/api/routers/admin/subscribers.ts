import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  staffProcedure,
} from "~/server/api/trpc";

const subscriberListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  emailSubscribed: z.boolean().optional(),
  smsSubscribed: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "email", "lastName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const subscriberCreateSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  emailSubscribed: z.boolean().default(true),
  smsSubscribed: z.boolean().default(false),
  source: z.string().optional().nullable(),
});

const subscriberUpdateSchema = subscriberCreateSchema.partial().extend({
  id: z.string(),
});

const bulkImportSchema = z.object({
  subscribers: z.array(z.object({
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    emailSubscribed: z.boolean().default(true),
    smsSubscribed: z.boolean().default(false),
  })),
  source: z.string().default("import"),
});

export const adminSubscribersRouter = createTRPCRouter({
  // List subscribers with pagination
  list: staffProcedure
    .input(subscriberListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, emailSubscribed, smsSubscribed, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
        ...(emailSubscribed !== undefined && { emailSubscribed }),
        ...(smsSubscribed !== undefined && { smsSubscribed }),
      };

      const [subscribers, total] = await Promise.all([
        ctx.db.subscriber.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        ctx.db.subscriber.count({ where }),
      ]);

      return {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single subscriber
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscriber = await ctx.db.subscriber.findUnique({
        where: { id: input.id },
      });

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscriber not found",
        });
      }

      return subscriber;
    }),

  // Create subscriber
  create: adminProcedure
    .input(subscriberCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.subscriber.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A subscriber with this email already exists",
        });
      }

      const subscriber = await ctx.db.subscriber.create({
        data: {
          ...input,
          confirmedAt: new Date(), // Admin-created subscribers are auto-confirmed
        },
      });

      return subscriber;
    }),

  // Update subscriber
  update: adminProcedure
    .input(subscriberUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.subscriber.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscriber not found",
        });
      }

      // Check email conflict
      if (data.email && data.email !== existing.email) {
        const emailConflict = await ctx.db.subscriber.findUnique({
          where: { email: data.email },
        });
        if (emailConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A subscriber with this email already exists",
          });
        }
      }

      const subscriber = await ctx.db.subscriber.update({
        where: { id },
        data,
      });

      return subscriber;
    }),

  // Delete subscriber
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.subscriber.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  // Unsubscribe (soft)
  unsubscribe: staffProcedure
    .input(z.object({
      id: z.string(),
      type: z.enum(["email", "sms", "both"]).default("both"),
    }))
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {
        unsubscribedAt: new Date(),
      };

      if (input.type === "email" || input.type === "both") {
        data.emailSubscribed = false;
      }
      if (input.type === "sms" || input.type === "both") {
        data.smsSubscribed = false;
      }

      const subscriber = await ctx.db.subscriber.update({
        where: { id: input.id },
        data,
      });

      return subscriber;
    }),

  // Bulk import
  bulkImport: adminProcedure
    .input(bulkImportSchema)
    .mutation(async ({ ctx, input }) => {
      const results = {
        created: 0,
        updated: 0,
        errors: [] as { email: string; error: string }[],
      };

      for (const subscriberData of input.subscribers) {
        try {
          const existing = await ctx.db.subscriber.findUnique({
            where: { email: subscriberData.email },
          });

          if (existing) {
            // Update existing (but don't resubscribe if they unsubscribed)
            await ctx.db.subscriber.update({
              where: { email: subscriberData.email },
              data: {
                phone: subscriberData.phone ?? existing.phone,
                firstName: subscriberData.firstName ?? existing.firstName,
                lastName: subscriberData.lastName ?? existing.lastName,
              },
            });
            results.updated++;
          } else {
            await ctx.db.subscriber.create({
              data: {
                ...subscriberData,
                source: input.source,
                confirmedAt: new Date(),
              },
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            email: subscriberData.email,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    }),

  // Export subscribers
  export: staffProcedure
    .input(z.object({
      emailSubscribed: z.boolean().optional(),
      smsSubscribed: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const subscribers = await ctx.db.subscriber.findMany({
        where: {
          ...(input.emailSubscribed !== undefined && { emailSubscribed: input.emailSubscribed }),
          ...(input.smsSubscribed !== undefined && { smsSubscribed: input.smsSubscribed }),
        },
        orderBy: { createdAt: "desc" },
      });

      return subscribers;
    }),

  // Get subscriber stats
  getStats: staffProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSubscribers,
      emailSubscribers,
      smsSubscribers,
      newThisMonth,
      unsubscribed,
    ] = await Promise.all([
      ctx.db.subscriber.count(),
      ctx.db.subscriber.count({ where: { emailSubscribed: true } }),
      ctx.db.subscriber.count({ where: { smsSubscribed: true } }),
      ctx.db.subscriber.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      ctx.db.subscriber.count({
        where: { unsubscribedAt: { not: null } },
      }),
    ]);

    return {
      totalSubscribers,
      emailSubscribers,
      smsSubscribers,
      newThisMonth,
      unsubscribed,
      activeRate: totalSubscribers > 0
        ? ((totalSubscribers - unsubscribed) / totalSubscribers) * 100
        : 0,
    };
  }),

  // Bulk delete unsubscribed
  deleteUnsubscribed: adminProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.subscriber.deleteMany({
      where: {
        emailSubscribed: false,
        smsSubscribed: false,
      },
    });

    return { deleted: result.count };
  }),
});
