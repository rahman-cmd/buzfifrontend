"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, type Product, type PaginatedMeta } from "@/services/productService";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 20;
  const [meta, setMeta] = useState<PaginatedMeta>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { products: items, meta: m } = await fetchProducts(page, limit);
        if (!cancelled) {
          setProducts(items);
          setMeta(m);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to fetch products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = meta?.totalPages ?? (products.length < limit ? page : undefined);
  const canPrev = page > 1;
  const canNext = totalPages ? page < totalPages : products.length === limit;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col gap-8 py-16 px-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Buzfi Products
          </h1>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page}
            {totalPages ? ` / ${totalPages}` : ""}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-zinc-700 dark:text-zinc-300">Loading products…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="text-red-600 dark:text-red-400">{error}</span>
            <button
              className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
              onClick={() => setPage((p) => p)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <span className="text-zinc-700 dark:text-zinc-300">No products found.</span>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    const slug = (p as any).slug ?? p.id;
                    router.push(`/product/details?slug=${encodeURIComponent(String(slug))}`);
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const slug = (p as any).slug ?? p.id;
                      router.push(`/product/details?slug=${encodeURIComponent(String(slug))}`);
                    }
                  }}
                >
                  <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={p.imageUrl || "/file.svg"}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-sm sm:text-base font-medium text-black dark:text-zinc-50 line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="text-zinc-700 dark:text-zinc-300">
                      {typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            className="h-10 rounded-full border border-black/10 dark:border-white/20 px-4 text-sm disabled:opacity-50"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="h-10 rounded-full bg-foreground px-4 text-background text-sm hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
