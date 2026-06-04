// 4734 Sayılı Kamu İhale Kanunu – Madde 10 Belge Şablonları
// Ekonomik/Mali, Mesleki/Teknik ve İhale Dışı Bırakılma belgelerinin
// tam listesi, yasal dayanakları ve şablon içerikleri

// ── Tip Tanımları ──────────────────────────────────────────────────────────────

export type BelgeTipiKodu =
  // Ekonomik ve Mali
  | "BANKA_REFERANS"
  | "BILANCO"
  | "IS_HACMI"
  // Mesleki ve Teknik
  | "ODA_KAYIT"
  | "IMZA_SIRKULER"
  | "IS_DENEYIM"
  | "TEKNIK_PERSONEL"
  | "MAKINE_TECHIZAT"
  | "KALITE_STANDART"
  // İhale Dışı Bırakılma (10/4. fıkra)
  | "IFLAS_KONKORDATO"
  | "SGK_BORCU"
  | "VERGI_BORCU"
  | "ADLI_SICIL"
  | "IHALE_DURUM"
  | "TICARET_SICIL"
  // Genel
  | "DIGER";

export interface BelgeSablonAlani {
  /** Alanın görünen adı */
  etiket: string;
  /** Formda kullanılacak alan anahtarı */
  anahtar: string;
  /** HTML input tipi */
  tip: "text" | "date" | "number" | "textarea" | "select";
  /** Zorunlu alan mı? */
  zorunlu: boolean;
  /** Placeholder metni */
  ipucu?: string;
  /** Select tipi için seçenekler */
  secenekler?: string[];
}

export interface BelgeSablon {
  /** Belge adı */
  ad: string;
  /** Enum kodu (DB'ye kaydedilir) */
  belgeTipiKodu: BelgeTipiKodu;
  /** Kanundaki bent referansı */
  bentRef: string;
  /** Belgenin kısa açıklaması */
  aciklama: string;
  /** Belgeyi veren kurum/makam */
  verenMakam: string;
  /** Geçerlilik süresi bilgisi */
  gecerlilikSuresi: string;
  /** Yasal dayanak metni */
  yasalDayanak: string;
  /** İhale aşamasında mı yoksa sözleşme öncesinde mi istenir */
  asama: "TEKLIF" | "SOZLESME_ONCESI" | "HER_IKI";
  /** Şablon form alanları */
  alanlar: BelgeSablonAlani[];
}

export interface OnMaddKategori {
  /** Kategori başlığı */
  category: string;
  /** Kanun fıkra numarası */
  fikra: string;
  /** Kategori açıklaması */
  aciklama: string;
  /** Bu kategorideki belge adları (geriye uyumluluk) */
  items: string[];
  /** Detaylı belge şablonları */
  sablonlar: BelgeSablon[];
}

// ── 1. Ekonomik ve Mali Yeterliğe İlişkin Belgeler ─────────────────────────────

const ekonomikMaliSablonlar: BelgeSablon[] = [
  {
    ad: "Banka Referans Mektubu",
    belgeTipiKodu: "BANKA_REFERANS",
    bentRef: "10/1-a",
    aciklama:
      "İsteklinin bankalardaki kullanılmamış nakdi veya gayrinakdi kredisini ya da üzerinde kısıtlama bulunmayan mevduatını gösteren belge.",
    verenMakam: "Bankalar / Finans Kuruluşları",
    gecerlilikSuresi: "İhale tarihinden önceki 30 gün içinde düzenlenmiş olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/1-a, Yapım İşleri İhaleleri Uygulama Yönetmeliği Madde 34",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Banka Adı",
        anahtar: "bankaAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Ziraat Bankası A.Ş.",
      },
      {
        etiket: "Şube Adı",
        anahtar: "subeAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Ankara Ticari Şube",
      },
      {
        etiket: "Mektup Tarihi",
        anahtar: "mektupTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Mektup Numarası",
        anahtar: "mektupNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: REF-2026/1234",
      },
      {
        etiket: "Kullanılmamış Nakdi Kredi (TL)",
        anahtar: "nakdiKredi",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Kullanılmamış Gayrinakdi Kredi (TL)",
        anahtar: "gayrinakdiKredi",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Üzerinde Kısıtlama Olmayan Mevduat (TL)",
        anahtar: "mevduat",
        tip: "number",
        zorunlu: false,
        ipucu: "0.00",
      },
    ],
  },
  {
    ad: "Mali Bilanço ve Gelir Tablosu",
    belgeTipiKodu: "BILANCO",
    bentRef: "10/1-b",
    aciklama:
      "İlgili mevzuat uyarınca yayınlanması zorunlu olan, bir önceki yıla ait ya da idarece istenen yılların yıl sonu bilançosu veya bilançonun gerekli bölümleri ile gelir tablosu.",
    verenMakam: "Yeminli Mali Müşavir / SMMM / Vergi Dairesi",
    gecerlilikSuresi:
      "İhalenin yapıldığı yıldan önceki yıla ait olmalıdır; ilgili yılın bilançosu yayımlanmamışsa bir önceki yıl kabul edilir",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/1-b, Yapım İşleri İhaleleri Uygulama Yönetmeliği Madde 35",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Bilanço Yılı",
        anahtar: "bilancoYili",
        tip: "number",
        zorunlu: true,
        ipucu: "Örn: 2025",
      },
      {
        etiket: "Toplam Aktifler (TL)",
        anahtar: "toplamAktif",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Dönen Varlıklar (TL)",
        anahtar: "donenVarlik",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Kısa Vadeli Borçlar (TL)",
        anahtar: "kisaVadeliBorc",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Öz Kaynaklar (TL)",
        anahtar: "ozKaynak",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Banka Borçları (TL)",
        anahtar: "bankaBorclari",
        tip: "number",
        zorunlu: false,
        ipucu: "0.00",
      },
      {
        etiket: "Net Satışlar (Ciro) (TL)",
        anahtar: "netSatislar",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Cari Oran (Hesaplanan)",
        anahtar: "cariOran",
        tip: "text",
        zorunlu: false,
        ipucu: "Dönen Varlıklar / Kısa Vadeli Borçlar ≥ 0,75",
      },
      {
        etiket: "Onaylayan YMM/SMMM Adı",
        anahtar: "onaylayanMM",
        tip: "text",
        zorunlu: true,
        ipucu: "Adı ve sicil numarası",
      },
    ],
  },
  {
    ad: "İş Hacmini Gösteren Belgeler",
    belgeTipiKodu: "IS_HACMI",
    bentRef: "10/1-c",
    aciklama:
      "İsteklinin ihalenin yapıldığı yıldan önceki yıla ait toplam cirosunu veya ihale konusu iş ile ilgili taahhüdü altındaki ve bitirdiği iş miktarını gösteren belgeler.",
    verenMakam: "YMM / SMMM / Vergi Dairesi",
    gecerlilikSuresi:
      "İhalenin yapıldığı yıldan önceki yılın verilerine ait olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/1-c, Uygulama Yönetmelikleri Madde 36",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Referans Yılı",
        anahtar: "referansYili",
        tip: "number",
        zorunlu: true,
        ipucu: "Örn: 2025",
      },
      {
        etiket: "Toplam Ciro (TL)",
        anahtar: "toplamCiro",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "İhale Konusu İşe Ait Ciro (TL)",
        anahtar: "ihaleKonusuCiro",
        tip: "number",
        zorunlu: false,
        ipucu: "0.00",
      },
      {
        etiket: "Taahhüt Altındaki İş Miktarı (TL)",
        anahtar: "taahhutMiktar",
        tip: "number",
        zorunlu: false,
        ipucu: "0.00",
      },
      {
        etiket: "Bitirilen İş Miktarı (TL)",
        anahtar: "bitirilenisMiktar",
        tip: "number",
        zorunlu: false,
        ipucu: "0.00",
      },
      {
        etiket: "Belge Açıklaması",
        anahtar: "aciklama",
        tip: "textarea",
        zorunlu: false,
        ipucu: "Ek açıklama ve fatura detayları",
      },
    ],
  },
];

// ── 2. Mesleki ve Teknik Yeterliğe İlişkin Belgeler ────────────────────────────

const meslekiTeknikSablonlar: BelgeSablon[] = [
  {
    ad: "Oda Kayıt Belgesi",
    belgeTipiKodu: "ODA_KAYIT",
    bentRef: "10/2-a",
    aciklama:
      "Mevzuatı gereği ilgili Ticaret ve/veya Sanayi Odası veya Esnaf ve Sanatkârlar Odasına kayıtlı olduğunu gösteren belge.",
    verenMakam: "Ticaret Odası / Sanayi Odası / Esnaf ve Sanatkârlar Odası",
    gecerlilikSuresi:
      "İhalenin yapıldığı yıl içinde alınmış olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-a, Yapım İşleri İhaleleri Uygulama Yönetmeliği Madde 38",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Oda Adı",
        anahtar: "odaAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Ankara Ticaret Odası",
      },
      {
        etiket: "Sicil / Kayıt Numarası",
        anahtar: "sicilNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: ATO-12345",
      },
      {
        etiket: "Kayıt Tarihi",
        anahtar: "kayitTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Belge Düzenlenme Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Gerçek / Tüzel Kişi",
        anahtar: "kisiTipi",
        tip: "select",
        zorunlu: true,
        secenekler: ["Gerçek Kişi", "Tüzel Kişi"],
      },
    ],
  },
  {
    ad: "İmza Sirküleri / İmza Beyannamesi",
    belgeTipiKodu: "IMZA_SIRKULER",
    bentRef: "10/2-b",
    aciklama:
      "Teklif vermeye ve belgeleri imzalamaya yasal olarak yetkili olunduğunu gösteren noter onaylı imza sirküleri veya imza beyannamesi.",
    verenMakam: "Noterlik",
    gecerlilikSuresi:
      "Geçerlilik süresi noterlik tarafından belirlenir; genellikle süresiz veya 1 yıllık düzenlenir",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-b, Uygulama Yönetmelikleri",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Noterlik Adı",
        anahtar: "noterlikAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Ankara 15. Noterliği",
      },
      {
        etiket: "Yevmiye Numarası",
        anahtar: "yevmiyeNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: 2026/12345",
      },
      {
        etiket: "Düzenlenme Tarihi",
        anahtar: "duzenlenmeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Belge Türü",
        anahtar: "belgeTuru",
        tip: "select",
        zorunlu: true,
        secenekler: ["İmza Sirküleri (Tüzel Kişi)", "İmza Beyannamesi (Gerçek Kişi)"],
      },
      {
        etiket: "Yetkili Kişi(ler) Adı Soyadı",
        anahtar: "yetkiliKisiler",
        tip: "textarea",
        zorunlu: true,
        ipucu: "Her satıra bir kişi yazınız",
      },
    ],
  },
  {
    ad: "İş Deneyim Belgeleri",
    belgeTipiKodu: "IS_DENEYIM",
    bentRef: "10/2-c",
    aciklama:
      "Kamu veya özel sektörde ihale konusu işe benzer işlerdeki tecrübeyi gösteren İş Bitirme, İş Durum, İş Yönetme veya İş Denetleme belgeleri.",
    verenMakam:
      "Kamu kurumları (doğrudan) / Özel sektör (noter onaylı sözleşme + fatura)",
    gecerlilikSuresi:
      "İlk ilan / davet tarihinden geriye doğru son 15 yıl (yapım), 5 yıl (hizmet/mal) içinde tamamlanan işler",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-c, Uygulama Yönetmelikleri Madde 39-43",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Belge Türü",
        anahtar: "belgeTuru",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "İş Bitirme Belgesi",
          "İş Durum Belgesi",
          "İş Yönetme Belgesi",
          "İş Denetleme Belgesi",
        ],
      },
      {
        etiket: "İşin Adı",
        anahtar: "isinAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Tamamlanan / devam eden işin tam adı",
      },
      {
        etiket: "İşveren / İdare Adı",
        anahtar: "isverenAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Karayolları Genel Müdürlüğü",
      },
      {
        etiket: "Sözleşme Bedeli (TL)",
        anahtar: "sozlesmeBedeli",
        tip: "number",
        zorunlu: true,
        ipucu: "0.00",
      },
      {
        etiket: "Belge Tutarı (Güncellenmiş) (TL)",
        anahtar: "belgeTutari",
        tip: "number",
        zorunlu: true,
        ipucu: "KGÜDF ile güncellenmiş tutar",
      },
      {
        etiket: "İş Başlangıç Tarihi",
        anahtar: "isBaslangic",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "İş Bitiş / Kabul Tarihi",
        anahtar: "isBitis",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Belge Numarası",
        anahtar: "belgeNo",
        tip: "text",
        zorunlu: false,
        ipucu: "EKAP üzerinden alınan belge numarası",
      },
    ],
  },
  {
    ad: "Teknik Personel Bildirimi",
    belgeTipiKodu: "TEKNIK_PERSONEL",
    bentRef: "10/2-d",
    aciklama:
      "İhale konusu iş için istihdam edileceği taahhüt edilen anahtar teknik personel ve teknik personele ait diploma, oda kayıt belgesi ve özgeçmişler.",
    verenMakam: "İsteklinin kendi beyanı + ilgili meslek odaları",
    gecerlilikSuresi: "İhale tarihinde geçerli olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-d, Uygulama Yönetmelikleri Madde 40",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Personel Adı Soyadı",
        anahtar: "personelAd",
        tip: "text",
        zorunlu: true,
        ipucu: "Adı Soyadı",
      },
      {
        etiket: "Unvanı / Pozisyonu",
        anahtar: "unvan",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Şantiye Şefi, Proje Müdürü",
      },
      {
        etiket: "Meslek / Uzmanlık Alanı",
        anahtar: "meslek",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: İnşaat Mühendisi",
      },
      {
        etiket: "Diploma No",
        anahtar: "diplomaNo",
        tip: "text",
        zorunlu: false,
        ipucu: "Mezuniyet belgesi numarası",
      },
      {
        etiket: "Oda Sicil Numarası",
        anahtar: "odaSicilNo",
        tip: "text",
        zorunlu: false,
        ipucu: "İlgili meslek odasına kayıt numarası",
      },
      {
        etiket: "Deneyim Süresi (Yıl)",
        anahtar: "deneyimYili",
        tip: "number",
        zorunlu: true,
        ipucu: "Mesleki deneyim süresi",
      },
      {
        etiket: "SGK İşe Giriş Bildirgesi Tarihi",
        anahtar: "sgkGirisTarihi",
        tip: "date",
        zorunlu: false,
      },
    ],
  },
  {
    ad: "Makine, Teçhizat ve Ekipman Belgeleri",
    belgeTipiKodu: "MAKINE_TECHIZAT",
    bentRef: "10/2-e",
    aciklama:
      "İşin yapılmasında kullanılacak yapı araçlarına, iş makinelerine veya üretim tesislerine ait ruhsat, fatura ya da taahhütname belgeleri.",
    verenMakam:
      "Trafik Tescil / Sanayi ve Ticaret İl Müdürlüğü / Noter (kiralık ise)",
    gecerlilikSuresi:
      "Ruhsatlar güncel olmalı; kira sözleşmeleri ihale süresini kapsamalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-e, Yapım İşleri İhaleleri Uygulama Yönetmeliği Madde 41",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Makine / Ekipman Adı",
        anahtar: "ekipmanAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Paletli Ekskavatör CAT 320",
      },
      {
        etiket: "Marka / Model",
        anahtar: "markaModel",
        tip: "text",
        zorunlu: true,
        ipucu: "Marka ve model bilgisi",
      },
      {
        etiket: "Kapasite / Güç",
        anahtar: "kapasite",
        tip: "text",
        zorunlu: false,
        ipucu: "Örn: 150 HP, 20 ton",
      },
      {
        etiket: "Adet",
        anahtar: "adet",
        tip: "number",
        zorunlu: true,
        ipucu: "1",
      },
      {
        etiket: "Sahiplik Durumu",
        anahtar: "sahiplikDurumu",
        tip: "select",
        zorunlu: true,
        secenekler: ["Öz Mal", "Kiralık", "Taahhütname ile Sağlanacak"],
      },
      {
        etiket: "Ruhsat / Fatura Numarası",
        anahtar: "ruhsatNo",
        tip: "text",
        zorunlu: false,
        ipucu: "Tescil belgesi veya fatura numarası",
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: false,
      },
    ],
  },
  {
    ad: "Kalite ve Standart Belgeleri",
    belgeTipiKodu: "KALITE_STANDART",
    bentRef: "10/2-f",
    aciklama:
      "İdarelerin işin niteliğine göre talep ettiği ISO standartları, TSE belgeleri, hizmet yeterlilik sertifikaları veya akreditasyon belgeleri.",
    verenMakam: "TSE / TÜRKAK / Akredite Belgelendirme Kuruluşları",
    gecerlilikSuresi:
      "Belge üzerinde yazılı geçerlilik süresi içinde olmalıdır (genellikle 3 yıl)",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/2-f, Uygulama Yönetmelikleri Madde 42",
    asama: "TEKLIF",
    alanlar: [
      {
        etiket: "Belge / Sertifika Adı",
        anahtar: "sertifikaAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: ISO 9001:2015 Kalite Yönetim Sistemi",
      },
      {
        etiket: "Belge Türü",
        anahtar: "belgeTuru",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "ISO 9001 (Kalite Yönetim)",
          "ISO 14001 (Çevre Yönetim)",
          "ISO 45001 (İSG Yönetim)",
          "TSE Hizmet Yeterlilik Belgesi",
          "CE Belgesi",
          "Kapasite Raporu",
          "Diğer Akreditasyon",
        ],
      },
      {
        etiket: "Belge Numarası",
        anahtar: "belgeNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Sertifika numarası",
      },
      {
        etiket: "Veren Kuruluş",
        anahtar: "verenKurulus",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: TÜRKAK, TSE",
      },
      {
        etiket: "Düzenlenme Tarihi",
        anahtar: "duzenlenmeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Geçerlilik Bitiş Tarihi",
        anahtar: "gecerlilikBitis",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Kapsam Açıklaması",
        anahtar: "kapsam",
        tip: "textarea",
        zorunlu: false,
        ipucu: "Belgenin kapsadığı faaliyet alanları",
      },
    ],
  },
];

// ── 3. İhale Dışı Bırakılma Koşullarının Olmadığını Gösteren Belgeler ──────────

const ihaleDisiSablonlar: BelgeSablon[] = [
  {
    ad: "İflas ve Konkordato Durum Belgesi",
    belgeTipiKodu: "IFLAS_KONKORDATO",
    bentRef: "10/4-a,b",
    aciklama:
      "Ticaret Sicil Müdürlüklerinden alınan, firmanın iflas etmediğini, tasfiye halinde olmadığını veya konkordato ilan etmediğini gösteren belge.",
    verenMakam: "Ticaret Sicil Müdürlüğü / İcra Müdürlüğü",
    gecerlilikSuresi:
      "İhale tarihinden önceki 30 gün içinde düzenlenmiş olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/4-a ve 10/4-b",
    asama: "SOZLESME_ONCESI",
    alanlar: [
      {
        etiket: "Firma / Şirket Unvanı",
        anahtar: "firmaUnvan",
        tip: "text",
        zorunlu: true,
        ipucu: "Ticaret sicilindeki resmi unvan",
      },
      {
        etiket: "Ticaret Sicil Numarası",
        anahtar: "ticaretSicilNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Mersis numarası veya sicil no",
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Belge Numarası",
        anahtar: "belgeNo",
        tip: "text",
        zorunlu: true,
      },
      {
        etiket: "Durum Beyanı",
        anahtar: "durumBeyani",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "İflas etmemiştir, tasfiye halinde değildir",
          "Konkordato ilan etmemiştir",
          "Her iki duruma da uygundur",
        ],
      },
    ],
  },
  {
    ad: "SGK Prim Borcu Yoktur Belgesi",
    belgeTipiKodu: "SGK_BORCU",
    bentRef: "10/4-c",
    aciklama:
      "Sosyal Güvenlik Kurumu'ndan alınan, Türkiye genelinde kesinleşmiş sosyal güvenlik prim borcu olmadığını gösteren belge.",
    verenMakam: "Sosyal Güvenlik Kurumu (SGK)",
    gecerlilikSuresi:
      "İhale tarihinden önceki 15 gün içinde düzenlenmiş olmalıdır (e-Borcu Yoktur belgesi anlık sorgulanır)",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/4-c, 5510 Sayılı Kanun",
    asama: "SOZLESME_ONCESI",
    alanlar: [
      {
        etiket: "Firma / Şirket Unvanı",
        anahtar: "firmaUnvan",
        tip: "text",
        zorunlu: true,
        ipucu: "SGK'da kayıtlı işveren unvanı",
      },
      {
        etiket: "İşyeri Sicil Numarası",
        anahtar: "isyeriSicilNo",
        tip: "text",
        zorunlu: true,
        ipucu: "SGK İşyeri Sicil No",
      },
      {
        etiket: "Vergi Kimlik Numarası",
        anahtar: "vergiNo",
        tip: "text",
        zorunlu: true,
        ipucu: "10 haneli VKN",
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Barkod / Doğrulama Kodu",
        anahtar: "barkodKodu",
        tip: "text",
        zorunlu: false,
        ipucu: "e-Devlet / e-SGK doğrulama kodu",
      },
      {
        etiket: "Sonuç",
        anahtar: "sonuc",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "Borcu Yoktur",
          "Borcu Vardır (Açıklama Gerekli)",
        ],
      },
    ],
  },
  {
    ad: "Vergi Borcu Yoktur Belgesi",
    belgeTipiKodu: "VERGI_BORCU",
    bentRef: "10/4-d",
    aciklama:
      "Vergi dairesinden alınan, 6183 sayılı Kanunun 22/A maddesi kapsamında kesinleşmiş vergi borcu olmadığını gösteren belge.",
    verenMakam: "Gelir İdaresi Başkanlığı / Vergi Dairesi Müdürlüğü",
    gecerlilikSuresi:
      "İhale tarihinden önceki 15 gün içinde düzenlenmiş olmalıdır (e-Borcu Yoktur belgesi anlık sorgulanır)",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/4-d, 6183 Sayılı Kanun Madde 22/A",
    asama: "SOZLESME_ONCESI",
    alanlar: [
      {
        etiket: "Firma / Şirket Unvanı",
        anahtar: "firmaUnvan",
        tip: "text",
        zorunlu: true,
        ipucu: "Vergi dairesinde kayıtlı unvan",
      },
      {
        etiket: "Vergi Kimlik Numarası",
        anahtar: "vergiNo",
        tip: "text",
        zorunlu: true,
        ipucu: "10 haneli VKN",
      },
      {
        etiket: "Bağlı Vergi Dairesi",
        anahtar: "vergiDairesi",
        tip: "text",
        zorunlu: true,
        ipucu: "Örn: Ankara Başkent Vergi Dairesi",
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Barkod / Doğrulama Kodu",
        anahtar: "barkodKodu",
        tip: "text",
        zorunlu: false,
        ipucu: "e-Devlet / GİB doğrulama kodu",
      },
      {
        etiket: "Sonuç",
        anahtar: "sonuc",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "Vadesi Geçmiş Borcu Yoktur",
          "Borcu Vardır (Açıklama Gerekli)",
        ],
      },
    ],
  },
  {
    ad: "Adli Sicil Kaydı",
    belgeTipiKodu: "ADLI_SICIL",
    bentRef: "10/4-e",
    aciklama:
      "İhale tarihinden önceki 5 yıl içinde, mesleki faaliyetlerle ilgili bir suçtan dolayı yargı kararıyla hüküm giyilmediğini gösteren adli sicil belgesi. Şirket müdürleri, ortakları ve yönetim kurulu üyeleri için ayrı ayrı alınır.",
    verenMakam: "Adli Sicil ve İstatistik Genel Müdürlüğü / e-Devlet",
    gecerlilikSuresi:
      "İhale tarihinden önceki 30 gün içinde düzenlenmiş olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/4-e",
    asama: "SOZLESME_ONCESI",
    alanlar: [
      {
        etiket: "Adı Soyadı",
        anahtar: "adSoyad",
        tip: "text",
        zorunlu: true,
        ipucu: "Belge sahibi kişinin adı soyadı",
      },
      {
        etiket: "T.C. Kimlik Numarası",
        anahtar: "tcKimlikNo",
        tip: "text",
        zorunlu: true,
        ipucu: "11 haneli TC Kimlik No",
      },
      {
        etiket: "Görev / Pozisyon",
        anahtar: "gorev",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "Şirket Müdürü",
          "Yönetim Kurulu Başkanı",
          "Yönetim Kurulu Üyesi",
          "Ortak (%50'den fazla hisseye sahip)",
          "Gerçek Kişi İstekli",
        ],
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Barkod / Doğrulama Kodu",
        anahtar: "barkodKodu",
        tip: "text",
        zorunlu: false,
        ipucu: "e-Devlet üzerinden alındıysa doğrulama kodu",
      },
      {
        etiket: "Sonuç",
        anahtar: "sonuc",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "Adli sicil kaydı bulunmamaktadır",
          "Arşiv kaydı mevcut (Açıklama Gerekli)",
          "Adli sicil kaydı mevcut (Açıklama Gerekli)",
        ],
      },
    ],
  },
  {
    ad: "İhale Durum Belgesi",
    belgeTipiKodu: "IHALE_DURUM",
    bentRef: "10/4-g",
    aciklama:
      "Ticaret veya Sanayi Odasından alınan, ihale tarihi itibarıyla mesleki faaliyetten men edilmediğini gösteren belge.",
    verenMakam: "Ticaret Odası / Sanayi Odası",
    gecerlilikSuresi:
      "İhale tarihinden önceki 30 gün içinde düzenlenmiş olmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10/4-g",
    asama: "SOZLESME_ONCESI",
    alanlar: [
      {
        etiket: "Firma / Şirket Unvanı",
        anahtar: "firmaUnvan",
        tip: "text",
        zorunlu: true,
        ipucu: "Ticaret siciline kayıtlı resmi unvan",
      },
      {
        etiket: "Oda Adı",
        anahtar: "odaAdi",
        tip: "text",
        zorunlu: true,
        ipucu: "Belgeyi veren oda",
      },
      {
        etiket: "Sicil Numarası",
        anahtar: "sicilNo",
        tip: "text",
        zorunlu: true,
      },
      {
        etiket: "Belge Tarihi",
        anahtar: "belgeTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "Belge Numarası",
        anahtar: "belgeNo",
        tip: "text",
        zorunlu: true,
      },
      {
        etiket: "Durum Beyanı",
        anahtar: "durumBeyani",
        tip: "text",
        zorunlu: false,
        ipucu: "Mesleki faaliyetten men edilmemiştir",
      },
    ],
  },
  {
    ad: "Ticaret Sicil Gazetesi",
    belgeTipiKodu: "TICARET_SICIL",
    bentRef: "10/4 (Genel)",
    aciklama:
      "Şirketin ortaklık yapısını, yönetimini ve güncel durumunu gösteren ticaret sicil gazetesi kayıtları. Tüzel kişiliğin temsil ve ilzam yetkilerinin, son ortaklık yapısının teyidi için istenir.",
    verenMakam: "Türkiye Ticaret Sicili Gazetesi Müdürlüğü / TOBB",
    gecerlilikSuresi:
      "Güncel bilgileri yansıtan en son yayımlanmış gazeteler sunulmalıdır",
    yasalDayanak:
      "4734 Sayılı Kanun Madde 10, Türk Ticaret Kanunu ilgili maddeleri",
    asama: "HER_IKI",
    alanlar: [
      {
        etiket: "Firma / Şirket Unvanı",
        anahtar: "firmaUnvan",
        tip: "text",
        zorunlu: true,
        ipucu: "Ticaret sicilindeki resmi unvan",
      },
      {
        etiket: "Ticaret Sicil Numarası",
        anahtar: "ticaretSicilNo",
        tip: "text",
        zorunlu: true,
        ipucu: "Mersis numarası",
      },
      {
        etiket: "Gazete Sayısı",
        anahtar: "gazeteSayisi",
        tip: "text",
        zorunlu: true,
        ipucu: "Ticaret Sicil Gazetesi sayı numarası",
      },
      {
        etiket: "Gazete Tarihi",
        anahtar: "gazeteTarihi",
        tip: "date",
        zorunlu: true,
      },
      {
        etiket: "İlan İçeriği",
        anahtar: "ilanIcerigi",
        tip: "select",
        zorunlu: true,
        secenekler: [
          "Kuruluş İlanı",
          "Adres Değişikliği",
          "Unvan Değişikliği",
          "Ortaklık Yapısı Değişikliği",
          "Sermaye Artırımı",
          "Yönetim Kurulu Değişikliği",
          "Tüm Değişiklikleri Gösteren Son Gazete",
        ],
      },
      {
        etiket: "Notlar",
        anahtar: "notlar",
        tip: "textarea",
        zorunlu: false,
        ipucu: "Ek açıklamalar",
      },
    ],
  },
];

// ── Ana Export: Kategori Listesi ─────────────────────────────────────────────────

export const ONMADDE_TEMPLATES: OnMaddKategori[] = [
  {
    category: "Ekonomik ve Mali Yeterliğe İlişkin Belgeler",
    fikra: "10/1. Fıkra",
    aciklama:
      "İsteklinin finansal gücünü kanıtlamak amacıyla idareler tarafından talep edilen belgelerdir.",
    items: ekonomikMaliSablonlar.map((s) => s.ad),
    sablonlar: ekonomikMaliSablonlar,
  },
  {
    category: "Mesleki ve Teknik Yeterliğe İlişkin Belgeler",
    fikra: "10/2. Fıkra",
    aciklama:
      "İsteklinin ihaleye konu işi yapabilecek uzmanlığa, tecrübeye ve yasal yetkiye sahip olduğunu gösteren belgelerdir.",
    items: meslekiTeknikSablonlar.map((s) => s.ad),
    sablonlar: meslekiTeknikSablonlar,
  },
  {
    category:
      "İhale Dışı Bırakılma Koşullarının Olmadığını Gösteren Belgeler (10. Madde 4. Fıkra Belgeleri)",
    fikra: "10/4. Fıkra",
    aciklama:
      "İhaleyi kazanan istekliden, sözleşme imzalanmadan hemen önce durumunu kanıtlaması için zorunlu olarak istenen resmi belgelerdir.",
    items: ihaleDisiSablonlar.map((s) => s.ad),
    sablonlar: ihaleDisiSablonlar,
  },
];

// ── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────────

/** Belge tipi kodundan okunabilir etiket döndürür */
export const BELGE_TIPI_ETIKETLER: Record<BelgeTipiKodu, string> = {
  BANKA_REFERANS: "Banka Referans Mektubu",
  BILANCO: "Mali Bilanço ve Gelir Tablosu",
  IS_HACMI: "İş Hacmini Gösteren Belgeler",
  ODA_KAYIT: "Oda Kayıt Belgesi",
  IMZA_SIRKULER: "İmza Sirküleri / İmza Beyannamesi",
  IS_DENEYIM: "İş Deneyim Belgeleri",
  TEKNIK_PERSONEL: "Teknik Personel Bildirimi",
  MAKINE_TECHIZAT: "Makine, Teçhizat ve Ekipman Belgeleri",
  KALITE_STANDART: "Kalite ve Standart Belgeleri",
  IFLAS_KONKORDATO: "İflas ve Konkordato Durum Belgesi",
  SGK_BORCU: "SGK Prim Borcu Yoktur Belgesi",
  VERGI_BORCU: "Vergi Borcu Yoktur Belgesi",
  ADLI_SICIL: "Adli Sicil Kaydı",
  IHALE_DURUM: "İhale Durum Belgesi",
  TICARET_SICIL: "Ticaret Sicil Gazetesi",
  DIGER: "Diğer",
};

/** Belge tipi koduna göre şablonu bulur */
export function getSablonByKod(kod: BelgeTipiKodu): BelgeSablon | undefined {
  for (const kategori of ONMADDE_TEMPLATES) {
    const sablon = kategori.sablonlar.find((s) => s.belgeTipiKodu === kod);
    if (sablon) return sablon;
  }
  return undefined;
}

/** Tüm belge şablonlarını düz liste olarak döndürür */
export function getTumSablonlar(): BelgeSablon[] {
  return ONMADDE_TEMPLATES.flatMap((k) => k.sablonlar);
}

/** Aşamaya göre (TEKLIF / SOZLESME_ONCESI) belgeleri filtreler */
export function getSablonlarByAsama(
  asama: "TEKLIF" | "SOZLESME_ONCESI"
): BelgeSablon[] {
  return getTumSablonlar().filter(
    (s) => s.asama === asama || s.asama === "HER_IKI"
  );
}

/** Tüm belge tipi kodlarını döndürür (select dropdown için) */
export function getBelgeTipiSecenekleri(): { kod: BelgeTipiKodu; etiket: string }[] {
  return (Object.entries(BELGE_TIPI_ETIKETLER) as [BelgeTipiKodu, string][]).map(
    ([kod, etiket]) => ({ kod, etiket })
  );
}
