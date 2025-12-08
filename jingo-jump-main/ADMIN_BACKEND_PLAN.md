# Admin Backend Implementation Plan
## WordPress-like Admin System for JingoJump

---

## Executive Summary

Build a comprehensive admin backend for JingoJump with functionality similar to WordPress/WooCommerce, including:
- Product management (CRUD, import/export, SKU tracking)
- Order management (list, tracking numbers, status updates)
- Customer management (list, profiles, communication)
- Mailing list & phone number management
- Dashboard with analytics

---

## Current Architecture Analysis

### What Exists
- **Database**: Prisma + SQLite (can upgrade to PostgreSQL)
- **Auth**: NextAuth v5 with Discord OAuth
- **API**: tRPC v11 with protected procedures
- **Frontend**: Next.js 15 App Router + React Query
- **Cart**: React Context (client-side only)

### What Needs to Be Built
- Database models for e-commerce
- Admin role-based authentication
- Admin API routers
- Admin dashboard UI
- Import/export functionality

---

## Phase 1: Database Schema Design

### New Prisma Models

```prisma
// ============ PRODUCTS ============
model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  slug        String   @unique
  description String?
  price       Float
  salePrice   Float?
  costPrice   Float?    // For profit tracking
  category    String
  subcategory String?

  // Inventory
  stockQuantity Int     @default(0)
  lowStockThreshold Int @default(5)
  trackInventory Boolean @default(true)

  // Media
  images      ProductImage[]
  gradient    String?   // For display styling

  // Attributes
  size        String?
  ageRange    String?
  weight      Float?    // For shipping calc
  dimensions  String?   // LxWxH

  // Status
  status      ProductStatus @default(DRAFT)
  badge       String?       // NEW, POPULAR, SALE
  featured    Boolean       @default(false)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Relations
  orderItems  OrderItem[]

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  alt       String?
  position  Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

// ============ CUSTOMERS ============
model Customer {
  id            String   @id @default(cuid())
  userId        String?  @unique
  user          User?    @relation(fields: [userId], references: [id])

  // Contact Info
  email         String   @unique
  phone         String?
  firstName     String
  lastName      String
  company       String?

  // Addresses
  addresses     Address[]

  // Communication Preferences
  emailMarketing    Boolean @default(false)
  smsMarketing      Boolean @default(false)

  // Stats
  totalOrders   Int      @default(0)
  totalSpent    Float    @default(0)

  // Relations
  orders        Order[]

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastOrderAt   DateTime?

  // Notes (admin only)
  notes         String?
  tags          String?  // Comma-separated tags
}

model Address {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  type        AddressType @default(SHIPPING)
  isDefault   Boolean     @default(false)

  firstName   String
  lastName    String
  company     String?
  address1    String
  address2    String?
  city        String
  state       String
  postalCode  String
  country     String   @default("US")
  phone       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AddressType {
  SHIPPING
  BILLING
}

// ============ ORDERS ============
model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique  // Human-readable: JJ-2024-0001

  // Customer
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])

  // Items
  items           OrderItem[]

  // Pricing
  subtotal        Float
  taxAmount       Float    @default(0)
  shippingAmount  Float    @default(0)
  discountAmount  Float    @default(0)
  totalAmount     Float

  // Status
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  fulfillmentStatus FulfillmentStatus @default(UNFULFILLED)

  // Shipping
  shippingMethod  String?
  trackingNumber  String?
  trackingUrl     String?
  shippingCarrier String?  // UPS, FedEx, USPS, etc.

  // Addresses (snapshot at order time)
  shippingAddress Json
  billingAddress  Json

  // Payment
  paymentMethod   String?
  paymentId       String?  // Stripe/PayPal transaction ID

  // Notes
  customerNotes   String?
  internalNotes   String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product @relation(fields: [productId], references: [id])

  // Snapshot at order time
  sku         String
  name        String
  price       Float
  quantity    Int
  totalPrice  Float

  // Options/variants if applicable
  options     Json?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIALLY_PAID
  REFUNDED
  FAILED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
}

// ============ MAILING LIST ============
model Subscriber {
  id          String   @id @default(cuid())
  email       String   @unique
  phone       String?
  firstName   String?
  lastName    String?

  // Subscription status
  emailSubscribed Boolean @default(true)
  smsSubscribed   Boolean @default(false)

  // Source tracking
  source      String?  // website, checkout, import, etc.

  // Engagement
  confirmedAt DateTime?

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  unsubscribedAt DateTime?
}

// ============ ADMIN/ROLES ============
// Extend existing User model
model User {
  // ... existing fields ...
  role        UserRole @default(CUSTOMER)

  // Add relation
  customer    Customer?
}

enum UserRole {
  ADMIN
  MANAGER
  STAFF
  CUSTOMER
}
```

---

## Phase 2: Authentication & Authorization

### Admin Role System

**Extend NextAuth config** (`src/server/auth/config.ts`):
```typescript
// Add role to session
callbacks: {
  session: ({ session, user }) => ({
    ...session,
    user: {
      ...session.user,
      id: user.id,
      role: user.role, // Add role
    },
  }),
}
```

**Create Admin Procedures** (`src/server/api/trpc.ts`):
```typescript
// Admin-only procedure
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MANAGER") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

// Staff+ procedure (admin, manager, or staff)
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!["ADMIN", "MANAGER", "STAFF"].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
```

---

## Phase 3: API Routers (tRPC)

### Router Structure

```
src/server/api/routers/
├── admin/
│   ├── products.ts      # Product CRUD
│   ├── orders.ts        # Order management
│   ├── customers.ts     # Customer management
│   ├── subscribers.ts   # Mailing list
│   ├── dashboard.ts     # Analytics/stats
│   └── import-export.ts # Data import/export
└── public/
    ├── products.ts      # Public product queries
    ├── cart.ts          # Cart operations
    └── checkout.ts      # Checkout flow
```

### Key Router Implementations

#### Products Router (`admin/products.ts`)
```typescript
export const adminProductsRouter = createTRPCRouter({
  // List with pagination, filtering, sorting
  list: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
      sortBy: z.enum(["createdAt", "name", "price", "stock"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get single product
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Create product
  create: adminProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Update product
  update: adminProcedure
    .input(z.object({ id: z.string(), data: productSchema.partial() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Delete product
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Bulk operations
  bulkUpdateStatus: adminProcedure
    .input(z.object({ ids: z.array(z.string()), status: z.enum([...]) }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Import from CSV/JSON
  import: adminProcedure
    .input(z.object({ data: z.array(productSchema), mode: z.enum(["create", "update", "upsert"]) }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Export to CSV/JSON
  export: adminProcedure
    .input(z.object({ format: z.enum(["csv", "json"]), filters: z.object({...}).optional() }))
    .query(async ({ ctx, input }) => { /* ... */ }),
});
```

#### Orders Router (`admin/orders.ts`)
```typescript
export const adminOrdersRouter = createTRPCRouter({
  // List orders with filters
  list: staffProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum([...]).optional(),
      paymentStatus: z.enum([...]).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      search: z.string().optional(), // Order number, customer name
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get order details
  get: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Update order status
  updateStatus: staffProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum([...]),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Add tracking number
  addTracking: staffProcedure
    .input(z.object({
      id: z.string(),
      trackingNumber: z.string(),
      carrier: z.string(),
      trackingUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Add internal note
  addNote: staffProcedure
    .input(z.object({ id: z.string(), note: z.string() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Export orders
  export: adminProcedure
    .input(z.object({ format: z.enum(["csv", "json"]), filters: z.object({...}) }))
    .query(async ({ ctx, input }) => { /* ... */ }),
});
```

#### Customers Router (`admin/customers.ts`)
```typescript
export const adminCustomersRouter = createTRPCRouter({
  list: staffProcedure.input(...).query(...),
  get: staffProcedure.input(...).query(...),
  update: adminProcedure.input(...).mutation(...),
  addNote: staffProcedure.input(...).mutation(...),
  getOrderHistory: staffProcedure.input(...).query(...),
  export: adminProcedure.input(...).query(...),
});
```

#### Subscribers Router (`admin/subscribers.ts`)
```typescript
export const adminSubscribersRouter = createTRPCRouter({
  list: staffProcedure.input(...).query(...),
  add: staffProcedure.input(...).mutation(...),
  import: adminProcedure.input(...).mutation(...),
  export: adminProcedure.input(...).query(...),
  unsubscribe: staffProcedure.input(...).mutation(...),
});
```

#### Dashboard Router (`admin/dashboard.ts`)
```typescript
export const adminDashboardRouter = createTRPCRouter({
  // Overview stats
  getStats: staffProcedure.query(async ({ ctx }) => {
    // Returns: totalOrders, totalRevenue, totalCustomers,
    // ordersToday, revenueToday, pendingOrders, lowStockProducts
  }),

  // Revenue chart data
  getRevenueChart: staffProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d", "1y"]) }))
    .query(...),

  // Recent orders
  getRecentOrders: staffProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(...),

  // Top products
  getTopProducts: staffProcedure
    .input(z.object({ limit: z.number().default(10), period: z.enum([...]) }))
    .query(...),

  // Low stock alerts
  getLowStockProducts: staffProcedure.query(...),
});
```

---

## Phase 4: Admin UI Structure

### Route Structure

```
src/app/admin/
├── layout.tsx           # Admin layout with sidebar
├── page.tsx             # Dashboard
├── login/
│   └── page.tsx         # Admin login
├── products/
│   ├── page.tsx         # Product list
│   ├── new/
│   │   └── page.tsx     # Create product
│   ├── [id]/
│   │   └── page.tsx     # Edit product
│   └── import/
│       └── page.tsx     # Import products
├── orders/
│   ├── page.tsx         # Order list
│   └── [id]/
│       └── page.tsx     # Order details
├── customers/
│   ├── page.tsx         # Customer list
│   └── [id]/
│       └── page.tsx     # Customer details
├── subscribers/
│   └── page.tsx         # Mailing list
└── settings/
    └── page.tsx         # Admin settings
```

### UI Components Needed

```
src/app/_components/admin/
├── layout/
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   └── AdminLayout.tsx
├── dashboard/
│   ├── StatsCards.tsx
│   ├── RevenueChart.tsx
│   ├── RecentOrdersTable.tsx
│   └── LowStockAlert.tsx
├── products/
│   ├── ProductsTable.tsx
│   ├── ProductForm.tsx
│   ├── ProductImportModal.tsx
│   └── ProductExportButton.tsx
├── orders/
│   ├── OrdersTable.tsx
│   ├── OrderDetails.tsx
│   ├── OrderStatusBadge.tsx
│   ├── TrackingForm.tsx
│   └── OrderTimeline.tsx
├── customers/
│   ├── CustomersTable.tsx
│   ├── CustomerDetails.tsx
│   └── CustomerOrderHistory.tsx
├── subscribers/
│   ├── SubscribersTable.tsx
│   └── ImportSubscribersModal.tsx
└── shared/
    ├── DataTable.tsx
    ├── Pagination.tsx
    ├── SearchInput.tsx
    ├── DateRangePicker.tsx
    ├── ExportButton.tsx
    └── StatusBadge.tsx
```

---

## Phase 5: Implementation Order

### Stage 1: Foundation (Week 1)
1. Update Prisma schema with all models
2. Run migrations
3. Set up admin procedures in tRPC
4. Add role to User model and session
5. Create admin layout and sidebar

### Stage 2: Products (Week 2)
1. Build products tRPC router
2. Create products list page with DataTable
3. Build product create/edit form
4. Implement product import (CSV/JSON)
5. Implement product export

### Stage 3: Orders (Week 3)
1. Build orders tRPC router
2. Create orders list page
3. Build order details page
4. Implement tracking number management
5. Add order status updates

### Stage 4: Customers & Subscribers (Week 4)
1. Build customers tRPC router
2. Create customers list and detail pages
3. Build subscribers tRPC router
4. Create subscribers management page
5. Implement import/export for subscribers

### Stage 5: Dashboard & Polish (Week 5)
1. Build dashboard router with analytics
2. Create dashboard with charts
3. Add low stock alerts
4. Implement search across all sections
5. Add bulk operations

---

## Technical Decisions

### Database
- **Recommendation**: Keep SQLite for development, switch to PostgreSQL for production
- PostgreSQL provides better performance for concurrent admin operations

### File Uploads (Product Images)
- **Options**:
  1. **UploadThing** - Easy integration with Next.js
  2. **AWS S3/Cloudflare R2** - More control, cost-effective at scale
  3. **Vercel Blob** - Simple if deploying on Vercel
- **Recommendation**: Start with UploadThing for simplicity

### Data Tables
- **TanStack Table** (React Table v8) - Best for complex filtering/sorting
- Already uses React Query which works well with tRPC

### Forms
- **React Hook Form** + **Zod** - Already have Zod, natural fit
- Type-safe forms that match API schemas

### Charts
- **Recharts** or **Chart.js** - Both work well with React
- Recommendation: Recharts for simpler API

### CSV Parsing
- **Papaparse** - Battle-tested CSV parsing
- Works both client and server side

---

## Security Considerations

1. **Authentication**: All admin routes require valid session
2. **Authorization**: Role-based access (Admin > Manager > Staff)
3. **Input Validation**: All inputs validated with Zod
4. **Rate Limiting**: Add rate limiting to import/export endpoints
5. **Audit Logging**: Log all admin actions for accountability
6. **CSRF Protection**: Built into NextAuth

---

## Questions for Clarification

Before proceeding, please confirm:

1. **Database**: Stay with SQLite or migrate to PostgreSQL?

2. **Authentication**:
   - Keep Discord OAuth only, or add email/password for admin?
   - Need to create first admin user manually?

3. **File Storage**: Where should product images be stored?
   - Local filesystem
   - Cloud storage (S3/R2/UploadThing)

4. **Email Sending**:
   - Need transactional emails (order confirmation, tracking)?
   - What email service? (SendGrid, Resend, AWS SES)

5. **Payment Integration**:
   - Is Stripe/PayPal integration needed now or later?

6. **Priority Features**:
   - Which features are most critical to build first?
   - Any features to skip for MVP?
