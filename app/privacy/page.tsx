import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PDFForge handles uploaded documents, service data, and privacy.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-page page-shell">
      <article className="legal-content">
        <span className="section-kicker">YOUR FILES, YOURS</span>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated November 26, 2026</p>
        <p>PDFForge is designed to convert a document without creating an account or retaining a file library. This policy describes the information handled when you use the service.</p>
        <h2>Files you upload</h2>
        <p>Your selected file is sent over HTTPS to the conversion service. It is held in a private, temporary working directory while LibreOffice converts it. The original and generated PDF are removed when that request finishes, whether it succeeds or fails. Temporary storage is not intended as a backup or recovery service.</p>
        <h2>Service and security data</h2>
        <p>The server processes your IP address to enforce short-window rate limits. It may log a generated request ID and a technical error summary to diagnose service failures. Conversion logs do not include document contents or your original filename. Configure your reverse proxy and hosting provider to apply their own log retention limits.</p>
        <h2>Analytics and third-party tags</h2>
        <p>PDFForge loads Google Tag Manager container GTM-WQ8TN36L to monitor site usage. Tags configured in that container may collect page views, page interactions, browser and device details, and network information. They may use cookies or similar browser storage and may send data to Google or other services configured in the container. See the <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a> for information about Google’s processing.</p>
        <h2>Retention and deletion</h2>
        <p>Temporary files are removed as part of each completed request. In the included Docker deployment, conversion scratch space is an ephemeral temporary filesystem. Infrastructure logs are managed separately by the server operator and may have their own retention period.</p>
        <h2>Security limits</h2>
        <p>Files are encrypted in transit when the service is deployed behind HTTPS. No online service can guarantee absolute security. Do not upload documents that you are not authorized to share with the service operator, or that require a special regulated-data agreement.</p>
        <h2>Questions</h2>
        <p>Contact details can be configured by the service operator and are shown on the <a href="/contact">Contact page</a>.</p>
      </article>
    </main>
  );
}
