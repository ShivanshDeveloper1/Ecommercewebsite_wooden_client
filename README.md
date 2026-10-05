This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## MongoDB

Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `MONGODB_DB` for your MongoDB instance. The homepage reads from the `categories` and `products` collections when a URI is configured; without one, it uses the included sample data.

Products use a category slug as `categoryId`. Product images are stored as image URLs in `images`.

Products without variation data continue to use product-level `price`, `salePrice`, and optional `sku` and `stock` fields. Variant products store generic `attributes` (`id`, display `name`, and `values`) and a `variants` array. Each variant has a stable `variantId`, attribute selections keyed by attribute ID, a unique SKU, price, and stock; optional variant images override the product images. Existing product documents do not need a migration because products without attributes and variants remain simple products.

The admin generates at most 1,000 combinations at a time and preserves variant IDs, SKUs, prices, and stock for combinations that remain unchanged. Product API validation rejects duplicate combinations and case-insensitive SKU duplicates across product and variant SKUs.

## Admin

Open `/admin` to manage products and categories. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local` to enable signed image uploads. `CLOUDINARY_FOLDER` is optional and defaults to `products`.

The admin and its API routes intentionally have no authentication. Do not expose them publicly without adding access control at your deployment or network layer.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


<!-- abcinstitutecr@gmail.com -->