"use strict";

const fs = require("fs");
const path = require("path");

class CodeGenApi {

    detect(text) {
        const lower = String(text || "").toLowerCase();
        const wantsCode = lower.includes("kod yaz") || lower.includes("yaz ") ||
            lower.includes("yaz:") || /\byaz\b/.test(lower) ||
            lower.includes("oluştur") || lower.includes("olustur") ||
            lower.includes("geliştir") || lower.includes("oluştur:") ||
            lower.includes("şablon") || lower.includes("sablon");
        if (!wantsCode) return null;

        if (lower.includes("express") && (lower.includes("server") || lower.includes("sunucu") || lower.includes("api"))) {
            const name = this._extractName(text, ["express", "server", "sunucu", "api"]);
            return { type: "express", name };
        }

        if (lower.includes("http server") || (lower.includes("http") && lower.includes("server"))) {
            const name = this._extractName(text, ["http", "server", "sunucu"]);
            return { type: "httpserver", name };
        }

        if (lower.includes("rest api") || (lower.includes("rest") && lower.includes("api"))) {
            const name = this._extractName(text, ["rest", "api"]);
            return { type: "restapi", name };
        }

        if (lower.includes("cli") || lower.includes("komut satırı") || lower.includes("komut satiri")) {
            const name = this._extractName(text, ["cli", "komut"]);
            return { type: "cli", name };
        }

        if (lower.includes("html") || lower.includes("web sayfası") || lower.includes("web sayfasi") || lower.includes("landing")) {
            const name = this._extractName(text, ["html", "sayfa", "page", "landing"]);
            return { type: "html", name };
        }

        if (lower.includes("fonksiyon") || lower.includes("function") || lower.includes("metot")) {
            return { type: "function", spec: text };
        }

        if (lower.includes("modül") || lower.includes("modul") || lower.includes("module")) {
            const name = this._extractName(text, ["modül", "modul", "module"]);
            return { type: "module", name };
        }

        return { type: "generic", spec: text };
    }

    _extractName(text, keywords) {
        let t = text;
        keywords.forEach(k => { t = t.replace(new RegExp(k, "gi"), " "); });
        const words = t.replace(/[^a-zA-Z0-9çğıöşü\s]/gi, " ").split(/\s+/).filter(w => w.length > 1 && !["yaz", "oluştur", "olustur", "geliştir", "bir", "için", "icin", "bana", "gibi", "istiyorum", "yap", "kod"].includes(w.toLowerCase()));
        return words[0] ? words[0].toLowerCase() : "jarvis-app";
    }

    async execute(text, options) {
        const detected = this.detect(text);
        if (!detected) return null;

        const outDir = (options && options.dir) || path.join(process.cwd(), "generated");
        const name = detected.name || "jarvis-output";
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "");

        switch (detected.type) {
            case "express":
                return this._genExpress(outDir, safeName);
            case "httpserver":
                return this._genHttpServer(outDir, safeName);
            case "restapi":
                return this._genRestApi(outDir, safeName);
            case "cli":
                return this._genCli(outDir, safeName);
            case "html":
                return this._genHtml(outDir, safeName);
            case "function":
                return this._genFunction(detected.spec);
            case "module":
                return this._genModule(outDir, safeName);
            default:
                return this._genGeneric(detected.spec);
        }
    }

    _writeFile(filePath, content) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return filePath;
    }

    _genExpress(dir, name) {
        const appFile = path.join(dir, name, "app.js");
        const pkgFile = path.join(dir, name, "package.json");
        const port = 3000;

        this._writeFile(pkgFile, JSON.stringify({
            name: name,
            version: "1.0.0",
            main: "app.js",
            scripts: { start: "node app.js" },
            dependencies: { express: "^4.18.2" }
        }, null, 2));

        this._writeFile(appFile, `'use strict';

const express = require('express');
const app = express();
const PORT = process.env.PORT || ${port};

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '${name} çalışıyor', time: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/echo', (req, res) => {
  res.json({ you_sent: req.body });
});

app.listen(PORT, () => {
  console.log('🚀 ${name} http://localhost:' + PORT + ' adresinde çalışıyor');
});
`);

        return "✅ Express sunucu oluşturuldu: " + path.join(dir, name) + "/\n\n" +
            "Dosyalar:\n• app.js (sunucu)\n• package.json (bağımlılık)\n\n" +
            "Çalıştırma:\n  cd " + path.join(dir, name) + " && npm install && npm start\n" +
            "Endpoint'ler: GET / , GET /health , POST /echo";
    }

    _genHttpServer(dir, name) {
        const file = path.join(dir, name, "server.js");
        this._writeFile(file, `'use strict';

const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ app: '${name}', status: 'running', time: new Date().toISOString() }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
});

server.listen(PORT, () => {
  console.log('🚀 ${name} sunucusu http://localhost:' + PORT + ' adresinde');
});
`);
        return "✅ Saf HTTP sunucu oluşturuldu: " + file + "\n\nÇalıştırma:\n  node " + file;
    }

    _genRestApi(dir, name) {
        const file = path.join(dir, name, "api.js");
        this._writeFile(file, `'use strict';

/**
 * ${name} — Basit REST API (saf Node.js, express gerekmez)
 * Örnek kaynak: /api/items
 */
const http = require('http');

let items = [
  { id: 1, name: 'örnek 1' },
  { id: 2, name: 'örnek 2' }
];
let nextId = 3;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve(null); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  // GET /api/items
  if (path === '/api/items' && method === 'GET') {
    return sendJson(res, 200, items);
  }
  // POST /api/items
  if (path === '/api/items' && method === 'POST') {
    const data = await readBody(req);
    if (!data || !data.name) return sendJson(res, 400, { error: 'name gerekli' });
    const item = { id: nextId++, name: data.name };
    items.push(item);
    return sendJson(res, 201, item);
  }
  // GET /api/items/:id
  const m = path.match(/^\\/api\\/items\\/(\\d+)$/);
  if (m && method === 'GET') {
    const item = items.find(i => i.id === parseInt(m[1]));
    if (!item) return sendJson(res, 404, { error: 'bulunamadı' });
    return sendJson(res, 200, item);
  }
  // DELETE /api/items/:id
  if (m && method === 'DELETE') {
    const idx = items.findIndex(i => i.id === parseInt(m[1]));
    if (idx < 0) return sendJson(res, 404, { error: 'bulunamadı' });
    items.splice(idx, 1);
    return sendJson(res, 204, '');
  }
  return sendJson(res, 404, { error: 'route yok', path });
});

server.listen(3000, () => console.log('🚀 ${name} REST API http://localhost:3000'));
`);
        return "✅ REST API oluşturuldu: " + file + "\n\n" +
            "Endpoint'ler:\n" +
            "• GET    /api/items      — tüm kayıtlar\n" +
            "• POST   /api/items      — yeni kayıt (body: {name})\n" +
            "• GET    /api/items/:id  — tek kayıt\n" +
            "• DELETE /api/items/:id  — silme\n\n" +
            "Çalıştırma: node " + file;
    }

    _genCli(dir, name) {
        const file = path.join(dir, name, "cli.js");
        this._writeFile(file, `'#!/usr/bin/env node
'use strict';

/**
 * ${name} — Jarvis tarafından oluşturulan CLI aracı
 */
const args = process.argv.slice(2);

function help() {
  console.log('Kullanım: node cli.js <komut> [seçenekler]');
  console.log('');
  console.log('Komutlar:');
  console.log('  hello [isim]   Merhaba der');
  console.log('  echo <metin>  Metni geri yazdırır');
  console.log('  count <metin> Karakter sayısını verir');
  console.log('  help          Bu yardım mesajı');
}

const cmd = args[0];

switch (cmd) {
  case 'hello': {
    const name = args[1] || 'dünya';
    console.log('Merhaba, ' + name + '!');
    break;
  }
  case 'echo': {
    console.log(args.slice(1).join(' '));
    break;
  }
  case 'count': {
    const text = args.slice(1).join(' ');
    console.log(text + ' => ' + text.length + ' karakter');
    break;
  }
  case 'help':
  case '--help':
  case '-h':
  default:
    help();
}
`);
        try { fs.chmodSync(file, 0o755); } catch {}
        return "✅ CLI araç oluşturuldu: " + file + "\n\n" +
            "Komutlar:\n  hello [isim]\n  echo <metin>\n  count <metin>\n  help\n\n" +
            "Çalıştırma: node " + file + " hello Jarvis";
    }

    _genHtml(dir, name) {
        const file = path.join(dir, name, "index.html");
        this._writeFile(file, `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(90deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #94a3b8; margin-bottom: 1.5rem; }
    button { background: linear-gradient(90deg, #3b82f6, #6366f1); color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-size: 1rem; cursor: pointer; transition: transform 0.2s; }
    button:hover { transform: translateY(-2px); }
    .time { margin-top: 1.5rem; font-size: 0.9rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${name}</h1>
    <p>Jarvis tarafından oluşturuldu 🚀</p>
    <button onclick="alert('Merhaba!')">Tıkla</button>
    <div class="time" id="time"></div>
  </div>
  <script>
    document.getElementById('time').textContent = new Date().toLocaleString('tr-TR');
  </script>
</body>
</html>
`);
        return "✅ HTML sayfa oluşturuldu: " + file + "\n\nTarayıcıda aç: " + file;
    }

    _genFunction(spec) {
        const nameMatch = spec.match(/(?:fonksiyon|function|metot)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/i);
        const fnName = nameMatch ? nameMatch[1] : "jarvisFn";

        const code = `'use strict';

/**
 * ${fnName} — Jarvis tarafından oluşturuldu
 * İstek: ${spec.replace(/\n/g, " ").slice(0, 100)}
 */
function ${fnName}() {
  // TODO: İş mantığını buraya ekle
  return 'Merhaba, ben ${fnName}';
}

module.exports = ${fnName};

// Kullanım: ${fnName}()
`;
        return "✅ Fonksiyon şablonu:\n\n```javascript\n" + code + "\n```";
    }

    _genModule(dir, name) {
        const file = path.join(dir, name + "Api.js");
        this._writeFile(file, `"use strict";

/**
 * ${name} API — Jarvis tarafından oluşturulan modül
 */

class ${this._capitalize(name)}Api {

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (!lower.includes("${name}")) return null;
        return { type: "${name}_query", text };
    }

    async execute(text) {
        const detected = this.detect(text);
        if (!detected) return null;
        // TODO: ${name} mantığını buraya ekle
        return "${name} modülü çalışıyor (şablon). Geliştirmek için execute() içini düzenle.";
    }

}

module.exports = new ${this._capitalize(name)}Api();
`);
        return "✅ Yeni modül oluşturuldu: " + file + "\n\n" +
            "localEngine'e eklemek için:\n" +
            "  const " + name + "Api = require(\"../api/" + name + "Api\");\n" +
            "  ask() içinde: const r = await " + name + "Api.execute(text); if (r) return r;";
    }

    _genGeneric(spec) {
        return "Kod üretmek için daha açık tarif ver. Örnek:\n" +
            "• 'express server yaz' (API sunucusu)\n" +
            "• 'http server yaz' (saf Node sunucu)\n" +
            "• 'rest api yaz' (CRUD API)\n" +
            "• 'cli araç yaz' (komut satırı)\n" +
            "• 'html sayfa yaz' (web sayfası)\n" +
            "• 'modül ekle <isim>' (Jarvis modülü)\n" +
            "• 'fonksiyon yaz <isim>' (fonksiyon şablonu)";
    }

    _capitalize(s) {
        return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
    }

}

module.exports = new CodeGenApi();
