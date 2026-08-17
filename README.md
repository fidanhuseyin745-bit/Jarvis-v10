# Jarvis v10

Türkçe **tamamen yerel** kişisel AI asistanı. Dış API, internet veya API anahtarı
gerekmez — Jarvis kendi yazdığımız motoruyla (`localEngine`) bu cihazda çalışır.
Niyet algılama tabanlı yönlendirme ile sohbet, araştırma, piyasa, ders, telefon
ve haber modüllerini çalıştırır; bilgi tabanını sorgular, öğrenir ve hatırlar.

## Özellikler

- 💬 **Doğal sohbet** — Türkçe selamlama, sohbet, teşekkür, vedalaşma
- 📚 **Bilgi tabanı** — "ışık hızı nedir", "bitcoin nedir" gibi sorular
- 🧮 **Hesaplama** — "15 * 24", "100 / 4" gibi matematik işlemleri
- 🕐 **Saat/Tarih** — "saat kaç", "bugün günlerden ne"
- 🧠 **Öğrenme** — "öğret: ..." ile bilgi verir; sayı/içerik içeren cümleleri otomatik not alır
- 🗑️ **Unutma** — "unut" komutuyla öğrendiklerini temizler
- 🔍 **Araştırma** — "X araştır" ile derinlemesine modül
- 📰 **Haber/Piyasa** — reasoner pipeline ile kaynak analizi (yerel servis varsa)
- 🧠 **Hafıza** — geçmiş konuşmaları `memory.json`'a kaydeder, context olarak kullanır

## Kurulum

```bash
npm install
```

## Yapılandırma (isteğe bağlı)

Jarvis dış yapılandırma olmadan çalışır. İsteğe bağlı ayarlar için:

```bash
cp .env.example .env
```

| Değişken        | Açıklama                                       |
|-----------------|------------------------------------------------|
| `AI_MODEL`      | Model adı etiketi (varsayılan: `jarvis-local`) |
| `AI_TIMEOUT`    | İstek zaman aşımı, ms (varsayılan: `60000`)    |
| `DEBUG`         | `true` ise karar motoru çıktısını gösterir     |
| `AUTO_START_SERVICES` | `false` ise yerel servis başlatmayı atlar |

## Çalıştırma

```bash
npm start          # etkileşimli CLI
```

Komut satırına yazın, çıkmak için `exit`.

### Örnek oturum

```
Jarvis > merhaba
🤖 Merhaba! Ben Jarvis. Bugün sana nasıl yardımcı olabilirim?

Jarvis > 15 * 37
🤖 🧮 15*37 = 555

Jarvis > ışık hızı nedir
🤖 Işık hızı boşlukta yaklaşık 299.792.458 m/s (yaklaşık 300.000 km/s)...

Jarvis > öğret: Mars kırmızı gezegendir
🤖 Tamam, bunu öğrendim: Mars kırmızı gezegendir

Jarvis > mars nedir
🤖 Mars kırmızı gezegendir

Jarvis > saat kaç
🤖 🕐 Şu an saat 18:07. (Pazartesi, 17 Ağustos 2026)
```

## Test

```bash
npm test
```

## Mimari (aktif kod yolu)

```
index.js                  CLI (readline) + servis önyüklemesi
└─ core/jarvis.js         execute(input) → engine.reply()
   └─ engine/
      ├─ engine.js        Engine: ai + memory; reply() context toplar ve kaydeder
      ├─ brain.js         karar + yerel motor yönlendirmesi (chat önceliği)
      ├─ decisionEngine.js  Türkçe anahtar kelimelerle niyet skorlama
      ├─ executor.js      plan adımlarını modüllere yönlendirir
      ├─ memory.js        sohbet geçmişini memory.json'a kaydeder
      └─ modules/         chat, news, market, study, phone, research
└─ ai/
   ├─ localEngine.js      ⭐ Tamamen yerel AI motoru (NLU + cevap + fonksiyonlar)
   ├─ coder.js            localEngine sarmalayıcı
   ├─ reasoningAI.js      haber pipeline için yerel özetleme
   └─ summarizer.js       kaynak özeti
└─ knowledge/
   ├─ knowledgeBase.js    yerel bilgi tabanı (yerleşik + öğrenilen)
   ├─ builtinFacts.js     19 hazır bilgi (bilim, teknoloji, genel)
   └─ data/               kalıcı öğrenilen bilgiler (learned.json)
└─ reasoner/              relevance, fact/entity/confidence, fusion, graph, learner
└─ agents/                webAgent (arama), phoneAgent (bridge)
└─ bridge/bridgeClient.js telefon komut köprüsü
└─ config/aiConfig.js     yerel-only yapılandırma (geriye dönük uyumluluk)
```

## Niyet yönlendirme

`decisionEngine` her girdi için niyet sınıflarını puanlar; `brain.js` yerel
motor yeteneklerini (bilgi, matematik, saat, selamlama) önceliklendirir:

- **chat (localEngine)**: bilgi tabanı, matematik, saat/tarih, selamlama, öğrenme
- **market**: bitcoin, kripto, borsa, dolar, altın, hisse
- **study**: yks, tyt, ayt, matematik, fizik, kimya, biyoloji, ders
- **phone**: telefon, android, youtube, uygulama, chrome
- **coding**: node, javascript, python, kod, github, debug, hata
- **research**: araştır, incele, analiz et
- **news/web**: bugün, güncel, haber (yerel servis varsa kaynak analizi)

## Geliştirme notları

- **Dış bağımlılık yok**: `localEngine.js` axios veya dış API kullanmaz.
- `memory.json` sohbet geçmişi tutar (context-aware cevaplar için).
- `knowledge/data/learned.json` kullanıcı tarafından öğretilen bilgileri kalıcı saklar.
- Harici servisler (Web API) varsayılan olarak sessizce atlanır.
- `reasoner/` pipeline'ı tamamen kendi yazdığımız yerel analiz motorudur.
