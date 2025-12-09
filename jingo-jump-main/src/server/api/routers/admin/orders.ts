import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { customAlphabet } from "nanoid";
import {
  createTRPCRouter,
  adminProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "../../../../../generated/prisma";

// Collision-resistant order number generator using nanoid
// Uses uppercase alphanumeric characters (excluding ambiguous chars like 0/O, 1/I/L)
const generateOrderId = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

// Generate a human-readable, collision-resistant order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const uniqueId = generateOrderId();
  return `JJ-${year}-${uniqueId}`;
}

const orderListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(["createdAt", "totalAmount", "orderNumber"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const updateTrackingSchema = z.object({
  orderId: z.string(),
  trackingNumber: z.string().min(1),
  shippingCarrier: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

const updateStatusSchema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus),
});

const addNoteSchema = z.object({
  orderId: z.string(),
  note: z.string().min(1),
});

export const adminOrdersRouter = createTRPCRouter({
  // List orders with pagination and filters
  list: staffProcedure
    .input(orderListSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, paymentStatus, fulfillmentStatus, dateFrom, dateTo, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { orderNumber: { contains: search } },
            { customer: { email: { contains: search } } },
            { customer: { firstName: { contains: search } } },
            { customer: { lastName: { contains: search } } },
          ],
        }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(fulfillmentStatus && { fulfillmentStatus }),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            }
          : {}),
      };

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            items: {
              select: {
                id: true,
                name: true,
                quantity: true,
                price: true,
              },
            },
          },
        }),
        ctx.db.order.count({ where }),
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

  // Get single order by ID
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
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

  // Update order status
  updateStatus: adminProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      // Set timestamps based on status
      switch (input.status) {
        case OrderStatus.SHIPPED:
          updateData.shippedAt = new Date();
          updateData.fulfillmentStatus = FulfillmentStatus.FULFILLED;
          break;
        case OrderStatus.DELIVERED:
          updateData.deliveredAt = new Date();
          break;
        case OrderStatus.CANCELLED:
          updateData.cancelledAt = new Date();
          break;
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: updateData,
      });

      return updatedOrder;
    }),

  // Update payment status
  updatePaymentStatus: adminProcedure
    .input(z.object({
      orderId: z.string(),
      paymentStatus: z.nativeEnum(PaymentStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updateData: Record<string, unknown> = {
        paymentStatus: input.paymentStatus,
      };

      if (input.paymentStatus === PaymentStatus.PAID) {
        updateData.paidAt = new Date();
        updateData.status = OrderStatus.CONFIRMED;
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: updateData,
      });

      return updatedOrder;
    }),

  // Add tracking information
  addTracking: adminProcedure
    .input(updateTrackingSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          trackingNumber: input.trackingNumber,
          shippingCarrier: input.shippingCarrier,
          trackingUrl: input.trackingUrl,
          status: OrderStatus.SHIPPED,
          fulfillmentStatus: FulfillmentStatus.FULFILLED,
          shippedAt: new Date(),
        },
      });

      return updatedOrder;
    }),

  // Add internal note
  addNote: staffProcedure
    .input(addNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const existingNotes = order.internalNotes ?? "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${input.note}`;
      const updatedNotes = existingNotes
        ? `${existingNotes}\n${newNote}`
        : newNote;

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { internalNotes: updatedNotes },
      });

      return updatedOrder;
    }),

  // Export orders
  export: staffProcedure
    .input(z.object({
      status: z.nativeEnum(OrderStatus).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.dateFrom || input.dateTo
            ? {
                createdAt: {
                  ...(input.dateFrom && { gte: input.dateFrom }),
                  ...(input.dateTo && { lte: input.dateTo }),
                },
              }
            : {}),
        },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return orders;
    }),

  // Get order statistics
  getStats: staffProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      pendingOrders,
      processingOrders,
      recentRevenue,
    ] = await Promise.all([
      ctx.db.order.count(),
      ctx.db.order.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      ctx.db.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      ctx.db.order.count({
        where: { status: OrderStatus.PENDING },
      }),
      ctx.db.order.count({
        where: { status: OrderStatus.PROCESSING },
      }),
      ctx.db.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      monthOrders,
      pendingOrders,
      processingOrders,
      monthRevenue: recentRevenue._sum.totalAmount ?? 0,
    };
  }),

  // Get recent orders (for dashboard)
  getRecent: staffProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return orders;
    }),

  // Create order (for manual orders)
  create: adminProcedure
    .input(z.object({
      customerId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })),
      shippingAddress: z.string(),
      billingAddress: z.string(),
      shippingMethod: z.string().optional(),
      customerNotes: z.string().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Fetch products for pricing
      const productIds = input.items.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Calculate totals
      let subtotal = 0;
      const orderItems = input.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product ${item.productId} not found`,
          });
        }
        const totalPrice = product.price * item.quantity;
        subtotal += totalPrice;
        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          totalPrice,
        };
      });

      // Generate collision-resistant order number using nanoid
      // With 6 chars from 32-char alphabet = 32^6 = ~1 billion combinations
      // Collision probability is negligible for typical order volumes
      const orderNumber = generateOrderNumber();

      const order = await ctx.db.order.create({
        data: {
          orderNumber,
          customerId: input.customerId,
          subtotal,
          totalAmount: subtotal, // No tax/shipping for manual orders initially
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress,
          shippingMethod: input.shippingMethod,
          customerNotes: input.customerNotes,
          internalNotes: input.internalNotes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // Update customer stats
      await ctx.db.customer.update({
        where: { id: input.customerId },
        data: {
          totalOrders: { increment: 1 },
          lastOrderAt: new Date(),
        },
      });

      return order;
    }),
});
