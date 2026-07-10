import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { CtaBar } from "./components/CtaBar";
import { SiteScripts } from "./components/SiteScripts";
import { PhoneIcon } from "./components/icons";

export const metadata = {
  title: "Sayfa bulunamadı | Gebze Fiber Tamir",
  description: "Aradığınız sayfa bulunamadı. Fiber arızanız için doğrudan arayabilir veya WhatsApp'tan yazabilirsiniz.",
  robots: "noindex",
};

const CALL_HREF = "tel:+905301380041";

export default function NotFound() {
  return (
    <>
      <SiteHeader variant="minimal" />

      <main>
        <section className="hero hero-404">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-inner">
            <p className="eyebrow" data-hero>
              404
            </p>
            <h1 className="hero-title" data-hero>
              <span className="line">Bu ışık hattı</span>
              <span className="line accent">burada kesiliyor.</span>
            </h1>
            <p className="hero-sub" data-hero>
              Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Fiber arızanız için doğrudan bize
              ulaşın, sinyali biz buluruz.
            </p>
            <div className="hero-cta" data-hero>
              <a className="btn btn-primary" href={CALL_HREF}>
                <PhoneIcon width={18} height={18} />
                Hemen Ara
              </a>
              <a className="btn btn-ghost" href="/">
                Ana sayfaya dön
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <CtaBar />
      <SiteScripts />
    </>
  );
}
