# Sistem Mimarisi

## 1. Amaç ve durum

Bu belge hedef mimariyi ve temel teknik sınırları tanımlar. Monorepo, web, API, ortak sözleşmeler ve Docker Compose temeli uygulanmıştır; sonraki bölümlerdeki ürün servislerinin önemli bölümü hâlâ hedef durumdur. Tasarım, küçük bir ekibin hızlı ilerleyebilmesini sağlarken güvenlik, maliyet kontrolü ve ileride servis ayrıştırma ihtiyacını gözetir.

## 2. Mimari hedefler

- Akışlı AI yanıtlarında güvenilir ve gözlemlenebilir kullanıcı deneyimi
- Kullanıcılar ve projeler arasında kesin veri izolasyonu
- AI ve ödeme sağlayıcılarını değiştirilebilir adapter'lar arkasında tutma
- Kota ve maliyetin istek bazında ölçülmesi
- Dosya ve aktif artifact içeriğinin güvenli biçimde işlenmesi
- Tek komutla tekrar üretilebilir Docker Compose production kurulumu
- Gereksiz mikroservis karmaşıklığından kaçınan modüler monolit yaklaşımı

## 3. Teknoloji kararları

- Tüm uygulama kodunda **TypeScript** kullanılır.
- Kullanıcı arayüzü ve web sunumu **Next.js** ile geliştirilir.
- İş API'si ve akış uçları **Fastify** üzerinde çalışır.
- Kalıcı ilişkisel veri **PostgreSQL** içinde tutulur.
- Production bileşenleri **Docker Compose** ile orkestre edilir.
- AI inference yalnızca harici sağlayıcı **API'leri** üzerinden yapılır.
- **Laravel kullanılmaz.** PHP/Laravel tabanlı bir uygulama katmanı planlanmamaktadır.
- Monorepo bağımlılıkları ve script'leri **npm workspaces** ile yönetilir.

Framework ve kütüphane sürümleri uygulama iskeleti oluşturulurken sabitlenecek, otomatik güncelleme ve güvenlik politikası ayrıca tanımlanacaktır.

## 4. Üst düzey bileşenler

```text
Tarayıcı
   |
   v
Next.js Web  ----->  Fastify API  -----> PostgreSQL
                           |   \
                           |    +------> Nesne depolama
                           |
                           +-----------> AI sağlayıcı API'leri
                           +-----------> Ödeme sağlayıcı API/webhook'ları
                           +-----------> İş kuyruğu / Worker

Artifact önizleme: ayrı origin + sandbox
Gelecek kod ajanı: ayrı, geçici ve kısıtlı çalışma ortamı
```

### Next.js web

- Sayfa, layout, erişilebilir etkileşim ve istemci durumunu yönetir.
- Kimlik doğrulama oturumunu güvenli cookie yaklaşımıyla kullanır.
- Secret veya sağlayıcı API anahtarı içermez.
- Yetkilendirme konusunda API'yi tek doğruluk kaynağı kabul eder.

### Fastify API

- Kimlik doğrulama, yetkilendirme ve girdi doğrulamanın sunucu sınırıdır.
- Sohbet, proje, dosya, artifact, kullanım ve abonelik modüllerini barındırır.
- AI sağlayıcı adapter'ını çağırır ve akışı istemciye iletir.
- İdempotency, rate limit, audit ve yapılandırılmış log politikalarını uygular.

### Worker

Dosya çıkarma, indeksleme, başlıklandırma, kullanım mutabakatı, silme ve webhook sonrası işler gibi uzun süreçleri API request yaşam döngüsünden ayırır. İlk sürümde API ile aynı kod tabanından farklı process olarak çalışabilir. Kuyruk teknolojisi uygulama öncesi seçilecektir; kalıcı, tekrar denenebilir ve idempotent iş semantiği zorunludur.

### PostgreSQL

İlişkisel kayıtlar, sahiplik, durum makineleri, kullanım defteri ve audit metadata için ana veri kaynağıdır. Migration'lar ileri/geri uyumluluk gözetilerek sürümlenir. Mesaj veya çıkarılmış metin gibi büyük alanların saklanma stratejisi yük testi ve gizlilik gereksinimleriyle doğrulanır.

### Nesne depolama

Yüklenen dosyalar ve büyük artifact çıktıları S3 uyumlu özel bir bucket'ta tutulur. Erişim kısa ömürlü imzalı URL veya API üzerinden verilir; bucket genel erişime açılmaz. Docker Compose production hedefinde uyumlu bir servis veya yönetilen dış servis yapılandırılabilir.

## 5. Önerilen depo yapısı

```text
apps/
  web/                 # Next.js
  api/                 # Fastify HTTP ve stream API
  worker/              # arka plan işleri (sonraki aşama)
packages/
  contracts/           # API şemaları ve paylaşılan tipler
  domain/              # framework'ten bağımsız iş kuralları
  ai/                  # sağlayıcı arayüzü ve adapter'lar
  config/              # doğrulanan ortak yapılandırma
  observability/       # log, metric ve tracing yardımcıları
infra/
  compose/             # production container tanımları
docs/
```

Bu yapının `apps/web`, `apps/api` ve `packages/shared` bölümleri uygulanmıştır. Worker ve diğer ortak paketler ihtiyaç doğdukça, sınırları belirlendikten sonra eklenecektir.

## 6. Domain sınırları ve veri modeli

Başlangıç varlıkları:

- `users`: hesap kimliği ve yaşam döngüsü
- `sessions`: oturumlar, son kullanım ve iptal bilgisi
- `plans` / `subscriptions`: yetki verilen plan ve sağlayıcı abonelik eşlemesi
- `projects`: kullanıcıya ait çalışma bağlamı ve talimatlar
- `conversations`: kullanıcı/proje ilişkisi, başlık ve durum
- `messages`: rol, içerik referansı, model ve üretim durumu
- `attachments`: dosya metadata'sı, tarama/işleme durumu ve storage anahtarı
- `document_chunks`: çıkarılmış, parçalanmış ve kaynak konumlu içerik
- `artifacts` / `artifact_versions`: tür, güncel sürüm ve değişmez sürüm içerikleri
- `usage_ledger`: rezervasyon, gerçekleşen tüketim, düzeltme ve dönem
- `provider_requests`: harici istek kimliği, süre, durum ve maliyet metadata'sı
- `billing_events`: idempotent webhook ve işleme sonucu
- `audit_events`: güvenlikle ilgili eylemler; hassas içerik olmadan

Tüm kullanıcı içeriği sorguları doğrudan veya doğrulanmış üst varlık üzerinden `user_id` sahiplik filtresine bağlanır. Silme davranışı varlık bazında açıkça tanımlanmalı; kontrolsüz cascade ile fatura/audit yükümlülükleri kaybedilmemelidir.

## 7. Ana veri akışları

### 7.1 Akışlı sohbet

1. İstemci, konuşma kimliği ve mesajı idempotency anahtarıyla API'ye gönderir.
2. API oturumu, konuşma sahipliğini, girdiyi, rate limit'i ve plan hakkını doğrular.
3. Tahmini kullanım atomik olarak rezerve edilir.
4. İzin verilen konuşma geçmişi ve proje/dosya bağlamı bütçe dahilinde hazırlanır.
5. Normalleştirilmiş istek AI adapter'ına verilir.
6. Sağlayıcı stream'i SSE veya uygun streaming HTTP cevabıyla istemciye aktarılır.
7. Tamamlanmış cevap ve sağlayıcı kullanım bilgisi kaydedilir; rezervasyon gerçekleşen değerle kapatılır.
8. Kopma, iptal ve timeout durumunda kısmi yanıt/durum işaretlenir ve rezervasyon mutabakatı yapılır.

İstemcinin kopması sağlayıcı isteğinin kontrolsüz biçimde devam etmesine yol açmamalı; iptal ve maksimum süre politikası bulunmalıdır.

### 7.2 Dosya yükleme ve analiz

1. API dosya adı, türü, boyutu ve plan kotasını doğrular; yükleme kaydı oluşturur.
2. Dosya özel nesne depolamaya yüklenir.
3. Worker zararlı içerik taraması ve gerçek dosya türü doğrulaması yapar.
4. Desteklenen parser izole ve kaynak limitli işlemde metni çıkarır.
5. Metin parçalanır; kaynak konumlarıyla kaydedilir, gerekiyorsa embedding API'sine gönderilir.
6. Attachment durumu `ready` veya güvenli hata koduyla `failed` olur.

Ham içerik log'lanmaz. Parser'ların ağ erişimi kapalı olmalı; zip bomb, makro, path traversal ve aşırı kaynak tüketimi tehditleri ele alınmalıdır.

### 7.3 Artifact önizleme

Artifact içeriği sürümlü ve değişmez kayıtlarla saklanır. Pasif metin renderer'ları güvenli biçimde escape eder. HTML/JavaScript gibi aktif önizleme gerekiyorsa ayrı origin üzerinde sandbox'lı iframe, katı CSP, kısıtlı ağ erişimi ve uygulama oturum cookie'lerine erişimsiz ortam kullanılır. Önizleme ile ana uygulama arasındaki mesajlar şema ve origin kontrolünden geçer.

### 7.4 Abonelik

1. API kullanıcı için ödeme sağlayıcısında checkout oturumu oluşturur.
2. Kullanıcı sağlayıcının barındırdığı ödeme ekranına yönlenir.
3. İmzalı webhook ham gövde üzerinden doğrulanır ve benzersiz olay kimliğiyle kaydedilir.
4. Worker olayları sıra dışı/tekrarlı teslimata dayanıklı biçimde işler.
5. Yerel abonelik durumu sağlayıcı gerçeğiyle periyodik olarak mutabık tutulur.

Tarayıcı dönüş URL'si tek başına plan yükseltmek için yeterli kanıt değildir.

## 8. AI sağlayıcı soyutlaması

Domain katmanı `model`, normalize mesajlar, araç/attachment yetenekleri, stream olayları, kullanım ve hata kategorilerinden oluşan sağlayıcı bağımsız bir sözleşme kullanır. Adapter:

- kimlik doğrulama ve sağlayıcı request formatını,
- timeout, kontrollü retry ve iptal işlemini,
- stream event normalizasyonunu,
- rate-limit ve hata sınıflandırmasını,
- token/kullanım bilgisini

yönetir. Retry yalnızca güvenli koşullarda ve jitter'lı backoff ile yapılır; aynı kullanıcı isteğinin çift maliyet yaratması izlenir. Model kataloğu kod içine dağılmak yerine sunucu kontrollü yetenek ve plan politikası olarak tutulur.

## 9. Kimlik, yetki ve güvenlik

- Şifreler modern, ayarlanabilir maliyetli parola hash algoritmasıyla saklanır.
- Oturum cookie'leri `HttpOnly`, `Secure` ve uygun `SameSite` ayarına sahip olur; state-changing istekler CSRF modeline göre korunur.
- E-posta doğrulama ve reset token'ları kısa ömürlü, tek kullanımlık ve veritabanında hash'li tutulur.
- API uçları hem authentication hem nesne seviyesinde authorization uygular.
- Rate limit IP, kullanıcı ve riskli işlem seviyelerinde katmanlanır.
- Secret'lar environment/secret store üzerinden enjekte edilir, imajlara veya log'lara yazılmaz ve döndürülebilir olur.
- TLS reverse proxy veya platform ingress'inde zorunludur.
- Güvenlik başlıkları, CORS allowlist ve payload limitleri varsayılan olarak sıkıdır.
- Bağımlılık ve container imajları düzenli olarak zafiyet taramasından geçirilir.

Tehdit modeli; hesap ele geçirme, IDOR, prompt injection, veri sızdırma, dosya saldırıları, artifact XSS, webhook sahteciliği, kota atlatma ve tedarik zinciri risklerini kapsamalıdır. Prompt injection, yetkilendirme mekanizması değildir; model çıktıları güvenilmeyen veri kabul edilir.

## 10. Kullanım limiti ve maliyet kontrolü

`usage_ledger` append-only muhasebe yaklaşımıyla rezervasyon ve kesinleşen tüketimi izler. Limit kontrolü ve rezervasyon aynı transaction/atomik işlem içinde yapılır. Boyutlar arasında plan dönemindeki model token'ı veya kredi, dosya/depolama, eşzamanlı stream ve istek hızı bulunabilir.

- Sağlayıcının raporladığı kesin kullanım mümkün olduğunda esas alınır.
- Hatalı ve iptal edilen isteklerin ücretlendirme kuralı açıkça tanımlanır.
- Kullanıcı arayüzü gecikebilen yaklaşık değeri etiketler; enforcement sunucuda yapılır.
- Global harcama alarmı, kullanıcı anomalisi ve sağlayıcı bütçe sınırları izlenir.

## 11. Gözlemlenebilirlik ve operasyon

- JSON yapılandırılmış log; request/correlation kimliği ve güvenli metadata
- API latency, ilk token süresi, stream tamamlanma, hata, kuyruk derinliği ve sağlayıcı maliyet metric'leri
- Web → API → worker → sağlayıcı akışında dağıtık tracing
- Liveness ve dependency-aware readiness health check'leri
- Hedeflerle uyumlu alarm, dashboard ve runbook'lar
- Kişisel içerik için redaction; log ve trace saklama süresi politikası

Önerilen başlangıç SLO'ları beta öncesi trafik ve sağlayıcı davranışı ölçülerek belirlenecektir. Sağlayıcı kesintilerinde hızlı hata, kontrollü retry ve kullanıcıya durum açıklaması tercih edilir.

## 12. Docker Compose production topolojisi

Planlanan servisler `reverse-proxy`, `web`, `api`, `worker`, `postgres` ve seçilecek kuyruğa bağlı ek bileşenlerdir. Nesne depolama yönetilen servis veya ayrı S3 uyumlu container olabilir.

- Uygulama imajları multi-stage, minimal, sabitlenmiş ve root olmayan kullanıcıyla çalışır.
- Yalnızca reverse proxy dış ağa port açar; veritabanı ve iç servisler private network'tedir.
- Persistent volume, otomatik yedek, şifreli harici yedek ve düzenli restore testi gerekir.
- Migration, deploy sırasında tek seferlik kontrollü job olarak yürütülür.
- Health check, restart policy, kaynak limitleri ve log rotasyonu tanımlanır.
- Deploy'lar sürüm etiketli imaj kullanır; `latest` production doğruluğu için yeterli değildir.
- Rolling deploy Compose'un doğal kapsamını aşarsa bakım penceresi veya ileride orkestratör geçişi değerlendirilir.

Docker Compose production kurulumu hedef dağıtım biçimidir; tek sunucunun kullanılabilirlik sınırları açıkça kabul edilir ve yedek/geri yükleme planıyla azaltılır.

## 13. Gelecekteki OpenCode ajanı

Kod ajanı API/worker process'inde doğrudan shell çalıştırmaz. Her görev için ayrı, geçici sandbox gerekir:

- salt okunur taban imaj ve yalnızca görev workspace'ine yazma,
- CPU, bellek, disk, process ve süre limiti,
- varsayılan kapalı ağ; gerektiğinde hedef allowlist,
- kısa ömürlü, görev kapsamlı secret ve kimlik bilgisi,
- ayrıcalıksız kullanıcı, capability azaltma ve host socket erişimi yasağı,
- komut/araç çağrıları için denetim kaydı ve riskli eylem onayı,
- uygulanmadan önce diff incelemesi ve iptal/temizleme.

Container tek başına mutlak güvenlik sınırı kabul edilmemeli; seçilen çalışma ortamı için tehdit modeli ve kaçış savunması yapılmalıdır.

## 14. Test stratejisi

- Domain ve kota kuralları için birim/property testleri
- PostgreSQL ve adapter sınırları için entegrasyon testleri
- API sözleşme ve yetkilendirme testleri
- Sahte AI/ödeme sağlayıcılarıyla hata, timeout, stream kopması ve webhook tekrar testleri
- Kritik kullanıcı yolculukları için uçtan uca tarayıcı testleri
- Dosya parser ve artifact sandbox için güvenlik regresyon testleri
- Production Compose için image build, health, migration, backup/restore smoke testleri
- Kontrollü yük testleriyle eşzamanlı stream, connection pool ve kota yarış koşulları

## 15. Açık teknik kararlar

- npm workspaces ötesinde ek bir monorepo build/cache aracına ihtiyaç olup olmadığı
- ORM/query builder ve migration yaklaşımı
- Kuyruk ve cache/rate-limit altyapısı
- Kimlik doğrulamanın uygulama içi mi yönetilen servis mi olacağı
- AI ve ödeme sağlayıcıları
- S3 uyumlu storage seçimi
- Embedding/vector arama gereksinimi ve PostgreSQL eklentisi kullanımı
- Stream protokolü ve reconnect semantiği
- Telemetry platformu, veri bölgesi ve saklama süreleri
- Artifact yürütme/önizleme altyapısı

Her önemli karar bir ADR ile bağlam, seçenekler, sonuçlar ve geri dönüş koşulları belirtilerek kaydedilmelidir.
