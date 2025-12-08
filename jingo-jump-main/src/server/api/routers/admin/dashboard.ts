import { z } from "zod";
import {
  createTRPCRouter,
  staffProcedure,
} from "~/server/api/trpc";
import { OrderStatus, PaymentStatus, ProductStatus } from "../../../../../generated/prisma";

export const adminDashboardRouter = createTRPCRouter({
  // Get main dashboard stats
  getStats: staffProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      // Orders
      totalOrders,
      todayOrders,
      monthOrders,
      pendingOrders,

      // Revenue
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      todayRevenue,

      // Products
      totalProducts,
      activeProducts,
      lowStockProducts,

      // Customers
      totalCustomers,
      newCustomersThisMonth,

      // Subscribers
      totalSubscribers,
      activeEmailSubscribers,
    ] = await Promise.all([
      // Orders counts
      ctx.db.order.count(),
      ctx.db.order.count({ where: { createdAt: { gte: startOfDay } } }),
      ctx.db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      ctx.db.order.count({ where: { status: OrderStatus.PENDING } }),

      // Revenue aggregations
      ctx.db.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { totalAmount: true },
      }),
      ctx.db.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { totalAmount: true },
      }),
      ctx.db.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { totalAmount: true },
      }),
      ctx.db.order.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { totalAmount: true },
      }),

      // Products
      ctx.db.product.count(),
      ctx.db.product.count({ where: { status: ProductStatus.ACTIVE } }),
      ctx.db.product.count({
        where: {
          trackInventory: true,
          stockQuantity: { lte: 5 }, // Low stock threshold
        },
      }),

      // Customers
      ctx.db.customer.count(),
      ctx.db.customer.count({ where: { createdAt: { gte: startOfMonth } } }),

      // Subscribers
      ctx.db.subscriber.count(),
      ctx.db.subscriber.count({ where: { emailSubscribed: true } }),
    ]);

    const currentMonthRevenue = monthRevenue._sum.totalAmount ?? 0;
    const previousMonthRevenue = lastMonthRevenue._sum.totalAmount ?? 0;
    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    return {
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisMonth: monthOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount ?? 0,
        thisMonth: currentMonthRevenue,
        lastMonth: previousMonthRevenue,
        today: todayRevenue._sum.totalAmount ?? 0,
        growthPercent: revenueGrowth,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      subscribers: {
        total: totalSubscribers,
        activeEmail: activeEmailSubscribers,
      },
    };
  }),

  // Get revenue chart data
  getRevenueChart: staffProcedure
    .input(z.object({
      period: z.enum(["week", "month", "year"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate: Date;
      let groupBy: "day" | "month";

      switch (input.period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = "day";
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          groupBy = "day";
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          groupBy = "month";
          break;
      }

      const orders = await ctx.db.order.findMany({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: PaymentStatus.PAID,
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
      const grouped = new Map<string, number>();

      for (const order of orders) {
        let key: string;
        if (groupBy === "day") {
          key = order.createdAt.toISOString().split("T")[0]!;
        } else {
          key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
        }

        grouped.set(key, (grouped.get(key) ?? 0) + order.totalAmount);
      }

      return Array.from(grouped.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }));
    }),

  // Get recent orders
  getRecentOrders: staffProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            select: {
              name: true,
              quantity: true,
            },
          },
        },
      });

      return orders;
    }),

  // Get top selling products
  getTopProducts: staffProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(20).default(5),
      period: z.enum(["week", "month", "year", "all"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate: Date | undefined;

      switch (input.period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "all":
          startDate = undefined;
          break;
      }

      // Get order items with aggregation
      const orderItems = await ctx.db.orderItem.groupBy({
        by: ["productId"],
        where: startDate
          ? { order: { createdAt: { gte: startDate } } }
          : undefined,
        _sum: {
          quantity: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: input.limit,
      });

      // Get product details
      const productIds = orderItems.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          images: {
            take: 1,
            orderBy: { position: "asc" },
          },
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      return orderItems.map((item) => ({
        product: productMap.get(item.productId),
        totalSold: item._sum.quantity ?? 0,
        totalRevenue: item._sum.totalPrice ?? 0,
      }));
    }),

  // Get low stock products
  getLowStockProducts: staffProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          trackInventory: true,
          status: ProductStatus.ACTIVE,
        },
        orderBy: { stockQuantity: "asc" },
        take: input.limit,
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
          images: {
            take: 1,
            orderBy: { position: "asc" },
          },
        },
      });

      // Filter to only low stock
      return products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
    }),

  // Get orders by status breakdown
  getOrderStatusBreakdown: staffProcedure.query(async ({ ctx }) => {
    const statuses = await ctx.db.order.groupBy({
      by: ["status"],
      _count: true,
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count,
    }));
  }),

  // Get customer activity
  getCustomerActivity: staffProcedure
    .input(z.object({
      period: z.enum(["week", "month", "year"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const [newCustomers, returningCustomers] = await Promise.all([
        ctx.db.customer.count({
          where: { createdAt: { gte: startDate } },
        }),
        ctx.db.customer.count({
          where: {
            totalOrders: { gt: 1 },
            lastOrderAt: { gte: startDate },
          },
        }),
      ]);

      return {
        newCustomers,
        returningCustomers,
      };
    }),
});
