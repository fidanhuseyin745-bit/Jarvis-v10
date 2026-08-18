/* JARVIS Browser Skill Engine — sunucusuz, tarayıcıda çalışır
   APK / PWA içinde Node.js sunucusu olmadan skill'leri çalıştırır.
   Komutları eşleştirip doğrudan harici API'lere fetch yapar. */

(function () {
  const T = (s) => String(s).toLowerCase().trim();

  async function fetchJSON(url, opts) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function ok(reply, extra) { return { matched: true, reply, ...(extra || {}) }; }
  function no() { return { matched: false, reply: "Bunu anlayamadım. Örnek: hava durumu istanbul, bitcoin fiyatı, 1 dolar kaç tl, şaka söyle..." }; }

  // ---- Yardımcılar ----
  const fmtTry = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 0 });

  // ---- Skill'ler (tarayıcıda çalışır) ----
  const skills = [
    {
      name: "weather",
      match: (t) => /hava durumu|hava\s+nasıl|sıcaklık|yağmur/i.test(t),
      run: async (t) => {
        const city = (t.match(/(?:hava durumu|hava|sıcaklık|yağmur)\s+(?:için\s+)?([a-zçğıöşü\s]+?)(?:\s+(?:nasıl|değil|kaç|var mı)\b|$)/i) || [])[1] || t.replace(/hava durumu|hava|sıcaklık|yağmur/gi, "").trim() || "istanbul";
        const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`);
        if (!geo.results || !geo.results.length) return ok(`"${city}" bulunamadı.`);
        const g = geo.results[0];
        const w = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        const c = w.current;
        const desc = { 0:"açık",1:"çok az bulutlu",2:"parçalı bulutlu",3:"kapalı",45:"sisli",48:"sisli",51:"hafif çiseleme",53:"çiseleme",55:"yoğun çiseleme",61:"hafif yağmurlu",63:"yağmurlu",65:"yoğun yağmurlu",71:"hafif karlı",73:"karlı",75:"yoğun karlı",80:"hafif sağanak",81:"sağanak",82:"yoğun sağanak",95:"gökgürültülü",96:"gökgürültülü dolu",99:"şiddetli gökgürültülü dolu" }[c.weather_code] || "belirsiz";
        return ok(`🌤️ ${g.name}, ${g.country || ""}\nHava: ${desc}\nSıcaklık: ${c.temperature_2m}°C (hissedilen ${c.apparent_temperature}°C)\nNem: %${c.relative_humidity_2m}\nRüzgar: ${c.wind_speed_10m} km/s`);
      }
    },
    {
      name: "crypto",
      match: (t) => /bitcoin|btc|ethereum|eth|kripto|altcoin|solana|bnb|xrp|doge/i.test(t),
      run: async (t) => {
        const map = { bitcoin:"bitcoin", btc:"bitcoin", ethereum:"ethereum", eth:"ethereum", solana:"solana", sol:"solana", bnb:"binancecoin", xrp:"ripple", doge:"dogecoin", dogecoin:"dogecoin", cardano:"cardano", ada:"cardano" };
        const found = Object.keys(map).find(k => t.toLowerCase().includes(k));
        if (!found) return ok("Hangi kripto? (bitcoin, ethereum, solana...)");
        const id = map[found];
        const d = await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,try&include_24hr_change=true`);
        const p = d[id];
        const chg = (p.usd_24h_change >= 0 ? "+" : "") + p.usd_24h_change.toFixed(2) + "%";
        return ok(`₿ ${id.toUpperCase()}\nUSD: $${p.usd.toLocaleString()}\nTRY: ${fmtTry(p.try)}\n24s değişim: ${chg}`);
      }
    },
    {
      name: "currency",
      match: (t) => /(dolar|euro|sterlin|pound|altın|döviz|kur|kaç tl|kaç₺|usd|eur|gbp)/i.test(t),
      run: async (t) => {
        const pairs = [["dolar","USD","TRY"],["usd","USD","TRY"],["euro","EUR","TRY"],["eur","EUR","TRY"],["sterlin","GBP","TRY"],["pound","GBP","TRY"],["gbp","GBP","TRY"]];
        const found = pairs.find(([k]) => t.toLowerCase().includes(k));
        if (!found) {
          const r = await fetchJSON("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP");
          return ok(`💱 Güncel kurlar:\n1 USD = ₺${r.rates.TRY.toFixed(2)}\n1 EUR = ₺${(r.rates.TRY / r.rates.EUR).toFixed(2)}\n1 GBP = ₺${(r.rates.TRY / r.rates.GBP).toFixed(2)}`);
        }
        const [, from, to] = found;
        const r = await fetchJSON(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        return ok(`💱 1 ${from} = ${fmtTry(r.rates[to])}`);
      }
    },
    {
      name: "joke",
      match: (t) => /şaka|fıkra|güldür|komik/i.test(t),
      run: async () => {
        const d = await fetchJSON("https://official-joke-api.appspot.com/random_joke");
        return ok(`😄 ${d.setup}\n${d.punchline}`);
      }
    },
    {
      name: "quote",
      match: (t) => /söz|alnt|quote|motivasyon|ilham/i.test(t),
      run: async () => {
        const d = await fetchJSON("https://api.quotable.io/random");
        return ok(`💬 "${d.content}"\n— ${d.author}`);
      }
    },
    {
      name: "ip",
      match: (t) => /^ip( adresim)?\s*(ne|nedir)?$|ip bilgisi|ip adres/i.test(t),
      run: async () => {
        const d = await fetchJSON("https://ipapi.co/json/");
        return ok(`🌐 IP: ${d.ip}\nKonum: ${d.city}, ${d.country_name}\nISP: ${d.org}`);
      }
    },
    {
      name: "translate",
      match: (t) => /çevir|translate|ingilizce (ne|ne demek)|ne demek/i.test(t),
      run: async (t) => {
        const m = t.match(/çevir\s+(.+?)(?:\s+to\s+(\w+))?$/i) || t.match(/translate\s+(.+)/i);
        const text = m ? m[1] : t.replace(/çevir|translate|ingilizce/gi, "").trim();
        if (!text) return ok("Ne çevireyim? Örnek: çevir hello");
        const lang = (m && m[2]) || "en";
        const d = await fetchJSON(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${lang}`);
        return ok(`🌐 ${d.responseData.translatedText}`);
      }
    },
    {
      name: "wikipedia",
      match: (t) => /wikipedia|wiki|kimdir|nedir|ne demek/i.test(t) && !/çevir/i.test(t),
      run: async (t) => {
        const q = t.replace(/wikipedia|wiki|kimdir|nedir|ne demek|ara/gi, "").trim();
        if (!q) return ok("Ne arayayım? Örnek: nedir Atatürk");
        let url = `https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&origin=*&titles=${encodeURIComponent(q)}`;
        let d = await fetchJSON(url);
        let pages = d.query && d.query.pages;
        let p = pages && Object.values(pages)[0];
        if (!p || !p.extract) {
          url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&origin=*&titles=${encodeURIComponent(q)}`;
          d = await fetchJSON(url);
          pages = d.query && d.query.pages;
          p = pages && Object.values(pages)[0];
        }
        if (!p || !p.extract) return ok(`"${q}" hakkında bilgi bulunamadı.`);
        return ok(`📚 ${p.title}\n${p.extract.substring(0, 600)}${p.extract.length > 600 ? "…" : ""}`);
      }
    },
    {
      name: "search",
      match: (t) => /ara|search|bul\b|google/i.test(t),
      run: async (t) => {
        const q = t.replace(/ara|search|bul|google/gi, "").trim();
        if (!q) return ok("Ne arayayım?");
        const d = await fetchJSON(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1&kl=tr-tr`);
        const r = d.AbstractText || (d.RelatedTopics && d.RelatedTopics[0] && d.RelatedTopics[0].Text) || "Sonuç bulunamadı.";
        return ok(`🔍 ${q}\n${r}`);
      }
    },
    {
      name: "github",
      match: (t) => /github|repo|depo|kullanıcı\s+\w+/i.test(t),
      run: async (t) => {
        const m = t.match(/(?:github|repo|kullanıcı)\s+([\w.-]+)/i);
        const q = m ? m[1] : "node";
        const d = await fetchJSON(`https://api.github.com/users/${encodeURIComponent(q)}`);
        if (d.message) return ok(`Kullanıcı bulunamadı: ${q}`);
        return ok(`🐙 ${d.login}\n${d.name || ""}\nTakipçi: ${d.followers} • Repo: ${d.public_repos}\n${d.bio || ""}`);
      }
    },
    {
      name: "dictionary",
      match: (t) => /anlamı|sözlük|define|ne demek/i.test(t),
      run: async (t) => {
        const w = (t.match(/(?:anlamı|sözlük|define)\s+(\w+)/i) || [])[1] || t.replace(/anlamı|sözlük|define|ne demek/gi, "").trim();
        if (!w) return ok("Hangi kelime?");
        const d = await fetchJSON(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
        if (Array.isArray(d)) {
          const def = d[0].meanings[0].definitions[0].definition;
          return ok(`📖 ${w}\n${def}`);
        }
        return ok(`"${w}" bulunamadı.`);
      }
    },
    {
      name: "reminder",
      match: (t) => /hatırlat|reminder|unutma/i.test(t),
      run: async (t) => {
        let list = JSON.parse(localStorage.getItem("jarvis_reminders") || "[]");
        const m = t.match(/hatırlat[ıi]r mıs[ıi]n?\s+(.+)/i) || t.match(/unutma\s+(.+)/i) || t.match(/hatırlat\s+(.+)/i);
        if (!m) {
          if (!list.length) return ok("Hiç hatırlatıcın yok.");
          return ok("⏰ Hatırlatıcılar:\n" + list.map((r, i) => `${i + 1}. ${r}`).join("\n"));
        }
        const item = m[1].trim();
        list.push(item);
        localStorage.setItem("jarvis_reminders", JSON.stringify(list));
        return ok(`⏰ Not edildi: "${item}" (toplam ${list.length})`);
      }
    },
    {
      name: "system",
      match: (t) => /sistem|system|bilgi|durum|telefon|cihaz|pil|batarya|saat/i.test(t),
      run: async () => {
        const d = new Date();
        const lines = [
          "🖥️ Sistem:",
          `Tarih: ${d.toLocaleDateString("tr-TR")}`,
          `Saat: ${d.toLocaleTimeString("tr-TR", { hour12: false })}`,
          `Cihaz: ${navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("iPhone") ? "iPhone" : "Bilinmiyor"}`,
          `Tarayıcı: ${navigator.userAgent.split(" ").slice(-1)[0]}`,
          `Ekran: ${window.screen.width}x${window.screen.height}`,
          `Çevrimiçi: ${navigator.onLine ? "evet" : "hayır"}`
        ];
        if (navigator.getBattery) {
          try { const b = await navigator.getBattery(); lines.push(`Pil: %${Math.round(b.level * 100)}${b.charging ? " (şarjda)" : ""}`); } catch (e) {}
        }
        return ok(lines.join("\n"));
      }
    },
    {
      name: "numbers",
      match: (t) => /sayı|rastgele|zar|tura|yazı|para at/i.test(t),
      run: async (t) => {
        if (/zar/i.test(t)) return ok(`🎲 Zar: ${Math.floor(Math.random() * 6) + 1}`);
        if (/tura|yazı|para/i.test(t)) return ok(`🪙 ${Math.random() < 0.5 ? "Yazı" : "Tura"}`);
        const m = t.match(/(\d+)\s*(?:ile|ve|-)\s*(\d+)/);
        const min = m ? +m[1] : 1, max = m ? +m[2] : 100;
        return ok(`🔢 ${min}–${max} arası rastgele sayı: ${Math.floor(Math.random() * (max - min + 1)) + min}`);
      }
    },
    {
      name: "math",
      match: (t) => /[\d]+\s*[\+\-\*\/x×÷]\s*[\d]+/.test(t),
      run: async (t) => {
        const expr = t.replace(/x|×/g, "*").replace(/÷/g, "/").replace(/[^\d\+\-\*\/\.\(\)]/g, "");
        try {
          const val = Function('"use strict"; return (' + expr + ")")();
          return ok(`🧮 ${expr} = ${val}`);
        } catch (e) {
          return ok("Hesaplayamadım.");
        }
      }
    },
    {
      name: "hello",
      match: (t) => /^(selam|merhaba|hey|hello|hi|naber|nasılsın)\b/i.test(t),
      run: async () => ok("Merhaba! Ben JARVIS. Ne yapabilirim? Örnek komutlar: hava durumu istanbul, bitcoin fiyatı, 1 dolar kaç tl, şaka söyle, nedir Atatürk")
    },
    {
      name: "help",
      match: (t) => /yardım|help|komutlar|ne yapabilirsin|nasıl kullanırım/i.test(t),
      run: async () => ok("🤖 Kullanabileceğin komutlar:\n• hava durumu istanbul\n• bitcoin fiyatı\n• 1 dolar kaç tl\n• şaka söyle\n• söz söyle\n• nedir Atatürk\n• çevir hello\n• ip adresim\n• ara node.js\n• zar at\n• sistem bilgisi\n• hatırlat toplantı yarın")
    }
  ];

  async function dispatch(input) {
    const t = T(input);
    for (const s of skills) {
      try {
        if (s.match(t)) {
          return await s.run(t);
        }
      } catch (e) {
        return ok(`⚠️ ${s.name} hatası: ${e.message}`);
      }
    }
    return no();
  }

  function listSkills() {
    return skills.map(s => s.name.charAt(0).toUpperCase() + s.name.slice(1));
  }

  window.JarvisEngine = { dispatch, listSkills };
})();
