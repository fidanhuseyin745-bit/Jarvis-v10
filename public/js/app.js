/* JARVIS v10 — arayüz mantığı: saat, skill listesi, sistem, sohbet */

(function () {
  const $ = (id) => document.getElementById(id);
  const log = $("log");
  const form = $("form");
  const input = $("input");

  function addMsg(who, text) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.innerHTML = "<b>" + (who === "user" ? "Sen:" : "JARVIS:") + "</b> " + escapeHtml(text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  async function api(path, body) {
    const opts = body
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {};
    const res = await fetch(path, opts);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "istek başarısız");
    return data.data;
  }

  // Sunucu var mı? (APK'da yok → lokal engine devreye girer)
  let serverAvailable = false;
  let serverBase = localStorage.getItem("jarvis_server_url") || "";

  function normalizeBase(u) {
    if (!u) return "";
    u = u.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//.test(u)) u = "http://" + u;
    return u;
  }

  async function detectServer() {
    // Kayıtlı sunucu adresi varsa onu dene, yoksa relative dene
    const bases = [];
    if (serverBase) bases.push(normalizeBase(serverBase));
    bases.push(""); // relative
    for (const b of bases) {
      try {
        const r = await fetch(b + "/health", { method: "GET", cache: "no-store" });
        const d = await r.json();
        if (d && d.success) {
          serverBase = b;
          serverAvailable = true;
          return;
        }
      } catch (e) {}
    }
    serverAvailable = false;
    serverBase = "";
  }

  function setServerUrl(u) {
    serverBase = normalizeBase(u);
    localStorage.setItem("jarvis_server_url", serverBase);
    serverAvailable = false;
    return detectServer();
  }

  // UI: sunucu ayarı inputu (mobil uyumlu)
  (function setupServerInput() {
    const sb = document.getElementById("serverBox");
    if (!sb) return;
    const inp = document.getElementById("serverUrl");
    if (inp) inp.value = localStorage.getItem("jarvis_server_url") || "";
    const btn = document.getElementById("serverSave");
    if (btn) {
      btn.addEventListener("click", async () => {
        const v = inp && inp.value.trim();
        if (!v) {
          alert("Sunucu adresi girin (ör: http://192.168.1.100:3000)");
          return;
        }
        btn.textContent = "…";
        await setServerUrl(v);
        btn.textContent = serverAvailable ? "OK" : "X";
        setTimeout(() => { btn.textContent = "KAYDET"; location.reload(); }, 800);
      });
    }
  })();

  // Saat
  function tick() {
    const d = new Date();
    $("clock").textContent = d.toLocaleTimeString("tr-TR", { hour12: false });
  }
  setInterval(tick, 1000);
  tick();

  // Meta: skill listesi + AI durumu
  async function loadMeta() {
    try {
      if (serverAvailable) {
        const m = await api("/meta");
        const ul = $("skillList");
        ul.innerHTML = "";
        m.skills.forEach((s) => {
          const li = document.createElement("li");
          li.textContent = s;
          ul.appendChild(li);
        });
        const pill = $("aiState");
        if (m.aiConfigured) {
          pill.textContent = "AI ONLINE";
          pill.className = "pill pill-on";
        } else {
          pill.textContent = "AI OFFLINE";
          pill.className = "pill pill-off";
        }
      } else if (window.JarvisEngine) {
        // APK modunda: lokal engine skill listesi
        const ul = $("skillList");
        ul.innerHTML = "";
        window.JarvisEngine.listSkills().forEach((s) => {
          const li = document.createElement("li");
          li.textContent = s;
          ul.appendChild(li);
        });
        const pill = $("aiState");
        pill.textContent = "OFFLINE MODE";
        pill.className = "pill pill-off";
      }
    } catch (e) {
      console.warn("meta yüklenemedi", e);
    }
  }

  // Sistem bilgisi
  async function loadSys() {
    try {
      if (serverAvailable) {
        const d = await api("/api/system");
        $("sysInfo").textContent = d.reply || "—";
      } else {
        // APK modunda: cihaz bilgisi
        $("sysInfo").textContent = "🖥️ Cihaz bilgisi:\n" +
          "Ekran: " + window.screen.width + "x" + window.screen.height + "\n" +
          "Çevrimiçi: " + (navigator.onLine ? "evet" : "hayır") + "\n" +
          "Mod: APK (yerel)";
      }
    } catch (e) {
      $("sysInfo").textContent = "sistem bilgisi alınamadı";
    }
  }

  // Komut gönder
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg("user", text);
    input.value = "";
    addMsg("jarvis", "⏳ işleniyor…");
    try {
      let reply;
      if (serverAvailable) {
        // Sunucuya gönder
        const d = await api("/api/dispatch", { input: text });
        reply = d.reply || (d.matched ? "(boş yanıt)" : "anlayamadım.");
      } else if (window.JarvisEngine) {
        // APK'da: lokal engine
        const d = await window.JarvisEngine.dispatch(text);
        reply = d.reply;
      } else {
        reply = "❌ Skill motoru yüklenemedi.";
      }
      const last = log.lastChild;
      if (last) last.remove();
      addMsg("jarvis", reply);
    } catch (err) {
      const last = log.lastChild;
      if (last) last.remove();
      addMsg("jarvis", "❌ " + err.message);
    }
  });

  // Karşılama
  (async function () {
    await detectServer();
    loadMeta();
    loadSys();
    if (serverAvailable) {
      addMsg("jarvis", "Sisteme hoş geldiniz. Komutlarınızı bekliyorum.");
    } else {
      addMsg("jarvis", "Sisteme hoş geldiniz. Yerel mod (APK) aktif. Tüm skill'ler çevrimdışı motor üzerinden çalışır. 'yardım' yazarak komutları görebilirsiniz.");
    }
  })();
})();
