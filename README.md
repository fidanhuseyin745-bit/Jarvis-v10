# 🤖 Jarvis v10

Yapay zeka destekli, skill kütüphanesi ve REST API'si olan kişisel asistan.

Jarvis, bir OpenAI uyumlu `/chat/completions` uç noktasına bağlanabilir; ancak **AI tanımlı olmasa bile** çalışır. Yerleşik skill'ler (hava durumu, kripto, döviz, çeviri, Wikipedia, şaka, söz, IP, web arama, GitHub, sözlük, hatırlatıcı, sistem, sayı) ücretsiz ve anahtar gerektirmeyen API'leri kullanır.

## Özellikler

- 🧠 **AI katmanı**: çok mesajlı sohbet, zarif (graceful) geri dönüş — uç nokta yoksa bile Jarvis bozulmaz.
- 🧩 **Skill kütüphanesi**: 14 hazır skill, otomatik yüklenir, istekleri otomatik eşleştirir.
- 🌐 **Gerçek web arama**: DuckDuckGo tabanlı, lokal sunucu bağımlılığı yok.
- 🚀 **REST API**: tüm yetenekleri HTTP üzerinden açar (`/api/chat`, `/api/weather`, ...).
- 🛠️ **Proje üretici**: Express/React/Vue/Next/Flask/FastAPI projeleri oluşturur ve modül ekler (jwt, login, docker, ...).
- 🧪 **Testler**: Jest ile birim testleri.
- 🔁 **CI**: GitHub Actions ile otomatik test + sözdizimi kontrolü.

## Kurulum

```bash
npm install
cp .env.example .env   # opsiyonel — AI uç noktasını buraya girin
```

## Kullanım

### CLI

```bash
npm start
```

Örnek komutlar:

```
hava durumu için istanbul
bitcoin fiyatı
dolar ne kadar
internette ara: node.js nedir
şaka yap
günün sözü
42 sayısı hakkında
github'da repo ara: express
```

### REST API

```bash
npm run serve
# veya
node webserver/index.js
```

Uçlar:

| Method | Uç | Açıklama |
|--------|----|-----------|
| GET | `/` | Bilgi |
| GET | `/health` | Sağlık |
| GET | `/meta` | Sürüm + skill listesi + AI durumu |
| GET | `/api/skills` | Skill listesi |
| POST | `/api/chat` | `{ "input": "..." }` — serbest sohbet |
| POST | `/api/dispatch` | `{ "input": "..." }` — önce skill, sonra AI |
| POST | `/api/weather` | `{ "input": "istanbul" }` |
| POST | `/api/crypto` | `{ "input": "bitcoin" }` |
| POST | `/api/currency` | `{ "input": "dolar" }` |
| POST | `/api/translate` | `{ "text": "merhaba", "target": "en" }` |
| POST | `/api/wikipedia` | `{ "input": "kuantum" }` |
| POST | `/api/joke` | `{}` |
| POST | `/api/quote` | `{}` |
| GET | `/api/ip` | IP bilgisi |
| GET | `/api/search?q=...` | Web arama |
| POST | `/api/github` | `{ "input": "express" }` |
| POST | `/api/dictionary` | `{ "word": "run" }` |
| POST | `/api/reminder` | `{ "input": "18:00 ekmek al" }` |
| GET | `/api/system` | Sistem bilgisi |
| POST | `/api/numbers` | `{ "number": 42 }` |

## Yapay Zeka yapılandırması

`AI_API_URL`, OpenAI uyumlu bir uç noktadır. Örnek:

```
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
AI_API_KEY=sk-...
```

Jarvis, `AI_API_URL` tanımsızsa `offline` moda geçer; serbest sohbet dışındaki tüm yetenekler çalışmaya devam eder.

## Test

```bash
npm test
```

## Sözdizimi kontrolü

```bash
npm run syntax
```

## 📱 Telefona Kurulum (Android APK)

Jarvis'in HUD arayüzü bir **PWA**'dır ve **GitHub Actions otomatik APK** üretir.

### Otomatik APK derleme (en kolay yol)

1. GitHub repo → **Actions** sekmesi → **Android APK** workflow
2. **Run workflow**'a bas (veya `public/` değişikliğinde otomatik çalışır)
3. Derleme bitince run sayfasının en altındaki **Artifacts** → `JARVIS-android-apk`'yi indir
4. ZIP'i aç → `JARVIS-debug.apk`'yi telefona gönder
5. Telefonda **Ayarlar → Uygulamalar → Bilinmeyen kaynaklar** iznini aç, APK'ya dokunup kur

> APK, Jarvis HUD'unu bağımsız bir Android uygulamasına (Capacitor) paketler.

### Uygulama sunucuya nasıl bağlanır?

APK bir arayüz kabuğudur; Jarvis'in skill motoru bir Node sunucusu çalıştırır. İki seçenek:

**A) Termux ile telefonda (tamamen bağımsız, internet gerekmez):**
```bash
pkg install nodejs git
git clone https://github.com/fidanhuseyin745-bit/Jarvis-v10
cd Jarvis-v10
npm install
node webserver/index.js
```
Sonra Jarvis uygulamasını aç → ayarlardan sunucu adresini `http://127.0.0.1:3000` yap.

**B) Kendi sunucunda çalıştır, telefondan bağlan:**
Sunucuda `node webserver/index.js` çalıştır, telefonda uygulama sunucu adresine sunucu IP'sini gir.

### PWA olarak kurma (APK olmadan)

Tarayıcıda Jarvis'i aç → menü → **Ana ekrana ekle**. Tam ekran, ikonlu uygulama gibi çalışır, offline önbellek aktiftir.

## Lisans

MIT
