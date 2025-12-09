import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { customAlphabet } from "nanoid";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

// Collision-resistant order number generator
const generateOrderId = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const uniqueId = generateOrderId();
  return `JJ-${year}-${uniqueId}`;
}

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("US"),
  phone: z.string().optional(),
});

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  sku: z.string().optional(),
});

const checkoutSchema = z.object({
  // Customer info
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),

  // Addresses
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),

  // Cart items
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),

  // Order notes
  customerNotes: z.string().optional(),

  // For test mode
  paymentMethod: z.enum(["test", "stripe", "paypal"]).default("test"),
});

export const checkoutRouter = createTRPCRouter({
  // Create order (works for both guests and logged-in users)
  createOrder: publicProcedure
    .input(checkoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, phone, shippingAddress, billingAddress, sameAsShipping, items, customerNotes, paymentMethod } = input;

      // Use billing address or shipping if same
      const finalBillingAddress = sameAsShipping ? shippingAddress : billingAddress ?? shippingAddress;

      // Find or create customer
      let customer = await ctx.db.customer.findUnique({
        where: { email },
      });

      if (!customer) {
        // Create new customer
        customer = await ctx.db.customer.create({
          data: {
            email,
            phone: phone ?? shippingAddress.phone,
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            // Link to user if logged in
            userId: ctx.session?.user?.id,
          },
        });

        // Create default shipping address for the customer
        await ctx.db.address.create({
          data: {
            customerId: customer.id,
            type: "SHIPPING",
            isDefault: true,
            ...shippingAddress,
          },
        });
      } else if (ctx.session?.user?.id && !customer.userId) {
        // Link existing customer to logged-in user if not already linked
        customer = await ctx.db.customer.update({
          where: { id: customer.id },
          data: { userId: ctx.session.user.id },
        });
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = items.map((item) => {
        const totalPrice = item.price * item.quantity;
        subtotal += totalPrice;
        return {
          productId: item.productId,
          sku: item.sku ?? item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice,
        };
      });

      // For test mode, no tax/shipping
      const taxAmount = 0;
      const shippingAmount = 0;
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create the order
      const order = await ctx.db.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(finalBillingAddress),
          customerNotes,
          paymentMethod,
          // For test mode, mark as paid immediately
          status: paymentMethod === "test" ? "CONFIRMED" : "PENDING",
          paymentStatus: paymentMethod === "test" ? "PAID" : "PENDING",
          paidAt: paymentMethod === "test" ? new Date() : null,
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
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: totalAmount },
          lastOrderAt: new Date(),
        },
      });

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      };
    }),

  // Get order by ID (for confirmation page)
  getOrder: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: true,
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
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

  // Get order by order number (for lookup)
  getOrderByNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: {
          items: true,
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
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
});
