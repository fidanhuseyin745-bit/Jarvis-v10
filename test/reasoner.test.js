"use strict";

const test = require("node:test");
const assert = require("node:assert");
const relevance = require("../reasoner/relevanceEngine");
const reasoner = require("../reasoner/reasoner");
const fusion = require("../reasoner/fusionEngine");
const cleaner = require("../reasoner/cleaner");
const extractor = require("../reasoner/factExtractor");
const detector = require("../reasoner/entityDetector");

const sampleResults = [
    { title: "Bitcoin fiyatı 50000 dolar oldu", snippet: "Bitcoin bugün 50000 dolara yükseldi. OpenAI duyurdu." },
    { title: "Magazin galeri video", snippet: "Galeri video tıklayın burç fal" }
];

test("relevance filter keeps relevant results and drops noise", () => {
    const filtered = relevance.filter("bitcoin fiyatı", sampleResults);
    assert.ok(filtered.length >= 1);
    assert.ok(filtered.every(r => r.relevance >= 25));
});

test("relevance penalises bad words", () => {
    const noisy = relevance.score("bitcoin", sampleResults[1]);
    assert.ok(noisy < 0 || noisy === 0);
});

test("fact extractor reads numbers and dates", () => {
    const facts = extractor.extract(sampleResults);
    assert.ok(facts.length > 0);
    const withNumbers = facts.find(f => f.numbers.length > 0);
    assert.ok(withNumbers, "expected at least one fact with numbers");
});

test("entity detector recognises known entities", () => {
    const entities = detector.detect("Bitcoin ve OpenAI hakkında");
    const names = entities.map(e => e.name);
    assert.ok(names.includes("bitcoin"));
    assert.ok(entities.some(e => e.type === "crypto"));
});

test("reasoner produces a report with best entries", () => {
    const report = reasoner.analyze(sampleResults);
    assert.ok(typeof report.average === "number");
    assert.ok(Array.isArray(report.best));
    assert.ok(Array.isArray(report.all));
});

test("fusion deduplicates near-identical best entries", () => {
    const report = reasoner.analyze(sampleResults);
    const before = report.best.length;
    const fused = fusion.fuse(report);
    assert.ok(fused.best.length <= before);
    const keys = new Set();
    for (const item of fused.best) {
        const key = item.text.toLowerCase().replace(/\s+/g, " ").trim();
        assert.ok(!keys.has(key), "duplicate best entry found");
        keys.add(key);
    }
});

test("cleaner removes boilerplate and trims length", () => {
    const long = "Bu sayfada tıklayın " + "a".repeat(300);
    const cleaned = cleaner.clean(long);
    assert.ok(!cleaned.includes("tıklayın"));
    assert.ok(!cleaned.includes("Bu sayfada"));
    assert.ok(cleaned.length <= 223);
});
