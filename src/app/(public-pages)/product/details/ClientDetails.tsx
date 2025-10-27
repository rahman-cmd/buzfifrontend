"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProductDetails, type ProductDetail } from "@/services/productService";

export default function ProductDetailsClient() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug") || "";
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoomActive, setZoomActive] = useState<boolean>(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [mainImgLoading, setMainImgLoading] = useState<boolean>(true);
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!slugParam) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const detail = await fetchProductDetails(slugParam);
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
  }, [slugParam]);

  // Reset selected image when product changes
  useEffect(() => {
    setCurrentIndex(0);
    setZoomActive(false);
    setMainImgLoading(true);
  }, [product?.slug]);

  const gallery: string[] = useMemo(() => {
    if (!product?.images || !Array.isArray(product.images)) return [];
    return product.images
      .map((img: any) => (typeof img === "string" ? img : img?.url || ""))
      .filter(Boolean);
  }, [product?.images]);

  // Preload helper
  function preloadImage(src: string | undefined) {
    if (!src) return;
    if (preloadedRef.current.has(src)) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => preloadedRef.current.add(src);
  }

  // Preload current and adjacent images
  useEffect(() => {
    const current = gallery[currentIndex];
    const next = gallery[currentIndex + 1];
    const prev = gallery[currentIndex - 1];
    preloadImage(current);
    preloadImage(next);
    preloadImage(prev);
  }, [gallery, currentIndex]);

  // Set loading state when index changes
  useEffect(() => {
    setMainImgLoading(true);
  }, [currentIndex]);

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
              <div
                className={`aspect-square w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0a0a0a] ${zoomActive ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
                }}
                onClick={() => setZoomActive((z) => !z)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setZoomActive((z) => !z);
                }}
                role="button"
                tabIndex={0}
                aria-label="Product image zoom container"
              >
                <div className="relative w-full h-full">
                  {/* Loading overlay */}
                  {mainImgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5">
                      <div className="h-8 w-8 border-2 border-black/20 border-t-black dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <Image
                    src={gallery[currentIndex] || resolveImage(product)}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover transition-transform duration-200 ease-out"
                    priority
                    fetchPriority="high"
                    placeholder="blur"
                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    style={{
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      transform: zoomActive ? "scale(1.8)" : "scale(1)",
                    }}
                    onLoadingComplete={() => setMainImgLoading(false)}
                  />
                </div>
              </div>

              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {gallery.slice(0, 6).map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      onMouseEnter={() => preloadImage(src)}
                      onFocus={() => preloadImage(src)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border border-black/10 dark:border-white/15 focus:outline-none ${currentIndex === idx ? "ring-2 ring-black dark:ring-white" : ""}`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <Image
                        src={src || "/file.svg"}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 25vw, 120px"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                      />
                    </button>
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

function renderSpecsRows(specs: ProductDetail["specifications"]) {
  if (!specs)
    return [
      <tr key="empty">
        <td className="py-2 text-zinc-600 dark:text-zinc-400">No specifications</td>
      </tr>,
    ];
  if (Array.isArray(specs)) {
    return specs.slice(0, 20).map((s, idx) => (
      <tr key={idx}>
        <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{(s as any).key ?? Object.keys(s)[0]}</td>
        <td className="py-2 text-black dark:text-zinc-50">{(s as any).value ?? Object.values(s)[0]}</td>
      </tr>
    ));
  }
  return Object.entries(specs)
    .slice(0, 20)
    .map(([key, value]) => (
      <tr key={key}>
        <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{key}</td>
        <td className="py-2 text-black dark:text-zinc-50">{String(value)}</td>
      </tr>
    ));
}