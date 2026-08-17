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
    assert.ok(reply.includes("Hesaplama"));
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
