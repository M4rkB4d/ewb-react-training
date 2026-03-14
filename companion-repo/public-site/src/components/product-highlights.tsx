// src/components/product-highlights.tsx
import Link from 'next/link';
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  category: z.string(),
});

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return z.array(ProductSchema).parse(data).slice(0, 3);
  } catch {
    return [];
  }
}

export async function ProductHighlights() {
  const products = await getFeaturedProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{product.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
