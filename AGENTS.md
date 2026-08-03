# AGENTS.md

Bu dosya, bu deponun tamamında çalışan insanlara ve otomasyon ajanlarına yönelik kuralları tanımlar.

## Proje bağlamı

- Ürün, Claude benzeri bir AI çalışma alanıdır.
- Ana dil TypeScript; frontend Next.js, backend Fastify ve veritabanı PostgreSQL olacaktır.
- Production dağıtımı Docker Compose ile yapılacaktır.
- AI modellerine yalnızca harici API'ler üzerinden erişilecektir; model ağırlıkları bu sistemde barındırılmayacaktır.
- Laravel kullanılmayacaktır.
- OpenCode tabanlı kod ajanı, çekirdek ürün doğrulandıktan sonraki ayrı bir aşamadır.

## Çalışmaya başlamadan önce

1. `README.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md` ve `docs/ROADMAP.md` dosyalarını okuyun.
2. Çalışmanın mevcut yol haritasındaki aşama ve kapsamla uyumunu doğrulayın.
3. Değiştirilecek dizinlerde daha özel bir `AGENTS.md` olup olmadığını kontrol edin; daha derindeki talimatlar önceliklidir.
4. Belirsiz ürün veya güvenlik kararlarını varsayım olarak koda gömmek yerine belgeleyin.

## Geliştirme ilkeleri

- TypeScript için strict mode kullanılmalı; gerekçesiz `any`, görmezden gelinen hata ve doğrulanmamış type assertion eklenmemelidir.
- Web ve API bağımsız uygulamalar olarak tutulmalı; ortak sözleşmeler açık ve sürümlenebilir olmalıdır.
- HTTP girdileri, ortam değişkenleri, webhook'lar ve AI sağlayıcı cevapları çalışma zamanında doğrulanmalıdır.
- İş mantığı framework handler'larına gömülmemeli; test edilebilir servis ve domain sınırlarında tutulmalıdır.
- Veritabanı değişiklikleri migration ile yapılmalı ve mümkün olduğunda geriye dönük uyumlu olmalıdır.
- Sağlayıcıya özgü AI ayrıntıları adapter katmanının dışına sızmamalıdır.
- Yeni bağımlılık eklerken bakım durumu, lisans, güvenlik ve bundle/runtime maliyeti değerlendirilmelidir.
- Kaynak koduna secret, token, gerçek kullanıcı verisi veya üretim bağlantı bilgisi eklenmemelidir.

## Ürün ve güvenlik kuralları

- Yetkilendirme, yalnızca arayüzde değil her API ve veri erişimi sınırında uygulanmalıdır.
- Kullanım limiti kontrolleri yarış koşullarına dayanıklı ve sunucu tarafında olmalıdır.
- Dosyalar güvenilmeyen girdi kabul edilmeli; tür/boyut doğrulama, zararlı içerik taraması ve izole işleme tasarlanmalıdır.
- Artifact önizlemeleri ana uygulama origin'inden ayrılmalı ve sıkı sandbox/CSP ile çalıştırılmalıdır.
- Log'larda mesaj içeriği, dosya içeriği, sağlayıcı anahtarları veya ödeme verileri bulunmamalıdır.
- Hesap silme, veri saklama ve dışa aktarma davranışları uygulanırken ürün politikasına bağlanmalıdır.
- Kod ajanı hiçbir zaman uygulama/API container'ında ayrıcalıklı komut çalıştırmamalıdır.

## Test ve kalite beklentileri

- Her davranış değişikliği uygun seviyede otomatik test içermelidir.
- En azından lint, type-check ve ilgili testler çalıştırılmalı; çalıştırılamayan kontroller nedenleriyle raporlanmalıdır.
- Kimlik doğrulama, yetkilendirme, kota ve ödeme akışları için negatif senaryolar test edilmelidir.
- UI değişikliklerinde erişilebilirlik, dar/geniş ekran ve loading/error/empty durumları kontrol edilmelidir.
- Production yapılandırması değiştiğinde container sağlık kontrolleri, migration ve geri alma yolu doğrulanmalıdır.

## Dokümantasyon ve değişiklik disiplini

- Kapsam veya kullanıcı davranışı değişirse `docs/PRODUCT.md` güncellenmelidir.
- Servis sınırı, veri modeli, altyapı veya güvenlik kararı değişirse `docs/ARCHITECTURE.md` güncellenmelidir.
- Teslimat sırası veya kilometre taşı değişirse `docs/ROADMAP.md` güncellenmelidir.
- Commit'ler küçük, anlamlı ve tek amaçlı olmalıdır. Commit mesajı emir kipinde ve değişikliği açıklayıcı yazılmalıdır.
- Pull request açıklaması amaç, kapsam, testler, riskler ve varsa migration/geri alma notlarını içermelidir.

## Yapılmaması gerekenler

- Talep edilmeden mimari yığını değiştirmeyin veya ikinci bir backend framework'ü eklemeyin.
- API anahtarlarını istemciye göndermeyin.
- Kullanıcı tarafından sağlanan HTML/JavaScript'i ana uygulama bağlamında çalıştırmayın.
- Kota ve abonelik durumunu yalnızca istemci tarafındaki verilere göre belirlemeyin.
- OpenCode entegrasyonunu izolasyon, izin ve denetim tasarımı tamamlanmadan başlatmayın.
