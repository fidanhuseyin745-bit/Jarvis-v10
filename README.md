# Jarvis v10

Türkçe AI asistanı. Niyet algılama tabanlı yönlendirme ile sohbet, araştırma,
piyasa, ders, telefon ve haber modüllerini çalıştırır.

## Kurulum

```bash
npm install
```

## Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın ve AI uç noktanızı girin:

```bash
cp .env.example .env
```

Gerekli değişkenler:

| Değişken        | Açıklama                                       |
|-----------------|------------------------------------------------|
| `AI_API_URL`    | OpenAI uyumlu chat completions uç noktası      |
| `AI_API_KEY`    | API anahtarı (varsa `Authorization: Bearer`)   |
| `AI_MODEL`      | Model adı (varsayılan: `jarvis-chat`)          |
| `AI_TIMEOUT`    | İstek zaman aşımı, ms (varsayılan: `60000`)    |
| `DEBUG`         | `true` ise karar çıktısını gösterir            |
| `AUTO_START_SERVICES` | `false` ise harici servis başlatmayı atlar |

AI yapılandırılmadığında Jarvis çökmez; çevrimdışı bir bilgilendirme mesajı
döndürür ve yerel niyet yönlendirmesi çalışmaya devam eder.

## Çalıştırma

```bash
npm start          # etkileşimli CLI
```

Komut satırına yazın, çıkmak için `exit`.

## Test

```bash
npm test
```

## Mimari (aktif kod yolu)

```
index.js                  CLI (readline) + servis önyüklemesi
└─ core/jarvis.js         execute(input) → engine.reply()
   └─ engine/
      ├─ engine.js        Engine: ai + memory, reply() kaydeder
      ├─ brain.js         decisionEngine kararını executor'a iletir
      ├─ decisionEngine.js  Türkçe anahtar kelimelerle niyet skorlama
      ├─ executor.js      plan adımlarını modüllere yönlendirir
      ├─ memory.js        sohbet geçmişini memory.json'a kaydeder
      └─ modules/         chat, news, market, study, phone, research
└─ ai/
   ├─ coder.js            OpenAI uyumlu API çağrısı + çevrimdışı fallback
   ├─ reasoningAI.js      haber/reasoner pipeline için AI özetleme
   └─ summarizer.js       AI erişilemezse kaynak özeti
└─ reasoner/              relevance, fact/entity/confidence, fusion, graph, learner
└─ agents/                webAgent (arama), phoneAgent (bridge)
└─ bridge/bridgeClient.js telefon komut köprüsü
└─ config/aiConfig.js     doğrulamalı AI ayarları
```

## Niyet yönlendirme

`decisionEngine` her girdi için niyet sınıflarını puanlar ve en yüksek
puanlıları `executor` çalıştırır:

- **market**: bitcoin, kripto, borsa, dolar, altın, hisse
- **study**: yks, tyt, ayt, matematik, fizik, kimya, biyoloji, ders
- **phone**: telefon, android, youtube, uygulama, chrome
- **coding**: node, javascript, python, kod, github, debug, hata
- **research**: araştır, incele, analiz et (derinlemesine AI araştırması)
- **news/web**: bugün, güncel, haber, nedir, nasıl (kaynak arama + reasoner)
- **chat**: diğer her şey

## Geliştirme notları

- Çalışan özellikler korundu; düzeltmeler aktif kod yoluna odaklandı.
- `memory.json` sohbet geçmişi tutar (varsayılan son 50 kayıt).
- Harici servisler (Web API, AI API) varsayılan olarak sessizce atlanır;
  varsa otomatik başlatılır.
