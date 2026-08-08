# AGENTS.md

Bu depo Claude benzeri üretim kalitesinde bir AI çalışma alanı geliştirir.

## Kaynak mimari

Bu projede büyük özellikler sıfırdan yeniden yazılmaz. Temel ilke: **ada yapma, köprü yap**.

Seçilen ana açık kaynak bileşenler:

- `vercel/chatbot`: ana ürün kabuğu; Next.js UI, auth, chat, PostgreSQL, history, streaming ve artifacts.
- `decolua/9router`: tek model/provider gateway; OpenAI uyumlu API, routing, fallback ve model kullanım telemetrisi.
- `onyx-dot-app/onyx`: Projects/RAG, dosya ingestion/indexing, web search, deep research, memory, MCP/actions/connectors, güvenli code/file execution yetenekleri.
- PostgreSQL: ürün source of truth.
- Redis + `rate-limiter-flexible`: hızlı kota/rate-limit sayaçları.

Şimdilik **Mem0, OpenMeter ve gerçek payment processor eklenmez**. Ödeme için yalnız gelecekte kullanılabilecek adapter sınırı bırakılır.

## Eski dokümanlarla çakışma

`docs/` altındaki ilk planlarda Next.js + ayrı Fastify API/worker gibi sıfırdan geliştirilecek mimari anlatılabilir. Bu yaklaşım artık bağlayıcı değildir. Mevcut upstream OSS davranışı korunur; yalnız entegrasyon, ürün-spesifik veri sahipliği, güvenlik ve UI uyarlaması için özel kod yazılır.

## Çalışmaya başlamadan önce

1. Mevcut upstream uygulamayı ve ilgili dosyaları inceleyin.
2. Aynı işlev seçilen OSS projelerden birinde zaten varsa yeniden uygulamayın.
3. API/request modellerini tahmin etmeyin; güncel upstream kodu/dokümanından doğrulayın.
4. Onyx CE/EE sınırını her özellik için kontrol edin. EE/proprietary kodu CE gibi kullanmayın.
5. Değişiklikten sonra lint, typecheck ve ilgili testleri gerçekten çalıştırın; çalışmayan kontrolü başarılı gibi raporlamayın.

## Ana sorumluluk sınırları

### Ana uygulama (`vercel/chatbot` tabanı)

Sahip olduğu alanlar:
- kullanıcı ve auth
- chat/message/history
- product Project kaydı ve Onyx mapping ID
- kullanıcı ayarları ve Styles
- plan/entitlement yapılandırması
- durable usage accounting
- artifact UI

### 9Router

Yalnız server-side erişilir. Model/provider credential, routing ve fallback 9Router'da kalır. Ürünün hangi modeli hangi kullanıcının görebileceği ana uygulamada kontrol edilir.

Varsayılan internal base URL yapılandırılabilir olmalıdır:
`ROUTER_BASE_URL=http://9router:20128/v1`

### Onyx

Ayrı servis olarak çalışır; kaynak dosyaları ana uygulamaya kopyalanmaz. Projects/RAG/search/research/memory/MCP/files/code için adapter katmanı üzerinden erişilir. Ana ürün kullanıcısı canonical kimliktir; Onyx auth devre dışı bırakılarak kolay yol seçilmez.

## Kod ilkeleri

- TypeScript strict mode korunur.
- Gereksiz `any`, sessiz catch ve doğrulanmamış assertion eklenmez.
- Secret/API key browser'a gönderilmez.
- Browser 9Router/Onyx/Redis/Postgres ile doğrudan konuşmaz.
- Kullanıcı tarafından üretilen kod web process içinde `eval`, `exec` veya izolesiz child process ile çalıştırılmaz.
- Plan/kota/ownership kontrolleri yalnız UI'da değil server endpoint'lerinde uygulanır.
- Kullanıcı dosyaları güvenilmeyen girdidir; boyut/tür/ownership kontrolü zorunludur.
- Incognito chat history ve persistent memory okumaz/yazmaz.
- Product DB ana source of truth olarak kalır; dış servis ID'leri mapping olarak tutulur.

## Kaynak kısıtları

Hedef fiziksel sunucu küçük tutulmalıdır. Gereksiz servis, duplicate worker veya lokal LLM ağırlığı eklemeyin. Docker log rotation, storage quota ve geçici dosya temizliği production gereksinimidir.

## Git disiplini

- Büyük değişiklikleri doğrudan `main` üzerinde yapmayın.
- Küçük ve anlamlı commit'ler üretin.
- Gerekli özelliklerde mock/TODO/placeholder bırakarak production-complete ilan etmeyin.
- Lisansı bilinmeyen veya AGPL/GPL/network-copyleft yeni bağımlılık eklemeden önce durup raporlayın.

## Public release kuralı

Bu proje public MVP/V1/V2 olarak parçalanmayacaktır. Geliştirme içeride fazlara ayrılabilir ancak ilk public production sürümünde gerekli Claude-benzeri çekirdek işlevlerin tamamı gerçekten çalışmalıdır.
