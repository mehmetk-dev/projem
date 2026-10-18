import type { Metadata } from 'next';
import Link from 'next/link';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import { ogImageUrl } from '@/lib/site';

export const revalidate = 3600;

const description =
  'Mehmet Kerem web sitesinde işlenen kişisel veriler, amaçları, saklama süreleri ve KVKK kapsamındaki haklarınız hakkında bilgilendirme.';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Mehmet Kerem',
  description,
  openGraph: {
    title: 'Gizlilik Politikası | Mehmet Kerem',
    description,
    type: 'website',
    locale: 'tr_TR',
    images: [ogImageUrl('Gizlilik Politikası', description)],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gizlilik Politikası | Mehmet Kerem',
    description,
    images: [ogImageUrl('Gizlilik Politikası', description)],
  },
  alternates: {
    canonical: '/gizlilik',
  },
};

const CONTACT_EMAIL = 'mehmetkerem2109@gmail.com';

type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  after?: string[];
};

const sections: Section[] = [
  {
    id: 'veri-sorumlusu',
    title: 'Veri sorumlusu',
    paragraphs: [
      'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket eden Mehmet Kerem (İstanbul, Türkiye) tarafından, bu web sitesini ziyaret edenleri ve siteyi kullananları bilgilendirmek amacıyla hazırlanmıştır.',
      `Veri sorumlusuna ${CONTACT_EMAIL} adresinden ulaşabilirsiniz.`,
    ],
  },
  {
    id: 'islenen-veriler',
    title: 'İşlenen kişisel veriler ve amaçları',
    paragraphs: ['Sitede hangi hizmeti kullandığınıza bağlı olarak aşağıdaki veriler işlenir.'],
    items: [
      'İletişim formu: ad soyad, e-posta, telefon (isteğe bağlı) ve mesaj içeriği. Bilgiler veritabanına kaydedilir ve talebinizi yanıtlayabilmek için site sahibine e-posta ile bildirilir.',
      'Blog yorumları: ad, e-posta ve yorum metni. Yönetici onayından sonra yalnızca ad ve yorum yayınlanır; e-posta adresi yayınlanmaz.',
      'Ziyaretçi defteri: ad, e-posta ve mesaj. Onaydan sonra yalnızca ad ve mesaj yayınlanır.',
      'Bülten aboneliği: e-posta adresi ve IP adresi. Bülten göndermek ve aboneliği yönetmek için kullanılır.',
      'Hesap kaydı ve giriş: e-posta adresi ve şifre. Şifre düz metin olarak saklanmaz; yalnızca bcrypt ile hash\'lenmiş hâli tutulur.',
      'Güvenlik: kötüye kullanımı önlemek amacıyla IP adresine dayalı istek sınırlama (rate limit) uygulanır. Yönetim panelindeki işlemler için IP adresi içeren işlem kayıtları tutulur.',
      'Ziyaret istatistiği: hangi sayfanın ne zaman görüntülendiği ve siteye başka bir siteden gelindiyse o sitenin alan adı (ör. linkedin.com). IP adresi, tarayıcı bilgisi veya çerez kullanılmaz; bu kayıtlar tek başına kimseyi tanımlamaz ve yalnızca toplam ziyaret sayılarını görmek için kullanılır.',
    ],
  },
  {
    id: 'hukuki-sebepler',
    title: 'Hukuki sebepler',
    paragraphs: ['Kişisel verileriniz, KVKK m.5 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenir.'],
    items: [
      'Açık rıza: bülten aboneliği ve yorum ile ziyaretçi defteri gibi içeriklerin yayınlanması.',
      'Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması: hesap oluşturma ve giriş işlemleri ile iletişim formu üzerinden iletilen talebin değerlendirilmesi.',
      'Veri sorumlusunun meşru menfaati: sitenin güvenliğinin sağlanması, kötüye kullanımın önlenmesi, işlem kayıtlarının tutulması ve sitenin geliştirilmesi için toplu ziyaret istatistiklerinin izlenmesi; bu menfaatin ilgili kişinin temel hak ve özgürlüklerine zarar vermemesi şartıyla.',
      'Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması: ihtilaf hâlinde gerekli kayıtların muhafazası.',
    ],
  },
  {
    id: 'aktarim',
    title: 'Verilerin aktarılması',
    paragraphs: [
      'Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilere satılmaz veya pazarlama amacıyla paylaşılmaz. Sitenin işletilebilmesi için aşağıdaki hizmet sağlayıcılardan yararlanılır; bu sağlayıcıların sunucuları yurt dışında bulunabilir.',
    ],
    items: [
      'Veritabanı barındırma: Turso.',
      'Dosya depolama: Cloudflare R2.',
      'E-posta gönderimi: SMTP hizmet sağlayıcısı.',
      'Site barındırma: barındırma (hosting) sağlayıcısı.',
    ],
    after: [
      'Yurt dışına aktarım söz konusu olduğunda KVKK m.8 ve m.9 hükümlerine uygun hareket edilmesi hedeflenir. Yasal bir zorunluluk doğduğunda yetkili kamu kurum ve kuruluşlarıyla da paylaşım yapılabilir.',
    ],
  },
  {
    id: 'saklama-suresi',
    title: 'Saklama süresi',
    paragraphs: ['Verileriniz, işlenme amacının gerektirdiği makul süre boyunca saklanır. Genel yaklaşım şöyledir.'],
    items: [
      'İletişim mesajları: talebiniz sonuçlandıktan sonra makul bir süre.',
      'Yorum ve ziyaretçi defteri kayıtları: yayında kaldıkları süre boyunca veya silinmesini talep edene kadar.',
      'Bülten aboneliği: abonelikten ayrıldığınızda size bülten gönderilmez; tekrar gönderim yapılmaması için ayrılma kaydınız tutulur. Kaydın tamamen silinmesini e-posta ile talep edebilirsiniz.',
      'Hesap bilgileri: hesabınız silinene kadar.',
      'Güvenlik ve işlem kayıtları ile istek sınırlama verileri: güvenlik amacının gerektirdiği makul süre.',
      'Ziyaret istatistikleri: kimseyi tanımlamayan toplu kayıtlar olarak istatistik amacı sürdükçe.',
    ],
    after: ['Saklama süresi dolan veya amaç ortadan kalkan veriler silinir, yok edilir veya anonim hâle getirilir.'],
  },
  {
    id: 'cerezler',
    title: 'Çerezler ve yerel depolama',
    paragraphs: [
      'Sitede analitik veya reklam amaçlı çerez kullanılmaz; ziyaret istatistiği çerezsiz tutulur.',
      'Giriş yaptığınızda oturumunuzu sürdürmek için tek bir zorunlu çerez (JWT oturum çerezi) kullanılır. Bu çerez httpOnly olarak ayarlanır; yani tarayıcıdaki komut dosyalarınca okunamaz.',
      'Siteyi daha hızlı ve çevrimdışıyken de açabilmek için bazı sayfa ve dosyalar tarayıcınızın önbelleğinde (service worker) saklanabilir. Bu önbellek kişisel veri içermez, yalnızca cihazınızda kalır ve tarayıcı ayarlarınızdan silinebilir.',
      'Yönetim paneli kullanıcıları için seçilen tema (açık/koyu) tercihi tarayıcının localStorage alanında saklanır (next-themes). Bu bilgi kişisel veri içermez ve yalnızca cihazda kalır.',
    ],
  },
  {
    id: 'haklariniz',
    title: 'KVKK m.11 kapsamındaki haklarınız',
    paragraphs: ['KVKK m.11 uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz.'],
    items: [
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme,',
      'İşlenmişse buna ilişkin bilgi talep etme,',
      'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
      'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,',
      'Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,',
      'KVKK m.7 çerçevesinde verilerin silinmesini veya yok edilmesini isteme,',
      'Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
      'İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi sonucu aleyhinize bir sonuç doğmasına itiraz etme,',
      'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.',
    ],
  },
  {
    id: 'basvuru',
    title: 'Başvuru yöntemi',
    paragraphs: [
      'Haklarınıza ilişkin taleplerinizi, kimliğinizi ve talebinizi açıkça belirten bir e-posta ile iletebilirsiniz. Başvurular, talebin niteliğine göre en geç otuz gün içinde sonuçlandırılmaya çalışılır.',
    ],
  },
  {
    id: 'guncellemeler',
    title: 'Güncellemeler',
    paragraphs: [
      'Bu metin, sitedeki uygulamalar veya mevzuat değiştikçe güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır. Bu metin genel bilgilendirme amacı taşır ve hukuki danışmanlık niteliğinde değildir.',
    ],
  },
];

export default async function PrivacyPage() {
  const socialLinks = await getSocialLinks().catch(() => []);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Yasal</p>
          <h1 className="home-reveal mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink md:text-6xl">
            Gizlilik Politikası ve <span className="font-serif-display text-accent">KVKK</span> Aydınlatma Metni
          </h1>
          <p className="home-reveal mt-5 text-lg leading-relaxed text-ink-soft md:text-xl">{description}</p>
          <p className="home-reveal mt-4 text-[13px] text-ink-muted">
            Son güncelleme: <time dateTime="2026-10-18">18 Ekim 2026</time>
          </p>

          <nav
            aria-label="İçindekiler"
            className="home-reveal mt-10 rounded-2xl border border-line bg-surface p-5 md:p-6"
          >
            <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">İçindekiler</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-soft marker:text-accent">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="transition-colors hover:text-accent">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12 text-[17px] leading-[1.8] text-ink-soft md:text-lg">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">{section.title}</h2>
                {section.paragraphs?.map((text, i) => <p key={i}>{text}</p>)}
                {section.items && (
                  <ul className="list-disc space-y-2 pl-6 marker:text-accent">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.after?.map((text, i) => <p key={i}>{text}</p>)}
                {section.id === 'saklama-suresi' && (
                  <p>
                    Bülten aboneliğinizi{' '}
                    <Link href="/bulten/ayril" className="font-medium text-accent underline underline-offset-4">
                      abonelik ve ayrılma sayfasından
                    </Link>{' '}
                    yönetebilirsiniz.
                  </p>
                )}
                {section.id === 'basvuru' && (
                  <p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=KVKK%20Ba%C5%9Fvurusu`}
                      className="font-medium text-accent underline underline-offset-4"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
