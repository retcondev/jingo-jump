import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { accountAddressSchema } from "~/lib/validations/address";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  emailMarketing: z.boolean().optional(),
  smsMarketing: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const accountRouter = createTRPCRouter({
  // Get current user profile with customer data
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            company: true,
            emailMarketing: true,
            smsMarketing: true,
            totalOrders: true,
            totalSpent: true,
            lastOrderAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update profile information
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, firstName, lastName, phone, emailMarketing, smsMarketing } = input;

      // Update user name if provided
      if (name) {
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { name },
        });
      }

      // Get or create customer record
      let customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (!user?.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email is required to create customer profile",
          });
        }

        customer = await ctx.db.customer.create({
          data: {
            userId: ctx.session.user.id,
            email: user.email,
            firstName: firstName ?? name?.split(" ")[0] ?? "",
            lastName: lastName ?? name?.split(" ").slice(1).join(" ") ?? "",
          },
        });
      }

      // Update customer profile
      const updatedCustomer = await ctx.db.customer.update({
        where: { id: customer.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(emailMarketing !== undefined && { emailMarketing }),
          ...(smsMarketing !== undefined && { smsMarketing }),
        },
      });

      return updatedCustomer;
    }),

  // Change password
  updatePassword: protectedProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // If user has a password (credentials user), verify current password
      if (user.password) {
        const isCurrentPasswordValid = await compare(
          input.currentPassword,
          user.password
        );

        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }
      }

      // Hash and update new password
      const hashedPassword = await hash(input.newPassword, 12);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Get user's orders
  getOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        return {
          orders: [],
          pagination: {
            page: input.page,
            limit: input.limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      const skip = (input.page - 1) * input.limit;

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where: { customerId: customer.id },
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              select: {
                id: true,
                name: true,
                quantity: true,
                price: true,
                totalPrice: true,
              },
            },
          },
        }),
        ctx.db.order.count({
          where: { customerId: customer.id },
        }),
      ]);

      return {
        orders,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Get single order details
  getOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      const order = await ctx.db.order.findFirst({
        where: {
          id: input.orderId,
          customerId: customer.id,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  images: {
                    take: 1,
                    orderBy: { position: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // Get addresses
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    const customer = await ctx.db.customer.findFirst({
      where: { userId: ctx.session.user.id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    return customer?.addresses ?? [];
  }),

  // Add address
  addAddress: protectedProcedure
    .input(accountAddressSchema)
    .mutation(async ({ ctx, input }) => {
      // Get or create customer
      let customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (!user?.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User email required",
          });
        }

        customer = await ctx.db.customer.create({
          data: {
            userId: ctx.session.user.id,
            email: user.email,
            firstName: input.firstName,
            lastName: input.lastName,
          },
        });
      }

      // If this is set as default, unset other defaults of same type
      if (input.isDefault) {
        await ctx.db.address.updateMany({
          where: {
            customerId: customer.id,
            type: input.type,
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }

      const address = await ctx.db.address.create({
        data: {
          ...input,
          customerId: customer.id,
        },
      });

      return address;
    }),

  // Update address
  updateAddress: protectedProcedure
    .input(
      z.object({
        addressId: z.string(),
        data: accountAddressSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      // Verify address belongs to customer
      const existingAddress = await ctx.db.address.findFirst({
        where: {
          id: input.addressId,
          customerId: customer.id,
        },
      });

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If setting as default, unset other defaults of same type
      if (input.data.isDefault) {
        const addressType = input.data.type ?? existingAddress.type;
        await ctx.db.address.updateMany({
          where: {
            customerId: customer.id,
            type: addressType,
            isDefault: true,
            id: { not: input.addressId },
          },
          data: { isDefault: false },
        });
      }

      const address = await ctx.db.address.update({
        where: { id: input.addressId },
        data: input.data,
      });

      return address;
    }),

  // Delete address
  deleteAddress: protectedProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found",
        });
      }

      // Verify address belongs to customer
      const address = await ctx.db.address.findFirst({
        where: {
          id: input.addressId,
          customerId: customer.id,
        },
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await ctx.db.address.delete({
        where: { id: input.addressId },
      });

      return { success: true };
    }),

  // Get dashboard summary
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const customer = await ctx.db.customer.findFirst({
      where: { userId: ctx.session.user.id },
    });

    if (!customer) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        recentOrders: [],
        savedAddresses: 0,
      };
    }

    const [recentOrders, addressCount] = await Promise.all([
      ctx.db.order.findMany({
        where: { customerId: customer.id },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              name: true,
              quantity: true,
            },
          },
        },
      }),
      ctx.db.address.count({
        where: { customerId: customer.id },
      }),
    ]);

    return {
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      recentOrders,
      savedAddresses: addressCount,
    };
  }),
});
