import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PDFForge",
  description: "Get help with PDFForge document conversion.",
  alternates: { canonical: "/contact" },
};

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const configuredEmail = process.env.SUPPORT_EMAIL?.trim();
  const email = configuredEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail) ? configuredEmail : "";
  return (
    <main id="main-content" className="legal-page page-shell">
      <article className="legal-content">
        <span className="section-kicker">WE’RE HERE TO HELP</span>
        <h1>Contact</h1>
        <p>Need help with a conversion? If a file did not convert, try saving it again from your document editor and upload the new copy.</p>
        <section className="contact-card" aria-label="Support contact">
          <h2>PDFForge support</h2>
          {email ? (
            <p>Email us at <a href={`mailto:${email}`}>{email}</a>. Please include your browser, the file type, and the request ID shown with a conversion error. Do not attach documents containing sensitive information.</p>
          ) : (
            <p>Support contact information is not currently published. If you were directed here by an organization, contact its support team. When reporting a conversion issue, include your browser, file type, and request ID, but never send document contents.</p>
          )}
        </section>
      </article>
    </main>
  );
}
