import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-black/10 dark:border-white/15 bg-white dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Contact */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-black dark:text-zinc-50">Buzfi</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Quality products curated for you.
          </p>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            <div>Email: <a className="underline" href="mailto:support@buzfi.com">support@buzfi.com</a></div>
            <div>Phone: <a className="underline" href="tel:+10000000000">+1 000 000 0000</a></div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-black dark:text-zinc-50">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-zinc-700 dark:text-zinc-300 hover:underline">Home</Link></li>
            <li><Link href="/checkout" className="text-zinc-700 dark:text-zinc-300 hover:underline">Checkout</Link></li>
          </ul>
        </section>

        {/* Socials */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-black dark:text-zinc-50">Follow Us</h3>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">Twitter/X</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">Instagram</a>
          </div>
        </section>

        {/* Copyright */}
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-black dark:text-zinc-50">Legal</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">© {new Date().getFullYear()} Buzfi. All rights reserved.</p>
        </section>
      </div>
    </footer>
  );
}