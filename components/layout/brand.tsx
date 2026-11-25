import { FileText } from "lucide-react";
import Link from "next/link";

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link className={`brand${footer ? " footer-brand" : ""}`} href="/" aria-label="PDFForge home">
      <span className="brand-mark"><FileText size={footer ? 16 : 18} strokeWidth={2.3} /></span>
      <span className="brand-word">PDF<span>Forge</span></span>
    </Link>
  );
}
