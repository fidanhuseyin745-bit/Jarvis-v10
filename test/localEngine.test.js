"use strict";

const test = require("node:test");
const assert = require("node:assert");
const LocalEngine = require("../ai/localEngine");
const knowledge = require("../knowledge/knowledgeBase");

const engine = new LocalEngine();

test("greets based on time of day", async () => {
    const reply = await engine.ask("merhaba");
    assert.ok(reply.includes("Jarvis"));
});

test("evaluates basic math expressions", async () => {
    const reply = await engine.ask("15 * 24");
    assert.ok(reply.includes("360"));
    assert.ok(reply.includes("🧮"));
});

test("handles division", async () => {
    const reply = await engine.ask("100 / 4");
    assert.ok(reply.includes("25"));
});

test("answers time queries", async () => {
    const reply = await engine.ask("saat kaç");
    assert.ok(reply.includes("🕐") || reply.includes("saat"));
});

test("answers date queries", async () => {
    const reply = await engine.ask("bugün günlerden ne");
    assert.ok(reply.includes("📅") || reply.includes("Bugün"));
});

test("looks up builtin knowledge", async () => {
    const reply = await engine.ask("ışık hızı nedir");
    assert.ok(reply.includes("299"));
});

test("looks up bitcoin facts", async () => {
    const reply = await engine.ask("bitcoin nedir");
    assert.ok(reply.toLowerCase().includes("bitcoin"));
    assert.ok(reply.includes("Satoshi"));
});

test("help lists capabilities", async () => {
    const reply = await engine.ask("neler yapabilirsin");
    assert.ok(reply.includes("Sohbet"));
    assert.ok(reply.includes("Matematik"));
    assert.ok(reply.includes("Öğrenme"));
});

test("thanks response", async () => {
    const reply = await engine.ask("teşekkürler");
    assert.ok(reply.includes("Rica"));
});

test("learns and recalls taught facts", async () => {
    knowledge.forget();
    await engine.ask("öğret: Jüpiter en büyük gezegendir");
    const recall = await engine.ask("jüpiter nedir");
    assert.ok(recall.includes("en büyük gezegen"));
    knowledge.forget();
});

test("empty prompt returns prompt message", async () => {
    const reply = await engine.ask("");
    assert.strictEqual(reply, "Bir şey yazmadın.");
});

test("forgets learned facts on command", async () => {
    await engine.ask("öğret: Test bilgisi 12345");
    knowledge.forget();
    const recall = await engine.ask("test bilgisi");
    assert.ok(!recall.includes("12345"));
});

test("rejects non-math input safely", async () => {
    const reply = await engine.ask("alert(1)");
    assert.ok(typeof reply === "string");
});

test("math power calculation", async () => {
    const reply = await engine.ask("5 üzeri 3");
    assert.ok(reply.includes("125"));
});

test("math percentage", async () => {
    const reply = await engine.ask("250nin yüzde 20si");
    assert.ok(reply.includes("50"));
});

test("math prime detection", async () => {
    const prime = await engine.ask("7 asal mı");
    assert.ok(prime.includes("asal"));
});

test("units length conversion", async () => {
    const reply = await engine.ask("5 km kaç metre eder");
    assert.ok(reply.includes("5.000") || reply.includes("5000"));
});

test("units weight conversion", async () => {
    const reply = await engine.ask("2 kg kaç gram");
    assert.ok(reply.includes("2.000") || reply.includes("2000"));
});

test("units temperature conversion", async () => {
    const reply = await engine.ask("100 derece c kaç f");
    assert.ok(reply.includes("212"));
});

test("inference capital city", async () => {
    const reply = await engine.ask("türkiyenin başkenti neresi");
    assert.ok(reply.includes("Ankara"));
});

test("inference currency", async () => {
    const reply = await engine.ask("japonyanın para birimi ne");
    assert.ok(reply.includes("Japon Yeni") || reply.includes("JPY"));
});

test("inference language", async () => {
    const reply = await engine.ask("almanyanın resmi dili ne");
    assert.ok(reply.includes("Almanca"));
});

test("knowledge geography lookup", async () => {
    const reply = await engine.ask("paris nerede");
    assert.ok(reply.includes("Fransa") || reply.includes("başkent"));
});

test("knowledge science lookup", async () => {
    const reply = await engine.ask("yerçekimi nedir");
    assert.ok(reply.includes("9.81") || reply.includes("kütle"));
});

test("knowledge history lookup", async () => {
    const reply = await engine.ask("atatürk kimdir");
    assert.ok(reply.includes("Atatürk") || reply.includes("Cumhuriyet"));
});

test("knowledge math lookup", async () => {
    const reply = await engine.ask("pisagor teoremi nedir");
    assert.ok(reply.includes("dik") || reply.includes("hipotenüs") || reply.includes("Pisagor"));
});

test("time age calculation", async () => {
    const reply = await engine.ask("15.06.1990 doğumluyum kaç yaşımdayım");
    assert.ok(reply.includes("yaş"));
    assert.ok(reply.includes("1990"));
});

test("phone app open detection (fallback)", async () => {
    const reply = await engine.ask("youtube aç");
    assert.ok(reply.includes("bridge") || reply.includes("köprü") || reply.includes("youtube"));
});

test("phone call detection (fallback)", async () => {
    const reply = await engine.ask("0555 123 45 67 ara");
    assert.ok(reply.includes("köprü") || reply.includes("bridge") || reply.includes("ara"));
});

test("phone wifi setting detection (fallback)", async () => {
    const reply = await engine.ask("wifi kapat");
    assert.ok(reply.includes("köprü") || reply.includes("bridge") || reply.includes("Wi-Fi") || reply.includes("Ayar"));
});

test("phone flashlight detection (fallback)", async () => {
    const reply = await engine.ask("el feneri aç");
    assert.ok(reply.includes("köprü") || reply.includes("bridge") || reply.includes("fener"));
});

test("phone alarm detection (fallback)", async () => {
    const reply = await engine.ask("sabah 7ye alarm kur");
    assert.ok(reply.includes("köprü") || reply.includes("bridge") || reply.includes("Alarm"));
});

test("units not misclassified as phone open", async () => {
    const reply = await engine.ask("2 kg kaç gram");
    assert.ok(reply.includes("gram"));
    assert.ok(!reply.includes("instagram"));
});

test("temperature not misclassified as phone open", async () => {
    const reply = await engine.ask("100 derece c kaç f");
    assert.ok(reply.includes("212"));
    assert.ok(!reply.includes("facebook"));
});
