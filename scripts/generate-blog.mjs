// One-off content generator: renders the static /blog/ index page and each
// post's /blog/<slug>/index.html from the POSTS array below. Not part of the
// Netlify build — run manually with `node scripts/generate-blog.mjs`
// whenever a post is added or edited, then commit the generated HTML.
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = 'https://gebze-fiber-tamir.netlify.app';
const OG_IMAGE = `${SITE}/og-image.png`;

const POSTS = [
  {
    slug: 'fiber-internet-neden-kopar',
    tag: 'Arıza Nedenleri',
    title: 'Fiber İnternet Kablosu Neden Kopar? En Sık 7 Neden',
    description: 'Fiber optik kablo neden kopar, ezilir ya da hasar görür? Gebze ve çevresinde en sık karşılaşılan 7 fiber arıza nedenini ve belirtilerini anlatıyoruz.',
    excerpt: 'Kemirgenden inşaat kazısına, fırtınadan bina içi tadilata kadar fiber hattın en sık kesilme sebepleri ve nasıl fark edilecekleri.',
    publishDate: '2026-06-02',
    updatedDate: '2026-06-02',
    readMins: 5,
    body: `
      <p>Fiber optik kablo, içinden geçen ışık sinyaliyle çalışır ve bakır kabloya göre çok daha incedir — bu da onu doğru korunmadığında hasara karşı hassas hale getirir. Gebze, Darıca, Çayırova ve çevresinde saha ekibimizin en sık karşılaştığı arıza nedenlerini derledik.</p>

      <h2>1. İnşaat ve kazı çalışmaları</h2>
      <p>Yol, altyapı ya da bina temeli çalışmalarında toprak altındaki hava/yer hatları en sık kesilen kablolardır. Kazı makinesi operatörü fiber hattın yerini bilmediğinde saniyeler içinde hat tamamen kopabilir.</p>

      <h2>2. Kemirgen hasarı</h2>
      <p>Bina içi ve çatı arası hatlarda fare ve sıçanlar kablo kılıfını kemirebilir. Bu tür hasar genelde kısmi başlar (sinyalde dalgalanma) ve zamanla tam kopmaya ilerler.</p>

      <h2>3. Aşırı bükülme ve ezilme</h2>
      <p>Fiberin belirli bir "bükülme yarıçapı" (bend radius) vardır; bu sınırın altında keskin büküldüğünde veya mobilya/kapı altında sıkıştığında kırılgan cam öz kırılabilir. Kopma olmasa bile bu, <a href="/blog/dusuk-optik-sinyal-db-kaybi/">optik sinyal kaybına (dB kaybı)</a> yol açar.</p>

      <h2>4. Fırtına ve rüzgâr</h2>
      <p>Hava hattı ile gelen bağlantılarda dal düşmesi, direk sarsıntısı ya da gerginlik kayması hatları koparabilir. Bu konuyu <a href="/blog/firtina-sonrasi-hava-hatti-hasari/">ayrı bir yazıda</a> detaylandırdık.</p>

      <h2>5. Konnektör ve ek noktası yorgunluğu</h2>
      <p>Zamanla nem, sıcaklık değişimi veya titreşim konnektörlerin gevşemesine, füzyon ek noktalarının bozulmasına neden olabilir. Belirti genelde ani değil, kademeli sinyal düşüşüdür.</p>

      <h2>6. Tadilat ve iç mekân çalışmaları</h2>
      <p>Boya, alçıpan, priz/kablo kanalı işleri sırasında duvar içinden geçen fiber hat yanlışlıkla kesilebilir. Bu konuda <a href="/blog/tadilat-sirasinda-fiber-kablo-kesilmesi/">ne yapılması gerektiğini</a> yazdık.</p>

      <h2>7. Taşınma sırasında hattın yanlış sökülmesi</h2>
      <p>Ev/ofis taşınmasında ONT cihazı ile birlikte hattın da sökülmeye çalışılması hem konnektöre hem hatta zarar verebilir.</p>

      <h2>Belirtiler nelerdir?</h2>
      <ul>
        <li>İnternetin aniden tamamen kesilmesi</li>
        <li>Modem/ONT üzerinde kırmızı ya da sürekli yanıp sönen "LOS" ışığı</li>
        <li>Belirli saatlerde ya da hava koşullarına bağlı kopmalar</li>
        <li>Hız düşüşü, yüksek ping, sık kopan bağlantı</li>
      </ul>

      <p>Hangi neden olursa olsun, hattı kendiniz onarmaya çalışmak riskli ve genelde etkisizdir — füzyon ek için özel cihaz (splice makinesi) ve optik ölçüm gerekir.</p>
    `
  },
  {
    slug: 'dusuk-optik-sinyal-db-kaybi',
    tag: 'Teknik Bilgi',
    title: 'Düşük Optik Sinyal (dB Kaybı) Nedir, Nasıl Anlaşılır?',
    description: 'Fiber internette dB kaybı (optik sinyal zayıflığı) nedir, ONT ekranında nasıl görünür, hangi seviyeler normal kabul edilir? Teknik ama sade bir anlatım.',
    excerpt: 'İnternet "bazen" kesiliyorsa suçlu genelde tam kopukluk değil, kademeli sinyal kaybıdır. dB seviyelerini ve ölçüm mantığını anlatıyoruz.',
    publishDate: '2026-06-09',
    updatedDate: '2026-06-09',
    readMins: 6,
    body: `
      <p>Fiber optik hatlarda sinyal, ışık gücü olarak "dBm" (desibel-milliwatt) biriminde ölçülür ve negatif bir değerdir — sıfıra ne kadar yakınsa sinyal o kadar güçlüdür. Kablo uzadıkça, ek noktası arttıkça veya hasar oluştukça bu değer düşer (daha negatif olur), buna optik sinyal kaybı ya da "dB kaybı" denir.</p>

      <h2>Genel kabul gören dBm aralıkları</h2>
      <ul>
        <li><strong>-8 ile -20 dBm arası:</strong> Genelde sağlıklı kabul edilir (operatöre göre değişir).</li>
        <li><strong>-21 ile -25 dBm arası:</strong> Sınırda; bağlantı çalışabilir ama kopmalara açıktır.</li>
        <li><strong>-26 dBm ve altı:</strong> Zayıf sinyal; modem senkron sorunu, sık kopma, hız düşüşü beklenir.</li>
      </ul>
      <p>Bu eşikler operatörden operatöre ve ONT modeline göre birkaç dB farklılık gösterebilir; kesin referans için kendi cihazınızın kullanıcı arayüzüne bakmak en doğrusudur.</p>

      <h2>dB kaybına ne sebep olur?</h2>
      <ol>
        <li>Hat üzerinde fazla sayıda füzyon ek veya konnektör</li>
        <li>Aşırı bükülmüş, ezilmiş veya sıkışmış kablo bölümleri</li>
        <li>Kirli veya hasarlı konnektör yüzeyleri (toz/nem)</li>
        <li>Uzun mesafe + zayıf kalite splitter/ayırıcı</li>
        <li>Eski, mikro çatlaklı kablo bölümleri</li>
      </ol>

      <h2>Nasıl fark edilir?</h2>
      <p>Çoğu ONT/modem cihazının web arayüzünde ya da ekranında "Rx Power", "Optical Power" veya "Sinyal Seviyesi" gibi bir alan bulunur. Bu değeri düzenli kontrol etmek, sorunu tam kopmadan önce yakalamayı sağlar.</p>

      <h2>Neden kendiniz düzeltemezsiniz?</h2>
      <p>dB kaybının kaynağını bulmak için hat boyunca optik güç ölçer (power meter) ve gerekirse OTDR cihazı ile noktasal ölçüm yapılır. Kaynak bulunduktan sonra ya <a href="/blog/fuzyon-ek-nedir/">füzyon ek</a> ile hat yenilenir ya da konnektör değiştirilir.</p>

      <div class="article-cta-placeholder"></div>

      <p>Modem ekranınızda sürekli düşük sinyal görüyorsanız, tam kopmayı beklemeden yerinde ölçüm talep etmeniz ileride daha büyük bir arızayı önler.</p>
    `
  },
  {
    slug: 'fuzyon-ek-nedir',
    tag: 'Teknik Bilgi',
    title: 'Füzyon Ek (Splice) Nedir, Neden Gereklidir?',
    description: 'Füzyon ek (fusion splice) nedir, fiber kablo onarımında neden konnektörden daha güvenilirdir? Süreç adım adım nasıl işler?',
    excerpt: 'Kopan bir fiber hattı yeniden "ışık taşır" hale getirmenin endüstri standardı yöntemi: füzyon ek. Süreci ve neden önemli olduğunu anlatıyoruz.',
    publishDate: '2026-06-16',
    updatedDate: '2026-06-16',
    readMins: 5,
    body: `
      <p>Fiber optik kablo koptuğunda, iki ucu basitçe "birbirine bağlamak" mümkün değildir — ışığın kesintisiz devam edebilmesi için iki cam öz (core) mikron hassasiyetinde hizalanıp eritilerek birleştirilmelidir. Bu işleme <strong>füzyon ek (fusion splice)</strong> denir.</p>

      <h2>Füzyon ek süreci nasıl işler?</h2>
      <ol>
        <li><strong>Sıyırma:</strong> Kablonun dış kılıfı ve koruyucu tabakalar belirli bir uzunlukta sıyrılır.</li>
        <li><strong>Temizlik ve kesim:</strong> Cam öz izopropil alkolle temizlenir, hassas bir kesici (cleaver) ile mikron hassasiyetinde düz kesilir.</li>
        <li><strong>Hizalama:</strong> Füzyon splice makinesi, iki ucu kameralarla otomatik olarak mikron seviyesinde hizalar.</li>
        <li><strong>Kaynak (fusion):</strong> Elektrik arkı ile iki uç anlık olarak eritilip kalıcı şekilde birleştirilir.</li>
        <li><strong>Koruma:</strong> Ek noktası bir ısı büzüşmeli koruyucu (splice protector) ile mekanik olarak korunur.</li>
        <li><strong>Ölçüm:</strong> Optik güç ölçer ile ek noktasının sinyal kaybı (genelde 0.1 dB altı hedeflenir) doğrulanır.</li>
      </ol>

      <h2>Neden konnektör değil, füzyon ek?</h2>
      <p>Mekanik konnektörler hızlı çözüm olsa da zamanla gevşer, kirlenir ve daha yüksek <a href="/blog/dusuk-optik-sinyal-db-kaybi/">sinyal kaybına</a> yol açar. Füzyon ek ise kalıcıdır, kayıp çok düşüktür ve doğru yapıldığında hattın orijinal performansına en yakın sonucu verir — bu yüzden operatörler ve saha teknisyenleri kalıcı onarımlarda füzyon eki tercih eder.</p>

      <h2>Ne zaman gereklidir?</h2>
      <ul>
        <li>Kablo tamamen koptuğunda (kazı, kemirgen, ezilme)</li>
        <li>Hasarlı bir bölümün kesilip çıkarılması gerektiğinde</li>
        <li>Hat uzatma veya yeni bir dağıtım noktasına bağlanma durumunda</li>
        <li>Konnektör onarımının yetersiz kaldığı yüksek dB kaybı vakalarında</li>
      </ul>

      <p>Doğru ekipman (splice makinesi, cleaver, power meter) ve deneyim olmadan yapılan bir füzyon ek, hizalama hatası ya da kirli temas nedeniyle yüksek kayıpla sonuçlanabilir — bu yüzden bu işlem saha tecrübesi gerektiren teknik bir müdahaledir.</p>
    `
  },
  {
    slug: 'modem-ont-isik-rehberi',
    tag: 'Kullanıcı Rehberi',
    title: 'Modem ve ONT Işıkları Ne Anlama Gelir? (LOS, PON, LAN Rehberi)',
    description: 'ONT ve modem cihazınızdaki PON, LOS, LAN, PWR ışıkları ne anlama gelir? Kırmızı ışık yanınca ne yapmalısınız? Basit bir rehber.',
    excerpt: 'ONT cihazınızdaki ışıklar aslında bir "durum panosu" gibi çalışır. Hangi ışık ne anlatır, arıza olduğunda neyi işaret eder — sade bir rehber.',
    publishDate: '2026-06-23',
    updatedDate: '2026-06-23',
    readMins: 5,
    body: `
      <p>Fiber internette kullanılan ONT (Optical Network Terminal) cihazının üzerinde genelde 3-6 arası gösterge ışığı bulunur. Marka/operatöre göre isimlendirme değişse de mantık genelde aynıdır.</p>

      <h2>PWR (Power)</h2>
      <p>Cihazın elektriğe bağlı ve açık olduğunu gösterir. Yanmıyorsa önce adaptör ve prizi kontrol edin.</p>

      <h2>PON / LOS (Loss of Signal)</h2>
      <p>Bu, fiber hattın kendisiyle ilgili en kritik ışıktır. Yeşil/sabit ise optik sinyal sağlıklı geliyor demektir. <strong>Kırmızı yanıyor veya sürekli yanıp sönüyorsa</strong>, ONT hiç optik sinyal almıyor — yani hat kesilmiş, aşırı zayıflamış ya da santral/dağıtım tarafında bir sorun var demektir. Bu durum genelde saha müdahalesi gerektirir.</p>

      <h2>LAN / Ethernet</h2>
      <p>ONT ile modem/router arasındaki (ya da ONT'nin kendi LAN portlarındaki) kablo bağlantısını gösterir. Sönükse kablo, port veya karşı cihazla ilgili bir sorun olabilir — fiber hattan bağımsızdır.</p>

      <h2>WLAN / Wi-Fi</h2>
      <p>Kablosuz yayının aktif olup olmadığını gösterir; fiber hattın durumuyla ilgisi yoktur.</p>

      <h2>Hızlı teşhis tablosu</h2>
      <ul>
        <li><strong>PWR sönük:</strong> Elektrik/adaptör sorunu.</li>
        <li><strong>PON/LOS kırmızı:</strong> Optik sinyal yok — <a href="/blog/fiber-internet-neden-kopar/">hat kesilmiş veya çok zayıflamış olabilir</a>.</li>
        <li><strong>PON yeşil ama internet yok:</strong> Muhtemelen operatör/hesap veya router yapılandırma sorunu, fiber hat sağlıklı.</li>
        <li><strong>PON zaman zaman kırmızıya dönüyor:</strong> Kademeli <a href="/blog/dusuk-optik-sinyal-db-kaybi/">sinyal kaybı</a> ihtimali — tam kopmadan önce kontrol ettirin.</li>
      </ul>

      <p>PON/LOS ışığı kırmızıysa ya da düzensiz yanıp sönüyorsa, bu genelde evinizin dışındaki hat veya dağıtım noktasıyla ilgili bir sorundur ve yerinde ölçüm gerektirir.</p>
    `
  },
  {
    slug: 'bina-ici-fiber-ariza',
    tag: 'Bina İçi Arıza',
    title: 'Apartmanlarda Bina İçi Fiber Hat Arızaları: Sık Yaşanan 6 Sorun',
    description: 'Apartman ve sitelerde bina içi fiber hat arızaları neden sık yaşanır? Kat dağıtım kutusu, dikey hat ve ortak alan sorunlarını anlatıyoruz.',
    excerpt: 'Çok katlı binalarda fiber hat, bodrumdaki dağıtım kutusundan dairenize kadar birçok noktadan geçer — her biri potansiyel bir arıza kaynağıdır.',
    publishDate: '2026-06-30',
    updatedDate: '2026-06-30',
    readMins: 5,
    body: `
      <p>Gebze ve çevresindeki apartman ve sitelerde en sık aldığımız çağrılardan biri "sokakta herkes çalışıyor ama bende yok" ya da "bizim blokta sürekli kopuyor" şeklinde. Bunun nedeni genelde bina dışı hat değil, <strong>bina içi dağıtımdır</strong>.</p>

      <h2>1. Bodrum/kat dağıtım kutusu (ODF) sorunları</h2>
      <p>Binaya giren ana fiber, genelde bodrumda bir dağıtım kutusunda (ODF) her daireye ayrılır. Bu kutudaki gevşek konnektör, nem veya toz birikimi tüm bloğu ya da tek bir daireyi etkileyebilir.</p>

      <h2>2. Dikey/şaft hattı hasarları</h2>
      <p>Kat aralarında dikey olarak giden hat, elektrik/su tesisatı çalışmaları sırasında yanlışlıkla zedelenebilir. Bu genelde belirli bir kattan itibaren tüm dairelerin etkilenmesiyle fark edilir.</p>

      <h2>3. Daire girişindeki aşırı bükülme</h2>
      <p>Fiber, daireye girerken sıkça kapı pervazı altından ya da keskin köşelerden geçirilir. Zamanla bu bükülme <a href="/blog/dusuk-optik-sinyal-db-kaybi/">sinyal kaybına</a> yol açar.</p>

      <h2>4. Ortak alan tadilatları</h2>
      <p>Merdiven boşluğu boyaması, kapı/asansör değişimi gibi çalışmalarda hat genelde geçici olarak sökülüp yanlış şekilde geri takılabilir.</p>

      <h2>5. Splitter (ayırıcı) doygunluğu</h2>
      <p>Bazı binalarda tek bir splitter'a kapasitesinden fazla daire bağlanmış olabilir; bu, herkeste hafif ama kalıcı bir sinyal zayıflığına neden olur.</p>

      <h2>6. Kemirgen ve nem</h2>
      <p>Bodrum ve çatı arası gibi alanlarda nem ve kemirgen hasarı, bina içi hatlarda dış hatlara göre daha sık görülür.</p>

      <h2>Bina yönetimine ne önerilir?</h2>
      <ul>
        <li>Ana dağıtım kutusunun kilitli ve nem/tozdan korunaklı olması</li>
        <li>Ortak alan tadilatlarında hat güzergâhının işaretlenmesi</li>
        <li>Tekrarlayan arızalarda tüm bloğun optik ölçümünün tek seferde yaptırılması</li>
      </ul>

      <p>Bina içi arızalar genelde tek bir daireyi değil birden fazla komşuyu etkilediği için, yönetim üzerinden toplu randevu almak hem daha hızlı hem daha ekonomik olur.</p>
    `
  },
  {
    slug: 'internet-kesildiginde-ilk-yapilmasi-gerekenler',
    tag: 'Kullanıcı Rehberi',
    title: 'Fiber İnternet Kesildiğinde İlk Yapılması Gerekenler: 8 Adımlık Kontrol Listesi',
    description: 'Fiber internetiniz aniden kesildiğinde teknisyeni aramadan önce deneyebileceğiniz 8 basit kontrol adımı.',
    excerpt: 'Her kesinti bir arıza değildir — bazen basit bir yeniden başlatma yeterli olur. İşte teknisyeni aramadan önce deneyebileceğiniz adımlar.',
    publishDate: '2026-07-07',
    updatedDate: '2026-07-07',
    readMins: 4,
    body: `
      <p>İnternetiniz aniden kesildiğinde panik yapmadan önce birkaç basit kontrolle sorunun kaynağını daraltabilirsiniz. İşte adım adım kontrol listesi:</p>

      <h2>1. ONT/modem üzerindeki ışıkları kontrol edin</h2>
      <p><a href="/blog/modem-ont-isik-rehberi/">PON/LOS ışığının rengine</a> bakın. Kırmızıysa sorun optik hatta, yeşilse muhtemelen router/hesap tarafındadır.</p>

      <h2>2. Tüm kabloları kontrol edin</h2>
      <p>ONT'ye giren fiber kablonun aşırı bükülmediğinden, güç adaptörünün tam takılı olduğundan emin olun.</p>

      <h2>3. Cihazı yeniden başlatın</h2>
      <p>ONT ve router'ı fişten çekip 30 saniye bekleyip tekrar takın. Küçük yazılım/senkron sorunlarının büyük kısmı bununla çözülür.</p>

      <h2>4. Başka bir cihazla test edin</h2>
      <p>Sorunun tek bir cihazda mı yoksa tüm evde mi olduğunu anlamak için telefonu Wi-Fi'a bağlayıp test edin.</p>

      <h2>5. Komşularınıza sorun</h2>
      <p>Aynı binadan/sokaktan komşularınızda da kesinti varsa, sorun muhtemelen <a href="/blog/bina-ici-fiber-ariza/">bina içi dağıtım</a> ya da bölgesel bir hattır — bireysel değil.</p>

      <h2>6. Hava durumunu göz önünde bulundurun</h2>
      <p>Son saatlerde şiddetli rüzgâr/fırtına yaşandıysa, kesintinin nedeni <a href="/blog/firtina-sonrasi-hava-hatti-hasari/">hava hattı hasarı</a> olabilir.</p>

      <h2>7. Yakın zamanda tadilat/kazı oldu mu?</h2>
      <p>Evde tadilat, bina dışında kazı ya da bahçe çalışması yapıldıysa hat kesilmiş olabilir.</p>

      <h2>8. Hâlâ çözülmediyse, hattı ölçtürün</h2>
      <p>Yukarıdaki adımlar sonuç vermediyse sorun büyük olasılıkla fiziksel bir hat arızasıdır ve yerinde optik ölçüm gerekir.</p>

      <p>Bu noktada bize telefon veya WhatsApp üzerinden ulaşabilir, mümkünse ONT ışıklarının fotoğrafını göndererek teşhis sürecini hızlandırabilirsiniz.</p>
    `
  },
  {
    slug: 'tasinmada-fiber-hatti-tasima',
    tag: 'Kullanıcı Rehberi',
    title: 'Taşınırken Fiber İnternet Hattı Nasıl Taşınır/Yeniden Bağlanır?',
    description: 'Ev veya ofis taşınırken fiber internet hattı nasıl güvenle taşınır, yeni adreste bağlantı nasıl kurulur? Dikkat edilmesi gerekenler.',
    excerpt: 'Fiber hat, bakır telefon hattı gibi kolayca söküp takılan bir kablo değildir. Taşınmadan önce bilmeniz gerekenler.',
    publishDate: '2026-07-14',
    updatedDate: '2026-07-14',
    readMins: 4,
    body: `
      <p>Taşınma sürecinde birçok kişi ONT cihazını sökerken fiber kabloyu da beraberinde çekmeye çalışır — bu, hem konnektöre hem hatta zarar verebilir. İşte doğru yaklaşım.</p>

      <h2>ONT cihazı sizindir, fiber hat değildir</h2>
      <p>Genellikle ONT/modem cihazı size aittir veya operatöre iade edilir, ancak binaya döşenmiş fiber hat altyapıya aittir ve yeni adrese "taşınamaz". Yeni adreste ya mevcut bir fiber altyapı olmalı ya da yeni bir hat çekimi gerekir.</p>

      <h2>Taşınmadan önce yapılacaklar</h2>
      <ul>
        <li>Yeni adreste fiber altyapısının olup olmadığını operatörünüzden teyit edin</li>
        <li>Mevcut hattın iptal/nakil sürecini önceden başlatın</li>
        <li>ONT cihazını sökerken fiber konnektörünü zorlamadan, kilit mekanizmasını (varsa) serbest bırakarak çıkarın</li>
      </ul>

      <h2>Yeni adreste karşılaşılabilecek sorunlar</h2>
      <ul>
        <li>Bina içi dağıtımın eski/yetersiz olması</li>
        <li>Yeni hat çekiminde geçici olarak <a href="/blog/dusuk-optik-sinyal-db-kaybi/">yüksek dB kaybı</a> ile karşılaşılması</li>
        <li>ONT'nin eski adres profiliyle senkron olmaması</li>
      </ul>

      <h2>Eski adreste hat sorunlu bırakılırsa</h2>
      <p>Bazı taşınmalarda hat yanlışlıkla koparılır veya konnektör hasar görür; bu durumda sonraki kullanıcı için sorun oluşturmaması adına <a href="/blog/fuzyon-ek-nedir/">füzyon ek ile kalıcı onarım</a> önerilir.</p>

      <p>Taşınma sırasında ONT'yi kendiniz sökmek yerine, hem eski hem yeni adreste hattın sağlıklı bırakıldığından/kurulduğundan emin olmak için yerinde kontrol talep etmeniz, ileride yaşanacak "neden internetim yok" sürprizlerini önler.</p>
    `
  },
  {
    slug: 'firtina-sonrasi-hava-hatti-hasari',
    tag: 'Arıza Nedenleri',
    title: 'Fırtına ve Rüzgâr Sonrası Hava Hattı Fiber Hasarları Nasıl Onarılır?',
    description: 'Şiddetli rüzgâr, fırtına veya dal düşmesi sonrası hava hattı fiber kablo hasarları nasıl oluşur, onarım süreci nasıl işler?',
    excerpt: 'Hava koşulları hava hattı ile gelen fiber bağlantılarda mevsimsel bir arıza kaynağıdır. Belirtileri ve onarım sürecini anlatıyoruz.',
    publishDate: '2026-07-14',
    updatedDate: '2026-07-14',
    readMins: 4,
    body: `
      <p>Bina dışından direk veya cephe üzerinden gelen hava hattı fiber bağlantılar, yeraltı hatlara göre hava koşullarına karşı daha savunmasızdır. Özellikle sonbahar-kış aylarında rüzgâr ve fırtına sonrası arıza çağrılarında belirgin bir artış görürüz.</p>

      <h2>Hasar nasıl oluşur?</h2>
      <ul>
        <li><strong>Dal/ağaç düşmesi:</strong> Hat üzerine düşen dal, kabloyu anında koparabilir.</li>
        <li><strong>Aşırı gerginlik:</strong> Güçlü rüzgârda hat salınımı, zamanla konnektör veya ek noktalarında gevşemeye yol açar.</li>
        <li><strong>Direk/askı sarsıntısı:</strong> Hattın bağlı olduğu askı noktasının gevşemesi, kablonun sarkarak gerilmesine neden olur.</li>
        <li><strong>Nem girişi:</strong> Kılıfta mikro çatlak oluşan bölgelere yağmur suyu girmesi, zamanla sinyal kaybını artırır.</li>
      </ul>

      <h2>Belirtiler</h2>
      <p>Rüzgârlı/yağmurlu havalarda kesintinin artması, sakin havada ise bağlantının normale dönmesi tipik bir hava hattı hasarı belirtisidir. Bu, sabit bir kopukluktan çok <a href="/blog/dusuk-optik-sinyal-db-kaybi/">değişken sinyal kaybı</a> şeklinde kendini gösterir.</p>

      <h2>Onarım süreci</h2>
      <ol>
        <li>Hasarlı bölüm görsel olarak tespit edilir (dal teması, sarkma, görünür kesik)</li>
        <li>Gerekirse hattın gerginliği ve askı noktası yeniden düzenlenir</li>
        <li>Kopuk noktada <a href="/blog/fuzyon-ek-nedir/">füzyon ek</a> ile kalıcı onarım yapılır</li>
        <li>Onarım sonrası optik ölçüm ile sinyal seviyesi doğrulanır</li>
      </ol>

      <h2>Tekrarı önlemek için</h2>
      <p>Hat güzergâhındaki ağaç dallarının budanması, hattın gerginliğinin doğru ayarlanması ve askı noktalarının sağlamlaştırılması, aynı hasarın tekrar yaşanma riskini belirgin şekilde azaltır.</p>

      <p>Şiddetli hava koşulları sonrası bağlantınızda düzensizlik fark ederseniz, hasar büyümeden yerinde kontrol talep etmenizi öneririz.</p>
    `
  },
  {
    slug: 'tadilat-sirasinda-fiber-kablo-kesilmesi',
    tag: 'Bina İçi Arıza',
    title: 'Tadilat/İnşaat Sırasında Fiber Kablo Kesilirse Ne Yapmalı?',
    description: 'Ev tadilatı, boya, alçıpan veya inşaat çalışması sırasında fiber internet kablosu kesilirse ilk yapılması gerekenler ve onarım süreci.',
    excerpt: 'Duvar içinden geçen bir fiber hat, matkap ya da kazma darbesiyle saniyeler içinde kesilebilir. Panik yapmadan izlemeniz gereken adımlar.',
    publishDate: '2026-07-14',
    updatedDate: '2026-07-14',
    readMins: 4,
    body: `
      <p>Tadilat sırasında en sık yaşanan kazalardan biri, duvar içinden veya kablo kanalından geçen fiber hattın matkap, keski ya da kazma ile kesilmesidir. Bu durumda izlenecek adımlar sonucu doğrudan etkiler.</p>

      <h2>İlk yapılması gerekenler</h2>
      <ol>
        <li><strong>Çalışmayı durdurun:</strong> Aynı bölgede devam eden çalışma, hasarı büyütebilir.</li>
        <li><strong>Kesik noktayı koruyun:</strong> Kablo uçlarını bükmeden, üzerine ağırlık binmeyecek şekilde bırakın.</li>
        <li><strong>Kesik noktanın fotoğrafını çekin:</strong> Onarım ekibinin önceden hazırlık yapmasına yardımcı olur.</li>
        <li><strong>Kabloyu kendiniz eklemeye/bantlamaya çalışmayın:</strong> Fiber optik, bakır kablo gibi basitçe eklenemez — <a href="/blog/fuzyon-ek-nedir/">füzyon ek</a> gerektirir.</li>
      </ol>

      <h2>Neden kendiniz onaramazsınız?</h2>
      <p>Fiberin cam özü saç telinden incedir ve iki ucun ışığı kesintisiz iletebilmesi için mikron hassasiyetinde hizalanıp özel bir cihazla kaynaklanması gerekir. Bantlama veya mekanik konnektör gibi geçici çözümler ya çalışmaz ya da çok yüksek sinyal kaybıyla sonuçlanır.</p>

      <h2>Onarım ne kadar sürer?</h2>
      <p>Kesik noktaya erişim kolaysa (görünür duvar yüzeyi, açık kablo kanalı) onarım genelde yerinde tek seferde tamamlanır. Duvar içine gömülü hatlarda ek olarak kablo güzergâhının açığa çıkarılması gerekebilir.</p>

      <h2>Gelecekte bu riski azaltmak için</h2>
      <ul>
        <li>Tadilat öncesi mevcut kablo/hat güzergâhını mümkünse işaretleyin</li>
        <li>Duvar delme işlemlerinde kablo dedektörü kullanılmasını isteyin</li>
        <li>Fiber hattı, mümkünse gözle görülür bir kablo kanalından geçirin</li>
      </ul>

      <p>Tadilat sırasında hat kesilirse, hattı zorlamadan bırakıp doğrudan bize ulaşmanız hem onarım süresini kısaltır hem de ek hasarı önler.</p>
    `
  },
  {
    slug: 'fiber-vs-bakir-vdsl-karsilastirma',
    tag: 'Teknik Bilgi',
    title: 'Fiber ve Bakır (VDSL) İnternet Arızaları: Farklar ve Onarım Süreci',
    description: 'Fiber optik ve bakır (VDSL/ADSL) internet hatlarında arıza nedenleri ve onarım yöntemleri nasıl farklılaşır? Karşılaştırmalı anlatım.',
    excerpt: 'Aynı ev içinde bile fiber ve bakır hat arızaları çok farklı nedenlerden ve farklı yöntemlerle çözülür. Farkları anlamak doğru beklenti oluşturur.',
    publishDate: '2026-07-14',
    updatedDate: '2026-07-14',
    readMins: 5,
    body: `
      <p>Birçok kullanıcı "internetim yok" dediğinde altta yatan teknoloji fiber mi yoksa bakır (VDSL/ADSL) mi olduğuna göre arızanın nedeni ve onarım yöntemi tamamen farklıdır. İşte temel farklar.</p>

      <h2>Sinyal iletim şekli</h2>
      <p>Fiber optik, veriyi ışık darbeleri olarak cam öz içinden iletir; elektromanyetik girişimden etkilenmez. Bakır hat ise elektrik sinyali taşır ve mesafe arttıkça, hat kalitesi düştükçe sinyal hızla zayıflar.</p>

      <h2>Arıza nedenleri nasıl farklılaşır?</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 1.3rem;font-size:0.95rem;">
        <thead>
          <tr style="text-align:left;border-bottom:1px solid rgba(237,234,246,0.15);">
            <th style="padding:0.5rem 0.6rem 0.5rem 0;">Neden</th>
            <th style="padding:0.5rem 0.6rem;">Fiber</th>
            <th style="padding:0.5rem 0 0.5rem 0.6rem;">Bakır (VDSL)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid rgba(237,234,246,0.08);">
            <td style="padding:0.5rem 0.6rem 0.5rem 0;">Mesafeye duyarlılık</td>
            <td style="padding:0.5rem 0.6rem;">Çok düşük</td>
            <td style="padding:0.5rem 0 0.5rem 0.6rem;">Yüksek — santrale uzaklık hızı doğrudan etkiler</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(237,234,246,0.08);">
            <td style="padding:0.5rem 0.6rem 0.5rem 0;">Nem/elektriksel girişim</td>
            <td style="padding:0.5rem 0.6rem;">Etkilenmez</td>
            <td style="padding:0.5rem 0 0.5rem 0.6rem;">Sinyal gürültüsüne (crosstalk) yol açar</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(237,234,246,0.08);">
            <td style="padding:0.5rem 0.6rem 0.5rem 0;">Fiziksel kopma</td>
            <td style="padding:0.5rem 0.6rem;">Tam kesinti (füzyon ek gerekir)</td>
            <td style="padding:0.5rem 0 0.5rem 0.6rem;">Genelde kademeli hız düşüşü</td>
          </tr>
          <tr>
            <td style="padding:0.5rem 0.6rem 0.5rem 0;">Onarım yöntemi</td>
            <td style="padding:0.5rem 0.6rem;">Füzyon ek / konnektör yenileme</td>
            <td style="padding:0.5rem 0 0.5rem 0.6rem;">Ek kutusu/jonksiyon temizliği, kablo değişimi</td>
          </tr>
        </tbody>
      </table>

      <h2>Hangi belirtiler hangi teknolojiye işaret eder?</h2>
      <ul>
        <li><strong>Ani ve tam kopukluk + <a href="/blog/modem-ont-isik-rehberi/">kırmızı PON/LOS ışığı</a>:</strong> Fiber hat kesintisi olasılığı yüksek.</li>
        <li><strong>Yağmurlu havada hız düşüşü, kademeli yavaşlama:</strong> Bakır hatta nem kaynaklı sinyal kaybı olasılığı yüksek.</li>
        <li><strong>Belirli saatlerde yavaşlama (yoğunluk):</strong> Genelde altyapıdan çok kapasite ile ilgilidir, her iki teknolojide de görülebilir.</li>
      </ul>

      <h2>Onarım süresi farkı</h2>
      <p>Fiber onarımı özel ekipman (füzyon makinesi) gerektirdiği için görece daha teknik ama sonuç genelde kalıcıdır. Bakır hat onarımı ekipman açısından daha basittir ancak hattın yaşı ve mesafesi nedeniyle sorun zamanla tekrar edebilir.</p>

      <p>Hangi teknolojiyi kullandığınızdan emin değilseniz, ONT/modem üzerindeki ışıkları ve model bilgisini bize iletmeniz doğru teşhis için yeterli olur.</p>
    `
  }
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDateTR(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const NAV = `
    <a class="brand" href="/" aria-label="Gebze Fiber Tamir, ana sayfa">
      <svg class="brand-mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
        <path d="M2 22 C 10 6, 18 28, 30 10" fill="none" stroke="url(#markGrad)" stroke-width="2.4" stroke-linecap="round"/>
        <circle class="brand-pulse" cx="21" cy="21.4" r="3" fill="#ffb25e"/>
        <defs>
          <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#6bf0c2"/>
            <stop offset="1" stop-color="#9d8cff"/>
          </linearGradient>
        </defs>
      </svg>
      <span class="brand-name">Gebze <em>Fiber</em> Tamir</span>
    </a>
    <nav class="site-nav" aria-label="Ana menü">
      <a href="/#hizmetler">Hizmetler</a>
      <a href="/#surec">Süreç</a>
      <a href="/#bolge">Bölge</a>
      <a href="/#iletisim">İletişim</a>
      <a href="/blog/" aria-current="page">Blog</a>
      <a href="/admin/login">Admin</a>
    </nav>
    <a class="btn btn-header" href="tel:+905301380041" aria-label="Telefonla ara: 0530 138 00 41">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2z"/></svg>
      <span>0530 138 00 41</span>
    </a>`;

const FOOTER = `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="brand-name">Gebze <em>Fiber</em> Tamir</span>
        <p>Fiber optik kablo tamiri ve arıza servisi.</p>
      </div>
      <div class="footer-contact">
        <a href="tel:+905301380041">+90 530 138 00 41</a>
        <a href="https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F">WhatsApp</a>
      </div>
      <nav class="footer-links" aria-label="Alt menü">
        <a href="/#hizmetler">Hizmetler</a>
        <a href="/#bolge">Bölge</a>
        <a href="/blog/">Blog</a>
        <a href="/admin/login">Admin</a>
      </nav>
      <p class="footer-area">Gebze · Darıca · Çayırova · Dilovası · Körfez · İzmit · Pendik – Tuzla</p>
      <p class="footer-fine"><span id="year">2026</span> Gebze Fiber Tamir</p>
    </div>
  </footer>

  <nav class="cta-bar" aria-label="Hızlı iletişim">
    <a class="cta-bar-call" href="tel:+905301380041">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2z"/></svg>
      Ara
    </a>
    <a class="cta-bar-wa" href="https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      WhatsApp
    </a>
  </nav>

  <script src="/js/analytics.js"></script>
  <script src="/js/vendor/gsap-bundle.min.js"></script>
  <script src="/js/main.js"></script>`;

function headBlock({ title, description, canonical, jsonLd }) {
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#0a0714">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="tr_TR">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icons/favicon-16x16.png" sizes="16x16" type="image/png">
  <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/blog.css">
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>`;
}

function renderPost(post, related) {
  const url = `${SITE}/blog/${post.slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishDate,
        dateModified: post.updatedDate,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: OG_IMAGE,
        inLanguage: 'tr-TR',
        author: { '@type': 'Organization', name: 'Gebze Fiber Tamir', url: SITE },
        publisher: {
          '@type': 'Organization',
          name: 'Gebze Fiber Tamir',
          logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url }
        ]
      }
    ]
  };

  const relatedHtml = related.map((r) => `
        <a href="/blog/${r.slug}/">${esc(r.title)}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
${headBlock({ title: `${post.title} | Gebze Fiber Tamir Blog`, description: post.description, canonical: url, jsonLd })}
</head>
<body>
  <div class="grain" aria-hidden="true"></div>

  <header class="site-header" id="ust">${NAV}
  </header>

  <main>
    <article class="article-shell">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Ana Sayfa</a>
        <span>/</span>
        <a href="/blog/">Blog</a>
        <span>/</span>
        <span aria-current="page">${esc(post.title)}</span>
      </nav>

      <p class="eyebrow article-eyebrow">${esc(post.tag)}</p>
      <h1>${esc(post.title)}</h1>
      <div class="article-meta">
        <span>${fmtDateTR(post.publishDate)}</span>
        <span>·</span>
        <span>${post.readMins} dk okuma</span>
      </div>

      <div class="article-body">
        ${post.body.replace('<div class="article-cta-placeholder"></div>', articleCta())}
      </div>

      ${post.body.includes('article-cta-placeholder') ? '' : articleCta()}

      <div class="related">
        <h2>İlgili Yazılar</h2>
        <div class="related-grid">${relatedHtml}
        </div>
      </div>
    </article>
  </main>
${FOOTER}
</body>
</html>
`;
}

function articleCta() {
  return `
      <div class="article-cta">
        <p>Fiber hattınızla ilgili benzer bir sorun mu yaşıyorsunuz? Gebze ve çevresinde yerinde ölçüm ve onarım için ulaşın.</p>
        <div class="btns">
          <a class="btn btn-primary" href="tel:+905301380041">Ara</a>
          <a class="btn btn-ghost" href="https://wa.me/905301380041?text=Merhaba%2C%20fiber%20internet%20ar%C4%B1zam%20var%2C%20yard%C4%B1mc%C4%B1%20olabilir%20misiniz%3F">WhatsApp</a>
        </div>
      </div>`;
}

function renderIndex() {
  const url = `${SITE}/blog/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gebze Fiber Tamir Blog',
    description: 'Fiber optik kablo arızaları, onarım süreçleri ve internet sorun giderme rehberleri.',
    url,
    inLanguage: 'tr-TR',
    hasPart: POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}/`,
      datePublished: p.publishDate
    }))
  };

  const cards = POSTS.map((p) => `
        <a class="blog-card" href="/blog/${p.slug}/">
          <span class="blog-tag">${esc(p.tag)}</span>
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.excerpt)}</p>
          <span class="blog-meta"><span>${fmtDateTR(p.publishDate)}</span><span>·</span><span>${p.readMins} dk</span></span>
        </a>`).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
${headBlock({
  title: 'Blog — Fiber Optik Arıza ve Onarım Rehberi | Gebze Fiber Tamir',
  description: 'Fiber optik kablo arızaları, dB kaybı, füzyon ek, ONT ışıkları ve bina içi hat sorunları hakkında pratik rehberler ve teknik yazılar.',
  canonical: url,
  jsonLd
})}
</head>
<body>
  <div class="grain" aria-hidden="true"></div>

  <header class="site-header" id="ust">${NAV}
  </header>

  <main>
    <section class="blog-hero">
      <p class="eyebrow">Blog</p>
      <h1>Fiber arıza ve onarım rehberi</h1>
      <p>Fiber optik kablo arızaları, sinyal kaybı, füzyon ek ve bina içi hat sorunları hakkında sahadaki tecrübemizden pratik yazılar.</p>
    </section>
    <section class="blog-list">
      <div class="blog-grid">${cards}
      </div>
    </section>
  </main>
${FOOTER}
</body>
</html>
`;
}

// -- Write files --
mkdirSync(join(ROOT, 'blog'), { recursive: true });
writeFileSync(join(ROOT, 'blog', 'index.html'), renderIndex());

POSTS.forEach((post, i) => {
  const dir = join(ROOT, 'blog', post.slug);
  mkdirSync(dir, { recursive: true });
  const related = POSTS.filter((_, j) => j !== i).slice(0, 3).length === 3
    ? [POSTS[(i + 1) % POSTS.length], POSTS[(i + 2) % POSTS.length], POSTS[(i + 3) % POSTS.length]]
    : POSTS.filter((_, j) => j !== i);
  writeFileSync(join(dir, 'index.html'), renderPost(post, related));
});

console.log(`Generated blog/index.html + ${POSTS.length} post pages.`);

// -- Update sitemap.xml with blog URLs --
const sitemapPath = join(ROOT, 'sitemap.xml');
const urls = [
  { loc: `${SITE}/`, changefreq: 'monthly', priority: '1.0' },
  { loc: `${SITE}/blog/`, changefreq: 'weekly', priority: '0.8' },
  ...POSTS.map((p) => ({ loc: `${SITE}/blog/${p.slug}/`, changefreq: 'monthly', priority: '0.6', lastmod: p.updatedDate }))
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(sitemapPath, sitemapXml);
console.log('Updated sitemap.xml');
