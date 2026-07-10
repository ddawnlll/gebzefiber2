import { BrandMark } from "./BrandMark";
import { PhoneIcon } from "./icons";

interface SiteHeaderProps {
  /** Homepage renders in-page anchor links and scrolls to #ust; other pages link back to "/". */
  variant: "home" | "sub" | "minimal";
}

const NAV_LINKS = [
  { hash: "#hizmetler", label: "Hizmetler" },
  { hash: "#surec", label: "Süreç" },
  { hash: "#bolge", label: "Bölge" },
  { hash: "#iletisim", label: "İletişim" },
];

export function SiteHeader({ variant }: SiteHeaderProps) {
  const isHome = variant === "home";
  const brandHref = isHome ? "#ust" : "/";
  const brandLabel = isHome ? "Gebze Fiber Tamir, sayfa başı" : "Gebze Fiber Tamir, ana sayfa";

  return (
    <header className="site-header" id="ust">
      <a className="brand" href={brandHref} aria-label={brandLabel}>
        <BrandMark />
        <span className="brand-name">
          Gebze <em>Fiber</em> Tamir
        </span>
      </a>
      {variant !== "minimal" && (
        <nav className="site-nav" aria-label="Ana menü">
          {NAV_LINKS.map((link) => (
            <a key={link.hash} href={isHome ? link.hash : `/${link.hash}`}>
              {link.label}
            </a>
          ))}
          <a href="/rehber/" aria-current={variant === "sub" ? "page" : undefined}>
            Rehber
          </a>
        </nav>
      )}
      <a className="btn btn-header" href="tel:+905301380041" aria-label="Telefonla ara: 0530 138 00 41">
        <PhoneIcon />
        <span>0530 138 00 41</span>
      </a>
    </header>
  );
}
