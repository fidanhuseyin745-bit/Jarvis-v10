"use strict";

require("dotenv").config();

const express = require("express");
const capabilities = require("./capabilities");
const { ok, fail, catchAsync } = require("./helpers");

const app = express();
const PORT = process.env.JARVIS_PORT || process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Statik dosyalar (JARVIS HUD arayüzü + PWA) ---
const pub = require("path").join(__dirname, "..", "public");
app.use(express.static(pub, {
    setHeaders: (res, path) => {
        // service worker ve manifest tarayıcı tarafından önbelleğe alınmamalı
        if (path.endsWith("sw.js") || path.endsWith("manifest.json")) {
            res.setHeader("Cache-Control", "no-cache");
        }
    }
}));

// --- Ana sayfa HUD'a yönlendirir ---
app.get("/", (req, res) => {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.sendFile(require("path").join(pub, "index.html"));
    }
    ok(res, {
        name: "Jarvis API",
        version: "10.0",
        docs: "/meta, /health, /api/chat, /api/dispatch, /api/skills, /api/weather, /api/crypto, /api/currency, /api/translate, /api/wikipedia, /api/joke, /api/quote, /api/ip, /api/search, /api/github, /api/dictionary, /api/reminder, /api/system, /api/numbers"
    });
});
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.end();
    next();
});

// --- Basit API anahtarı koruması (opsiyonel) ---
app.use((req, res, next) => {
    const expected = process.env.JARVIS_API_KEY;
    if (!expected) return next();
    if (req.method === "GET" && (req.path === "/" || req.path === "/health" || req.path === "/meta")) {
        return next();
    }
    const given = (req.headers["x-api-key"] || req.query.key || "").trim();
    if (given !== expected) {
        return fail(res, "Yetkisiz: geçersiz API anahtarı.", 401);
    }
    next();
});

// --- Ana rotalar ---

app.get("/", (req, res) => ok(res, {
    name: "Jarvis API",
    version: "10.0",
    docs: "/meta, /health, /api/chat, /api/dispatch, /api/skills, /api/weather, /api/crypto, /api/currency, /api/translate, /api/wikipedia, /api/joke, /api/quote, /api/ip, /api/search, /api/github, /api/dictionary, /api/reminder, /api/system, /api/numbers"
}));

app.get("/health", (req, res) => ok(res, {
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
}));

app.get("/meta", catchAsync(async (req, res) => {
    ok(res, capabilities.meta());
}));

app.get("/api/skills", catchAsync(async (req, res) => {
    ok(res, { skills: await capabilities.listSkillsAsync() });
}));

app.post("/api/dispatch", catchAsync(async (req, res) => {
    const input = req.body.input || req.query.input;
    if (!input) return fail(res, "'input' zorunlu.");
    ok(res, await capabilities.dispatch(input));
}));

app.post("/api/chat", catchAsync(async (req, res) => {
    const input = req.body.input || req.query.input;
    if (!input) return fail(res, "'input' zorunlu.");
    ok(res, { reply: await capabilities.chat(input), aiConfigured: capabilities.isAIConfigured() });
}));

app.post("/api/run-skill", catchAsync(async (req, res) => {
    const input = req.body.input || req.query.input;
    if (!input) return fail(res, "'input' zorunlu.");
    ok(res, await capabilities.runSkill(input));
}));

// --- Bireysel skill uçları (kolay kullanım için) ---

function skillEndpoint(skillName) {
    return catchAsync(async (req, res) => {
        const input = req.body.input || req.query.input || "";
        const reply = await skillManager_runByName(skillName, input);
        if (reply === null) return fail(res, "Skill bulunamadı: " + skillName, 404);
        ok(res, { reply });
    });
}

const skillManager = require("../skills/skillManager");
async function skillManager_runByName(name, input) {
    return await skillManager.runSkill(name, input);
}

app.post("/api/weather", catchAsync(async (req, res) => {
    const input = "hava durumu " + (req.body.input || req.query.input || req.query.city || "İstanbul");
    ok(res, { reply: await skillManager.runSkill("Weather", input) });
}));

app.post("/api/crypto", catchAsync(async (req, res) => {
    const input = (req.body.input || req.query.input || req.query.coin || "bitcoin") + " fiyatı";
    ok(res, { reply: await skillManager.runSkill("Crypto", input) });
}));

app.post("/api/currency", catchAsync(async (req, res) => {
    const input = (req.body.input || req.query.input || req.query.base || "dolar") + " kuru";
    ok(res, { reply: await skillManager.runSkill("Currency", input) });
}));

app.post("/api/translate", catchAsync(async (req, res) => {
    const text = req.body.text || req.query.text;
    const target = req.body.target || req.query.target || "en";
    if (!text) return fail(res, "'text' zorunlu.");
    ok(res, { reply: await skillManager.runSkill("Translate", "'" + text + "' " + target + "ya çevir") });
}));

app.post("/api/wikipedia", catchAsync(async (req, res) => {
    const input = (req.body.input || req.query.input || req.query.term || "") + " nedir";
    ok(res, { reply: await skillManager.runSkill("Wikipedia", input) });
}));

app.post("/api/joke", catchAsync(async (req, res) => {
    ok(res, { reply: await skillManager.runSkill("Joke", "şaka yap") });
}));

app.post("/api/quote", catchAsync(async (req, res) => {
    ok(res, { reply: await skillManager.runSkill("Quote", "günün sözü") });
}));

app.get("/api/ip", catchAsync(async (req, res) => {
    ok(res, { reply: await skillManager.runSkill("IP", "ip bilgim") });
}));

app.get("/api/search", catchAsync(async (req, res) => {
    const input = "internette ara: " + (req.query.input || req.query.q || req.body.input || "");
    if (!req.query.input && !req.query.q && !req.body.input) return fail(res, "'input' veya 'q' zorunlu.");
    ok(res, { reply: await skillManager.runSkill("Search", input) });
}));

app.post("/api/github", catchAsync(async (req, res) => {
    const input = "github'da repo ara: " + (req.body.input || req.query.input || "javascript");
    ok(res, { reply: await skillManager.runSkill("GitHub", input) });
}));

app.post("/api/dictionary", catchAsync(async (req, res) => {
    const word = req.body.word || req.query.word;
    if (!word) return fail(res, "'word' zorunlu.");
    ok(res, { reply: await skillManager.runSkill("Dictionary", word + " kelimesinin anlamı") });
}));

app.post("/api/reminder", catchAsync(async (req, res) => {
    const action = req.body.input || req.query.input;
    if (!action) return fail(res, "'input' zorunlu (örn: '18:00 ekmek al' veya 'göster').");
    ok(res, { reply: await skillManager.runSkill("Reminder", "hatırlat: " + action) });
}));

app.get("/api/system", catchAsync(async (req, res) => {
    ok(res, { reply: await skillManager.runSkill("System", "sistem bilgisi") });
}));

app.post("/api/numbers", catchAsync(async (req, res) => {
    const n = req.body.number || req.query.number;
    if (!n) return fail(res, "'number' zorunlu.");
    ok(res, { reply: await skillManager.runSkill("Numbers", n + " sayısı hakkında") });
}));

// --- Hata yakalama ---
app.use((req, res) => fail(res, "Bilinmeyen uç: " + req.path, 404));

function start() {
    return app.listen(PORT, () => {
        console.log("🚀 Jarvis API: http://localhost:" + PORT);
    });
}

if (require.main === module) {
    start();
}

module.exports = { app, start };
