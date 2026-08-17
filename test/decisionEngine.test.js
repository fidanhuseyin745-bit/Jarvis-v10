"use strict";

const test = require("node:test");
const assert = require("node:assert");
const decision = require("../engine/decisionEngine");

test("market intent for crypto/finance keywords", () => {
    const d = decision.decide("bitcoin fiyatı ne kadar");
    assert.strictEqual(d.intent, "market");
    assert.ok(d.score.market > 0);
    assert.ok(d.confidence > 0);
});

test("study intent for exam/lesson keywords", () => {
    const d = decision.decide("matematik ders çalışmak istiyorum");
    assert.strictEqual(d.intent, "study");
    assert.ok(d.score.study > 0);
});

test("phone intent for phone/app keywords", () => {
    const d = decision.decide("telefonda youtube aç");
    assert.strictEqual(d.intent, "phone");
    assert.ok(d.score.phone > 0);
});

test("coding intent for programming keywords", () => {
    const d = decision.decide("node js ile api nasıl yazılır");
    assert.strictEqual(d.intent, "coding");
    assert.ok(d.score.coding > 0);
});

test("research intent for explicit research keyword", () => {
    const d = decision.decide("karanlık madde araştır");
    assert.strictEqual(d.intent, "research");
    assert.ok(d.score.research > d.score.web);
    assert.ok(d.score.research >= 130);
});

test("news intent for current-events keywords", () => {
    const d = decision.decide("bugün son haberler");
    assert.strictEqual(d.intent, "news");
    assert.ok(d.score.web >= 100);
});

test("question keywords raise web + explain scores", () => {
    const d = decision.decide("yapay zeka nedir");
    assert.ok(d.score.web > 0);
    assert.ok(d.score.explain > 0);
});

test("empty prompt defaults to chat intent", () => {
    const d = decision.decide("");
    assert.strictEqual(d.intent, "chat");
});

test("plan is sorted descending by score and only positive entries", () => {
    const d = decision.decide("bitcoin bugün");
    assert.ok(d.plan.length > 0);
    for (let i = 1; i < d.plan.length; i++) {
        assert.ok(d.plan[i - 1][1] >= d.plan[i][1]);
        assert.ok(d.plan[i][1] > 0);
    }
});
