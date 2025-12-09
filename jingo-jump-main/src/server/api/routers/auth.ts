import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name, firstName, lastName } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "CUSTOMER",
        },
      });

      // Create associated customer profile
      const nameParts = name.split(" ");
      const customerFirstName = firstName ?? nameParts[0] ?? "";
      const lastNameFromParts = nameParts.slice(1).join(" ");
      const customerLastName = lastName ?? (lastNameFromParts || (nameParts[0] ?? ""));

      await ctx.db.customer.create({
        data: {
          userId: user.id,
          email,
          firstName: customerFirstName,
          lastName: customerLastName,
        },
      });

      return {
        success: true,
        message: "Account created successfully",
        userId: user.id,
      };
    }),

  // Check if email is available
  checkEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      return {
        available: !existingUser,
      };
    }),
});
