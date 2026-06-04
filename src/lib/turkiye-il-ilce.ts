/**
 * Türkiye illeri ve ilçeleri (Otomatik olarak CityDistrictJSONAPI veri kaynağından üretilmiştir)
 * Dropdown menüler için kullanılır
 */

export interface Il {
  kod: string
  ad: string
  plakaKodu: string
  bolge: string
}

export interface Ilce {
  kod: string
  ad: string
  ilKodu: string
}

// Türkiye illeri (81 il)
export const iller: Il[] = [
  {
    "kod": "01",
    "ad": "Adana",
    "plakaKodu": "01",
    "bolge": "Akdeniz"
  },
  {
    "kod": "02",
    "ad": "Adıyaman",
    "plakaKodu": "02",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "03",
    "ad": "Afyonkarahisar",
    "plakaKodu": "03",
    "bolge": "Marmara"
  },
  {
    "kod": "04",
    "ad": "Ağrı",
    "plakaKodu": "04",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "05",
    "ad": "Amasya",
    "plakaKodu": "05",
    "bolge": "Karadeniz"
  },
  {
    "kod": "06",
    "ad": "Ankara",
    "plakaKodu": "06",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "07",
    "ad": "Antalya",
    "plakaKodu": "07",
    "bolge": "Akdeniz"
  },
  {
    "kod": "08",
    "ad": "Artvin",
    "plakaKodu": "08",
    "bolge": "Karadeniz"
  },
  {
    "kod": "09",
    "ad": "Aydın",
    "plakaKodu": "09",
    "bolge": "Ege"
  },
  {
    "kod": "10",
    "ad": "Balıkesir",
    "plakaKodu": "10",
    "bolge": "Marmara"
  },
  {
    "kod": "11",
    "ad": "Bilecik",
    "plakaKodu": "11",
    "bolge": "Marmara"
  },
  {
    "kod": "12",
    "ad": "Bingöl",
    "plakaKodu": "12",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "13",
    "ad": "Bitlis",
    "plakaKodu": "13",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "14",
    "ad": "Bolu",
    "plakaKodu": "14",
    "bolge": "Karadeniz"
  },
  {
    "kod": "15",
    "ad": "Burdur",
    "plakaKodu": "15",
    "bolge": "Akdeniz"
  },
  {
    "kod": "16",
    "ad": "Bursa",
    "plakaKodu": "16",
    "bolge": "Marmara"
  },
  {
    "kod": "17",
    "ad": "Çanakkale",
    "plakaKodu": "17",
    "bolge": "Marmara"
  },
  {
    "kod": "18",
    "ad": "Çankırı",
    "plakaKodu": "18",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "19",
    "ad": "Çorum",
    "plakaKodu": "19",
    "bolge": "Karadeniz"
  },
  {
    "kod": "20",
    "ad": "Denizli",
    "plakaKodu": "20",
    "bolge": "Ege"
  },
  {
    "kod": "21",
    "ad": "Diyarbakır",
    "plakaKodu": "21",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "22",
    "ad": "Edirne",
    "plakaKodu": "22",
    "bolge": "Marmara"
  },
  {
    "kod": "23",
    "ad": "Elazığ",
    "plakaKodu": "23",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "24",
    "ad": "Erzincan",
    "plakaKodu": "24",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "25",
    "ad": "Erzurum",
    "plakaKodu": "25",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "26",
    "ad": "Eskişehir",
    "plakaKodu": "26",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "27",
    "ad": "Gaziantep",
    "plakaKodu": "27",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "28",
    "ad": "Giresun",
    "plakaKodu": "28",
    "bolge": "Karadeniz"
  },
  {
    "kod": "29",
    "ad": "Gümüşhane",
    "plakaKodu": "29",
    "bolge": "Karadeniz"
  },
  {
    "kod": "30",
    "ad": "Hakkari",
    "plakaKodu": "30",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "31",
    "ad": "Hatay",
    "plakaKodu": "31",
    "bolge": "Akdeniz"
  },
  {
    "kod": "32",
    "ad": "Isparta",
    "plakaKodu": "32",
    "bolge": "Akdeniz"
  },
  {
    "kod": "33",
    "ad": "Mersin",
    "plakaKodu": "33",
    "bolge": "Akdeniz"
  },
  {
    "kod": "34",
    "ad": "İstanbul",
    "plakaKodu": "34",
    "bolge": "Marmara"
  },
  {
    "kod": "35",
    "ad": "İzmir",
    "plakaKodu": "35",
    "bolge": "Ege"
  },
  {
    "kod": "36",
    "ad": "Kars",
    "plakaKodu": "36",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "37",
    "ad": "Kastamonu",
    "plakaKodu": "37",
    "bolge": "Karadeniz"
  },
  {
    "kod": "38",
    "ad": "Kayseri",
    "plakaKodu": "38",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "39",
    "ad": "Kırklareli",
    "plakaKodu": "39",
    "bolge": "Marmara"
  },
  {
    "kod": "40",
    "ad": "Kırşehir",
    "plakaKodu": "40",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "41",
    "ad": "Kocaeli",
    "plakaKodu": "41",
    "bolge": "Marmara"
  },
  {
    "kod": "42",
    "ad": "Konya",
    "plakaKodu": "42",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "43",
    "ad": "Kütahya",
    "plakaKodu": "43",
    "bolge": "Ege"
  },
  {
    "kod": "44",
    "ad": "Malatya",
    "plakaKodu": "44",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "45",
    "ad": "Manisa",
    "plakaKodu": "45",
    "bolge": "Ege"
  },
  {
    "kod": "46",
    "ad": "Kahramanmaraş",
    "plakaKodu": "46",
    "bolge": "Akdeniz"
  },
  {
    "kod": "47",
    "ad": "Mardin",
    "plakaKodu": "47",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "48",
    "ad": "Muğla",
    "plakaKodu": "48",
    "bolge": "Ege"
  },
  {
    "kod": "49",
    "ad": "Muş",
    "plakaKodu": "49",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "50",
    "ad": "Nevşehir",
    "plakaKodu": "50",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "51",
    "ad": "Niğde",
    "plakaKodu": "51",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "52",
    "ad": "Ordu",
    "plakaKodu": "52",
    "bolge": "Karadeniz"
  },
  {
    "kod": "53",
    "ad": "Rize",
    "plakaKodu": "53",
    "bolge": "Karadeniz"
  },
  {
    "kod": "54",
    "ad": "Sakarya",
    "plakaKodu": "54",
    "bolge": "Marmara"
  },
  {
    "kod": "55",
    "ad": "Samsun",
    "plakaKodu": "55",
    "bolge": "Karadeniz"
  },
  {
    "kod": "56",
    "ad": "Siirt",
    "plakaKodu": "56",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "57",
    "ad": "Sinop",
    "plakaKodu": "57",
    "bolge": "Karadeniz"
  },
  {
    "kod": "58",
    "ad": "Sivas",
    "plakaKodu": "58",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "59",
    "ad": "Tekirdağ",
    "plakaKodu": "59",
    "bolge": "Marmara"
  },
  {
    "kod": "60",
    "ad": "Tokat",
    "plakaKodu": "60",
    "bolge": "Karadeniz"
  },
  {
    "kod": "61",
    "ad": "Trabzon",
    "plakaKodu": "61",
    "bolge": "Karadeniz"
  },
  {
    "kod": "62",
    "ad": "Tunceli",
    "plakaKodu": "62",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "63",
    "ad": "Şanlıurfa",
    "plakaKodu": "63",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "64",
    "ad": "Uşak",
    "plakaKodu": "64",
    "bolge": "Ege"
  },
  {
    "kod": "65",
    "ad": "Van",
    "plakaKodu": "65",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "66",
    "ad": "Yozgat",
    "plakaKodu": "66",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "67",
    "ad": "Zonguldak",
    "plakaKodu": "67",
    "bolge": "Karadeniz"
  },
  {
    "kod": "68",
    "ad": "Aksaray",
    "plakaKodu": "68",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "69",
    "ad": "Bayburt",
    "plakaKodu": "69",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "70",
    "ad": "Karaman",
    "plakaKodu": "70",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "71",
    "ad": "Kırıkkale",
    "plakaKodu": "71",
    "bolge": "İç Anadolu"
  },
  {
    "kod": "72",
    "ad": "Batman",
    "plakaKodu": "72",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "73",
    "ad": "Şırnak",
    "plakaKodu": "73",
    "bolge": "Güneydoğu Anadolu"
  },
  {
    "kod": "74",
    "ad": "Bartın",
    "plakaKodu": "74",
    "bolge": "Karadeniz"
  },
  {
    "kod": "75",
    "ad": "Ardahan",
    "plakaKodu": "75",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "76",
    "ad": "Iğdır",
    "plakaKodu": "76",
    "bolge": "Doğu Anadolu"
  },
  {
    "kod": "77",
    "ad": "Yalova",
    "plakaKodu": "77",
    "bolge": "Marmara"
  },
  {
    "kod": "78",
    "ad": "Karabük",
    "plakaKodu": "78",
    "bolge": "Karadeniz"
  },
  {
    "kod": "79",
    "ad": "Kilis",
    "plakaKodu": "79",
    "bolge": "Karadeniz"
  },
  {
    "kod": "80",
    "ad": "Osmaniye",
    "plakaKodu": "80",
    "bolge": "Akdeniz"
  },
  {
    "kod": "81",
    "ad": "Düzce",
    "plakaKodu": "81",
    "bolge": "Marmara"
  }
]

// İllere göre ilçeler (Tüm 81 il ve ilçeleri)
export const ilceler: Record<string, Ilce[]> = {
  "10": [
    {
      "kod": "10001",
      "ad": "Altıeylül",
      "ilKodu": "10"
    },
    {
      "kod": "10002",
      "ad": "Ayvalık",
      "ilKodu": "10"
    },
    {
      "kod": "10003",
      "ad": "Balya",
      "ilKodu": "10"
    },
    {
      "kod": "10004",
      "ad": "Bandırma",
      "ilKodu": "10"
    },
    {
      "kod": "10005",
      "ad": "Bigadiç",
      "ilKodu": "10"
    },
    {
      "kod": "10006",
      "ad": "Burhaniye",
      "ilKodu": "10"
    },
    {
      "kod": "10007",
      "ad": "Dursunbey",
      "ilKodu": "10"
    },
    {
      "kod": "10008",
      "ad": "Edremit",
      "ilKodu": "10"
    },
    {
      "kod": "10009",
      "ad": "Erdek",
      "ilKodu": "10"
    },
    {
      "kod": "10010",
      "ad": "Gömeç",
      "ilKodu": "10"
    },
    {
      "kod": "10011",
      "ad": "Gönen",
      "ilKodu": "10"
    },
    {
      "kod": "10012",
      "ad": "Havran",
      "ilKodu": "10"
    },
    {
      "kod": "10013",
      "ad": "İvrindi",
      "ilKodu": "10"
    },
    {
      "kod": "10014",
      "ad": "Karesi",
      "ilKodu": "10"
    },
    {
      "kod": "10015",
      "ad": "Kepsut",
      "ilKodu": "10"
    },
    {
      "kod": "10016",
      "ad": "Manyas",
      "ilKodu": "10"
    },
    {
      "kod": "10017",
      "ad": "Marmara",
      "ilKodu": "10"
    },
    {
      "kod": "10018",
      "ad": "Savaştepe",
      "ilKodu": "10"
    },
    {
      "kod": "10019",
      "ad": "Sındırgı",
      "ilKodu": "10"
    },
    {
      "kod": "10020",
      "ad": "Susurluk",
      "ilKodu": "10"
    }
  ],
  "11": [
    {
      "kod": "11001",
      "ad": "Bozüyük",
      "ilKodu": "11"
    },
    {
      "kod": "11002",
      "ad": "Gölpazarı",
      "ilKodu": "11"
    },
    {
      "kod": "11003",
      "ad": "İnhisar",
      "ilKodu": "11"
    },
    {
      "kod": "11004",
      "ad": "Osmaneli",
      "ilKodu": "11"
    },
    {
      "kod": "11005",
      "ad": "Pazaryeri",
      "ilKodu": "11"
    },
    {
      "kod": "11006",
      "ad": "Söğüt",
      "ilKodu": "11"
    },
    {
      "kod": "11007",
      "ad": "Yenipazar",
      "ilKodu": "11"
    }
  ],
  "12": [
    {
      "kod": "12001",
      "ad": "Adaklı",
      "ilKodu": "12"
    },
    {
      "kod": "12002",
      "ad": "Genç",
      "ilKodu": "12"
    },
    {
      "kod": "12003",
      "ad": "Karlıova",
      "ilKodu": "12"
    },
    {
      "kod": "12004",
      "ad": "Kiğı",
      "ilKodu": "12"
    },
    {
      "kod": "12005",
      "ad": "Solhan",
      "ilKodu": "12"
    },
    {
      "kod": "12006",
      "ad": "Yayladere",
      "ilKodu": "12"
    },
    {
      "kod": "12007",
      "ad": "Yedisu",
      "ilKodu": "12"
    }
  ],
  "13": [
    {
      "kod": "13001",
      "ad": "Adilcevaz",
      "ilKodu": "13"
    },
    {
      "kod": "13002",
      "ad": "Ahlat",
      "ilKodu": "13"
    },
    {
      "kod": "13003",
      "ad": "Güroymak",
      "ilKodu": "13"
    },
    {
      "kod": "13004",
      "ad": "Hizan",
      "ilKodu": "13"
    },
    {
      "kod": "13005",
      "ad": "Mutki",
      "ilKodu": "13"
    },
    {
      "kod": "13006",
      "ad": "Tatvan",
      "ilKodu": "13"
    }
  ],
  "14": [
    {
      "kod": "14001",
      "ad": "Dörtdivan",
      "ilKodu": "14"
    },
    {
      "kod": "14002",
      "ad": "Gerede",
      "ilKodu": "14"
    },
    {
      "kod": "14003",
      "ad": "Göynük",
      "ilKodu": "14"
    },
    {
      "kod": "14004",
      "ad": "Kıbrıscık",
      "ilKodu": "14"
    },
    {
      "kod": "14005",
      "ad": "Mengen",
      "ilKodu": "14"
    },
    {
      "kod": "14006",
      "ad": "Mudurnu",
      "ilKodu": "14"
    },
    {
      "kod": "14007",
      "ad": "Seben",
      "ilKodu": "14"
    },
    {
      "kod": "14008",
      "ad": "Yeniçağa",
      "ilKodu": "14"
    }
  ],
  "15": [
    {
      "kod": "15001",
      "ad": "Ağlasun",
      "ilKodu": "15"
    },
    {
      "kod": "15002",
      "ad": "Altınyayla",
      "ilKodu": "15"
    },
    {
      "kod": "15003",
      "ad": "Bucak",
      "ilKodu": "15"
    },
    {
      "kod": "15004",
      "ad": "Çavdır",
      "ilKodu": "15"
    },
    {
      "kod": "15005",
      "ad": "Çeltikçi",
      "ilKodu": "15"
    },
    {
      "kod": "15006",
      "ad": "Gölhisar",
      "ilKodu": "15"
    },
    {
      "kod": "15007",
      "ad": "Karamanlı",
      "ilKodu": "15"
    },
    {
      "kod": "15008",
      "ad": "Kemer",
      "ilKodu": "15"
    },
    {
      "kod": "15009",
      "ad": "Tefenni",
      "ilKodu": "15"
    },
    {
      "kod": "15010",
      "ad": "Yeşilova",
      "ilKodu": "15"
    }
  ],
  "16": [
    {
      "kod": "16001",
      "ad": "Büyükorhan",
      "ilKodu": "16"
    },
    {
      "kod": "16002",
      "ad": "Gemlik",
      "ilKodu": "16"
    },
    {
      "kod": "16003",
      "ad": "Gürsu",
      "ilKodu": "16"
    },
    {
      "kod": "16004",
      "ad": "Harmancık",
      "ilKodu": "16"
    },
    {
      "kod": "16005",
      "ad": "İnegöl",
      "ilKodu": "16"
    },
    {
      "kod": "16006",
      "ad": "İznik",
      "ilKodu": "16"
    },
    {
      "kod": "16007",
      "ad": "Karacabey",
      "ilKodu": "16"
    },
    {
      "kod": "16008",
      "ad": "Keles",
      "ilKodu": "16"
    },
    {
      "kod": "16009",
      "ad": "Kestel",
      "ilKodu": "16"
    },
    {
      "kod": "16010",
      "ad": "Mudanya",
      "ilKodu": "16"
    },
    {
      "kod": "16011",
      "ad": "Mustafakemalpaşa",
      "ilKodu": "16"
    },
    {
      "kod": "16012",
      "ad": "Nilüfer",
      "ilKodu": "16"
    },
    {
      "kod": "16013",
      "ad": "Orhaneli",
      "ilKodu": "16"
    },
    {
      "kod": "16014",
      "ad": "Orhangazi",
      "ilKodu": "16"
    },
    {
      "kod": "16015",
      "ad": "Osmangazi",
      "ilKodu": "16"
    },
    {
      "kod": "16016",
      "ad": "Yenişehir",
      "ilKodu": "16"
    },
    {
      "kod": "16017",
      "ad": "Yıldırım",
      "ilKodu": "16"
    }
  ],
  "17": [
    {
      "kod": "17001",
      "ad": "Ayvacık",
      "ilKodu": "17"
    },
    {
      "kod": "17002",
      "ad": "Bayramiç",
      "ilKodu": "17"
    },
    {
      "kod": "17003",
      "ad": "Biga",
      "ilKodu": "17"
    },
    {
      "kod": "17004",
      "ad": "Bozcaada",
      "ilKodu": "17"
    },
    {
      "kod": "17005",
      "ad": "Çan",
      "ilKodu": "17"
    },
    {
      "kod": "17006",
      "ad": "Eceabat",
      "ilKodu": "17"
    },
    {
      "kod": "17007",
      "ad": "Ezine",
      "ilKodu": "17"
    },
    {
      "kod": "17008",
      "ad": "Gelibolu",
      "ilKodu": "17"
    },
    {
      "kod": "17009",
      "ad": "Gökçeada",
      "ilKodu": "17"
    },
    {
      "kod": "17010",
      "ad": "Lapseki",
      "ilKodu": "17"
    },
    {
      "kod": "17011",
      "ad": "Yenice",
      "ilKodu": "17"
    }
  ],
  "18": [
    {
      "kod": "18001",
      "ad": "Atkaracalar",
      "ilKodu": "18"
    },
    {
      "kod": "18002",
      "ad": "Bayramören",
      "ilKodu": "18"
    },
    {
      "kod": "18003",
      "ad": "Çerkeş",
      "ilKodu": "18"
    },
    {
      "kod": "18004",
      "ad": "Eldivan",
      "ilKodu": "18"
    },
    {
      "kod": "18005",
      "ad": "Ilgaz",
      "ilKodu": "18"
    },
    {
      "kod": "18006",
      "ad": "Kızılırmak",
      "ilKodu": "18"
    },
    {
      "kod": "18007",
      "ad": "Korgun",
      "ilKodu": "18"
    },
    {
      "kod": "18008",
      "ad": "Kurşunlu",
      "ilKodu": "18"
    },
    {
      "kod": "18009",
      "ad": "Orta",
      "ilKodu": "18"
    },
    {
      "kod": "18010",
      "ad": "Şabanözü",
      "ilKodu": "18"
    },
    {
      "kod": "18011",
      "ad": "Yapraklı",
      "ilKodu": "18"
    }
  ],
  "19": [
    {
      "kod": "19001",
      "ad": "Alaca",
      "ilKodu": "19"
    },
    {
      "kod": "19002",
      "ad": "Bayat",
      "ilKodu": "19"
    },
    {
      "kod": "19003",
      "ad": "Boğazkale",
      "ilKodu": "19"
    },
    {
      "kod": "19004",
      "ad": "Dodurga",
      "ilKodu": "19"
    },
    {
      "kod": "19005",
      "ad": "İskilip",
      "ilKodu": "19"
    },
    {
      "kod": "19006",
      "ad": "Kargı",
      "ilKodu": "19"
    },
    {
      "kod": "19007",
      "ad": "Laçin",
      "ilKodu": "19"
    },
    {
      "kod": "19008",
      "ad": "Mecitözü",
      "ilKodu": "19"
    },
    {
      "kod": "19009",
      "ad": "Oğuzlar",
      "ilKodu": "19"
    },
    {
      "kod": "19010",
      "ad": "Ortaköy",
      "ilKodu": "19"
    },
    {
      "kod": "19011",
      "ad": "Osmancık",
      "ilKodu": "19"
    },
    {
      "kod": "19012",
      "ad": "Sungurlu",
      "ilKodu": "19"
    },
    {
      "kod": "19013",
      "ad": "Uğurludağ",
      "ilKodu": "19"
    }
  ],
  "20": [
    {
      "kod": "20001",
      "ad": "Acıpayam",
      "ilKodu": "20"
    },
    {
      "kod": "20002",
      "ad": "Babadağ",
      "ilKodu": "20"
    },
    {
      "kod": "20003",
      "ad": "Baklan",
      "ilKodu": "20"
    },
    {
      "kod": "20004",
      "ad": "Bekilli",
      "ilKodu": "20"
    },
    {
      "kod": "20005",
      "ad": "Beyağaç",
      "ilKodu": "20"
    },
    {
      "kod": "20006",
      "ad": "Bozkurt",
      "ilKodu": "20"
    },
    {
      "kod": "20007",
      "ad": "Buldan",
      "ilKodu": "20"
    },
    {
      "kod": "20008",
      "ad": "Çal",
      "ilKodu": "20"
    },
    {
      "kod": "20009",
      "ad": "Çameli",
      "ilKodu": "20"
    },
    {
      "kod": "20010",
      "ad": "Çardak",
      "ilKodu": "20"
    },
    {
      "kod": "20011",
      "ad": "Çivril",
      "ilKodu": "20"
    },
    {
      "kod": "20012",
      "ad": "Güney",
      "ilKodu": "20"
    },
    {
      "kod": "20013",
      "ad": "Honaz",
      "ilKodu": "20"
    },
    {
      "kod": "20014",
      "ad": "Kale",
      "ilKodu": "20"
    },
    {
      "kod": "20015",
      "ad": "Merkezefendi",
      "ilKodu": "20"
    },
    {
      "kod": "20016",
      "ad": "Pamukkale",
      "ilKodu": "20"
    },
    {
      "kod": "20017",
      "ad": "Sarayköy",
      "ilKodu": "20"
    },
    {
      "kod": "20018",
      "ad": "Serinhisar",
      "ilKodu": "20"
    },
    {
      "kod": "20019",
      "ad": "Tavas",
      "ilKodu": "20"
    }
  ],
  "21": [
    {
      "kod": "21001",
      "ad": "Bağlar",
      "ilKodu": "21"
    },
    {
      "kod": "21002",
      "ad": "Bismil",
      "ilKodu": "21"
    },
    {
      "kod": "21003",
      "ad": "Çermik",
      "ilKodu": "21"
    },
    {
      "kod": "21004",
      "ad": "Çınar",
      "ilKodu": "21"
    },
    {
      "kod": "21005",
      "ad": "Çüngüş",
      "ilKodu": "21"
    },
    {
      "kod": "21006",
      "ad": "Dicle",
      "ilKodu": "21"
    },
    {
      "kod": "21007",
      "ad": "Eğil",
      "ilKodu": "21"
    },
    {
      "kod": "21008",
      "ad": "Ergani",
      "ilKodu": "21"
    },
    {
      "kod": "21009",
      "ad": "Hani",
      "ilKodu": "21"
    },
    {
      "kod": "21010",
      "ad": "Hazro",
      "ilKodu": "21"
    },
    {
      "kod": "21011",
      "ad": "Kayapınar",
      "ilKodu": "21"
    },
    {
      "kod": "21012",
      "ad": "Kocaköy",
      "ilKodu": "21"
    },
    {
      "kod": "21013",
      "ad": "Kulp",
      "ilKodu": "21"
    },
    {
      "kod": "21014",
      "ad": "Lice",
      "ilKodu": "21"
    },
    {
      "kod": "21015",
      "ad": "Silvan",
      "ilKodu": "21"
    },
    {
      "kod": "21016",
      "ad": "Sur",
      "ilKodu": "21"
    },
    {
      "kod": "21017",
      "ad": "Yenişehir",
      "ilKodu": "21"
    }
  ],
  "22": [
    {
      "kod": "22001",
      "ad": "Enez",
      "ilKodu": "22"
    },
    {
      "kod": "22002",
      "ad": "Havsa",
      "ilKodu": "22"
    },
    {
      "kod": "22003",
      "ad": "İpsala",
      "ilKodu": "22"
    },
    {
      "kod": "22004",
      "ad": "Keşan",
      "ilKodu": "22"
    },
    {
      "kod": "22005",
      "ad": "Lalapaşa",
      "ilKodu": "22"
    },
    {
      "kod": "22006",
      "ad": "Meriç",
      "ilKodu": "22"
    },
    {
      "kod": "22007",
      "ad": "Süloğlu",
      "ilKodu": "22"
    },
    {
      "kod": "22008",
      "ad": "Uzunköprü",
      "ilKodu": "22"
    }
  ],
  "23": [
    {
      "kod": "23001",
      "ad": "Ağın",
      "ilKodu": "23"
    },
    {
      "kod": "23002",
      "ad": "Alacakaya",
      "ilKodu": "23"
    },
    {
      "kod": "23003",
      "ad": "Arıcak",
      "ilKodu": "23"
    },
    {
      "kod": "23004",
      "ad": "Baskil",
      "ilKodu": "23"
    },
    {
      "kod": "23005",
      "ad": "Karakoçan",
      "ilKodu": "23"
    },
    {
      "kod": "23006",
      "ad": "Keban",
      "ilKodu": "23"
    },
    {
      "kod": "23007",
      "ad": "Kovancılar",
      "ilKodu": "23"
    },
    {
      "kod": "23008",
      "ad": "Maden",
      "ilKodu": "23"
    },
    {
      "kod": "23009",
      "ad": "Palu",
      "ilKodu": "23"
    },
    {
      "kod": "23010",
      "ad": "Sivrice",
      "ilKodu": "23"
    }
  ],
  "24": [
    {
      "kod": "24001",
      "ad": "Çayırlı",
      "ilKodu": "24"
    },
    {
      "kod": "24002",
      "ad": "İliç",
      "ilKodu": "24"
    },
    {
      "kod": "24003",
      "ad": "Kemah",
      "ilKodu": "24"
    },
    {
      "kod": "24004",
      "ad": "Kemaliye",
      "ilKodu": "24"
    },
    {
      "kod": "24005",
      "ad": "Otlukbeli",
      "ilKodu": "24"
    },
    {
      "kod": "24006",
      "ad": "Refahiye",
      "ilKodu": "24"
    },
    {
      "kod": "24007",
      "ad": "Tercan",
      "ilKodu": "24"
    },
    {
      "kod": "24008",
      "ad": "Üzümlü",
      "ilKodu": "24"
    }
  ],
  "25": [
    {
      "kod": "25001",
      "ad": "Aşkale",
      "ilKodu": "25"
    },
    {
      "kod": "25002",
      "ad": "Aziziye",
      "ilKodu": "25"
    },
    {
      "kod": "25003",
      "ad": "Çat",
      "ilKodu": "25"
    },
    {
      "kod": "25004",
      "ad": "Hınıs",
      "ilKodu": "25"
    },
    {
      "kod": "25005",
      "ad": "Horasan",
      "ilKodu": "25"
    },
    {
      "kod": "25006",
      "ad": "İspir",
      "ilKodu": "25"
    },
    {
      "kod": "25007",
      "ad": "Karaçoban",
      "ilKodu": "25"
    },
    {
      "kod": "25008",
      "ad": "Karayazı",
      "ilKodu": "25"
    },
    {
      "kod": "25009",
      "ad": "Köprüköy",
      "ilKodu": "25"
    },
    {
      "kod": "25010",
      "ad": "Narman",
      "ilKodu": "25"
    },
    {
      "kod": "25011",
      "ad": "Oltu",
      "ilKodu": "25"
    },
    {
      "kod": "25012",
      "ad": "Olur",
      "ilKodu": "25"
    },
    {
      "kod": "25013",
      "ad": "Palandöken",
      "ilKodu": "25"
    },
    {
      "kod": "25014",
      "ad": "Pasinler",
      "ilKodu": "25"
    },
    {
      "kod": "25015",
      "ad": "Pazaryolu",
      "ilKodu": "25"
    },
    {
      "kod": "25016",
      "ad": "Şenkaya",
      "ilKodu": "25"
    },
    {
      "kod": "25017",
      "ad": "Tekman",
      "ilKodu": "25"
    },
    {
      "kod": "25018",
      "ad": "Tortum",
      "ilKodu": "25"
    },
    {
      "kod": "25019",
      "ad": "Uzundere",
      "ilKodu": "25"
    },
    {
      "kod": "25020",
      "ad": "Yakutiye",
      "ilKodu": "25"
    }
  ],
  "26": [
    {
      "kod": "26001",
      "ad": "Alpu",
      "ilKodu": "26"
    },
    {
      "kod": "26002",
      "ad": "Beylikova",
      "ilKodu": "26"
    },
    {
      "kod": "26003",
      "ad": "Çifteler",
      "ilKodu": "26"
    },
    {
      "kod": "26004",
      "ad": "Günyüzü",
      "ilKodu": "26"
    },
    {
      "kod": "26005",
      "ad": "Han",
      "ilKodu": "26"
    },
    {
      "kod": "26006",
      "ad": "İnönü",
      "ilKodu": "26"
    },
    {
      "kod": "26007",
      "ad": "Mahmudiye",
      "ilKodu": "26"
    },
    {
      "kod": "26008",
      "ad": "Mihalgazi",
      "ilKodu": "26"
    },
    {
      "kod": "26009",
      "ad": "Mihalıççık",
      "ilKodu": "26"
    },
    {
      "kod": "26010",
      "ad": "Odunpazarı",
      "ilKodu": "26"
    },
    {
      "kod": "26011",
      "ad": "Sarıcakaya",
      "ilKodu": "26"
    },
    {
      "kod": "26012",
      "ad": "Seyitgazi",
      "ilKodu": "26"
    },
    {
      "kod": "26013",
      "ad": "Sivrihisar",
      "ilKodu": "26"
    },
    {
      "kod": "26014",
      "ad": "Tepebaşı",
      "ilKodu": "26"
    }
  ],
  "27": [
    {
      "kod": "27001",
      "ad": "Araban",
      "ilKodu": "27"
    },
    {
      "kod": "27002",
      "ad": "İslahiye",
      "ilKodu": "27"
    },
    {
      "kod": "27003",
      "ad": "Karkamış",
      "ilKodu": "27"
    },
    {
      "kod": "27004",
      "ad": "Nizip",
      "ilKodu": "27"
    },
    {
      "kod": "27005",
      "ad": "Nurdağı",
      "ilKodu": "27"
    },
    {
      "kod": "27006",
      "ad": "Oğuzeli",
      "ilKodu": "27"
    },
    {
      "kod": "27007",
      "ad": "Şahinbey",
      "ilKodu": "27"
    },
    {
      "kod": "27008",
      "ad": "Şehitkamil",
      "ilKodu": "27"
    },
    {
      "kod": "27009",
      "ad": "Yavuzeli",
      "ilKodu": "27"
    }
  ],
  "28": [
    {
      "kod": "28001",
      "ad": "Alucra",
      "ilKodu": "28"
    },
    {
      "kod": "28002",
      "ad": "Bulancak",
      "ilKodu": "28"
    },
    {
      "kod": "28003",
      "ad": "Çamoluk",
      "ilKodu": "28"
    },
    {
      "kod": "28004",
      "ad": "Çanakçı",
      "ilKodu": "28"
    },
    {
      "kod": "28005",
      "ad": "Dereli",
      "ilKodu": "28"
    },
    {
      "kod": "28006",
      "ad": "Doğankent",
      "ilKodu": "28"
    },
    {
      "kod": "28007",
      "ad": "Espiye",
      "ilKodu": "28"
    },
    {
      "kod": "28008",
      "ad": "Eynesil",
      "ilKodu": "28"
    },
    {
      "kod": "28009",
      "ad": "Görele",
      "ilKodu": "28"
    },
    {
      "kod": "28010",
      "ad": "Güce",
      "ilKodu": "28"
    },
    {
      "kod": "28011",
      "ad": "Keşap",
      "ilKodu": "28"
    },
    {
      "kod": "28012",
      "ad": "Piraziz",
      "ilKodu": "28"
    },
    {
      "kod": "28013",
      "ad": "Şebinkarahisar",
      "ilKodu": "28"
    },
    {
      "kod": "28014",
      "ad": "Tirebolu",
      "ilKodu": "28"
    },
    {
      "kod": "28015",
      "ad": "Yağlıdere",
      "ilKodu": "28"
    }
  ],
  "29": [
    {
      "kod": "29001",
      "ad": "Kelkit",
      "ilKodu": "29"
    },
    {
      "kod": "29002",
      "ad": "Köse",
      "ilKodu": "29"
    },
    {
      "kod": "29003",
      "ad": "Kürtün",
      "ilKodu": "29"
    },
    {
      "kod": "29004",
      "ad": "Şiran",
      "ilKodu": "29"
    },
    {
      "kod": "29005",
      "ad": "Torul",
      "ilKodu": "29"
    }
  ],
  "30": [
    {
      "kod": "30001",
      "ad": "Çukurca",
      "ilKodu": "30"
    },
    {
      "kod": "30002",
      "ad": "Derecik",
      "ilKodu": "30"
    },
    {
      "kod": "30003",
      "ad": "Şemdinli",
      "ilKodu": "30"
    },
    {
      "kod": "30004",
      "ad": "Yüksekova",
      "ilKodu": "30"
    }
  ],
  "31": [
    {
      "kod": "31001",
      "ad": "Altınözü",
      "ilKodu": "31"
    },
    {
      "kod": "31002",
      "ad": "Antakya",
      "ilKodu": "31"
    },
    {
      "kod": "31003",
      "ad": "Arsuz",
      "ilKodu": "31"
    },
    {
      "kod": "31004",
      "ad": "Belen",
      "ilKodu": "31"
    },
    {
      "kod": "31005",
      "ad": "Defne",
      "ilKodu": "31"
    },
    {
      "kod": "31006",
      "ad": "Dörtyol",
      "ilKodu": "31"
    },
    {
      "kod": "31007",
      "ad": "Erzin",
      "ilKodu": "31"
    },
    {
      "kod": "31008",
      "ad": "Hassa",
      "ilKodu": "31"
    },
    {
      "kod": "31009",
      "ad": "İskenderun",
      "ilKodu": "31"
    },
    {
      "kod": "31010",
      "ad": "Kırıkhan",
      "ilKodu": "31"
    },
    {
      "kod": "31011",
      "ad": "Kumlu",
      "ilKodu": "31"
    },
    {
      "kod": "31012",
      "ad": "Payas",
      "ilKodu": "31"
    },
    {
      "kod": "31013",
      "ad": "Reyhanlı",
      "ilKodu": "31"
    },
    {
      "kod": "31014",
      "ad": "Samandağ",
      "ilKodu": "31"
    },
    {
      "kod": "31015",
      "ad": "Yayladağı",
      "ilKodu": "31"
    }
  ],
  "32": [
    {
      "kod": "32001",
      "ad": "Aksu",
      "ilKodu": "32"
    },
    {
      "kod": "32002",
      "ad": "Atabey",
      "ilKodu": "32"
    },
    {
      "kod": "32003",
      "ad": "Eğirdir",
      "ilKodu": "32"
    },
    {
      "kod": "32004",
      "ad": "Gelendost",
      "ilKodu": "32"
    },
    {
      "kod": "32005",
      "ad": "Gönen",
      "ilKodu": "32"
    },
    {
      "kod": "32006",
      "ad": "Keçiborlu",
      "ilKodu": "32"
    },
    {
      "kod": "32007",
      "ad": "Senirkent",
      "ilKodu": "32"
    },
    {
      "kod": "32008",
      "ad": "Sütçüler",
      "ilKodu": "32"
    },
    {
      "kod": "32009",
      "ad": "Şarkikaraağaç",
      "ilKodu": "32"
    },
    {
      "kod": "32010",
      "ad": "Uluborlu",
      "ilKodu": "32"
    },
    {
      "kod": "32011",
      "ad": "Yalvaç",
      "ilKodu": "32"
    },
    {
      "kod": "32012",
      "ad": "Yenişarbademli",
      "ilKodu": "32"
    }
  ],
  "33": [
    {
      "kod": "33001",
      "ad": "Akdeniz",
      "ilKodu": "33"
    },
    {
      "kod": "33002",
      "ad": "Anamur",
      "ilKodu": "33"
    },
    {
      "kod": "33003",
      "ad": "Aydıncık",
      "ilKodu": "33"
    },
    {
      "kod": "33004",
      "ad": "Bozyazı",
      "ilKodu": "33"
    },
    {
      "kod": "33005",
      "ad": "Çamlıyayla",
      "ilKodu": "33"
    },
    {
      "kod": "33006",
      "ad": "Erdemli",
      "ilKodu": "33"
    },
    {
      "kod": "33007",
      "ad": "Gülnar",
      "ilKodu": "33"
    },
    {
      "kod": "33008",
      "ad": "Mezitli",
      "ilKodu": "33"
    },
    {
      "kod": "33009",
      "ad": "Mut",
      "ilKodu": "33"
    },
    {
      "kod": "33010",
      "ad": "Silifke",
      "ilKodu": "33"
    },
    {
      "kod": "33011",
      "ad": "Tarsus",
      "ilKodu": "33"
    },
    {
      "kod": "33012",
      "ad": "Toroslar",
      "ilKodu": "33"
    },
    {
      "kod": "33013",
      "ad": "Yenişehir",
      "ilKodu": "33"
    }
  ],
  "34": [
    {
      "kod": "34001",
      "ad": "Adalar",
      "ilKodu": "34"
    },
    {
      "kod": "34002",
      "ad": "Arnavutköy",
      "ilKodu": "34"
    },
    {
      "kod": "34003",
      "ad": "Ataşehir",
      "ilKodu": "34"
    },
    {
      "kod": "34004",
      "ad": "Avcılar",
      "ilKodu": "34"
    },
    {
      "kod": "34005",
      "ad": "Bağcılar",
      "ilKodu": "34"
    },
    {
      "kod": "34006",
      "ad": "Bahçelievler",
      "ilKodu": "34"
    },
    {
      "kod": "34007",
      "ad": "Bakırköy",
      "ilKodu": "34"
    },
    {
      "kod": "34008",
      "ad": "Başakşehir",
      "ilKodu": "34"
    },
    {
      "kod": "34009",
      "ad": "Bayrampaşa",
      "ilKodu": "34"
    },
    {
      "kod": "34010",
      "ad": "Beşiktaş",
      "ilKodu": "34"
    },
    {
      "kod": "34011",
      "ad": "Beykoz",
      "ilKodu": "34"
    },
    {
      "kod": "34012",
      "ad": "Beylikdüzü",
      "ilKodu": "34"
    },
    {
      "kod": "34013",
      "ad": "Beyoğlu",
      "ilKodu": "34"
    },
    {
      "kod": "34014",
      "ad": "Büyükçekmece",
      "ilKodu": "34"
    },
    {
      "kod": "34015",
      "ad": "Çatalca",
      "ilKodu": "34"
    },
    {
      "kod": "34016",
      "ad": "Çekmeköy",
      "ilKodu": "34"
    },
    {
      "kod": "34017",
      "ad": "Esenler",
      "ilKodu": "34"
    },
    {
      "kod": "34018",
      "ad": "Esenyurt",
      "ilKodu": "34"
    },
    {
      "kod": "34019",
      "ad": "Eyüpsultan",
      "ilKodu": "34"
    },
    {
      "kod": "34020",
      "ad": "Fatih",
      "ilKodu": "34"
    },
    {
      "kod": "34021",
      "ad": "Gaziosmanpaşa",
      "ilKodu": "34"
    },
    {
      "kod": "34022",
      "ad": "Güngören",
      "ilKodu": "34"
    },
    {
      "kod": "34023",
      "ad": "Kadıköy",
      "ilKodu": "34"
    },
    {
      "kod": "34024",
      "ad": "Kağıthane",
      "ilKodu": "34"
    },
    {
      "kod": "34025",
      "ad": "Kartal",
      "ilKodu": "34"
    },
    {
      "kod": "34026",
      "ad": "Küçükçekmece",
      "ilKodu": "34"
    },
    {
      "kod": "34027",
      "ad": "Maltepe",
      "ilKodu": "34"
    },
    {
      "kod": "34028",
      "ad": "Pendik",
      "ilKodu": "34"
    },
    {
      "kod": "34029",
      "ad": "Sancaktepe",
      "ilKodu": "34"
    },
    {
      "kod": "34030",
      "ad": "Sarıyer",
      "ilKodu": "34"
    },
    {
      "kod": "34031",
      "ad": "Silivri",
      "ilKodu": "34"
    },
    {
      "kod": "34032",
      "ad": "Sultanbeyli",
      "ilKodu": "34"
    },
    {
      "kod": "34033",
      "ad": "Sultangazi",
      "ilKodu": "34"
    },
    {
      "kod": "34034",
      "ad": "Şile",
      "ilKodu": "34"
    },
    {
      "kod": "34035",
      "ad": "Şişli",
      "ilKodu": "34"
    },
    {
      "kod": "34036",
      "ad": "Tuzla",
      "ilKodu": "34"
    },
    {
      "kod": "34037",
      "ad": "Ümraniye",
      "ilKodu": "34"
    },
    {
      "kod": "34038",
      "ad": "Üsküdar",
      "ilKodu": "34"
    },
    {
      "kod": "34039",
      "ad": "Zeytinburnu",
      "ilKodu": "34"
    }
  ],
  "35": [
    {
      "kod": "35001",
      "ad": "Aliağa",
      "ilKodu": "35"
    },
    {
      "kod": "35002",
      "ad": "Balçova",
      "ilKodu": "35"
    },
    {
      "kod": "35003",
      "ad": "Bayındır",
      "ilKodu": "35"
    },
    {
      "kod": "35004",
      "ad": "Bayraklı",
      "ilKodu": "35"
    },
    {
      "kod": "35005",
      "ad": "Bergama",
      "ilKodu": "35"
    },
    {
      "kod": "35006",
      "ad": "Beydağ",
      "ilKodu": "35"
    },
    {
      "kod": "35007",
      "ad": "Bornova",
      "ilKodu": "35"
    },
    {
      "kod": "35008",
      "ad": "Buca",
      "ilKodu": "35"
    },
    {
      "kod": "35009",
      "ad": "Çeşme",
      "ilKodu": "35"
    },
    {
      "kod": "35010",
      "ad": "Çiğli",
      "ilKodu": "35"
    },
    {
      "kod": "35011",
      "ad": "Dikili",
      "ilKodu": "35"
    },
    {
      "kod": "35012",
      "ad": "Foça",
      "ilKodu": "35"
    },
    {
      "kod": "35013",
      "ad": "Gaziemir",
      "ilKodu": "35"
    },
    {
      "kod": "35014",
      "ad": "Güzelbahçe",
      "ilKodu": "35"
    },
    {
      "kod": "35015",
      "ad": "Karabağlar",
      "ilKodu": "35"
    },
    {
      "kod": "35016",
      "ad": "Karaburun",
      "ilKodu": "35"
    },
    {
      "kod": "35017",
      "ad": "Karşıyaka",
      "ilKodu": "35"
    },
    {
      "kod": "35018",
      "ad": "Kemalpaşa",
      "ilKodu": "35"
    },
    {
      "kod": "35019",
      "ad": "Kınık",
      "ilKodu": "35"
    },
    {
      "kod": "35020",
      "ad": "Kiraz",
      "ilKodu": "35"
    },
    {
      "kod": "35021",
      "ad": "Konak",
      "ilKodu": "35"
    },
    {
      "kod": "35022",
      "ad": "Menderes",
      "ilKodu": "35"
    },
    {
      "kod": "35023",
      "ad": "Menemen",
      "ilKodu": "35"
    },
    {
      "kod": "35024",
      "ad": "Narlıdere",
      "ilKodu": "35"
    },
    {
      "kod": "35025",
      "ad": "Ödemiş",
      "ilKodu": "35"
    },
    {
      "kod": "35026",
      "ad": "Seferihisar",
      "ilKodu": "35"
    },
    {
      "kod": "35027",
      "ad": "Selçuk",
      "ilKodu": "35"
    },
    {
      "kod": "35028",
      "ad": "Tire",
      "ilKodu": "35"
    },
    {
      "kod": "35029",
      "ad": "Torbalı",
      "ilKodu": "35"
    },
    {
      "kod": "35030",
      "ad": "Urla",
      "ilKodu": "35"
    }
  ],
  "36": [
    {
      "kod": "36001",
      "ad": "Akyaka",
      "ilKodu": "36"
    },
    {
      "kod": "36002",
      "ad": "Arpaçay",
      "ilKodu": "36"
    },
    {
      "kod": "36003",
      "ad": "Digor",
      "ilKodu": "36"
    },
    {
      "kod": "36004",
      "ad": "Kağızman",
      "ilKodu": "36"
    },
    {
      "kod": "36005",
      "ad": "Sarıkamış",
      "ilKodu": "36"
    },
    {
      "kod": "36006",
      "ad": "Selim",
      "ilKodu": "36"
    },
    {
      "kod": "36007",
      "ad": "Susuz",
      "ilKodu": "36"
    }
  ],
  "37": [
    {
      "kod": "37001",
      "ad": "Abana",
      "ilKodu": "37"
    },
    {
      "kod": "37002",
      "ad": "Ağlı",
      "ilKodu": "37"
    },
    {
      "kod": "37003",
      "ad": "Araç",
      "ilKodu": "37"
    },
    {
      "kod": "37004",
      "ad": "Azdavay",
      "ilKodu": "37"
    },
    {
      "kod": "37005",
      "ad": "Bozkurt",
      "ilKodu": "37"
    },
    {
      "kod": "37006",
      "ad": "Cide",
      "ilKodu": "37"
    },
    {
      "kod": "37007",
      "ad": "Çatalzeytin",
      "ilKodu": "37"
    },
    {
      "kod": "37008",
      "ad": "Daday",
      "ilKodu": "37"
    },
    {
      "kod": "37009",
      "ad": "Devrekani",
      "ilKodu": "37"
    },
    {
      "kod": "37010",
      "ad": "Doğanyurt",
      "ilKodu": "37"
    },
    {
      "kod": "37011",
      "ad": "Hanönü",
      "ilKodu": "37"
    },
    {
      "kod": "37012",
      "ad": "İhsangazi",
      "ilKodu": "37"
    },
    {
      "kod": "37013",
      "ad": "İnebolu",
      "ilKodu": "37"
    },
    {
      "kod": "37014",
      "ad": "Küre",
      "ilKodu": "37"
    },
    {
      "kod": "37015",
      "ad": "Pınarbaşı",
      "ilKodu": "37"
    },
    {
      "kod": "37016",
      "ad": "Seydiler",
      "ilKodu": "37"
    },
    {
      "kod": "37017",
      "ad": "Şenpazar",
      "ilKodu": "37"
    },
    {
      "kod": "37018",
      "ad": "Taşköprü",
      "ilKodu": "37"
    },
    {
      "kod": "37019",
      "ad": "Tosya",
      "ilKodu": "37"
    }
  ],
  "38": [
    {
      "kod": "38001",
      "ad": "Akkışla",
      "ilKodu": "38"
    },
    {
      "kod": "38002",
      "ad": "Bünyan",
      "ilKodu": "38"
    },
    {
      "kod": "38003",
      "ad": "Develi",
      "ilKodu": "38"
    },
    {
      "kod": "38004",
      "ad": "Felahiye",
      "ilKodu": "38"
    },
    {
      "kod": "38005",
      "ad": "Hacılar",
      "ilKodu": "38"
    },
    {
      "kod": "38006",
      "ad": "İncesu",
      "ilKodu": "38"
    },
    {
      "kod": "38007",
      "ad": "Kocasinan",
      "ilKodu": "38"
    },
    {
      "kod": "38008",
      "ad": "Melikgazi",
      "ilKodu": "38"
    },
    {
      "kod": "38009",
      "ad": "Özvatan",
      "ilKodu": "38"
    },
    {
      "kod": "38010",
      "ad": "Pınarbaşı",
      "ilKodu": "38"
    },
    {
      "kod": "38011",
      "ad": "Sarıoğlan",
      "ilKodu": "38"
    },
    {
      "kod": "38012",
      "ad": "Sarız",
      "ilKodu": "38"
    },
    {
      "kod": "38013",
      "ad": "Talas",
      "ilKodu": "38"
    },
    {
      "kod": "38014",
      "ad": "Tomarza",
      "ilKodu": "38"
    },
    {
      "kod": "38015",
      "ad": "Yahyalı",
      "ilKodu": "38"
    },
    {
      "kod": "38016",
      "ad": "Yeşilhisar",
      "ilKodu": "38"
    }
  ],
  "39": [
    {
      "kod": "39001",
      "ad": "Babaeski",
      "ilKodu": "39"
    },
    {
      "kod": "39002",
      "ad": "Demirköy",
      "ilKodu": "39"
    },
    {
      "kod": "39003",
      "ad": "Kofçaz",
      "ilKodu": "39"
    },
    {
      "kod": "39004",
      "ad": "Lüleburgaz",
      "ilKodu": "39"
    },
    {
      "kod": "39005",
      "ad": "Pehlivanköy",
      "ilKodu": "39"
    },
    {
      "kod": "39006",
      "ad": "Pınarhisar",
      "ilKodu": "39"
    },
    {
      "kod": "39007",
      "ad": "Vize",
      "ilKodu": "39"
    }
  ],
  "40": [
    {
      "kod": "40001",
      "ad": "Akçakent",
      "ilKodu": "40"
    },
    {
      "kod": "40002",
      "ad": "Akpınar",
      "ilKodu": "40"
    },
    {
      "kod": "40003",
      "ad": "Boztepe",
      "ilKodu": "40"
    },
    {
      "kod": "40004",
      "ad": "Çiçekdağı",
      "ilKodu": "40"
    },
    {
      "kod": "40005",
      "ad": "Kaman",
      "ilKodu": "40"
    },
    {
      "kod": "40006",
      "ad": "Mucur",
      "ilKodu": "40"
    }
  ],
  "41": [
    {
      "kod": "41001",
      "ad": "Başiskele",
      "ilKodu": "41"
    },
    {
      "kod": "41002",
      "ad": "Çayırova",
      "ilKodu": "41"
    },
    {
      "kod": "41003",
      "ad": "Darıca",
      "ilKodu": "41"
    },
    {
      "kod": "41004",
      "ad": "Derince",
      "ilKodu": "41"
    },
    {
      "kod": "41005",
      "ad": "Dilovası",
      "ilKodu": "41"
    },
    {
      "kod": "41006",
      "ad": "Gebze",
      "ilKodu": "41"
    },
    {
      "kod": "41007",
      "ad": "Gölcük",
      "ilKodu": "41"
    },
    {
      "kod": "41008",
      "ad": "İzmit",
      "ilKodu": "41"
    },
    {
      "kod": "41009",
      "ad": "Kandıra",
      "ilKodu": "41"
    },
    {
      "kod": "41010",
      "ad": "Karamürsel",
      "ilKodu": "41"
    },
    {
      "kod": "41011",
      "ad": "Kartepe",
      "ilKodu": "41"
    },
    {
      "kod": "41012",
      "ad": "Körfez",
      "ilKodu": "41"
    }
  ],
  "42": [
    {
      "kod": "42001",
      "ad": "Ahırlı",
      "ilKodu": "42"
    },
    {
      "kod": "42002",
      "ad": "Akören",
      "ilKodu": "42"
    },
    {
      "kod": "42003",
      "ad": "Akşehir",
      "ilKodu": "42"
    },
    {
      "kod": "42004",
      "ad": "Altınekin",
      "ilKodu": "42"
    },
    {
      "kod": "42005",
      "ad": "Beyşehir",
      "ilKodu": "42"
    },
    {
      "kod": "42006",
      "ad": "Bozkır",
      "ilKodu": "42"
    },
    {
      "kod": "42007",
      "ad": "Cihanbeyli",
      "ilKodu": "42"
    },
    {
      "kod": "42008",
      "ad": "Çeltik",
      "ilKodu": "42"
    },
    {
      "kod": "42009",
      "ad": "Çumra",
      "ilKodu": "42"
    },
    {
      "kod": "42010",
      "ad": "Derbent",
      "ilKodu": "42"
    },
    {
      "kod": "42011",
      "ad": "Derebucak",
      "ilKodu": "42"
    },
    {
      "kod": "42012",
      "ad": "Doğanhisar",
      "ilKodu": "42"
    },
    {
      "kod": "42013",
      "ad": "Emirgazi",
      "ilKodu": "42"
    },
    {
      "kod": "42014",
      "ad": "Ereğli",
      "ilKodu": "42"
    },
    {
      "kod": "42015",
      "ad": "Güneysınır",
      "ilKodu": "42"
    },
    {
      "kod": "42016",
      "ad": "Hadim",
      "ilKodu": "42"
    },
    {
      "kod": "42017",
      "ad": "Halkapınar",
      "ilKodu": "42"
    },
    {
      "kod": "42018",
      "ad": "Hüyük",
      "ilKodu": "42"
    },
    {
      "kod": "42019",
      "ad": "Ilgın",
      "ilKodu": "42"
    },
    {
      "kod": "42020",
      "ad": "Kadınhanı",
      "ilKodu": "42"
    },
    {
      "kod": "42021",
      "ad": "Karapınar",
      "ilKodu": "42"
    },
    {
      "kod": "42022",
      "ad": "Karatay",
      "ilKodu": "42"
    },
    {
      "kod": "42023",
      "ad": "Kulu",
      "ilKodu": "42"
    },
    {
      "kod": "42024",
      "ad": "Meram",
      "ilKodu": "42"
    },
    {
      "kod": "42025",
      "ad": "Sarayönü",
      "ilKodu": "42"
    },
    {
      "kod": "42026",
      "ad": "Selçuklu",
      "ilKodu": "42"
    },
    {
      "kod": "42027",
      "ad": "Seydişehir",
      "ilKodu": "42"
    },
    {
      "kod": "42028",
      "ad": "Taşkent",
      "ilKodu": "42"
    },
    {
      "kod": "42029",
      "ad": "Tuzlukçu",
      "ilKodu": "42"
    },
    {
      "kod": "42030",
      "ad": "Yalıhüyük",
      "ilKodu": "42"
    },
    {
      "kod": "42031",
      "ad": "Yunak",
      "ilKodu": "42"
    }
  ],
  "43": [
    {
      "kod": "43001",
      "ad": "Altıntaş",
      "ilKodu": "43"
    },
    {
      "kod": "43002",
      "ad": "Aslanapa",
      "ilKodu": "43"
    },
    {
      "kod": "43003",
      "ad": "Çavdarhisar",
      "ilKodu": "43"
    },
    {
      "kod": "43004",
      "ad": "Domaniç",
      "ilKodu": "43"
    },
    {
      "kod": "43005",
      "ad": "Dumlupınar",
      "ilKodu": "43"
    },
    {
      "kod": "43006",
      "ad": "Emet",
      "ilKodu": "43"
    },
    {
      "kod": "43007",
      "ad": "Gediz",
      "ilKodu": "43"
    },
    {
      "kod": "43008",
      "ad": "Hisarcık",
      "ilKodu": "43"
    },
    {
      "kod": "43009",
      "ad": "Pazarlar",
      "ilKodu": "43"
    },
    {
      "kod": "43010",
      "ad": "Simav",
      "ilKodu": "43"
    },
    {
      "kod": "43011",
      "ad": "Şaphane",
      "ilKodu": "43"
    },
    {
      "kod": "43012",
      "ad": "Tavşanlı",
      "ilKodu": "43"
    }
  ],
  "44": [
    {
      "kod": "44001",
      "ad": "Akçadağ",
      "ilKodu": "44"
    },
    {
      "kod": "44002",
      "ad": "Arapgir",
      "ilKodu": "44"
    },
    {
      "kod": "44003",
      "ad": "Arguvan",
      "ilKodu": "44"
    },
    {
      "kod": "44004",
      "ad": "Battalgazi",
      "ilKodu": "44"
    },
    {
      "kod": "44005",
      "ad": "Darende",
      "ilKodu": "44"
    },
    {
      "kod": "44006",
      "ad": "Doğanşehir",
      "ilKodu": "44"
    },
    {
      "kod": "44007",
      "ad": "Doğanyol",
      "ilKodu": "44"
    },
    {
      "kod": "44008",
      "ad": "Hekimhan",
      "ilKodu": "44"
    },
    {
      "kod": "44009",
      "ad": "Kale",
      "ilKodu": "44"
    },
    {
      "kod": "44010",
      "ad": "Kuluncak",
      "ilKodu": "44"
    },
    {
      "kod": "44011",
      "ad": "Pütürge",
      "ilKodu": "44"
    },
    {
      "kod": "44012",
      "ad": "Yazıhan",
      "ilKodu": "44"
    },
    {
      "kod": "44013",
      "ad": "Yeşilyurt",
      "ilKodu": "44"
    }
  ],
  "45": [
    {
      "kod": "45001",
      "ad": "Ahmetli",
      "ilKodu": "45"
    },
    {
      "kod": "45002",
      "ad": "Akhisar",
      "ilKodu": "45"
    },
    {
      "kod": "45003",
      "ad": "Alaşehir",
      "ilKodu": "45"
    },
    {
      "kod": "45004",
      "ad": "Demirci",
      "ilKodu": "45"
    },
    {
      "kod": "45005",
      "ad": "Gölmarmara",
      "ilKodu": "45"
    },
    {
      "kod": "45006",
      "ad": "Gördes",
      "ilKodu": "45"
    },
    {
      "kod": "45007",
      "ad": "Kırkağaç",
      "ilKodu": "45"
    },
    {
      "kod": "45008",
      "ad": "Köprübaşı",
      "ilKodu": "45"
    },
    {
      "kod": "45009",
      "ad": "Kula",
      "ilKodu": "45"
    },
    {
      "kod": "45010",
      "ad": "Salihli",
      "ilKodu": "45"
    },
    {
      "kod": "45011",
      "ad": "Sarıgöl",
      "ilKodu": "45"
    },
    {
      "kod": "45012",
      "ad": "Saruhanlı",
      "ilKodu": "45"
    },
    {
      "kod": "45013",
      "ad": "Selendi",
      "ilKodu": "45"
    },
    {
      "kod": "45014",
      "ad": "Soma",
      "ilKodu": "45"
    },
    {
      "kod": "45015",
      "ad": "Şehzadeler",
      "ilKodu": "45"
    },
    {
      "kod": "45016",
      "ad": "Turgutlu",
      "ilKodu": "45"
    },
    {
      "kod": "45017",
      "ad": "Yunusemre",
      "ilKodu": "45"
    }
  ],
  "46": [
    {
      "kod": "46001",
      "ad": "Afşin",
      "ilKodu": "46"
    },
    {
      "kod": "46002",
      "ad": "Andırın",
      "ilKodu": "46"
    },
    {
      "kod": "46003",
      "ad": "Çağlayancerit",
      "ilKodu": "46"
    },
    {
      "kod": "46004",
      "ad": "Dulkadiroğlu",
      "ilKodu": "46"
    },
    {
      "kod": "46005",
      "ad": "Ekinözü",
      "ilKodu": "46"
    },
    {
      "kod": "46006",
      "ad": "Elbistan",
      "ilKodu": "46"
    },
    {
      "kod": "46007",
      "ad": "Göksun",
      "ilKodu": "46"
    },
    {
      "kod": "46008",
      "ad": "Nurhak",
      "ilKodu": "46"
    },
    {
      "kod": "46009",
      "ad": "Onikişubat",
      "ilKodu": "46"
    },
    {
      "kod": "46010",
      "ad": "Pazarcık",
      "ilKodu": "46"
    },
    {
      "kod": "46011",
      "ad": "Türkoğlu",
      "ilKodu": "46"
    }
  ],
  "47": [
    {
      "kod": "47001",
      "ad": "Artuklu",
      "ilKodu": "47"
    },
    {
      "kod": "47002",
      "ad": "Dargeçit",
      "ilKodu": "47"
    },
    {
      "kod": "47003",
      "ad": "Derik",
      "ilKodu": "47"
    },
    {
      "kod": "47004",
      "ad": "Kızıltepe",
      "ilKodu": "47"
    },
    {
      "kod": "47005",
      "ad": "Mazıdağı",
      "ilKodu": "47"
    },
    {
      "kod": "47006",
      "ad": "Midyat",
      "ilKodu": "47"
    },
    {
      "kod": "47007",
      "ad": "Nusaybin",
      "ilKodu": "47"
    },
    {
      "kod": "47008",
      "ad": "Ömerli",
      "ilKodu": "47"
    },
    {
      "kod": "47009",
      "ad": "Savur",
      "ilKodu": "47"
    },
    {
      "kod": "47010",
      "ad": "Yeşilli",
      "ilKodu": "47"
    }
  ],
  "48": [
    {
      "kod": "48001",
      "ad": "Bodrum",
      "ilKodu": "48"
    },
    {
      "kod": "48002",
      "ad": "Dalaman",
      "ilKodu": "48"
    },
    {
      "kod": "48003",
      "ad": "Datça",
      "ilKodu": "48"
    },
    {
      "kod": "48004",
      "ad": "Fethiye",
      "ilKodu": "48"
    },
    {
      "kod": "48005",
      "ad": "Kavaklıdere",
      "ilKodu": "48"
    },
    {
      "kod": "48006",
      "ad": "Köyceğiz",
      "ilKodu": "48"
    },
    {
      "kod": "48007",
      "ad": "Marmaris",
      "ilKodu": "48"
    },
    {
      "kod": "48008",
      "ad": "Menteşe",
      "ilKodu": "48"
    },
    {
      "kod": "48009",
      "ad": "Milas",
      "ilKodu": "48"
    },
    {
      "kod": "48010",
      "ad": "Ortaca",
      "ilKodu": "48"
    },
    {
      "kod": "48011",
      "ad": "Seydikemer",
      "ilKodu": "48"
    },
    {
      "kod": "48012",
      "ad": "Ula",
      "ilKodu": "48"
    },
    {
      "kod": "48013",
      "ad": "Yatağan",
      "ilKodu": "48"
    }
  ],
  "49": [
    {
      "kod": "49001",
      "ad": "Bulanık",
      "ilKodu": "49"
    },
    {
      "kod": "49002",
      "ad": "Hasköy",
      "ilKodu": "49"
    },
    {
      "kod": "49003",
      "ad": "Korkut",
      "ilKodu": "49"
    },
    {
      "kod": "49004",
      "ad": "Malazgirt",
      "ilKodu": "49"
    },
    {
      "kod": "49005",
      "ad": "Varto",
      "ilKodu": "49"
    }
  ],
  "50": [
    {
      "kod": "50001",
      "ad": "Acıgöl",
      "ilKodu": "50"
    },
    {
      "kod": "50002",
      "ad": "Avanos",
      "ilKodu": "50"
    },
    {
      "kod": "50003",
      "ad": "Derinkuyu",
      "ilKodu": "50"
    },
    {
      "kod": "50004",
      "ad": "Gülşehir",
      "ilKodu": "50"
    },
    {
      "kod": "50005",
      "ad": "Hacıbektaş",
      "ilKodu": "50"
    },
    {
      "kod": "50006",
      "ad": "Kozaklı",
      "ilKodu": "50"
    },
    {
      "kod": "50007",
      "ad": "Ürgüp",
      "ilKodu": "50"
    }
  ],
  "51": [
    {
      "kod": "51001",
      "ad": "Altunhisar",
      "ilKodu": "51"
    },
    {
      "kod": "51002",
      "ad": "Bor",
      "ilKodu": "51"
    },
    {
      "kod": "51003",
      "ad": "Çamardı",
      "ilKodu": "51"
    },
    {
      "kod": "51004",
      "ad": "Çiftlik",
      "ilKodu": "51"
    },
    {
      "kod": "51005",
      "ad": "Ulukışla",
      "ilKodu": "51"
    }
  ],
  "52": [
    {
      "kod": "52001",
      "ad": "Akkuş",
      "ilKodu": "52"
    },
    {
      "kod": "52002",
      "ad": "Altınordu",
      "ilKodu": "52"
    },
    {
      "kod": "52003",
      "ad": "Aybastı",
      "ilKodu": "52"
    },
    {
      "kod": "52004",
      "ad": "Çamaş",
      "ilKodu": "52"
    },
    {
      "kod": "52005",
      "ad": "Çatalpınar",
      "ilKodu": "52"
    },
    {
      "kod": "52006",
      "ad": "Çaybaşı",
      "ilKodu": "52"
    },
    {
      "kod": "52007",
      "ad": "Fatsa",
      "ilKodu": "52"
    },
    {
      "kod": "52008",
      "ad": "Gölköy",
      "ilKodu": "52"
    },
    {
      "kod": "52009",
      "ad": "Gülyalı",
      "ilKodu": "52"
    },
    {
      "kod": "52010",
      "ad": "Gürgentepe",
      "ilKodu": "52"
    },
    {
      "kod": "52011",
      "ad": "İkizce",
      "ilKodu": "52"
    },
    {
      "kod": "52012",
      "ad": "Kabadüz",
      "ilKodu": "52"
    },
    {
      "kod": "52013",
      "ad": "Kabataş",
      "ilKodu": "52"
    },
    {
      "kod": "52014",
      "ad": "Korgan",
      "ilKodu": "52"
    },
    {
      "kod": "52015",
      "ad": "Kumru",
      "ilKodu": "52"
    },
    {
      "kod": "52016",
      "ad": "Mesudiye",
      "ilKodu": "52"
    },
    {
      "kod": "52017",
      "ad": "Perşembe",
      "ilKodu": "52"
    },
    {
      "kod": "52018",
      "ad": "Ulubey",
      "ilKodu": "52"
    },
    {
      "kod": "52019",
      "ad": "Ünye",
      "ilKodu": "52"
    }
  ],
  "53": [
    {
      "kod": "53001",
      "ad": "Ardeşen",
      "ilKodu": "53"
    },
    {
      "kod": "53002",
      "ad": "Çamlıhemşin",
      "ilKodu": "53"
    },
    {
      "kod": "53003",
      "ad": "Çayeli",
      "ilKodu": "53"
    },
    {
      "kod": "53004",
      "ad": "Derepazarı",
      "ilKodu": "53"
    },
    {
      "kod": "53005",
      "ad": "Fındıklı",
      "ilKodu": "53"
    },
    {
      "kod": "53006",
      "ad": "Güneysu",
      "ilKodu": "53"
    },
    {
      "kod": "53007",
      "ad": "Hemşin",
      "ilKodu": "53"
    },
    {
      "kod": "53008",
      "ad": "İkizdere",
      "ilKodu": "53"
    },
    {
      "kod": "53009",
      "ad": "İyidere",
      "ilKodu": "53"
    },
    {
      "kod": "53010",
      "ad": "Kalkandere",
      "ilKodu": "53"
    },
    {
      "kod": "53011",
      "ad": "Pazar",
      "ilKodu": "53"
    }
  ],
  "54": [
    {
      "kod": "54001",
      "ad": "Adapazarı",
      "ilKodu": "54"
    },
    {
      "kod": "54002",
      "ad": "Akyazı",
      "ilKodu": "54"
    },
    {
      "kod": "54003",
      "ad": "Arifiye",
      "ilKodu": "54"
    },
    {
      "kod": "54004",
      "ad": "Erenler",
      "ilKodu": "54"
    },
    {
      "kod": "54005",
      "ad": "Ferizli",
      "ilKodu": "54"
    },
    {
      "kod": "54006",
      "ad": "Geyve",
      "ilKodu": "54"
    },
    {
      "kod": "54007",
      "ad": "Hendek",
      "ilKodu": "54"
    },
    {
      "kod": "54008",
      "ad": "Karapürçek",
      "ilKodu": "54"
    },
    {
      "kod": "54009",
      "ad": "Karasu",
      "ilKodu": "54"
    },
    {
      "kod": "54010",
      "ad": "Kaynarca",
      "ilKodu": "54"
    },
    {
      "kod": "54011",
      "ad": "Kocaali",
      "ilKodu": "54"
    },
    {
      "kod": "54012",
      "ad": "Pamukova",
      "ilKodu": "54"
    },
    {
      "kod": "54013",
      "ad": "Sapanca",
      "ilKodu": "54"
    },
    {
      "kod": "54014",
      "ad": "Serdivan",
      "ilKodu": "54"
    },
    {
      "kod": "54015",
      "ad": "Söğütlü",
      "ilKodu": "54"
    },
    {
      "kod": "54016",
      "ad": "Taraklı",
      "ilKodu": "54"
    }
  ],
  "55": [
    {
      "kod": "55001",
      "ad": "19 Mayıs",
      "ilKodu": "55"
    },
    {
      "kod": "55002",
      "ad": "Alaçam",
      "ilKodu": "55"
    },
    {
      "kod": "55003",
      "ad": "Asarcık",
      "ilKodu": "55"
    },
    {
      "kod": "55004",
      "ad": "Atakum",
      "ilKodu": "55"
    },
    {
      "kod": "55005",
      "ad": "Ayvacık",
      "ilKodu": "55"
    },
    {
      "kod": "55006",
      "ad": "Bafra",
      "ilKodu": "55"
    },
    {
      "kod": "55007",
      "ad": "Canik",
      "ilKodu": "55"
    },
    {
      "kod": "55008",
      "ad": "Çarşamba",
      "ilKodu": "55"
    },
    {
      "kod": "55009",
      "ad": "Havza",
      "ilKodu": "55"
    },
    {
      "kod": "55010",
      "ad": "İlkadım",
      "ilKodu": "55"
    },
    {
      "kod": "55011",
      "ad": "Kavak",
      "ilKodu": "55"
    },
    {
      "kod": "55012",
      "ad": "Ladik",
      "ilKodu": "55"
    },
    {
      "kod": "55013",
      "ad": "Salıpazarı",
      "ilKodu": "55"
    },
    {
      "kod": "55014",
      "ad": "Tekkeköy",
      "ilKodu": "55"
    },
    {
      "kod": "55015",
      "ad": "Terme",
      "ilKodu": "55"
    },
    {
      "kod": "55016",
      "ad": "Vezirköprü",
      "ilKodu": "55"
    },
    {
      "kod": "55017",
      "ad": "Yakakent",
      "ilKodu": "55"
    }
  ],
  "56": [
    {
      "kod": "56001",
      "ad": "Baykan",
      "ilKodu": "56"
    },
    {
      "kod": "56002",
      "ad": "Eruh",
      "ilKodu": "56"
    },
    {
      "kod": "56003",
      "ad": "Kurtalan",
      "ilKodu": "56"
    },
    {
      "kod": "56004",
      "ad": "Pervari",
      "ilKodu": "56"
    },
    {
      "kod": "56005",
      "ad": "Şirvan",
      "ilKodu": "56"
    },
    {
      "kod": "56006",
      "ad": "Tillo",
      "ilKodu": "56"
    }
  ],
  "57": [
    {
      "kod": "57001",
      "ad": "Ayancık",
      "ilKodu": "57"
    },
    {
      "kod": "57002",
      "ad": "Boyabat",
      "ilKodu": "57"
    },
    {
      "kod": "57003",
      "ad": "Dikmen",
      "ilKodu": "57"
    },
    {
      "kod": "57004",
      "ad": "Durağan",
      "ilKodu": "57"
    },
    {
      "kod": "57005",
      "ad": "Erfelek",
      "ilKodu": "57"
    },
    {
      "kod": "57006",
      "ad": "Gerze",
      "ilKodu": "57"
    },
    {
      "kod": "57007",
      "ad": "Saraydüzü",
      "ilKodu": "57"
    },
    {
      "kod": "57008",
      "ad": "Türkeli",
      "ilKodu": "57"
    }
  ],
  "58": [
    {
      "kod": "58001",
      "ad": "Akıncılar",
      "ilKodu": "58"
    },
    {
      "kod": "58002",
      "ad": "Altınyayla",
      "ilKodu": "58"
    },
    {
      "kod": "58003",
      "ad": "Divriği",
      "ilKodu": "58"
    },
    {
      "kod": "58004",
      "ad": "Doğanşar",
      "ilKodu": "58"
    },
    {
      "kod": "58005",
      "ad": "Gemerek",
      "ilKodu": "58"
    },
    {
      "kod": "58006",
      "ad": "Gölova",
      "ilKodu": "58"
    },
    {
      "kod": "58007",
      "ad": "Gürün",
      "ilKodu": "58"
    },
    {
      "kod": "58008",
      "ad": "Hafik",
      "ilKodu": "58"
    },
    {
      "kod": "58009",
      "ad": "İmranlı",
      "ilKodu": "58"
    },
    {
      "kod": "58010",
      "ad": "Kangal",
      "ilKodu": "58"
    },
    {
      "kod": "58011",
      "ad": "Koyulhisar",
      "ilKodu": "58"
    },
    {
      "kod": "58012",
      "ad": "Suşehri",
      "ilKodu": "58"
    },
    {
      "kod": "58013",
      "ad": "Şarkışla",
      "ilKodu": "58"
    },
    {
      "kod": "58014",
      "ad": "Ulaş",
      "ilKodu": "58"
    },
    {
      "kod": "58015",
      "ad": "Yıldızeli",
      "ilKodu": "58"
    },
    {
      "kod": "58016",
      "ad": "Zara",
      "ilKodu": "58"
    }
  ],
  "59": [
    {
      "kod": "59001",
      "ad": "Çerkezköy",
      "ilKodu": "59"
    },
    {
      "kod": "59002",
      "ad": "Çorlu",
      "ilKodu": "59"
    },
    {
      "kod": "59003",
      "ad": "Ergene",
      "ilKodu": "59"
    },
    {
      "kod": "59004",
      "ad": "Hayrabolu",
      "ilKodu": "59"
    },
    {
      "kod": "59005",
      "ad": "Kapaklı",
      "ilKodu": "59"
    },
    {
      "kod": "59006",
      "ad": "Malkara",
      "ilKodu": "59"
    },
    {
      "kod": "59007",
      "ad": "Marmaraereğlisi",
      "ilKodu": "59"
    },
    {
      "kod": "59008",
      "ad": "Muratlı",
      "ilKodu": "59"
    },
    {
      "kod": "59009",
      "ad": "Saray",
      "ilKodu": "59"
    },
    {
      "kod": "59010",
      "ad": "Süleymanpaşa",
      "ilKodu": "59"
    },
    {
      "kod": "59011",
      "ad": "Şarköy",
      "ilKodu": "59"
    }
  ],
  "60": [
    {
      "kod": "60001",
      "ad": "Almus",
      "ilKodu": "60"
    },
    {
      "kod": "60002",
      "ad": "Artova",
      "ilKodu": "60"
    },
    {
      "kod": "60003",
      "ad": "Başçiftlik",
      "ilKodu": "60"
    },
    {
      "kod": "60004",
      "ad": "Erbaa",
      "ilKodu": "60"
    },
    {
      "kod": "60005",
      "ad": "Niksar",
      "ilKodu": "60"
    },
    {
      "kod": "60006",
      "ad": "Pazar",
      "ilKodu": "60"
    },
    {
      "kod": "60007",
      "ad": "Reşadiye",
      "ilKodu": "60"
    },
    {
      "kod": "60008",
      "ad": "Sulusaray",
      "ilKodu": "60"
    },
    {
      "kod": "60009",
      "ad": "Turhal",
      "ilKodu": "60"
    },
    {
      "kod": "60010",
      "ad": "Yeşilyurt",
      "ilKodu": "60"
    },
    {
      "kod": "60011",
      "ad": "Zile",
      "ilKodu": "60"
    }
  ],
  "61": [
    {
      "kod": "61001",
      "ad": "Akçaabat",
      "ilKodu": "61"
    },
    {
      "kod": "61002",
      "ad": "Araklı",
      "ilKodu": "61"
    },
    {
      "kod": "61003",
      "ad": "Arsin",
      "ilKodu": "61"
    },
    {
      "kod": "61004",
      "ad": "Beşikdüzü",
      "ilKodu": "61"
    },
    {
      "kod": "61005",
      "ad": "Çarşıbaşı",
      "ilKodu": "61"
    },
    {
      "kod": "61006",
      "ad": "Çaykara",
      "ilKodu": "61"
    },
    {
      "kod": "61007",
      "ad": "Dernekpazarı",
      "ilKodu": "61"
    },
    {
      "kod": "61008",
      "ad": "Düzköy",
      "ilKodu": "61"
    },
    {
      "kod": "61009",
      "ad": "Hayrat",
      "ilKodu": "61"
    },
    {
      "kod": "61010",
      "ad": "Köprübaşı",
      "ilKodu": "61"
    },
    {
      "kod": "61011",
      "ad": "Maçka",
      "ilKodu": "61"
    },
    {
      "kod": "61012",
      "ad": "Of",
      "ilKodu": "61"
    },
    {
      "kod": "61013",
      "ad": "Ortahisar",
      "ilKodu": "61"
    },
    {
      "kod": "61014",
      "ad": "Sürmene",
      "ilKodu": "61"
    },
    {
      "kod": "61015",
      "ad": "Şalpazarı",
      "ilKodu": "61"
    },
    {
      "kod": "61016",
      "ad": "Tonya",
      "ilKodu": "61"
    },
    {
      "kod": "61017",
      "ad": "Vakfıkebir",
      "ilKodu": "61"
    },
    {
      "kod": "61018",
      "ad": "Yomra",
      "ilKodu": "61"
    }
  ],
  "62": [
    {
      "kod": "62001",
      "ad": "Çemişgezek",
      "ilKodu": "62"
    },
    {
      "kod": "62002",
      "ad": "Hozat",
      "ilKodu": "62"
    },
    {
      "kod": "62003",
      "ad": "Mazgirt",
      "ilKodu": "62"
    },
    {
      "kod": "62004",
      "ad": "Nazımiye",
      "ilKodu": "62"
    },
    {
      "kod": "62005",
      "ad": "Ovacık",
      "ilKodu": "62"
    },
    {
      "kod": "62006",
      "ad": "Pertek",
      "ilKodu": "62"
    },
    {
      "kod": "62007",
      "ad": "Pülümür",
      "ilKodu": "62"
    }
  ],
  "63": [
    {
      "kod": "63001",
      "ad": "Akçakale",
      "ilKodu": "63"
    },
    {
      "kod": "63002",
      "ad": "Birecik",
      "ilKodu": "63"
    },
    {
      "kod": "63003",
      "ad": "Bozova",
      "ilKodu": "63"
    },
    {
      "kod": "63004",
      "ad": "Ceylanpınar",
      "ilKodu": "63"
    },
    {
      "kod": "63005",
      "ad": "Eyyübiye",
      "ilKodu": "63"
    },
    {
      "kod": "63006",
      "ad": "Halfeti",
      "ilKodu": "63"
    },
    {
      "kod": "63007",
      "ad": "Haliliye",
      "ilKodu": "63"
    },
    {
      "kod": "63008",
      "ad": "Harran",
      "ilKodu": "63"
    },
    {
      "kod": "63009",
      "ad": "Hilvan",
      "ilKodu": "63"
    },
    {
      "kod": "63010",
      "ad": "Karaköprü",
      "ilKodu": "63"
    },
    {
      "kod": "63011",
      "ad": "Siverek",
      "ilKodu": "63"
    },
    {
      "kod": "63012",
      "ad": "Suruç",
      "ilKodu": "63"
    },
    {
      "kod": "63013",
      "ad": "Viranşehir",
      "ilKodu": "63"
    }
  ],
  "64": [
    {
      "kod": "64001",
      "ad": "Banaz",
      "ilKodu": "64"
    },
    {
      "kod": "64002",
      "ad": "Eşme",
      "ilKodu": "64"
    },
    {
      "kod": "64003",
      "ad": "Karahallı",
      "ilKodu": "64"
    },
    {
      "kod": "64004",
      "ad": "Sivaslı",
      "ilKodu": "64"
    },
    {
      "kod": "64005",
      "ad": "Ulubey",
      "ilKodu": "64"
    }
  ],
  "65": [
    {
      "kod": "65001",
      "ad": "Bahçesaray",
      "ilKodu": "65"
    },
    {
      "kod": "65002",
      "ad": "Başkale",
      "ilKodu": "65"
    },
    {
      "kod": "65003",
      "ad": "Çaldıran",
      "ilKodu": "65"
    },
    {
      "kod": "65004",
      "ad": "Çatak",
      "ilKodu": "65"
    },
    {
      "kod": "65005",
      "ad": "Edremit",
      "ilKodu": "65"
    },
    {
      "kod": "65006",
      "ad": "Erciş",
      "ilKodu": "65"
    },
    {
      "kod": "65007",
      "ad": "Gevaş",
      "ilKodu": "65"
    },
    {
      "kod": "65008",
      "ad": "Gürpınar",
      "ilKodu": "65"
    },
    {
      "kod": "65009",
      "ad": "İpekyolu",
      "ilKodu": "65"
    },
    {
      "kod": "65010",
      "ad": "Muradiye",
      "ilKodu": "65"
    },
    {
      "kod": "65011",
      "ad": "Özalp",
      "ilKodu": "65"
    },
    {
      "kod": "65012",
      "ad": "Saray",
      "ilKodu": "65"
    },
    {
      "kod": "65013",
      "ad": "Tuşba",
      "ilKodu": "65"
    }
  ],
  "66": [
    {
      "kod": "66001",
      "ad": "Akdağmadeni",
      "ilKodu": "66"
    },
    {
      "kod": "66002",
      "ad": "Aydıncık",
      "ilKodu": "66"
    },
    {
      "kod": "66003",
      "ad": "Boğazlıyan",
      "ilKodu": "66"
    },
    {
      "kod": "66004",
      "ad": "Çandır",
      "ilKodu": "66"
    },
    {
      "kod": "66005",
      "ad": "Çayıralan",
      "ilKodu": "66"
    },
    {
      "kod": "66006",
      "ad": "Çekerek",
      "ilKodu": "66"
    },
    {
      "kod": "66007",
      "ad": "Kadışehri",
      "ilKodu": "66"
    },
    {
      "kod": "66008",
      "ad": "Saraykent",
      "ilKodu": "66"
    },
    {
      "kod": "66009",
      "ad": "Sarıkaya",
      "ilKodu": "66"
    },
    {
      "kod": "66010",
      "ad": "Sorgun",
      "ilKodu": "66"
    },
    {
      "kod": "66011",
      "ad": "Şefaatli",
      "ilKodu": "66"
    },
    {
      "kod": "66012",
      "ad": "Yenifakılı",
      "ilKodu": "66"
    },
    {
      "kod": "66013",
      "ad": "Yerköy",
      "ilKodu": "66"
    }
  ],
  "67": [
    {
      "kod": "67001",
      "ad": "Alaplı",
      "ilKodu": "67"
    },
    {
      "kod": "67002",
      "ad": "Çaycuma",
      "ilKodu": "67"
    },
    {
      "kod": "67003",
      "ad": "Devrek",
      "ilKodu": "67"
    },
    {
      "kod": "67004",
      "ad": "Ereğli",
      "ilKodu": "67"
    },
    {
      "kod": "67005",
      "ad": "Gökçebey",
      "ilKodu": "67"
    },
    {
      "kod": "67006",
      "ad": "Kilimli",
      "ilKodu": "67"
    },
    {
      "kod": "67007",
      "ad": "Kozlu",
      "ilKodu": "67"
    }
  ],
  "68": [
    {
      "kod": "68001",
      "ad": "Ağaçören",
      "ilKodu": "68"
    },
    {
      "kod": "68002",
      "ad": "Eskil",
      "ilKodu": "68"
    },
    {
      "kod": "68003",
      "ad": "Gülağaç",
      "ilKodu": "68"
    },
    {
      "kod": "68004",
      "ad": "Güzelyurt",
      "ilKodu": "68"
    },
    {
      "kod": "68005",
      "ad": "Ortaköy",
      "ilKodu": "68"
    },
    {
      "kod": "68006",
      "ad": "Sarıyahşi",
      "ilKodu": "68"
    },
    {
      "kod": "68007",
      "ad": "Sultanhanı",
      "ilKodu": "68"
    }
  ],
  "69": [
    {
      "kod": "69001",
      "ad": "Aydıntepe",
      "ilKodu": "69"
    },
    {
      "kod": "69002",
      "ad": "Demirözü",
      "ilKodu": "69"
    }
  ],
  "70": [
    {
      "kod": "70001",
      "ad": "Ayrancı",
      "ilKodu": "70"
    },
    {
      "kod": "70002",
      "ad": "Başyayla",
      "ilKodu": "70"
    },
    {
      "kod": "70003",
      "ad": "Ermenek",
      "ilKodu": "70"
    },
    {
      "kod": "70004",
      "ad": "Kazımkarabekir",
      "ilKodu": "70"
    },
    {
      "kod": "70005",
      "ad": "Sarıveliler",
      "ilKodu": "70"
    }
  ],
  "71": [
    {
      "kod": "71001",
      "ad": "Bahşılı",
      "ilKodu": "71"
    },
    {
      "kod": "71002",
      "ad": "Balışeyh",
      "ilKodu": "71"
    },
    {
      "kod": "71003",
      "ad": "Çelebi",
      "ilKodu": "71"
    },
    {
      "kod": "71004",
      "ad": "Delice",
      "ilKodu": "71"
    },
    {
      "kod": "71005",
      "ad": "Karakeçili",
      "ilKodu": "71"
    },
    {
      "kod": "71006",
      "ad": "Keskin",
      "ilKodu": "71"
    },
    {
      "kod": "71007",
      "ad": "Sulakyurt",
      "ilKodu": "71"
    },
    {
      "kod": "71008",
      "ad": "Yahşihan",
      "ilKodu": "71"
    }
  ],
  "72": [
    {
      "kod": "72001",
      "ad": "Beşiri",
      "ilKodu": "72"
    },
    {
      "kod": "72002",
      "ad": "Gercüş",
      "ilKodu": "72"
    },
    {
      "kod": "72003",
      "ad": "Hasankeyf",
      "ilKodu": "72"
    },
    {
      "kod": "72004",
      "ad": "Kozluk",
      "ilKodu": "72"
    },
    {
      "kod": "72005",
      "ad": "Sason",
      "ilKodu": "72"
    }
  ],
  "73": [
    {
      "kod": "73001",
      "ad": "Beytüşşebap",
      "ilKodu": "73"
    },
    {
      "kod": "73002",
      "ad": "Cizre",
      "ilKodu": "73"
    },
    {
      "kod": "73003",
      "ad": "Güçlükonak",
      "ilKodu": "73"
    },
    {
      "kod": "73004",
      "ad": "İdil",
      "ilKodu": "73"
    },
    {
      "kod": "73005",
      "ad": "Silopi",
      "ilKodu": "73"
    },
    {
      "kod": "73006",
      "ad": "Uludere",
      "ilKodu": "73"
    }
  ],
  "74": [
    {
      "kod": "74001",
      "ad": "Amasra",
      "ilKodu": "74"
    },
    {
      "kod": "74002",
      "ad": "Kurucaşile",
      "ilKodu": "74"
    },
    {
      "kod": "74003",
      "ad": "Ulus",
      "ilKodu": "74"
    }
  ],
  "75": [
    {
      "kod": "75001",
      "ad": "Çıldır",
      "ilKodu": "75"
    },
    {
      "kod": "75002",
      "ad": "Damal",
      "ilKodu": "75"
    },
    {
      "kod": "75003",
      "ad": "Göle",
      "ilKodu": "75"
    },
    {
      "kod": "75004",
      "ad": "Hanak",
      "ilKodu": "75"
    },
    {
      "kod": "75005",
      "ad": "Posof",
      "ilKodu": "75"
    }
  ],
  "76": [
    {
      "kod": "76001",
      "ad": "Aralık",
      "ilKodu": "76"
    },
    {
      "kod": "76002",
      "ad": "Karakoyunlu",
      "ilKodu": "76"
    },
    {
      "kod": "76003",
      "ad": "Tuzluca",
      "ilKodu": "76"
    }
  ],
  "77": [
    {
      "kod": "77001",
      "ad": "Altınova",
      "ilKodu": "77"
    },
    {
      "kod": "77002",
      "ad": "Armutlu",
      "ilKodu": "77"
    },
    {
      "kod": "77003",
      "ad": "Çınarcık",
      "ilKodu": "77"
    },
    {
      "kod": "77004",
      "ad": "Çiftlikköy",
      "ilKodu": "77"
    },
    {
      "kod": "77005",
      "ad": "Termal",
      "ilKodu": "77"
    }
  ],
  "78": [
    {
      "kod": "78001",
      "ad": "Eflani",
      "ilKodu": "78"
    },
    {
      "kod": "78002",
      "ad": "Eskipazar",
      "ilKodu": "78"
    },
    {
      "kod": "78003",
      "ad": "Ovacık",
      "ilKodu": "78"
    },
    {
      "kod": "78004",
      "ad": "Safranbolu",
      "ilKodu": "78"
    },
    {
      "kod": "78005",
      "ad": "Yenice",
      "ilKodu": "78"
    }
  ],
  "79": [
    {
      "kod": "79001",
      "ad": "Elbeyli",
      "ilKodu": "79"
    },
    {
      "kod": "79002",
      "ad": "Musabeyli",
      "ilKodu": "79"
    },
    {
      "kod": "79003",
      "ad": "Polateli",
      "ilKodu": "79"
    }
  ],
  "80": [
    {
      "kod": "80001",
      "ad": "Bahçe",
      "ilKodu": "80"
    },
    {
      "kod": "80002",
      "ad": "Düziçi",
      "ilKodu": "80"
    },
    {
      "kod": "80003",
      "ad": "Hasanbeyli",
      "ilKodu": "80"
    },
    {
      "kod": "80004",
      "ad": "Kadirli",
      "ilKodu": "80"
    },
    {
      "kod": "80005",
      "ad": "Sumbas",
      "ilKodu": "80"
    },
    {
      "kod": "80006",
      "ad": "Toprakkale",
      "ilKodu": "80"
    }
  ],
  "81": [
    {
      "kod": "81001",
      "ad": "Akçakoca",
      "ilKodu": "81"
    },
    {
      "kod": "81002",
      "ad": "Cumayeri",
      "ilKodu": "81"
    },
    {
      "kod": "81003",
      "ad": "Çilimli",
      "ilKodu": "81"
    },
    {
      "kod": "81004",
      "ad": "Gölyaka",
      "ilKodu": "81"
    },
    {
      "kod": "81005",
      "ad": "Gümüşova",
      "ilKodu": "81"
    },
    {
      "kod": "81006",
      "ad": "Kaynaşlı",
      "ilKodu": "81"
    },
    {
      "kod": "81007",
      "ad": "Yığılca",
      "ilKodu": "81"
    }
  ],
  "01": [
    {
      "kod": "01001",
      "ad": "Aladağ",
      "ilKodu": "01"
    },
    {
      "kod": "01002",
      "ad": "Ceyhan",
      "ilKodu": "01"
    },
    {
      "kod": "01003",
      "ad": "Çukurova",
      "ilKodu": "01"
    },
    {
      "kod": "01004",
      "ad": "Feke",
      "ilKodu": "01"
    },
    {
      "kod": "01005",
      "ad": "İmamoğlu",
      "ilKodu": "01"
    },
    {
      "kod": "01006",
      "ad": "Karaisalı",
      "ilKodu": "01"
    },
    {
      "kod": "01007",
      "ad": "Karataş",
      "ilKodu": "01"
    },
    {
      "kod": "01008",
      "ad": "Kozan",
      "ilKodu": "01"
    },
    {
      "kod": "01009",
      "ad": "Pozantı",
      "ilKodu": "01"
    },
    {
      "kod": "01010",
      "ad": "Saimbeyli",
      "ilKodu": "01"
    },
    {
      "kod": "01011",
      "ad": "Sarıçam",
      "ilKodu": "01"
    },
    {
      "kod": "01012",
      "ad": "Seyhan",
      "ilKodu": "01"
    },
    {
      "kod": "01013",
      "ad": "Tufanbeyli",
      "ilKodu": "01"
    },
    {
      "kod": "01014",
      "ad": "Yumurtalık",
      "ilKodu": "01"
    },
    {
      "kod": "01015",
      "ad": "Yüreğir",
      "ilKodu": "01"
    }
  ],
  "02": [
    {
      "kod": "02001",
      "ad": "Besni",
      "ilKodu": "02"
    },
    {
      "kod": "02002",
      "ad": "Çelikhan",
      "ilKodu": "02"
    },
    {
      "kod": "02003",
      "ad": "Gerger",
      "ilKodu": "02"
    },
    {
      "kod": "02004",
      "ad": "Gölbaşı",
      "ilKodu": "02"
    },
    {
      "kod": "02005",
      "ad": "Kahta",
      "ilKodu": "02"
    },
    {
      "kod": "02006",
      "ad": "Samsat",
      "ilKodu": "02"
    },
    {
      "kod": "02007",
      "ad": "Sincik",
      "ilKodu": "02"
    },
    {
      "kod": "02008",
      "ad": "Tut",
      "ilKodu": "02"
    }
  ],
  "03": [
    {
      "kod": "03001",
      "ad": "Başmakçı",
      "ilKodu": "03"
    },
    {
      "kod": "03002",
      "ad": "Bayat",
      "ilKodu": "03"
    },
    {
      "kod": "03003",
      "ad": "Bolvadin",
      "ilKodu": "03"
    },
    {
      "kod": "03004",
      "ad": "Çay",
      "ilKodu": "03"
    },
    {
      "kod": "03005",
      "ad": "Çobanlar",
      "ilKodu": "03"
    },
    {
      "kod": "03006",
      "ad": "Dazkırı",
      "ilKodu": "03"
    },
    {
      "kod": "03007",
      "ad": "Dinar",
      "ilKodu": "03"
    },
    {
      "kod": "03008",
      "ad": "Emirdağ",
      "ilKodu": "03"
    },
    {
      "kod": "03009",
      "ad": "Evciler",
      "ilKodu": "03"
    },
    {
      "kod": "03010",
      "ad": "Hocalar",
      "ilKodu": "03"
    },
    {
      "kod": "03011",
      "ad": "İhsaniye",
      "ilKodu": "03"
    },
    {
      "kod": "03012",
      "ad": "İscehisar",
      "ilKodu": "03"
    },
    {
      "kod": "03013",
      "ad": "Kızılören",
      "ilKodu": "03"
    },
    {
      "kod": "03014",
      "ad": "Sandıklı",
      "ilKodu": "03"
    },
    {
      "kod": "03015",
      "ad": "Sinanpaşa",
      "ilKodu": "03"
    },
    {
      "kod": "03016",
      "ad": "Sultandağı",
      "ilKodu": "03"
    },
    {
      "kod": "03017",
      "ad": "Şuhut",
      "ilKodu": "03"
    }
  ],
  "04": [
    {
      "kod": "04001",
      "ad": "Diyadin",
      "ilKodu": "04"
    },
    {
      "kod": "04002",
      "ad": "Doğubayazıt",
      "ilKodu": "04"
    },
    {
      "kod": "04003",
      "ad": "Eleşkirt",
      "ilKodu": "04"
    },
    {
      "kod": "04004",
      "ad": "Hamur",
      "ilKodu": "04"
    },
    {
      "kod": "04005",
      "ad": "Patnos",
      "ilKodu": "04"
    },
    {
      "kod": "04006",
      "ad": "Taşlıçay",
      "ilKodu": "04"
    },
    {
      "kod": "04007",
      "ad": "Tutak",
      "ilKodu": "04"
    }
  ],
  "05": [
    {
      "kod": "05001",
      "ad": "Göynücek",
      "ilKodu": "05"
    },
    {
      "kod": "05002",
      "ad": "Gümüşhacıköy",
      "ilKodu": "05"
    },
    {
      "kod": "05003",
      "ad": "Hamamözü",
      "ilKodu": "05"
    },
    {
      "kod": "05004",
      "ad": "Merzifon",
      "ilKodu": "05"
    },
    {
      "kod": "05005",
      "ad": "Suluova",
      "ilKodu": "05"
    },
    {
      "kod": "05006",
      "ad": "Taşova",
      "ilKodu": "05"
    }
  ],
  "06": [
    {
      "kod": "06001",
      "ad": "Akyurt",
      "ilKodu": "06"
    },
    {
      "kod": "06002",
      "ad": "Altındağ",
      "ilKodu": "06"
    },
    {
      "kod": "06003",
      "ad": "Ayaş",
      "ilKodu": "06"
    },
    {
      "kod": "06004",
      "ad": "Bala",
      "ilKodu": "06"
    },
    {
      "kod": "06005",
      "ad": "Beypazarı",
      "ilKodu": "06"
    },
    {
      "kod": "06006",
      "ad": "Çamlıdere",
      "ilKodu": "06"
    },
    {
      "kod": "06007",
      "ad": "Çankaya",
      "ilKodu": "06"
    },
    {
      "kod": "06008",
      "ad": "Çubuk",
      "ilKodu": "06"
    },
    {
      "kod": "06009",
      "ad": "Elmadağ",
      "ilKodu": "06"
    },
    {
      "kod": "06010",
      "ad": "Etimesgut",
      "ilKodu": "06"
    },
    {
      "kod": "06011",
      "ad": "Evren",
      "ilKodu": "06"
    },
    {
      "kod": "06012",
      "ad": "Gölbaşı",
      "ilKodu": "06"
    },
    {
      "kod": "06013",
      "ad": "Güdül",
      "ilKodu": "06"
    },
    {
      "kod": "06014",
      "ad": "Haymana",
      "ilKodu": "06"
    },
    {
      "kod": "06015",
      "ad": "Kahramankazan",
      "ilKodu": "06"
    },
    {
      "kod": "06016",
      "ad": "Kalecik",
      "ilKodu": "06"
    },
    {
      "kod": "06017",
      "ad": "Keçiören",
      "ilKodu": "06"
    },
    {
      "kod": "06018",
      "ad": "Kızılcahamam",
      "ilKodu": "06"
    },
    {
      "kod": "06019",
      "ad": "Amak",
      "ilKodu": "06"
    },
    {
      "kod": "06020",
      "ad": "Nallıhan",
      "ilKodu": "06"
    },
    {
      "kod": "06021",
      "ad": "Polatlı",
      "ilKodu": "06"
    },
    {
      "kod": "06022",
      "ad": "Pursaklar",
      "ilKodu": "06"
    },
    {
      "kod": "06023",
      "ad": "Sincan",
      "ilKodu": "06"
    },
    {
      "kod": "06024",
      "ad": "Şereflikoçhisar",
      "ilKodu": "06"
    },
    {
      "kod": "06025",
      "ad": "Yenimahalle",
      "ilKodu": "06"
    }
  ],
  "07": [
    {
      "kod": "07001",
      "ad": "Akseki",
      "ilKodu": "07"
    },
    {
      "kod": "07002",
      "ad": "Aksu",
      "ilKodu": "07"
    },
    {
      "kod": "07003",
      "ad": "Alanya",
      "ilKodu": "07"
    },
    {
      "kod": "07004",
      "ad": "Demre",
      "ilKodu": "07"
    },
    {
      "kod": "07005",
      "ad": "Döşemealtı",
      "ilKodu": "07"
    },
    {
      "kod": "07006",
      "ad": "Elmalı",
      "ilKodu": "07"
    },
    {
      "kod": "07007",
      "ad": "Finike",
      "ilKodu": "07"
    },
    {
      "kod": "07008",
      "ad": "Gazipaşa",
      "ilKodu": "07"
    },
    {
      "kod": "07009",
      "ad": "Gündoğmuş",
      "ilKodu": "07"
    },
    {
      "kod": "07010",
      "ad": "İbradı",
      "ilKodu": "07"
    },
    {
      "kod": "07011",
      "ad": "Kaş",
      "ilKodu": "07"
    },
    {
      "kod": "07012",
      "ad": "Kemer",
      "ilKodu": "07"
    },
    {
      "kod": "07013",
      "ad": "Kepez",
      "ilKodu": "07"
    },
    {
      "kod": "07014",
      "ad": "Konyaaltı",
      "ilKodu": "07"
    },
    {
      "kod": "07015",
      "ad": "Korkuteli",
      "ilKodu": "07"
    },
    {
      "kod": "07016",
      "ad": "Kumluca",
      "ilKodu": "07"
    },
    {
      "kod": "07017",
      "ad": "Manavgat",
      "ilKodu": "07"
    },
    {
      "kod": "07018",
      "ad": "Muratpaşa",
      "ilKodu": "07"
    },
    {
      "kod": "07019",
      "ad": "Serik",
      "ilKodu": "07"
    }
  ],
  "08": [
    {
      "kod": "08001",
      "ad": "Ardanuç",
      "ilKodu": "08"
    },
    {
      "kod": "08002",
      "ad": "Arhavi",
      "ilKodu": "08"
    },
    {
      "kod": "08003",
      "ad": "Borçka",
      "ilKodu": "08"
    },
    {
      "kod": "08004",
      "ad": "Hopa",
      "ilKodu": "08"
    },
    {
      "kod": "08005",
      "ad": "Kemalpaşa",
      "ilKodu": "08"
    },
    {
      "kod": "08006",
      "ad": "Murgul",
      "ilKodu": "08"
    },
    {
      "kod": "08007",
      "ad": "Şavşat",
      "ilKodu": "08"
    },
    {
      "kod": "08008",
      "ad": "Yusufeli",
      "ilKodu": "08"
    }
  ],
  "09": [
    {
      "kod": "09001",
      "ad": "Bozdoğan",
      "ilKodu": "09"
    },
    {
      "kod": "09002",
      "ad": "Buharkent",
      "ilKodu": "09"
    },
    {
      "kod": "09003",
      "ad": "Çine",
      "ilKodu": "09"
    },
    {
      "kod": "09004",
      "ad": "Didim",
      "ilKodu": "09"
    },
    {
      "kod": "09005",
      "ad": "Efeler",
      "ilKodu": "09"
    },
    {
      "kod": "09006",
      "ad": "Germencik",
      "ilKodu": "09"
    },
    {
      "kod": "09007",
      "ad": "İncirliova",
      "ilKodu": "09"
    },
    {
      "kod": "09008",
      "ad": "Karacasu",
      "ilKodu": "09"
    },
    {
      "kod": "09009",
      "ad": "Karpuzlu",
      "ilKodu": "09"
    },
    {
      "kod": "09010",
      "ad": "Koçarlı",
      "ilKodu": "09"
    },
    {
      "kod": "09011",
      "ad": "Köşk",
      "ilKodu": "09"
    },
    {
      "kod": "09012",
      "ad": "Kuşadası",
      "ilKodu": "09"
    },
    {
      "kod": "09013",
      "ad": "Kuyucak",
      "ilKodu": "09"
    },
    {
      "kod": "09014",
      "ad": "Nazilli",
      "ilKodu": "09"
    },
    {
      "kod": "09015",
      "ad": "Söke",
      "ilKodu": "09"
    },
    {
      "kod": "09016",
      "ad": "Sultanhisar",
      "ilKodu": "09"
    },
    {
      "kod": "09017",
      "ad": "Yenipazar",
      "ilKodu": "09"
    }
  ]
}

// Yardımcı fonksiyonlar
export const LocationUtils = {
  /**
   * İlin koduna göre il bilgilerini döndürür
   */
  getIlByKod(kod: string): Il | undefined {
    return iller.find(il => il.kod === kod)
  },

  /**
   * İlin adına göre il bilgilerini döndürür
   */
  getIlByAd(ad: string): Il | undefined {
    return iller.find(il => il.ad.toLowerCase() === ad.toLowerCase())
  },

  /**
   * İlin plaka koduna göre il bilgilerini döndürür
   */
  getIlByPlaka(plakaKodu: string): Il | undefined {
    return iller.find(il => il.plakaKodu === plakaKodu)
  },

  /**
   * Belirli bir bölgeye ait illeri döndürür
   */
  getIllerByBolge(bolge: string): Il[] {
    return iller.filter(il => il.bolge === bolge)
  },

  /**
   * İle koduna göre ilçeleri döndürür
   */
  getIlcelerByIlKod(ilKodu: string): Ilce[] {
    return ilceler[ilKodu] || []
  },

  /**
   * İle adına göre ilçeleri döndürür
   */
  getIlcelerByIlAd(ilAd: string): Ilce[] {
    const il = this.getIlByAd(ilAd)
    return il ? this.getIlcelerByIlKod(il.kod) : []
  },

  /**
   * İlçe koduna göre ilçe bilgilerini döndürür
   */
  getIlceByKod(ilKodu: string, ilceKodu: string): Ilce | undefined {
    const ilcelerList = this.getIlcelerByIlKod(ilKodu)
    return ilcelerList.find(ilce => ilce.kod === ilceKodu)
  },

  /**
   * İlçe adına göre ilçe bilgilerini döndürür
   */
  getIlceByAd(ilKodu: string, ilceAd: string): Ilce | undefined {
    const ilcelerList = this.getIlcelerByIlKod(ilKodu)
    return ilcelerList.find(ilce => ilce.ad.toLowerCase() === ilceAd.toLowerCase())
  },
}

export default { iller, ilceler, LocationUtils }
