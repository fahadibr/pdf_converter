import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/layout/brand";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link className="nav-cta" href="/#converter">Convert a file <ArrowUpRight size={14} /></Link>
        </nav>
      </div>
    </header>
  );
}
