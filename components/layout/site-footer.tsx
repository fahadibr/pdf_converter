import Link from "next/link";
import { Brand } from "@/components/layout/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <Brand footer />
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <span className="footer-note">© {new Date().getFullYear()} PDFForge</span>
      </div>
    </footer>
  );
}
