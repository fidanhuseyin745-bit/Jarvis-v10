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
    } catch (e) {
      console.warn("meta yüklenemedi", e);
    }
  }
  loadMeta();

  // Sistem bilgisi
  async function loadSys() {
    try {
      const d = await api("/api/system");
      $("sysInfo").textContent = d.reply || "—";
    } catch (e) {
      $("sysInfo").textContent = "sistem bilgisi alınamadı";
    }
  }
  loadSys();

  // Komut gönder
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg("user", text);
    input.value = "";
    addMsg("jarvis", "⏳ işleniyor…");
    try {
      const d = await api("/api/dispatch", { input: text });
      // son "işleniyor" mesajını değiştir
      const last = log.lastChild;
      if (last) last.remove();
      const reply = d.reply || (d.matched ? "(boş yanıt)" : "anlayamadım.");
      addMsg("jarvis", reply);
    } catch (err) {
      const last = log.lastChild;
      if (last) last.remove();
      addMsg("jarvis", "❌ " + err.message);
    }
  });

  // Karşılama
  addMsg("jarvis", "Sisteme hoş geldiniz. Komutlarınızı bekliyorum.");
})();
