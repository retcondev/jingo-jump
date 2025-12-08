import { NavBar } from "~/app/_components/landing/NavBar";
import { SiteFooter } from "~/app/_components/landing/SiteFooter";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <NavBar />
      {children}
      <SiteFooter />
    </div>
  );
}
