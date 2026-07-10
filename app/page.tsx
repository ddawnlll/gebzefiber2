import { Fragment } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { CtaBar } from "./components/CtaBar";
import { HeroScene } from "./components/HeroScene";
import { SiteScripts } from "./components/SiteScripts";
import { PhoneIcon, WhatsAppIcon } from "./components/icons";

export const metadata: Metadata = {
  title: "Gebze Fiber Tamir — Fiber Optik Kablo Tamiri | Gebze, Darıca, Çayırova, İzmit",
  description:
    "Gebze ve çevresinde fiber optik kablo tamiri: kopan fiber onarımı, füzyon ek (splice), düşük optik sinyal (dB kaybı) tespiti, modem/ONT bağlantı sorunları ve bina içi hat arızaları için yerinde servis. Telefon ve WhatsApp ile hızlıca ulaşabilirsiniz.",
  alternates: {
    canonical: "https://gebze-fiber-tamir.netlify.app/",
  },
  openGraph: {
    title: "Gebze Fiber Tamir — Fiber Optik Kablo Tamiri",
    description:
      "Kopan fiber onarımı, füzyon ek (splice), düşük sinyal tespiti ve bina içi hat arızaları için Gebze merkezli yerinde servis.",
    type: "website",
    url: "https://gebze-fiber-tamir.netlify.app/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Gebze Fiber Tamir",
  telephone: "+905301380041",
  url: "https://gebze-fiber-tamir.netlify.app/",
  description:
    "Fiber optik kablo tamiri, kopan fiber onarımı, füzyon ek (splice), düşük optik sinyal tespiti, modem/ONT bağlantı sorunları ve bina içi fiber hat arızaları için yerinde servis.",
  areaServed: [
    { "@type": "City", name: "Gebze" },
    { "@type": "City", name: "Darıca" },
    { "@type": "City", name: "Çayırova" },
    { "@type": "City", name: "Dilovası" },
    { "@type": "City", name: "Körfez" },
    { "@type": "City", name: "İzmit" },
    { "@type": "City", name: "Pendik" },
    { "@type": "City", name: "Tuzla" },
  ],
};

const CALL_HREF = "tel:+905301380041";
const WA_HREF =
  "https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F";

const DISTRICTS = ["Gebze", "Darıca", "Çayırova", "Dilovası", "Körfez", "İzmit", "Pendik", "Tuzla"];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader variant="home" />

      <main>
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <HeroScene />
          </div>
          <div className="hero-inner">
            <p className="eyebrow" data-hero>
              Gebze ve çevresi · Fiber optik arıza servisi
            </p>
            <h1 className="hero-title">
              <span className="line" data-hero>
                Fiber, camın içinde
              </span>
              <span className="line" data-hero>
                yol alan ışıktır.
              </span>
              <span className="line accent" data-hero>
                Kesildiğinde bağlarız.
              </span>
            </h1>
            <p className="hero-sub" data-hero>
              Kopan ya da hasar gören fiber hattın füzyon ekle onarımı, düşük optik sinyal (dB kaybı)
              tespiti, modem/ONT bağlantı sorunları ve bina içi hat arızaları için adresinize geliyoruz.
            </p>
            <div className="hero-cta" data-hero>
              <a className="btn btn-primary" href={CALL_HREF}>
                <PhoneIcon width={18} height={18} />
                Hemen Ara
              </a>
              <a className="btn btn-wa" href={WA_HREF}>
                <WhatsAppIcon />
                WhatsApp&apos;tan Yaz
              </a>
            </div>
            <p className="hero-note" data-hero>
              Telefon ve WhatsApp ile hızlıca ulaşabilirsiniz.
            </p>
            <ul className="hero-chips" data-hero>
              <li>Füzyon ek (splice)</li>
              <li>Yerinde arıza tespiti</li>
              <li>Gebze · Kocaeli · İstanbul yakası</li>
            </ul>
          </div>
          <div className="hero-fade" aria-hidden="true" />
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((i) => (
              <Fragment key={i}>
                {DISTRICTS.map((d) => (
                  <Fragment key={d}>
                    <span>{d}</span>
                    <span className="dot" />
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <section className="section" id="hizmetler">
          <header className="section-head" data-reveal>
            <p className="eyebrow">Hizmetler</p>
            <h2>Sinyali zayıflatan her şey, işimiz.</h2>
            <p className="section-sub">
              Kablodan konnektöre, binadan modeme: fiber hattınızın ışığı nerede kayboluyorsa orada
              çalışırız.
            </p>
          </header>
          <div className="service-grid">
            <article className="card card-feature" data-reveal>
              <svg className="card-fiber" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M-4 96 C 60 20, 120 130, 200 56 S 300 30, 324 44"
                  fill="none"
                  stroke="url(#featFiber)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="featFiber" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#6bf0c2" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#6bf0c2" />
                    <stop offset="1" stopColor="#9d8cff" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path
                    d="M4 34 C 14 18, 20 40, 27 26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M33 20 C 37 13, 41 17, 44 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="3 4"
                  />
                  <circle cx="30" cy="23" r="2.6" fill="currentColor" />
                </svg>
              </div>
              <h3>Fiber Kablo Tamiri</h3>
              <p>
                Kopan, ezilen veya bükülerek hasar gören fiber kabloların onarımı; hattın yeniden ışık
                taşır hâle getirilmesi.
              </p>
            </article>

            <article className="card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path
                    d="M6 40 L14 28 L22 34 L32 16 L42 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="16" r="3" fill="currentColor" />
                  <path d="M6 10 h10 M6 16 h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Düşük Sinyal / dB Kaybı</h3>
              <p>
                Zayıf optik sinyalin yerinde ölçümü; kaybın kaynağının bulunup giderilmesiyle bağlantının
                kararlı hâle gelmesi.
              </p>
            </article>

            <article className="card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path d="M4 24 h14 M30 24 h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path
                    d="M24 18 v-6 M24 36 v-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="2 4"
                  />
                </svg>
              </div>
              <h3>Füzyon Ek &amp; Sonlandırma</h3>
              <p>Kopuk liflerin füzyon splice ile eklenmesi, konnektörizasyon ve fiber sonlandırma işleri.</p>
            </article>

            <article className="card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <rect x="8" y="26" width="32" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="15" cy="32" r="1.8" fill="currentColor" />
                  <circle cx="22" cy="32" r="1.8" fill="currentColor" />
                  <path
                    d="M24 20 a8 8 0 0 1 12 0 M20 14 a14 14 0 0 1 20 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Modem / ONT Sorunları</h3>
              <p>
                Modem ve ONT cihazlarında bağlantı kopması, senkron sorunları ve kablolama kaynaklı
                arızaların çözümü.
              </p>
            </article>

            <article className="card" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path d="M10 42 V14 L24 6 L38 14 V42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                  <path
                    d="M18 42 C 20 30, 28 34, 30 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="30" cy="22" r="2.4" fill="currentColor" />
                </svg>
              </div>
              <h3>Bina İçi Hat &amp; Arıza Tespiti</h3>
              <p>Apartman ve bina içi fiber hat sorunlarının tespiti; kat aralarında kaybolan sinyalin izinin sürülmesi.</p>
            </article>

            <article className="card card-wide" data-reveal>
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="19" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path
                    d="M24 4 a15 15 0 0 1 15 15 c0 10-15 25-15 25 S9 29 9 19 A15 15 0 0 1 24 4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="card-wide-body">
                <h3>Yerinde Servis</h3>
                <p>Gebze merkez ve çevre ilçelerde adresinize gelerek arızaya yerinde bakarız; sorun görülmeden çözülmez.</p>
              </div>
            </article>
          </div>
          <div className="section-cta" data-reveal>
            <a className="btn btn-primary" href={CALL_HREF}>
              Arızanızı Anlatın
            </a>
            <a className="btn btn-ghost" href={WA_HREF}>
              WhatsApp ile İletişim
            </a>
          </div>
        </section>

        <section className="section section-alt" id="surec">
          <header className="section-head" data-reveal>
            <p className="eyebrow">Süreç</p>
            <h2>Üç adımda onarım</h2>
          </header>
          <ol className="steps">
            <li className="step" data-reveal>
              <span className="step-num" aria-hidden="true">
                01
              </span>
              <h3>Ulaşın</h3>
              <p>Telefonla arayın ya da WhatsApp&apos;tan arızanızı yazın. Hasarlı bölgenin fotoğrafını gönderirseniz işimiz kolaylaşır.</p>
            </li>
            <li className="step" data-reveal>
              <span className="step-num" aria-hidden="true">
                02
              </span>
              <h3>Tespit</h3>
              <p>Yerinde ölçümle sinyal kaybının kaynağını buluruz: kopukluk, ezilme, gevşek konnektör veya bina içi hat sorunu.</p>
            </li>
            <li className="step" data-reveal>
              <span className="step-num" aria-hidden="true">
                03
              </span>
              <h3>Onarım</h3>
              <p>Füzyon ek, konnektör yenileme veya hat düzeltmesiyle ışığı yeniden yola koyarız; sinyal ölçülerek teslim edilir.</p>
            </li>
          </ol>
        </section>

        <section className="section" id="bolge">
          <header className="section-head" data-reveal>
            <p className="eyebrow">Hizmet Bölgesi</p>
            <h2>Işığın gittiği her yere gideriz.</h2>
            <p className="section-sub">
              Merkezimiz Gebze. Darıca, Çayırova, Dilovası, Körfez ve İzmit&apos;e; İstanbul yakasında
              Pendik–Tuzla hattına kadar geliyoruz.
            </p>
          </header>
          <div className="area-map" data-reveal>
            <svg
              viewBox="0 0 800 440"
              role="img"
              aria-label="Hizmet bölgesi şeması: merkezde Gebze, çevresinde Pendik-Tuzla, Çayırova, Darıca, Dilovası, Körfez ve İzmit"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6bf0c2" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#9d8cff" stopOpacity="0.5" />
                </linearGradient>
                <radialGradient id="hubGrad">
                  <stop offset="0" stopColor="#ffb25e" />
                  <stop offset="1" stopColor="#ffb25e" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g className="map-rings" fill="none" stroke="rgba(237,234,246,0.08)">
                <circle cx="400" cy="220" r="90" />
                <circle cx="400" cy="220" r="160" />
                <circle cx="400" cy="220" r="235" />
              </g>
              <g className="map-lines" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5">
                <path d="M400 220 L152 150" />
                <path d="M400 220 L258 118" />
                <path d="M400 220 L308 330" />
                <path d="M400 220 L548 116" />
                <path d="M400 220 L622 292" />
                <path d="M400 220 L706 186" />
              </g>
              <circle cx="400" cy="220" r="46" fill="url(#hubGrad)" opacity="0.35" />
              <g className="map-hub">
                <circle cx="400" cy="220" r="7" fill="#ffb25e" />
                <circle className="hub-ping" cx="400" cy="220" r="7" fill="none" stroke="#ffb25e" />
                <text x="400" y="254" textAnchor="middle" className="map-label map-label-hub">
                  Gebze
                </text>
              </g>
              <g className="map-node">
                <circle cx="152" cy="150" r="4.5" />
                <text x="152" y="128" textAnchor="middle" className="map-label">
                  Pendik – Tuzla
                </text>
                <text x="152" y="176" textAnchor="middle" className="map-tag">
                  İstanbul yakası
                </text>
              </g>
              <g className="map-node">
                <circle cx="258" cy="118" r="4.5" />
                <text x="258" y="98" textAnchor="middle" className="map-label">
                  Çayırova
                </text>
              </g>
              <g className="map-node">
                <circle cx="308" cy="330" r="4.5" />
                <text x="308" y="358" textAnchor="middle" className="map-label">
                  Darıca
                </text>
              </g>
              <g className="map-node">
                <circle cx="548" cy="116" r="4.5" />
                <text x="548" y="96" textAnchor="middle" className="map-label">
                  Dilovası
                </text>
              </g>
              <g className="map-node">
                <circle cx="622" cy="292" r="4.5" />
                <text x="622" y="320" textAnchor="middle" className="map-label">
                  Körfez
                </text>
              </g>
              <g className="map-node">
                <circle cx="706" cy="186" r="4.5" />
                <text x="706" y="166" textAnchor="middle" className="map-label">
                  İzmit
                </text>
              </g>
            </svg>
          </div>
        </section>

        <section className="final-cta" id="iletisim">
          <div className="final-cta-inner" data-reveal>
            <h2>
              Hattınız mı koptu,
              <br />
              sinyaliniz mi zayıf?
            </h2>
            <p>
              Arızanızı anlatın, nasıl ilerleyeceğimizi birlikte netleştirelim. Telefon ve WhatsApp ile
              hızlıca ulaşabilirsiniz.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary btn-lg" href={CALL_HREF}>
                <PhoneIcon width={18} height={18} />
                +90 530 138 00 41
              </a>
              <a className="btn btn-wa btn-lg" href={WA_HREF}>
                <WhatsAppIcon />
                WhatsApp
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
