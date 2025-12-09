import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/hero-images/Untitled design - 2025-12-04T135937.399.png"
            alt="Jingo Jump"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Jingo Jump. All rights reserved.</p>
      </footer>
    </div>
  );
}
