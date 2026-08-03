# Ürün ve Teknik Yol Haritası

## 1. Yaklaşım

Yol haritası takvim sözü değil, bağımlılık ve doğrulama sırasıdır. Tarihler ekip kapasitesi, sağlayıcı seçimi, güvenlik incelemesi ve kullanıcı araştırması tamamlandıktan sonra atanacaktır. Her aşama production'a çıkmak zorunda değildir; bir sonraki aşamaya geçiş için belirtilen çıkış ölçütleri aranır.

## 2. Öncelik ilkeleri

1. Güvenli hesap ve veri sahipliği, zengin özelliklerden önce gelir.
2. Sohbet güvenilirliği, Projects ve Artifacts genişlemesinden önce doğrulanır.
3. Kullanım ölçümü, ücretli abonelik açılmadan önce doğru çalışmalıdır.
4. Dosya ve aktif içerik, güvenlik sınırları hazır olmadan etkinleştirilmez.
5. Kod ajanı, çekirdek ürün ve izolasyon altyapısı olgunlaşmadan başlatılmaz.

## 3. Aşama 0 — Keşif ve temel kararlar

**Amaç:** Uygulama kodundan önce ürün, risk ve teknoloji varsayımlarını doğrulamak.

- Hedef kullanıcı görüşmeleri ve ana iş akışı prototipleri
- İlk sürüm kapsamı ve başarı ölçütlerinin onayı
- AI sağlayıcı/model değerlendirmesi: kalite, stream, veri politikası, maliyet ve bölge
- Kimlik, ödeme, nesne depolama, kuyruk ve telemetry seçeneklerinin kararı
- Veri sınıflandırması, saklama/silme politikası ve tehdit modelinin ilk sürümü
- Monorepo, paket yöneticisi, test ve CI kararlarının ADR'leri
- Free/Pro limit hipotezi ve birim ekonomi modeli

**Çıkış ölçütleri**

- Açık ürün kararlarının sahipleri ve son tarihleri atanmıştır.
- Kritik mimari kararlar ADR'lerle kaydedilmiştir.
- MVP kullanıcı akışları, gizlilik yaklaşımı ve maliyet tavanı onaylanmıştır.
- Risk kaydı ve ölçüm planı mevcuttur.

## 4. Aşama 1 — Platform temeli

**Amaç:** Özellik geliştirmeyi güvenli ve tekrar üretilebilir kılan iskeleti kurmak.

- TypeScript monorepo; Next.js, Fastify ve worker uygulama iskeletleri
- PostgreSQL migration sistemi ve yerel geliştirme ortamı
- Doğrulanan yapılandırma, secret yönetimi ve ortak API sözleşmeleri
- CI: format, lint, type-check, test, build ve bağımlılık/imaj taraması
- Yapılandırılmış log, correlation ID, temel metric ve health check
- Production Docker Compose, reverse proxy, TLS planı, volume ve yedek/restore prosedürü
- İlk veri modeli ve sahiplik/yetkilendirme test altyapısı

**Çıkış ölçütleri**

- Temiz ortamdan belgelenmiş şekilde geliştirme kurulumu yapılabilir.
- Production benzeri Compose stack health check'leri geçer.
- Migration ileri alınabilir; yedekten geri yükleme tatbikatı başarıyla tamamlanır.
- Ana branch için zorunlu kalite kontrolleri çalışır.

## 5. Aşama 2 — Hesaplar ve sohbet MVP

**Amaç:** Kayıtlı kullanıcının güvenilir biçimde sohbet edip geçmişine dönebildiği ilk uçtan uca değeri sunmak.

- Kayıt, giriş/çıkış, e-posta doğrulama ve şifre sıfırlama
- Hesap/oturum güvenliği, authorization ve temel rate limiting
- Sohbet oluşturma, mesaj gönderme, durdurma ve streaming yanıt
- Sağlayıcı adapter'ı; timeout, iptal, hata normalizasyonu ve kullanım kaydı
- Sohbet geçmişi: listeleme, yeniden açma, başlık değiştirme, arşivleme/silme
- Loading, empty, error ve reconnect kullanıcı deneyimleri
- İçerik taşımayan temel ürün analitiği ve operasyon dashboard'ları

**Çıkış ölçütleri**

- İlk değer ve geçmişe dönüş yolculukları uçtan uca testlerden geçer.
- Kullanıcılar yalnızca kendi konuşma ve mesajlarına erişebilir; negatif testler vardır.
- Stream kopması, sağlayıcı timeout'u ve retry davranışı veri/kota tutarlılığını bozmaz.
- Performans ve hata oranı için beta eşikleri tanımlanmış ve ölçülebilirdir.

## 6. Aşama 3 — Projects ve dosya bağlamı

**Amaç:** Sohbetleri kalıcı kaynak ve talimatlarla yapılandırılmış çalışmaya dönüştürmek.

- Proje oluşturma, düzenleme, arşivleme/silme ve proje talimatları
- Sohbeti projeye bağlama/taşıma
- Özel nesne depolama ve doğrudan güvenli yükleme akışı
- Dosya türü/boyut doğrulama, malware tarama ve izole parsing
- Metin çıkarma, parçalama, kaynak konumu ve retrieval yaklaşımı
- İş kuyruğu, retry/dead-letter ve dosya durum arayüzü
- Saklama, silme ve proje cascade davranışları

**Çıkış ölçütleri**

- Desteklenen dosya matrisi kalite ve güvenlik testleriyle belgelenmiştir.
- Proje bağlamı token bütçesini aşmadan ve kaynak sahipliğini ihlal etmeden hazırlanır.
- Bozuk/kötü niyetli/aşırı büyük dosya senaryoları güvenli biçimde reddedilir.
- Dosya silme ve hesap silme işlemlerinin storage dahil tamamlandığı doğrulanır.

## 7. Aşama 4 — Artifacts ve güvenli canlı önizleme

**Amaç:** AI çıktısını sohbetten ayrı, kalıcı ve etkileşimli bir çalışma ürünü haline getirmek.

- Artifact veri modeli, türleri ve sürüm geçmişi
- Sohbet yanında artifact paneli, güncelleme ve dışa aktarma
- Metin/Markdown renderer'ları ve desteklenen aktif önizlemeler
- Ayrı preview origin, iframe sandbox, CSP ve iletişim protokolü
- Önizleme hata/timeout/kaynak sınırı deneyimleri
- XSS, veri sızdırma ve kötüye kullanım regresyon testleri

**Çıkış ölçütleri**

- Artifact sürümleri kaybolmadan oluşturulabilir ve geri görüntülenebilir.
- Aktif önizleme uygulama cookie/secret'larına erişemez ve varsayılan olarak dış ağa çıkamaz.
- Güvenlik incelemesindeki yüksek önem dereceli bulgular kapatılmıştır.
- Temel kullanım ve kalite metric'leri dashboard'da izlenebilir.

## 8. Aşama 5 — Plan limitleri ve aylık Pro

**Amaç:** Kullanıcıya açık, doğru ve kötüye kullanıma dayanıklı gelir modeli kurmak.

- Append-only kullanım defteri, atomik rezervasyon ve mutabakat
- Free/Pro entitlement, dönem yenileme ve kullanıcı kullanım ekranı
- Model, token/kredi, dosya/depolama ve eşzamanlılık limitleri
- Barındırılan checkout, aylık abonelik ve müşteri fatura portalı
- Webhook imza doğrulama, idempotency ve periyodik mutabakat
- İptal, başarısız ödeme, grace period, geri ödeme ve plan düşürme davranışı
- Maliyet, dönüşüm ve abuse alarm/dashboard'ları

**Çıkış ölçütleri**

- Eşzamanlı istekler plan limitini yarış koşuluyla aşamaz.
- Tekrarlı/sırasız webhook'lar doğru abonelik durumuyla sonuçlanır.
- Satın alma, yenileme, başarısız ödeme ve iptal sandbox uçtan uca testlerinden geçer.
- Fiyatlandırma, vergi, kullanım ve tüketici bilgilendirmeleri hukuk/ürün onayı almıştır.

## 9. Aşama 6 — Beta sertleştirme ve production hazırlığı

**Amaç:** Kontrollü kullanıcı grubundan genel kullanıma güvenle geçmek.

- Erişilebilirlik, responsive deneyim ve tarayıcı uyumluluğu denetimi
- Yük/soak testleri; connection pool, stream kapasitesi ve kuyruk backpressure
- Veri tabanı/object storage yedekleme, restore ve felaket kurtarma tatbikatı
- SLO, alarm, on-call/runbook ve olay müdahale süreci
- Gizlilik, kullanım koşulları, destek ve hesap/veri silme operasyonu
- Güvenlik testi, bağımlılık/container tarama ve anahtar döndürme tatbikatı
- Sağlayıcı kesintisi, maliyet anomalisi ve ödeme kesintisi senaryoları

**Çıkış ölçütleri**

- Kritik kullanıcı yolculukları için kararlaştırılan SLO ve hata bütçesi karşılanır.
- Kritik/yüksek güvenlik bulgusu kalmamıştır.
- Restore, rollback ve olay müdahalesi sorumlu ekipçe uygulanmıştır.
- Ürün metric'leri ve birim ekonomi production kararını destekler.

## 10. Aşama 7 — OpenCode tabanlı kod ajanı (gelecek)

**Amaç:** Çekirdek çalışma alanını, açık izinlerle güvenli kod görevi yürütebilen ajanla genişletmek.

- Kullanıcı araştırması ve görev/izin UX prototipi
- OpenCode entegrasyon sözleşmesi ve sürüm/tedarik zinciri değerlendirmesi
- Geçici sandbox orkestrasyonu ve workspace yaşam döngüsü
- Ağ allowlist, kısa ömürlü secret, kaynak ve süre limitleri
- Araç/komut risk sınıfları, kullanıcı onayı, audit trail ve iptal
- Diff görüntüleme, test sonucu, değişiklik uygulama ve geri alma akışı
- Kötü niyetli repo/prompt, secret sızdırma ve sandbox kaçışı güvenlik testleri
- Ajan görevi başına maliyet/kota modeli

**Giriş koşulları**

- Önceki aşamaların kimlik, kota, gözlemlenebilirlik ve billing temelleri olgundur.
- Sandbox tehdit modeli ve prototipi bağımsız güvenlik incelemesinden geçmiştir.
- Kullanıcının hangi eylemde onay vereceği ürün politikası olarak tanımlanmıştır.

**Çıkış ölçütleri**

- Ajan yalnızca atanmış geçici workspace içinde ve tanımlı izinlerle çalışır.
- Ağ, secret ve kaynak sınırlarının aşılamadığı otomatik testlerle gösterilir.
- Kullanıcı her dosya değişikliğini uygulamadan önce inceleyebilir; görev iptal/temizliği güvenilirdir.
- Kapalı beta kalite, güvenlik ve maliyet hedefleri karşılanır.

## 11. Yatay çalışma alanları

Her aşamada devam eder:

- **Güvenlik ve gizlilik:** tehdit modeli, veri minimizasyonu, silme ve audit
- **Erişilebilirlik:** klavye, ekran okuyucu, kontrast, hareket ve hata açıklamaları
- **Gözlemlenebilirlik:** kullanıcı içeriği olmadan log, metric, trace ve maliyet görünürlüğü
- **Kalite:** birim, entegrasyon, sözleşme, E2E ve güvenlik regresyon testleri
- **Dokümantasyon:** ADR, API sözleşmesi, runbook ve kullanıcı yardımı
- **Maliyet:** sağlayıcı, depolama ve compute bütçesi; anomali ve tavanlar

## 12. Ertelenenler ve yeniden değerlendirme sinyalleri

- **Ekip/organizasyon özellikleri:** tek kullanıcı elde tutması güçlü olduğunda
- **Mobil uygulama:** mobil web kullanım ve ihtiyaç verisi doğruladığında
- **Birden fazla AI sağlayıcıya aktif yönlendirme:** dayanıklılık veya maliyet faydası operasyon karmaşıklığını aştığında
- **Mikroservislere ayrışma:** bağımsız ölçekleme/deploy ihtiyacı ölçülüp modüler monolit sınırları yetersiz kaldığında
- **Kubernetes veya yönetilen orkestrasyon:** tek sunucu Compose kullanılabilirlik/ölçek hedeflerini karşılamadığında
- **Kurumsal özellikler:** müşteri talebi SSO, audit export, veri bölgesi ve sözleşme maliyetini doğruladığında

## 13. Yol haritası yönetimi

Her kilometre taşı başlamadan önce kapsam, sorumlu, risk, metric ve geri alma planı tanımlanır. Aşama sonunda çıkış ölçütleri kanıtlarla değerlendirilir. Kapsam değişiklikleri bu belgeye; ürün davranışı değişiklikleri `PRODUCT.md` dosyasına; mimari kararlar `ARCHITECTURE.md` ve ilgili ADR'lere yansıtılır.
