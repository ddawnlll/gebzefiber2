interface SiteFooterProps {
  /** Rehber page footer adds an extra "· Ana sayfa" link after the year line. */
  showHomeLink?: boolean;
}

export function SiteFooter({ showHomeLink = false }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-name">
            Gebze <em>Fiber</em> Tamir
          </span>
          <p>Fiber optik kablo tamiri ve arıza servisi.</p>
        </div>
        <div className="footer-contact">
          <a href="tel:+905301380041">+90 530 138 00 41</a>
          <a href="https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F">
            WhatsApp
          </a>
        </div>
        <p className="footer-area">Gebze · Darıca · Çayırova · Dilovası · Körfez · İzmit · Pendik – Tuzla</p>
        <p className="footer-fine">
          <span id="year">2026</span> Gebze Fiber Tamir
          {showHomeLink && (
            <>
              {" "}
              · <a href="/">Ana sayfa</a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
