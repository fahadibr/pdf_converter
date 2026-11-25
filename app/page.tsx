import type { Metadata } from "next";
import { FileCheck2, FileText, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { Converter } from "@/components/converter/converter";

export const metadata: Metadata = {
  title: "Convert DOC, DOCX & TXT to PDF online",
  description:
    "Turn Word documents and text files into share-ready PDFs in seconds. Free conversion, private by design, no account required.",
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: Zap,
    title: "Ready in seconds",
    text: "A streamlined conversion engine gets your document into PDF without extra steps.",
    tone: "blue",
  },
  {
    icon: LockKeyhole,
    title: "Private by design",
    text: "Files are processed for your request and automatically removed from temporary storage.",
    tone: "violet",
  },
  {
    icon: FileCheck2,
    title: "Made to look right",
    text: "LibreOffice keeps familiar document layouts, fonts, and formatting intact in your PDF.",
    tone: "green",
  },
];

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDFForge",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description: "Convert DOC, DOCX, and TXT documents to PDF in seconds.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="page-shell hero-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A better way to make PDFs</div>
            <h1>From document<br className="desktop-break" /> to <span>done.</span></h1>
            <p className="hero-lede">Convert DOC, DOCX &amp; TXT into a polished PDF in seconds. Simple, secure, and ready when you are.</p>
            <div className="hero-proof" aria-label="Product benefits">
              <span><LockKeyhole size={15} /> Private by default</span>
              <i aria-hidden="true" />
              <span><Zap size={15} /> No account needed</span>
            </div>
          </div>
          <div className="converter-column">
            <Converter />
            <p className="upload-assurance"><LockKeyhole size={13} /> Your files are encrypted in transit and auto-deleted after conversion.</p>
          </div>
        </div>
        <div className="hero-bottom page-shell" aria-hidden="true">
          <span>TRUSTED FORMATS</span><i /><span>DOC</span><i /><span>DOCX</span><i /><span>TXT</span><i /><span><FileText size={13} /> PDF</span>
        </div>
      </section>

      <section className="features-section page-shell" id="features">
        <div className="section-heading">
          <span className="section-kicker">THE PDFFORGE DIFFERENCE</span>
          <h2>Everything you need.<br /><span>Nothing you don’t.</span></h2>
          <p>Document conversion should be the easiest part of your day.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text, tone }, index) => (
            <article className="feature-card" key={title}>
              <div className={`feature-icon ${tone}`}><Icon size={20} strokeWidth={1.8} /></div>
              <span className="feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="page-shell how-layout">
          <div className="how-intro">
            <span className="section-kicker">THREE STEPS. THAT’S IT.</span>
            <h2>Your document,<br /><span>PDF-ready.</span></h2>
            <p>No installs, no sign-ups, no puzzling settings. Just the file you need.</p>
          </div>
          <ol className="steps-list">
            <li><span>01</span><div><h3>Choose a file</h3><p>Drop in a DOC, DOCX, or TXT file from your device.</p></div></li>
            <li><span>02</span><div><h3>We make it a PDF</h3><p>Your file is converted securely in the background.</p></div></li>
            <li><span>03</span><div><h3>Download and go</h3><p>Save your finished PDF. Your upload is automatically cleared.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="closing-cta page-shell">
        <div className="cta-mark"><Sparkles size={21} /></div>
        <div><h2>One less thing on your list.</h2><p>Your next PDF is only a click away.</p></div>
        <a className="button button-primary cta-button" href="#converter">Convert a file <span aria-hidden="true">→</span></a>
      </section>
    </main>
  );
}
