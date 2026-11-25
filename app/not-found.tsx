import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <div>
        <span className="section-kicker">404 · PAGE NOT FOUND</span>
        <h1>This page is missing.</h1>
        <p>The link may be old, or the page may have moved.</p>
        <Link className="button button-primary" href="/"><ArrowLeft size={14} /> Back to PDFForge</Link>
      </div>
    </main>
  );
}
