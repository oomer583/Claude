# Ürün Tanımı

## 1. Ürün özeti

Bu ürün; bireylerin ve ekiplerin AI ile sohbet etmesini, kalıcı çalışma bağlamı oluşturmasını, kaynak dosyaları inceletmesini ve üretilen çıktıları artifact olarak görüntülemesini sağlayan web tabanlı bir çalışma alanıdır. Deneyim, hızlı bir sohbet arayüzünü proje organizasyonu ve güvenli içerik üretimiyle birleştirir.

## 2. Problem

Genel amaçlı AI sohbet araçlarında bilgi çoğunlukla konuşmalara dağılır; dosyalar, talimatlar ve çıktılar arasında süreklilik kurmak zordur. Kullanıcılar ayrıca:

- geçmiş çalışmayı bulmak ve devam ettirmek,
- bir konuya ait dosya ve konuşmaları birlikte yönetmek,
- uzun veya yapılandırılmış çıktıları sohbet akışından ayrı incelemek,
- kullanım ve maliyetlerini öngörmek,
- hassas içeriklerinin nasıl işlendiğini anlamak

ister. Ürün bu ihtiyaçları tek ve tutarlı bir çalışma yüzeyinde karşılamayı amaçlar.

## 3. Hedef kullanıcılar

### Birincil kullanıcılar

- **Bilgi çalışanları:** araştırma, özetleme, planlama ve doküman üretimi yapar.
- **Yazılım geliştiriciler:** teknik soru, taslak kod ve ileride izole kod ajanı iş akışları kullanır.
- **İçerik üreticileri ve öğrenciler:** kaynaklardan yapılandırılmış çıktı ve tekrar kullanılabilir artifact üretir.

### İkincil kullanıcılar

- Küçük ekipler ve danışmanlar. İlk sürüm tek kullanıcı deneyimine odaklanır; ekip üyeliği, ortak proje ve kurumsal yönetim ilk kapsamın dışındadır.

## 4. Değer önerisi

- **Süreklilik:** Geçmiş konuşmalar ve proje bağlamı korunur.
- **Odak:** Projeler, ilgili talimatları, sohbetleri ve dosyaları tek yerde toplar.
- **Üretkenlik:** Artifact'lar uzun çıktıları düzenlenebilir ve önizlenebilir çalışma ürünlerine dönüştürür.
- **Şeffaflık:** Plan limitleri, kalan kullanım ve yükseltme seçenekleri açıkça gösterilir.
- **Güven:** Kullanıcı verisi, dosya işleme ve AI sağlayıcı aktarımı anlaşılır kontrollerle yönetilir.

## 5. Ürün ilkeleri

1. Sohbete başlamak sürtünmesiz olmalıdır.
2. AI'ın yaptığı işlem, kullanılan bağlam ve hata durumu kullanıcıya açıklanmalıdır.
3. Kullanıcı her zaman içeriğinin sahibi ve kontrol edeni olmalıdır.
4. Limitler sürpriz yaratmamalı; tüketim gerçekleşmeden veya sınıra yaklaşırken bildirilmelidir.
5. Gelişmiş özellikler temel sohbet güvenilirliğini bozmamalıdır.
6. Riskli eylemler açık kullanıcı onayı ve geri bildirim gerektirmelidir.

## 6. Özellik kapsamı

### 6.1 AI sohbeti

- Yeni sohbet başlatma, mesaj gönderme, yanıtı akış halinde görme ve üretimi durdurma
- Markdown, kod blokları ve temel zengin içerik sunumu
- Yeniden deneme ve hatayı anlaşılır biçimde gösterme
- Model seçimi yalnızca ürün/plan politikasının izin verdiği modeller arasında
- Mesaj ve yanıt geri bildirimi

**Kabul ölçütü:** Kullanıcı, desteklenen bir tarayıcıda mesaj gönderip ilk parçayı hedeflenen gecikme içinde görür; bağlantı veya sağlayıcı hatasında veri kaybetmeden yeniden deneyebilir.

### 6.2 Sohbet geçmişi

- Otomatik başlıklandırma, kronolojik listeleme ve sohbeti yeniden açma
- Başlık değiştirme, arşivleme ve silme
- İlerleyen sürümde arama ve filtreleme
- Sohbet ile proje arasında bağ kurma

### 6.3 Projects

- Proje oluşturma, adlandırma, açıklama ve proje talimatları
- Bir projeye sohbet ve dosya ekleme
- Yeni sohbette izin verilen proje bağlamını kullanma
- Proje silerken etkilerin açıkça gösterilmesi

### 6.4 Dosya yükleme ve analiz

- Başlangıçta kontrollü bir belge türü listesi ve dosya boyutu sınırı
- Yükleme/işleme durumu, başarısızlık nedeni ve silme
- Metin çıkarma, parçalama ve uygun bağlamın modele iletilmesi
- Kaynağa referans verebilen yanıt tasarımı

Dosya desteği, format başına güvenlik ve kalite doğrulaması tamamlandıkça genişletilecektir. Görsel, arşiv ve çalıştırılabilir dosyalar ilk sürümde desteklenmek zorunda değildir.

### 6.5 Artifacts ve canlı önizleme

- Sohbet yanıtından ayrı, kalıcı artifact yüzeyi
- Metin, Markdown ve güvenli kod/HTML önizlemesi için tür bazlı renderer
- Artifact güncelleme ve temel sürüm geçmişi
- Kopyalama ve desteklenen türlerde dışa aktarma
- Aktif içerik için izole origin, sandbox ve ağ/izin politikası

### 6.6 Kullanıcı hesapları

- Kayıt, giriş, çıkış, e-posta doğrulama ve şifre sıfırlama
- Aktif oturumları güvenli biçimde yönetme
- Profil ve hesap silme
- Gizlilik metni ve veri işleme tercihleri

Sosyal giriş, çok faktörlü kimlik doğrulama ve ekip hesapları sonraki değerlendirme alanlarıdır.

### 6.7 Free ve Pro limitleri

Planlar; mesaj/model tüketimi, eşzamanlı üretim, dosya sayısı/boyutu, depolama veya artifact kapasitesi gibi ölçümlerle ayrıştırılabilir. Kesin sayılar lansman öncesi maliyet ve kullanım deneyleriyle belirlenecektir.

- Free plan, ürünü anlamaya yetecek yenilenen bir kullanım hakkı sunar.
- Pro plan daha yüksek limitler ve uygun olduğunda gelişmiş modellere erişim sunar.
- Sayaç, yenilenme zamanı ve limit aşımı davranışı kullanıcıya gösterilir.
- Sunucu tarafı ölçüm, rezervasyon ve mutabakat mekanizması kötüye kullanımı ve çift harcamayı engeller.

### 6.8 Aylık abonelik

- Güvenli ödeme sayfası üzerinden aylık Pro satın alma
- Abonelik durumu, yenileme tarihi ve fatura portalı
- Ödeme webhook'larıyla idempotent durum güncelleme
- İptal dönem sonunda etkili olur; başarısız ödeme ve geri ödeme davranışları açıkça tanımlanır
- Fiyat, para birimi, vergi ve ödeme sağlayıcısı uygulama öncesi ürün/hukuk kararıdır

### 6.9 Gelecekte OpenCode tabanlı kod ajanı

Kod ajanı ayrı bir ürün aşamasıdır. Kullanıcı onayıyla depo üzerinde planlama, dosya düzenleme ve komut çalıştırma sağlayabilir. Başlamadan önce sandbox, ağ erişimi, secret yönetimi, kaynak limitleri, denetim kaydı ve değişiklik inceleme deneyimi tamamlanmalıdır.

## 7. Temel kullanıcı yolculukları

1. **İlk değer:** Kayıt ol → yeni sohbet aç → mesaj gönder → akış yanıtını al → geçmişten sohbete dön.
2. **Projeli çalışma:** Proje oluştur → talimat ve dosya ekle → proje içinde sohbet başlat → kaynaklara dayalı çıktı al.
3. **Artifact:** Bir çıktı iste → artifact'ı ayrı panelde aç → önizle → revize ettir → dışa aktar.
4. **Yükseltme:** Limite yaklaş → kullanım bilgisini gör → Pro'yu seç → ödeme yap → yeni limitlerin uygulanmasını gör.
5. **Hesap kontrolü:** Ayarlara git → abonelik/veri seçeneklerini gör → dışa aktar veya hesabı sil.

## 8. Kapsam dışı — ilk sürüm

- Yerel model eğitimi veya inference barındırma
- Laravel tabanlı servisler
- Mobil native uygulamalar
- Gerçek zamanlı çok kullanıcılı ortak düzenleme
- Kurumsal SSO, SCIM ve organizasyon yönetimi
- Eklenti pazaryeri veya genel üçüncü taraf araç çalıştırma
- Production ortamında sınırsız/izolesiz kod yürütme

## 9. Başarı ölçütleri

Kesin hedefler beta verisiyle belirlenecektir. Başlangıç ölçüm çerçevesi:

- Aktivasyon: ilk oturumunda başarılı AI yanıtı alan kayıtlı kullanıcı oranı
- Değer: haftalık aktif kullanıcı başına anlamlı sohbet ve geri dönüş oranı
- Süreklilik: 7 ve 30 günlük elde tutma, geçmiş sohbet/proje yeniden açma
- Kalite: başarılı tamamlanma, kullanıcı tarafından durdurma, hata ve yeniden deneme oranı
- Performans: ilk token gecikmesi ve toplam yanıt süresi yüzdelikleri
- Dönüşüm: limite ulaşma, yükseltme başlatma ve Free→Pro dönüşüm oranı
- Ekonomi: aktif kullanıcı ve başarılı yanıt başına sağlayıcı/depolama maliyeti
- Güven: yetkisiz erişim vakası, abuse oranı ve silme talebi tamamlama süresi

Analitik olayları içerik taşımayacak, mümkün olan en az kişisel veriyle ve belgelenmiş saklama süreleriyle toplanacaktır.

## 10. Açık ürün kararları

- Lansman ülkeleri, desteklenen diller ve yasal gereksinimler
- AI sağlayıcıları, model kataloğu ve model seçiminin kullanıcıya açıklığı
- Free/Pro fiyatı, limit birimleri ve yenileme dönemi
- Desteklenen ilk dosya ve artifact türleri
- Veri saklama, dışa aktarma ve silme süreleri
- Misafir kullanımının olup olmayacağı
- İçerik moderasyonu, itiraz ve hesap kısıtlama politikası

Bu kararlar uygulamaya geçmeden önce sorumlu kişi, karar tarihi ve gerekçesiyle kaydedilmelidir.
