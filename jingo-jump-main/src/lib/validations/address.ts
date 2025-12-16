import { z } from "zod";
import { AddressType } from "../../../generated/prisma";

/**
 * Base address fields schema - core address fields without context-specific fields.
 * This is the foundation that other schemas extend.
 */
export const baseAddressFieldsSchema = z.object({
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

/**
 * Address schema for checkout flow - no type/default needed as it's contextual
 */
export const checkoutAddressSchema = baseAddressFieldsSchema;

/**
 * Address schema for customer account management - includes type and default flag
 */
export const accountAddressSchema = baseAddressFieldsSchema.extend({
  type: z.nativeEnum(AddressType),
  isDefault: z.boolean().default(false),
});

/**
 * Address schema for admin customer management - includes customerId and nullable fields
 */
export const adminAddressSchema = z.object({
  customerId: z.string(),
  type: z.nativeEnum(AddressType).default(AddressType.SHIPPING),
  isDefault: z.boolean().default(false),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional().nullable(),
  address1: z.string().min(1),
  address2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("US"),
  phone: z.string().optional().nullable(),
});

// Type exports for use in components and API responses
export type BaseAddressFields = z.infer<typeof baseAddressFieldsSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type AccountAddress = z.infer<typeof accountAddressSchema>;
export type AdminAddress = z.infer<typeof adminAddressSchema>;

/**
 * Safely parse an address from JSON string (e.g., from database storage).
 * Returns the parsed address or a fallback with empty/default values if invalid.
 */
export function parseAddressFromJson(json: string): BaseAddressFields {
  const fallback: BaseAddressFields = {
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };

  try {
    const parsed: unknown = JSON.parse(json);
    const result = baseAddressFieldsSchema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}
