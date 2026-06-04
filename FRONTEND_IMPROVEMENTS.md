# İhale Yönetim Sistemi - Frontend İyileştirmeleri

## Yapılan İyileştirmeler

### 1. React Hook Form Entegrasyonu
- Form yönetimi için `react-hook-form` kullanıldı
- Zod ile şema doğrulaması eklendi
- Giriş formu güncellendi
- Hata mesajları kullanıcı dostu hale getirildi

### 2. XSS Koruması
- HTML etiketlerini ve tehlikeli içerikleri temizleyen sanitizasyon fonksiyonları eklendi
- Harici kütüphane gerektirmez, basit ve güvenli
- Tüm API girişleri ve form verileri otomatik olarak temizleniyor

### 3. Rate Limiting
- Redis tabanlı hız sınırlama sistemi eklendi
- Kayıt API'sine IP başına 5 istek / 1 dakika kuralı uygulandı
- 429 Too Many Requests yanıtı döndürülüyor

### 4. Testler
- **E2E Testleri**: Playwright ile temel sayfa yükleme testleri
- **Unit Testleri**: Vitest ile sanitizasyon fonksiyonları testleri
- Test komutları package.json'a eklendi

## Kullanım

### Paketleri Yükle
```bash
npm install react-hook-form @hookform/resolvers @playwright/test --legacy-peer-deps
npm install @types/react-hook-form --save-dev
```

### Testleri Çalıştır
- Unit testleri: `npm run test`
- E2E testleri: `npm run test:e2e`

### Development Sunucusu
```bash
npm run dev
```
