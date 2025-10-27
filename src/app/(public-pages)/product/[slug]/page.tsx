"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { fetchProductDetails, type ProductDetail } from "@/services/productService";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const detail = await fetchProductDetails(slug);
        if (!cancelled) setProduct(detail);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-zinc-700 dark:text-zinc-300">Loading product…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <span className="text-red-600 dark:text-red-400">{error}</span>
            <button
              className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
              onClick={() => setProduct(null)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <section>
              <div className="aspect-square w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0a0a0a]">
                <div className="relative w-full h-full">
                  <Image
                    src={resolveImage(product)}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.images.slice(0, 6).map((img, idx) => (
                    <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-black/10 dark:border-white/15">
                      <Image
                        src={typeof img === "string" ? img : img?.url || "/file.svg"}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 25vw, 120px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Details */}
            <section className="flex flex-col gap-4">
              <h1 className="text-2xl sm:text-3xl font-semibold text-black dark:text-zinc-50">
                {product.title}
              </h1>
              {product.description && (
                <p className="text-zinc-700 dark:text-zinc-300 leading-7">
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-black dark:text-zinc-50">
                  {formatPrice(product.price)}
                </span>
                {product.discount ? (
                  <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Save {typeof product.discount === "number" ? `${product.discount}%` : product.discount}
                  </span>
                ) : null}
              </div>
              <button
                className="h-12 rounded-full bg-foreground px-5 text-background text-base font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] w-full sm:w-auto"
                onClick={() => alert("Proceed to checkout")}
              >
                Buy Now
              </button>

              {/* Specifications */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-3">Specifications</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody className="divide-y divide-black/10 dark:divide-white/15">
                      {renderSpecsRows(product.specifications)}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function resolveImage(p: ProductDetail): string {
  if (Array.isArray(p.images) && p.images.length) {
    const first = p.images[0];
    return typeof first === "string" ? first : first?.url || "/file.svg";
  }
  return p.imageUrl || "/file.svg";
}

function formatPrice(price: number | string | undefined): string {
  if (typeof price === "number") return `$${price.toFixed(2)}`;
  if (typeof price === "string") return price;
  return "$0.00";
}

function renderSpecsRows(specs: ProductDetail["specifications"]): ReactNode {
  if (!specs) return [<tr key="empty"><td className="py-2 text-zinc-600 dark:text-zinc-400">No specifications</td></tr>];
  if (Array.isArray(specs)) {
    return specs.slice(0, 20).map((s, idx) => (
      <tr key={idx}>
        <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{(s as any).key ?? Object.keys(s)[0]}</td>
        <td className="py-2 text-black dark:text-zinc-50">{(s as any).value ?? Object.values(s)[0]}</td>
      </tr>
    ));
  }
  return Object.entries(specs).slice(0, 20).map(([key, value]) => (
    <tr key={key}>
      <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{key}</td>
      <td className="py-2 text-black dark:text-zinc-50">{String(value)}</td>
    </tr>
  ));
}