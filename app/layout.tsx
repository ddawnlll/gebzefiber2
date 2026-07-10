import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gebze-fiber-tamir.netlify.app"),
  title: "Gebze Fiber Tamir — Fiber Optik Kablo Tamiri | Gebze, Darıca, Çayırova, İzmit",
  description:
    "Gebze ve çevresinde fiber optik kablo tamiri: kopan fiber onarımı, füzyon ek (splice), düşük optik sinyal (dB kaybı) tespiti, modem/ONT bağlantı sorunları ve bina içi hat arızaları için yerinde servis. Telefon ve WhatsApp ile hızlıca ulaşabilirsiniz.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0a0714",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${bricolageGrotesque.variable} ${instrumentSans.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
