"use strict";

const test = require("node:test");
const assert = require("node:assert");
const config = require("../config/aiConfig");

test("config exposes url, model, key, timeout", () => {
    assert.ok("url" in config);
    assert.ok("model" in config);
    assert.ok("key" in config);
    assert.ok("timeout" in config);
    assert.ok(typeof config.timeout === "number");
    assert.ok(config.timeout > 0);
});

test("config has isConfigured flag reflecting url validity", () => {
    assert.strictEqual(typeof config.isConfigured, "boolean");
    assert.strictEqual(config.isConfigured, !!config.url);
});

test("model has a sensible default", () => {
    assert.ok(config.model && config.model.length > 0);
});

test("coder returns offline reply when AI not configured", async () => {
    const Coder = require("../ai/coder");
    const coder = new Coder();
    const reply = await coder.ask("merhaba");
    if (!config.isConfigured) {
        assert.ok(reply.includes("AI yapılandırılmamış"));
    }
    assert.ok(typeof reply === "string");
});
