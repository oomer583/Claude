# Açık Alan — AI Çalışma Alanı

Claude benzeri bir deneyim sunmayı hedefleyen, sohbeti; proje, dosya ve üretilebilir içerik iş akışlarıyla birleştiren modern bir AI çalışma alanıdır. Depo şu anda **platform temeli aşamasındadır** ve çalışan web, API ve ortak tip paketlerini içerir.

## Vizyon

Kullanıcıların bir AI asistanıyla tek seferlik mesajlaşmanın ötesine geçerek uzun süreli bağlam oluşturabildiği, kaynak dosyalarını düzenleyebildiği ve ortaya çıkan içerikleri canlı olarak inceleyebildiği güvenli bir çalışma ortamı sunmak.

## Planlanan yetenekler

- Akış destekli AI sohbeti
- Aranabilir ve kalıcı sohbet geçmişi
- Sohbetleri, talimatları ve dosyaları bir araya getiren Projects alanı
- Güvenli dosya yükleme, metin çıkarma ve analiz
- Artifacts oluşturma, sürümleme ve canlı önizleme
- Kullanıcı hesabı, oturum ve hesap yönetimi
- Free ve Pro planlarına göre ölçümlenen kullanım limitleri
- Aylık Pro aboneliği ve faturalandırma yaşam döngüsü
- İleriki bir aşamada OpenCode tabanlı, izole çalışan kod ajanı

## Planlanan teknoloji yığını

| Katman | Teknoloji |
| --- | --- |
| Dil | TypeScript |
| Web uygulaması | Next.js |
| API | Fastify |
| Veritabanı | PostgreSQL |
| Dağıtım | Docker Compose |
| AI erişimi | Harici model sağlayıcılarının API'leri |
| Paket yöneticisi | npm workspaces |

> Laravel bu projenin teknoloji yığınında yer almaz. Modeller yerel olarak barındırılmayacak; yalnızca sağlayıcı API'leri üzerinden kullanılacaktır.

## Dokümantasyon

- [Ürün tanımı](docs/PRODUCT.md): hedef kitle, kapsam, deneyim ilkeleri ve başarı ölçütleri
- [Mimari](docs/ARCHITECTURE.md): servis sınırları, veri akışları, güvenlik ve production yaklaşımı
- [Yol haritası](docs/ROADMAP.md): aşamalar, teslimat ölçütleri ve bağımlılıklar
- [Katkı ve ajan rehberi](AGENTS.md): depo kuralları ve gelecekteki geliştirme ilkeleri

## Depo yapısı

```text
apps/
  api/       # Fastify API ve health check
  web/       # Next.js web uygulaması
packages/
  shared/    # Uygulamalar arasında paylaşılan TypeScript sözleşmeleri
docs/        # Ürün, mimari ve yol haritası belgeleri
```

## Yerel geliştirme

Gereksinimler: Node.js 22+, npm 10+ ve Docker Compose.

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Web uygulaması `http://localhost:3000`, API ise `http://localhost:3001` adresinde çalışır. API sağlık kontrolü `GET /health` üzerinden erişilebilir.

### Kalite kontrolleri

```bash
npm run lint
npm run typecheck
npm run build
```

## Docker Compose

Kök `.env.example` dosyasını `.env` olarak kopyalayıp güvenli PostgreSQL bilgileriyle güncelledikten sonra stack'i başlatın:

```bash
cp .env.example .env
docker compose up --build
```

Compose; PostgreSQL, Fastify API ve Next.js web servislerini sağlık kontrolleri ve kalıcı veritabanı volume'u ile başlatır. Örnek parolayı production ortamında kullanmayın.

## Mevcut durum

Monorepo iskeleti, basit ana sayfa, API sağlık kontrolü ve PostgreSQL production topolojisi hazırdır. Kullanıcı hesapları, AI sağlayıcı bağlantısı, ödeme, dosya yükleme ve kod ajanı henüz uygulanmamıştır.

## Temel ilkeler

1. **Gizlilik ve güvenlik:** Kullanıcı içeriği, kimlik bilgileri ve sağlayıcı anahtarları en az yetki ilkesiyle korunur.
2. **Sağlayıcı bağımsızlığı:** Ürün katmanı, belirli bir AI sağlayıcısının veri modellerine doğrudan bağlanmaz.
3. **Ölçülebilir maliyet:** Token, depolama ve işlem tüketimi plan bazında izlenir ve sınırlandırılır.
4. **Aşamalı teslimat:** Sohbet çekirdeği doğrulanmadan daha karmaşık ajan özelliklerine geçilmez.
5. **Production odaklılık:** Yerel geliştirme ve production kurulumu tekrar üretilebilir container tanımlarıyla yönetilir.

## Lisans

Henüz bir lisans seçilmemiştir. Lisans belirlenene kadar bu depodaki içeriğin yeniden kullanımı için proje sahiplerinden izin alınmalıdır.
