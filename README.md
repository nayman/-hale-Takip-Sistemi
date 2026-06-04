# İhale ve Operasyon Yönetim Sistemi (SaaS)

Bu proje, 4734 sayılı Kamu İhale Kanunu'na tabi olan ihaleler ve özel ihalelerdeki tüm süreçleri uçtan uca tek bir platform üzerinden yönetmek amacıyla geliştirilmiş kapsamlı bir **SaaS (Hizmet Olarak Yazılım)** sistemidir.

## 🎯 Projenin Amacı

Şirketlerin ihale süreçlerinde karşılaştığı dağınık yapıyı ortadan kaldırmak ve tüm aşamaları (hazırlık, tekliflendirme, sözleşme, hakediş ve tahsilat) dijitalleştirerek yasal sürelere tam uyum sağlamaktır.

## 🚀 Temel Özellikler

- **Teklif ve Yaklaşık Maliyet (YM) Yönetimi:** Rakiplerin analiz edilmesi, tekliflerin versiyonlanması ve sınır değer hesaplamaları.
- **Hukuki Süreç ve İtiraz Takibi:** KİK (Kamu İhale Kurumu) itiraz süreçleri, yasal bekleme süreleri ve otomatik alarm/hatırlatmalar.
- **Sözleşme Yönetimi:** Kesin teminatların takibi, 10. madde evraklarının yönetimi; damga vergisi, karar pulu, KİK payı gibi otomatik maliyet hesaplamaları.
- **Hakediş ve Tahsilat:** Brüt hakedişten ceza ve yasal kesintilerin otomatik düşülerek net ödemenin takibi; banka entegrasyonları.
- **İK ve Personel Atamaları:** İhalelere özel personel havuzu ve puantaj yönetimi, asgari ücret bazlı maliyet takibi.
- **Kurumsal Hafıza ve Belge Arşivi:** Yandex Disk entegrasyonu sayesinde her ihale için otomatik klasör yapısı oluşturulması ve belgelerin güvenle (versiyonlanarak) saklanması.
- **Rol Tabanlı Erişim Sistemi (RBAC):** İhale Sorumlusu, Muhasebe, Operasyon gibi rollerle veriye güvenli ve kontrollü erişim.

## 🛠️ Kullanılan Teknolojiler

- **Frontend & Backend:** Next.js (App Router), TypeScript
- **Veritabanı:** PostgreSQL (Multi-tenant mimari, Row-Level Security)
- **ORM:** Prisma
- **Kimlik Doğrulama:** NextAuth.js v5
- **Arka Plan İşlemleri & Zamanlayıcı:** BullMQ (Redis)
- **Depolama (Storage):** Yandex Disk API (Adapter Pattern)
- **UI & Stil:** Tailwind CSS

Bu platform, bir firmanın tüm departmanlarının senkronize çalışmasını sağlayarak hataları, zaman kayıplarını ve yasal ceza risklerini minimuma indirmeyi hedefler.
