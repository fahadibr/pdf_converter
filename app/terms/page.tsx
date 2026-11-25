import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using PDFForge's document-to-PDF conversion service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main id="main-content" className="legal-page page-shell">
      <article className="legal-content">
        <span className="section-kicker">SERVICE TERMS</span>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated November 25, 2026</p>
        <p>By using PDFForge, you agree to these terms. If you do not agree, do not use the service.</p>
        <h2>Using the converter</h2>
        <p>You may use PDFForge to convert DOC, DOCX, and TXT files that you own or have permission to process. You are responsible for the files you submit and for reviewing the resulting PDF before relying on or distributing it.</p>
        <h2>Acceptable use</h2>
        <p>Do not use the service to upload unlawful content, interfere with the service, probe its security, or submit files designed to disrupt the conversion system. Automated or excessive use may be rate-limited.</p>
        <h2>Availability and output</h2>
        <p>The service is provided as available. Conversion depends on file structure, fonts, and source-document features; PDFForge does not guarantee that every layout will be reproduced exactly or that the service will be uninterrupted. Keep your own copy of important source documents and verify the output.</p>
        <h2>Your content</h2>
        <p>You retain your rights to the documents you upload. You give the service operator permission to process them only as needed to return the converted PDF. Temporary files are deleted after the conversion request ends as described in the <a href="/privacy">Privacy Policy</a>.</p>
        <h2>Changes and contact</h2>
        <p>These terms may change when the service changes. Continued use after an updated version is published means you accept the updated terms. Contact details are shown on the <a href="/contact">Contact page</a> when configured by the operator.</p>
      </article>
    </main>
  );
}
