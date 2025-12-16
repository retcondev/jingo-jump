import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import { adminAddressSchema } from "~/lib/validations/address";

const customerListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "lastName", "totalSpent", "totalOrders"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const customerCreateSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional().nullable(),
  emailMarketing: z.boolean().default(false),
  smsMarketing: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

const customerUpdateSchema = customerCreateSchema.partial().extend({
  id: z.string(),
});

export const adminCustomersRouter = createTRPCRouter({
  // List customers with pagination
  list: staffProcedure
    .input(customerListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { email: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phone: { contains: search } },
              { company: { contains: search } },
            ],
          }
        : {};

      const [customers, total] = await Promise.all([
        ctx.db.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { orders: true },
            },
          },
        }),
        ctx.db.customer.count({ where }),
      ]);

      return {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single customer
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: input.id },
        include: {
          addresses: true,
          orders: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  totalPrice: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return customer;
    }),

  // Create customer
  create: adminProcedure
    .input(customerCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for existing customer with same email
      const existing = await ctx.db.customer.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A customer with this email already exists",
        });
      }

      const customer = await ctx.db.customer.create({
        data: input,
      });

      return customer;
    }),

  // Update customer
  update: adminProcedure
    .input(customerUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.customer.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Check for email conflict
      if (data.email && data.email !== existing.email) {
        const emailConflict = await ctx.db.customer.findUnique({
          where: { email: data.email },
        });
        if (emailConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A customer with this email already exists",
          });
        }
      }

      const customer = await ctx.db.customer.update({
        where: { id },
        data,
      });

      return customer;
    }),

  // Delete customer
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: input.id },
        include: { _count: { select: { orders: true } } },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      if (customer._count.orders > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete customer with existing orders",
        });
      }

      await ctx.db.customer.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add note
  addNote: staffProcedure
    .input(z.object({
      customerId: z.string(),
      note: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: input.customerId },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      const existingNotes = customer.notes ?? "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${input.note}`;
      const updatedNotes = existingNotes
        ? `${existingNotes}\n${newNote}`
        : newNote;

      const updatedCustomer = await ctx.db.customer.update({
        where: { id: input.customerId },
        data: { notes: updatedNotes },
      });

      return updatedCustomer;
    }),

  // Get order history
  getOrderHistory: staffProcedure
    .input(z.object({
      customerId: z.string(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { customerId, page, limit } = input;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where: { customerId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              select: {
                id: true,
                name: true,
                quantity: true,
                totalPrice: true,
              },
            },
          },
        }),
        ctx.db.order.count({ where: { customerId } }),
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Add address
  addAddress: adminProcedure
    .input(adminAddressSchema)
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset other defaults of same type
      if (input.isDefault) {
        await ctx.db.address.updateMany({
          where: {
            customerId: input.customerId,
            type: input.type,
          },
          data: { isDefault: false },
        });
      }

      const address = await ctx.db.address.create({
        data: input,
      });

      return address;
    }),

  // Update address
  updateAddress: adminProcedure
    .input(adminAddressSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // If setting as default, unset other defaults of same type
      if (data.isDefault && data.customerId && data.type) {
        await ctx.db.address.updateMany({
          where: {
            customerId: data.customerId,
            type: data.type,
            NOT: { id },
          },
          data: { isDefault: false },
        });
      }

      const address = await ctx.db.address.update({
        where: { id },
        data,
      });

      return address;
    }),

  // Delete address
  deleteAddress: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.address.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  // Export customers
  export: staffProcedure.query(async ({ ctx }) => {
    const customers = await ctx.db.customer.findMany({
      include: {
        addresses: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return customers;
  }),

  // Get customer stats
  getStats: staffProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalCustomers,
      newThisMonth,
      newLastMonth,
      marketingOptIn,
    ] = await Promise.all([
      ctx.db.customer.count(),
      ctx.db.customer.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      ctx.db.customer.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: startOfMonth,
          },
        },
      }),
      ctx.db.customer.count({
        where: { emailMarketing: true },
      }),
    ]);

    return {
      totalCustomers,
      newThisMonth,
      newLastMonth,
      marketingOptIn,
      growthRate: newLastMonth > 0
        ? ((newThisMonth - newLastMonth) / newLastMonth) * 100
        : 0,
    };
  }),
});
