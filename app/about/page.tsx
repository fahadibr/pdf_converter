import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PDFForge",
  description: "Learn about PDFForge, a simple and private way to convert everyday documents into PDFs.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="legal-page page-shell">
      <article className="legal-content">
        <span className="section-kicker">ABOUT PDFFORGE</span>
        <h1>Documents, made simpler.</h1>
        <p>PDFForge is a focused document-to-PDF converter. It helps you turn Word documents and plain text into a PDF you can share, print, and keep.</p>
        <h2>Built around the task</h2>
        <p>Choose a file, convert it, and download the result. There are no accounts to create and no settings to figure out. Conversion runs on our server with LibreOffice, a widely used office document engine.</p>
        <h2>Respect for your files</h2>
        <p>Your document is used only to create the PDF you asked for. The service does not keep a file library; temporary working files are deleted when the conversion request ends. Read our <a href="/privacy">Privacy Policy</a> for details.</p>
        <h2>Supported documents</h2>
        <p>PDFForge currently accepts DOC, DOCX, and UTF-8 TXT files up to the upload limit shown in the converter. Complex layouts may render differently across office software, so please review important documents before sharing them.</p>
      </article>
    </main>
  );
}
