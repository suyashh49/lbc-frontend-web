import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { BrandProvider } from "@/brand/BrandProvider";
import { getBrand } from "@/brand";
import { generateBrandCSS } from "@/brand/css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
});

function fontVariableForBrand(family: string) {
  return family === "Roboto" ? roboto.variable : inter.variable;
}

export function generateMetadata(): Metadata {
  const brand = getBrand();
  return {
    title: brand.copy.pageTitle,
    description: brand.copy.metaDescription,
    icons: brand.identity.faviconUrl ? { icon: brand.identity.faviconUrl } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = getBrand();
  return (
    <html lang="en" className={fontVariableForBrand(brand.font.family)} suppressHydrationWarning>
      <body>
        {/* Server-rendered brand tokens (no flash of unbranded colors). */}
        <style dangerouslySetInnerHTML={{ __html: generateBrandCSS(brand) }} />
        <ThemeProvider>
          <BrandProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
