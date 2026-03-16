// app/products/page.tsx
import { z } from 'zod';
import Link from 'next/link';
import { clientEnv } from '@/lib/env';
import { mockProducts } from '@/lib/mock-data';

const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  category: z.enum(['savings', 'loans', 'credit-cards', 'investments']),
  interestRate: z.number().nonnegative().optional(),
});

const ProductListSchema = z.array(ProductSchema);

type Product = z.infer<typeof ProductSchema>;

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status}`);
      return mockProducts;
    }

    const data = await res.json();
    return ProductListSchema.parse(data);
  } catch {
    // API unavailable — use mock data for local development
    return mockProducts;
  }
}

export const metadata = {
  title: 'Banking Products | EastWest Bank',
  description: 'Explore savings accounts, personal loans, credit cards, and investment products from EastWest Bank.',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
      <p className="mt-2 text-gray-600">
        Find the right banking product for your needs.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-ewb-purple/10 to-ewb-navy/10">
                <span className="text-2xl font-bold text-ewb-purple/30">{product.name}</span>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{product.summary}</p>
                {product.interestRate != null && (
                  <p className="mt-2 text-sm font-medium text-ewb-purple">
                    From {product.interestRate}% p.a.
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
