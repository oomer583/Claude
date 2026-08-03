# AI Çalışma Alanı

Claude benzeri bir deneyim sunmayı hedefleyen, sohbeti; proje, dosya ve üretilebilir içerik iş akışlarıyla birleştiren modern bir AI çalışma alanıdır. Bu depo şu anda **planlama ve dokümantasyon aşamasındadır**; henüz uygulama kodu içermez.

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

> Laravel bu projenin teknoloji yığınında yer almaz. Modeller yerel olarak barındırılmayacak; yalnızca sağlayıcı API'leri üzerinden kullanılacaktır.

## Dokümantasyon

- [Ürün tanımı](docs/PRODUCT.md): hedef kitle, kapsam, deneyim ilkeleri ve başarı ölçütleri
- [Mimari](docs/ARCHITECTURE.md): servis sınırları, veri akışları, güvenlik ve production yaklaşımı
- [Yol haritası](docs/ROADMAP.md): aşamalar, teslimat ölçütleri ve bağımlılıklar
- [Katkı ve ajan rehberi](AGENTS.md): depo kuralları ve gelecekteki geliştirme ilkeleri

## Mevcut durum

Depoda yalnızca ürün ve teknik planlama belgeleri bulunmaktadır. Kurulum, geliştirme veya çalıştırma komutu henüz yoktur. Uygulama geliştirme başlamadan önce temel kararlar, tehdit modeli ve ilk sürüm kapsamı belgeler üzerinden netleştirilecektir.

## Temel ilkeler

1. **Gizlilik ve güvenlik:** Kullanıcı içeriği, kimlik bilgileri ve sağlayıcı anahtarları en az yetki ilkesiyle korunur.
2. **Sağlayıcı bağımsızlığı:** Ürün katmanı, belirli bir AI sağlayıcısının veri modellerine doğrudan bağlanmaz.
3. **Ölçülebilir maliyet:** Token, depolama ve işlem tüketimi plan bazında izlenir ve sınırlandırılır.
4. **Aşamalı teslimat:** Sohbet çekirdeği doğrulanmadan daha karmaşık ajan özelliklerine geçilmez.
5. **Production odaklılık:** Yerel geliştirme ve production kurulumu tekrar üretilebilir container tanımlarıyla yönetilir.

## Lisans

Henüz bir lisans seçilmemiştir. Lisans belirlenene kadar bu depodaki içeriğin yeniden kullanımı için proje sahiplerinden izin alınmalıdır.
