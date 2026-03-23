// TODO: Exercise 1b — Product Detail | Target: public-site/app/products/[slug]/page.tsx
export default function ProductDetailPage({ params }: { params: { slug: string } }) { return <div>Product: {params.slug}</div>; }
