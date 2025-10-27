import { Suspense } from "react";
import ProductDetailsClient from "./ClientDetails";

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-zinc-50 dark:bg-black">
          <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-black/20 border-t-black dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
              <span className="ml-3 text-zinc-700 dark:text-zinc-300">Loading details…</span>
            </div>
          </main>
        </div>
      }
    >
      <ProductDetailsClient />
    </Suspense>
  );
}