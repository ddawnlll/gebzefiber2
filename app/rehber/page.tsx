import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { CtaBar } from "../components/CtaBar";
import { SiteScripts } from "../components/SiteScripts";
import { PhoneIcon, WhatsAppIcon, BackArrowIcon } from "../components/icons";
import "./rehber.css";

export const metadata: Metadata = {
  title: "Bu Site Nasıl Yapıldı — Rehber | Gebze Fiber Tamir",
  description:
    "Gebze Fiber Tamir sitesinin npm veya build aracı olmadan, düz HTML/CSS/JS ve CDN üzerinden GSAP, Three.js ile nasıl kurulduğunun adım adım anlatımı: teknoloji tercihleri, tasarım kararları, WebGL sahnesi ve süreç.",
  alternates: {
    canonical: "https://gebze-fiber-tamir.netlify.app/rehber/",
  },
  openGraph: {
    title: "Bu Site Nasıl Yapıldı — Rehber",
    description: "Gebze Fiber Tamir sitesinin npm olmadan, düz HTML/CSS/JS ve CDN üzerinden nasıl kurulduğunun anlatımı.",
    type: "article",
    url: "https://gebze-fiber-tamir.netlify.app/rehber/",
  },
};

const CALL_HREF = "tel:+905301380041";
const WA_HREF =
  "https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F";

const TOC_LINKS = [
  { href: "#neden", label: "1. Neden yeni bir site" },
  { href: "#teknoloji", label: "2. Teknoloji yığını" },
  { href: "#tasarim", label: "3. Tasarım kararları" },
  { href: "#webgl", label: "4. WebGL sahnesi" },
  { href: "#rol", label: "5. Claude'un rolü" },
  { href: "#surec", label: "6. Süreç" },
  { href: "#sinirlamalar", label: "7. Sınırlamalar" },
];

const SWATCHES = [
  { color: "#0a0714", label: "Zemin" },
  { color: "#120d1f", label: "Zemin (ikincil)" },
  { color: "#edeaf6", label: "Metin" },
  { color: "#6bf0c2", label: "Nane" },
  { color: "#ffb25e", label: "Kehribar" },
  { color: "#9d8cff", label: "Menekşe" },
];

export default function RehberPage() {
  return (
    <div className="rehber-body">
      <SiteHeader variant="sub" />

      <main>
        <section className="guide-hero">
          <div className="guide-hero-inner">
            <a className="back-link" href="/">
              <BackArrowIcon />
              Ana sayfaya dön
            </a>
            <p className="eyebrow">Rehber</p>
            <h1 className="guide-title">
              Bu site <span className="accent">nasıl yapıldı</span>
            </h1>
            <p className="guide-sub">
              Bu sayfa, Gebze Fiber Tamir&apos;in ana sayfasının hangi araçlarla, hangi kısıtlarla ve hangi
              kararlarla kurulduğunu anlatıyor — okuyup kendi projenizde aynı süreci uygulayabilmeniz için,
              adım adım ve dürüstçe.
            </p>
          </div>
        </section>

        <nav className="toc" aria-label="İçindekiler">
          {TOC_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <article className="guide-body">
          <section className="guide-section" id="neden" data-reveal>
            <span className="guide-num">01</span>
            <h2>Neden yeni bir site</h2>
            <p>
              İşletmenin mevcut sitesi, <strong>gebzefiberkablo.com</strong>, aynı telefon numarasını
              kullanan genel bir şablon siteydi: ince içerikli, belirli bir çalışma saati ya da fiyat
              bilgisi yayınlanmamış, tasarımı jenerik bir telekom şablonu görünümünde. Bu proje o siteyi
              taklit etmek yerine sıfırdan kuruldu. Eski site yalnızca tek bir amaçla kullanıldı: telefon
              numarasının ve iş kategorisinin gerçek olduğunu doğrulamak. Ne düzeni, ne renk şeması, ne
              tipografisi, ne de sayfa yapısı referans alınmadı — yeni site, işin gerçek bağlamından
              (verilen hizmetler, telefon/WhatsApp numarası, hizmet verilen bölge) yola çıkılarak
              tasarlandı.
            </p>
          </section>

          <section className="guide-section" id="teknoloji" data-reveal>
            <span className="guide-num">02</span>
            <h2>Teknoloji yığını ve neden böyle</h2>
            <p>
              Bu sitenin kurulduğu ortamda npm paket kayıt sunucusuna erişim yoktu.{" "}
              <code>registry.npmjs.org</code>, <code>cdn.jsdelivr.net</code>{" "}ve <code>npmmirror</code>{" "}
              adresleri test edildi ve ulaşılamadığı doğrulandı; bu yüzden Astro, Vite veya benzeri bir
              build aracı, hatta <code>npm install</code>{" "}bile bu ortamda çalışmıyordu. Buna karşılık şu
              adresler erişilebilir çıktı ve site tamamen bunlar üzerine kuruldu:
            </p>
            <ul className="stack-list">
              <li>
                <code>unpkg.com</code>{" "}— GSAP ve ScrollTrigger, klasik <code>&lt;script&gt;</code>{" "}
                etiketiyle, <code>window.gsap</code>{" "}global değişkeni üzerinden
              </li>
              <li>
                <code>esm.sh</code>{" "}— Three.js, gerçek bir ES module olarak,{" "}
                <code>&lt;script type=&quot;module&quot;&gt;</code>{" "}içinde <code>import</code>{" "}ile
              </li>
              <li>
                <code>fonts.googleapis.com</code>{" "}— Google Fonts, standart <code>&lt;link&gt;</code>{" "}ile
              </li>
              <li>
                <code>cdnjs.cloudflare.com</code>{" "}— gerektiğinde ek kütüphaneler için yedek kaynak
              </li>
            </ul>
            <p>
              Sonuç: build adımı olmayan, elle yazılmış düz HTML, CSS ve JavaScript. Bunu sadece bir
              kısıtlama olarak değil, kendi başına savunulabilir bir mimari tercih olarak da görmek
              mümkün — bağımlılık ağacı yok, <code>npm audit</code>{" "}uyarıları yok, sürüm çakışması yok,
              derleme süresi yok. Dosyayı tarayıcıya açtığınız an çalışan, uzun vadede bozulma riski en
              düşük site türlerinden biri bu. Küçük, dönüşüm odaklı bir tanıtım sitesi için fazlasıyla
              yeterli.
            </p>
          </section>

          <section className="guide-section" id="tasarim" data-reveal>
            <span className="guide-num">03</span>
            <h2>Tasarım kararları</h2>
            <p>
              Tasarımın çıkış noktası tek bir metafordu: <em>fiber, camın içinde yol alan ışıktır.</em>{" "}
              Sinyal koptuğunda arayan bir müşteri için görünmez olan şey — ince bir cam telin içinde ışık
              hızında akan veri — sitenin görsel diline dönüştürüldü: koyu, neredeyse gece gibi bir zemin
              üzerinde, ince ışık iplikleri boyunca hareket eden renkli sinyal atımları.
            </p>
            <div className="swatch-grid">
              {SWATCHES.map((sw) => (
                <div
                  className="swatch"
                  key={sw.color}
                  style={{ "--sw": sw.color } as React.CSSProperties}
                >
                  <span className="swatch-chip" />
                  <span>{sw.label}</span>
                  <code>{sw.color}</code>
                </div>
              ))}
            </div>
            <p>
              Tipografi eşleşmesi <strong>Bricolage Grotesque</strong>{" "}(başlıklar) ve{" "}
              <strong>Instrument Sans</strong>{" "}(gövde metni) oldu. Bu seçimin arkasında estetik kadar
              pratik bir zorunluluk da var: site tamamen Türkçe ve başlıklarda ğ, ş, ı, İ, ö, ü, ç
              karakterleri sürekli geçiyor. &quot;İlginç&quot; görünen birçok gösterim (display) fontu bu
              karakterlerin bir kısmını desteklemiyor ya da yanlış çiziyor — seçime geçmeden önce her iki
              fontun Latin Extended kapsamı tek tek doğrulandı. Sonuçta hem karakter dolu hem de Türkçe
              metinde kırılmayan bir eşleşme ortaya çıktı.
            </p>
            <p>
              Hizmetler bölümü ilk halinde altı eş boyutlu kart olarak kurulmuştu — teknik olarak doğru
              ama &quot;şablon sitesi&quot; hissi veren, hiyerarşisiz bir düzendi. Gözden geçirme
              turlarından birinde bu bir bento (kırık ızgara) kompozisyona dönüştürüldü: en sık aranan
              hizmet olan fiber kablo tamiri geniş bir öne çıkan kart, &quot;yerinde servis&quot; ise tam
              genişlikte kapanan bir şerit oldu. Aynı mantık düğme ve kart etkileşimlerine de taşındı:
              renk değişimi yerine, sitenin konseptine uygun biçimde düğmelerin ve kartların üzerinden
              geçen ince bir ışık atımı animasyonu eklendi — dekorasyon değil, markanın kendi görsel
              dilinin etkileşime sızması.
            </p>
          </section>

          <section className="guide-section" id="webgl" data-reveal>
            <span className="guide-num">04</span>
            <h2>WebGL sahnesi</h2>
            <p>
              Ana sayfadaki hero bölümündeki animasyon, Three.js ile çizilen eğri (tube) geometrileri
              üzerine yazılmış özel bir GLSL fragment shader&apos;a dayanıyor. Her ışık ipliğinin üzerinde,
              tüpün uzunluğu boyunca hareket eden dar bir &quot;ışık paketi&quot; hesaplanıyor ve bu paket{" "}
              <code>AdditiveBlending</code>{" "}(ekleme karışımı) ile çiziliyor; ince ipliğin etrafına, daha
              geniş yarıçaplı ve daha düşük opaklıklı ikinci bir &quot;halo&quot; tüp eklenerek parlama
              hissi elle üretiliyor.
            </p>
            <p>
              Bilinçli olarak Three.js&apos;in <code>UnrealBloomPass</code>{" "}son işleme (postprocessing)
              efekti kullanılmadı. Bunun yerine elle yazılmış halo tüpü tercih edildi, çünkü postprocessing
              zinciri (<code>EffectComposer</code>, <code>RenderPass</code>, <code>UnrealBloomPass</code>)
              özellikle pencere yeniden boyutlandırıldığında ve orta seviye mobil GPU&apos;larda daha
              kırılgan davranıyor; halo tüpü yaklaşımı görsel olarak benzer bir parlama verirken ek bir
              render geçişi gerektirmiyor.
            </p>
            <p>Performans için alınan somut önlemler:</p>
            <ul className="stack-list">
              <li>
                Piksel oranı <code>Math.min(devicePixelRatio, 2)</code>{" "}ile sınırlandı, dar ekranlarda
                1.5&apos;e düşürüldü
              </li>
              <li>760px altındaki ekranlarda iplik sayısı ve geometri detayı azaltıldı</li>
              <li>
                Sahne <code>requestIdleCallback</code>{" "}ile tembel başlatılıyor, ilk boyamayı bloklamıyor
              </li>
              <li>
                <code>IntersectionObserver</code>{" "}ile hero görünüm dışına çıktığında veya sekme
                gizlendiğinde animasyon döngüsü durduruluyor
              </li>
              <li>WebGL kullanılamıyorsa canvas kaldırılıp yerine düz CSS gradyan zemin devreye giriyor</li>
              <li>
                <code>prefers-reduced-motion</code>{" "}açıksa sahne tek bir sabit kare render edip animasyon
                döngüsüne hiç girmiyor
              </li>
            </ul>
          </section>

          <section className="guide-section" id="rol" data-reveal>
            <span className="guide-num">05</span>
            <h2>Claude&apos;un rolü</h2>
            <p>
              Bu sayfaların görsel tasarımı, Anthropic&apos;in Fable modeli tarafından, verilen bir
              kreatif brief&apos;e karşılık üretildi: marka adı, telefon numarası, hizmet listesi ve hizmet
              bölgesi gibi doğrulanmış iş bilgileri sabit tutulup, tasarım yönü, renk paleti, tipografi
              eşleşmesi ve WebGL konsepti serbest bırakıldı. Bu bilinçli bir portföy gösterimidir — model,
              gerçek bir işletme için gerçek kısıtlar (npm erişimi yok, uydurma bilgi yasak, mobilde
              arama/WhatsApp önceliği) altında uçtan uca bir site üretebildiğini göstermek üzere
              kullanıldı.
            </p>
          </section>

          <section className="guide-section" id="surec" data-reveal>
            <span className="guide-num">06</span>
            <h2>Süreç</h2>
            <p>Kendi projenizde uygulayabileceğiniz sıra şuydu:</p>
            <ol className="checklist">
              <li>
                <strong>Araştırma.</strong>{" "}İşletmenin gerçek bilgilerini (telefon, hizmetler, bölge) topla;
                mevcut siteyi varsa sadece doğrulama için incele, tasarımını kopyalama.
              </li>
              <li>
                <strong>Ortam kısıtlarını keşfet.</strong>{" "}Hangi paket kayıt sunucularına, hangi
                CDN&apos;lere erişim var — bunu varsaymadan test et.
              </li>
              <li>
                <strong>İçerik ve dönüşüm hedefini planla.</strong>{" "}Bu sitede birincil hedef telefon
                araması veya WhatsApp mesajıydı; sayfa yapısı buna göre kuruldu (sabit mobil CTA çubuğu,
                tekrarlayan çağrılar).
              </li>
              <li>
                <strong>Tasarım ve kodu birlikte üret.</strong>{" "}Palet, tipografi ve konsept metaforunu önce
                netleştir, sonra HTML/CSS/JS&apos;i buna göre yaz.
              </li>
              <li>
                <strong>Yerel önizlemede doğrula.</strong>{" "}Masaüstü ve mobil ekran görüntüleri al, konsol
                hatalarını ve başarısız ağ isteklerini kontrol et.
              </li>
              <li>
                <strong>Kritik ve cilalama turları — art arda, taze gözle.</strong>{" "}Bu sitede üç tur
                yapıldı. Birincisi favicon, özel 404 sayfası ve güvenlik başlıkları (CSP dahil) gibi teknik
                eksikleri kapattı. İkincisi, siteyi hiç görmemiş bir gözle yapılan bağımsız bir eleştiri
                turuydu: hizmetler ızgarası şablon hissi verdiği için bento düzene çevrildi, süreç adımları
                arasına akan bir sinyal çizgisi eklendi, düğme/kart etkileşimlerine ışık atımı
                mikro-animasyonları geldi ve mobilde bölge haritasındaki okunamayan etiketler büyütüldü.
                Üçüncüsü bu sayfayı — yani şu an okuduğunuz metni — güncel tutup son bir tutarlılık
                kontrolü yaptı. Her tur bir öncekinin kör noktalarını hedef aldı; aynı kişi/model kendi
                işini art arda üç kez incelemek yerine mümkün olduğunca taze bir bakışla tekrar
                değerlendirdi.
              </li>
              <li>
                <strong>Kod incelemesi.</strong>{" "}Erişilebilirlik (alt metin, aria-label, odak durumları),
                performans (lazy-init, reduced motion) ve dürüstlük (uydurma bilgi var mı) kontrolü yap.
              </li>
              <li>
                <strong>Statik dağıtım.</strong>{" "}Build adımı olmadığı için dosyalar doğrudan Netlify&apos;a
                statik olarak yüklendi.
              </li>
            </ol>
          </section>

          <section className="guide-section" id="sinirlamalar" data-reveal>
            <span className="guide-num">07</span>
            <h2>Sınırlamalar</h2>
            <p className="callout">
              Bu sitede bilerek eklenmeyen şeyler var: gerçek müşteri yorumu, yıldız puanı, fiyat bilgisi
              ve kesin çalışma saati. Bunların hiçbiri işletme tarafından doğrulanmadığı için sayfa uydurma
              bilgi içermektense eksik kalmayı tercih etti. Telefon ve WhatsApp üzerinden hızlıca
              ulaşılabileceği belirtildi; ötesi işletmenin kendi beyanına bırakıldı.
            </p>
          </section>

          <div className="guide-cta" data-reveal>
            <p>Arızanız mı var, yoksa siteyi mi konuşmak istiyorsunuz?</p>
            <div className="hero-cta">
              <a className="btn btn-primary" href={CALL_HREF}>
                <PhoneIcon width={18} height={18} />
                Hemen Ara
              </a>
              <a className="btn btn-wa" href={WA_HREF}>
                <WhatsAppIcon />
                WhatsApp&apos;tan Yaz
              </a>
            </div>
            <a className="text-link" href="/">
              Ana sayfaya dön
            </a>
          </div>
        </article>
      </main>

      <SiteFooter showHomeLink />
      <CtaBar />
      <SiteScripts />
    </div>
  );
}
