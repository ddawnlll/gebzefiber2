import { PhoneIcon, WhatsAppIcon } from "./icons";

export function CtaBar() {
  return (
    <nav className="cta-bar" aria-label="Hızlı iletişim">
      <a className="cta-bar-call" href="tel:+905301380041">
        <PhoneIcon width={20} height={20} />
        Ara
      </a>
      <a
        className="cta-bar-wa"
        href="https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F"
      >
        <WhatsAppIcon width={20} height={20} />
        WhatsApp
      </a>
    </nav>
  );
}
