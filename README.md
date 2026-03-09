# 🍴 Utensil Store

A full-stack kitchen utensil e-commerce application built with Next.js. Customers can browse products, place orders with a token-based payment flow, and track order status. Admins manage inventory, update orders, and view audit logs through a dedicated dashboard.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Image Uploads:** [Cloudinary](https://cloudinary.com/)
- **Password Hashing:** bcryptjs

## Prerequisites

Make sure the following are installed on your machine:

- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later
- npm (comes with Node.js)

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd utensil-store
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Seed the Database

```bash
npx tsx scripts/seed.ts
```

This creates an admin account and 10 sample kitchen utensil products.

### 6. Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
| ----------------------- | --------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/utensil_store`) |
| `NEXTAUTH_SECRET` | Random secret for signing session tokens. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL of the app (e.g. `http://localhost:3000`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name for product image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Project Structure

```
utensil-store/
├── prisma/
│   └── schema.prisma        # Database schema (User, Product, Order, etc.)
├── scripts/
│   └── seed.ts              # Database seed script
├── src/
│   ├── app/                  # Next.js App Router pages & API routes
│   ├── components/           # Reusable React components
│   └── lib/
│       └── prisma.ts         # Shared Prisma client instance
├── public/                   # Static assets
├── .env.example              # Environment variable template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Features

### Customer

- Browse the product catalogue with stock availability
- Add products to cart and place orders
- Token-based payment flow (pay a token amount upfront, settle the rest on delivery)
- Track order status in real time (Pending → Confirmed → Preparing → Ready → Delivered)
- Phone-number-based authentication

### Admin

- Dashboard to manage products (create, edit, update stock)
- Upload product images via Cloudinary
- View and manage all orders
- Update order status through the fulfilment pipeline
- Audit log for tracking administrative actions
- Role-based access control

## Admin Credentials

After running the seed script, you can log in to the admin dashboard with:

| Field    | Value        |
| -------- | ------------ |
| Phone    | `9999999999` |
| Password | `admin123`   |

> **Change these credentials in production.**

## Available Scripts

| Command | Description |
| ----------------------------- | -------------------------------- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `npx prisma migrate dev` | Run pending migrations |
| `npx tsx scripts/seed.ts` | Seed the database |

## Deployment

### Vercel + Hosted PostgreSQL

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Provision a PostgreSQL database with [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/).
4. Set all environment variables in the Vercel project settings.
5. Add a build command override if needed:
   ```
   npx prisma generate && next build
   ```
6. Deploy. Vercel will automatically build and serve your application.

> Make sure `NEXTAUTH_URL` is set to your production domain and `NEXTAUTH_SECRET` is a strong, unique value.

## License

This project is licensed under the [MIT License](LICENSE).
